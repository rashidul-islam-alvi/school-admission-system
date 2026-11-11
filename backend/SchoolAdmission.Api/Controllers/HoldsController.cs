
using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Models;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
public class HoldsController : ControllerBase
{
    private readonly AdmissionDbContext _context;
    private readonly int _holdDurationSeconds;

    public HoldsController(
        AdmissionDbContext context,
        IConfiguration configuration)
    {
        _context = context;
        _holdDurationSeconds = Math.Max(
            1,
            configuration.GetValue<int?>("HOLD_DURATION_SECONDS") ?? 600
        );
    }

    private string? GetStudentId()
    {
        if (!Request.Headers.TryGetValue("X-Student-Id", out var value))
            return null;

        var studentId = value.ToString();

        return studentId.Length == 17 &&
               studentId.All(char.IsAsciiDigit)
            ? studentId
            : null;
    }

    private static string StatusName(AdmissionHoldStatus status)
        => status.ToString();

    // POST /classes/{classId}/holds
    [HttpPost("classes/{classId:guid}/holds")]
    public async Task<IActionResult> CreateHold(
        Guid classId,
        [FromHeader(Name = "X-Student-Id")] string? studentId)
    {
        if (string.IsNullOrWhiteSpace(studentId) ||
            studentId.Length != 17 ||
            !studentId.All(char.IsAsciiDigit))
        {
            return BadRequest(new
            {
                message = "A valid 17-digit X-Student-Id header is required."
            });
        }

        await using var transaction =
            await _context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);

        // Lock this class row. Requests for the same class are serialized
        // across backend instances using the same PostgreSQL database.
        var admissionClass = await _context.AdmissionClasses
            .FromSqlInterpolated(
                $"SELECT * FROM \"AdmissionClasses\" WHERE \"Id\" = {classId} FOR UPDATE"
            )
            .FirstOrDefaultAsync();

        if (admissionClass == null)
            return NotFound(new { message = "Class not found." });

        var now = DateTimeOffset.UtcNow;

        // Release expired holds before checking the unique active-application index.
        await _context.AdmissionHolds
            .Where(h =>
                h.ClassId == classId &&
                h.Status == AdmissionHoldStatus.HELD &&
                h.ExpiresAtUtc <= now)
            .ExecuteUpdateAsync(setters =>
                setters.SetProperty(h => h.Status, AdmissionHoldStatus.EXPIRED));

        var alreadyApplied = await _context.AdmissionHolds.AnyAsync(h =>
            h.ClassId == classId &&
            h.StudentId == studentId &&
            (h.Status == AdmissionHoldStatus.HELD ||
             h.Status == AdmissionHoldStatus.CONFIRMED));

        if (alreadyApplied)
            return Conflict(new { message = "You already have an active or confirmed application for this class." });

        var occupiedSeats = await _context.AdmissionHolds.CountAsync(h =>
            h.ClassId == classId &&
            (h.Status == AdmissionHoldStatus.CONFIRMED ||
             (h.Status == AdmissionHoldStatus.HELD && h.ExpiresAtUtc > now)));

        if (occupiedSeats >= admissionClass.TotalSeats)
            return Conflict(new { message = "No seats are available in this class." });

        var hold = new AdmissionHold
        {
            ClassId = classId,
            StudentId = studentId,
            Status = AdmissionHoldStatus.HELD,
            CreatedAtUtc = now,
            ExpiresAtUtc = now.AddSeconds(_holdDurationSeconds)
        };

        _context.AdmissionHolds.Add(hold);

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return Created(
            $"/holds/{hold.Id}",
            new
            {
                holdId = hold.Id,
                classId = hold.ClassId,
                studentId = studentId,
                status = StatusName(hold.Status),
                expiresAt = hold.ExpiresAtUtc
            }
        );
    }

    // GET /holds/{holdId}
    [HttpGet("holds/{holdId:guid}")]
    public async Task<IActionResult> GetHold(Guid holdId)
    {
        var hold = await _context.AdmissionHolds
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == holdId);

        if (hold == null)
            return NotFound(new { message = "Hold not found." });

        var status = hold.Status;

        if (status == AdmissionHoldStatus.HELD &&
            hold.ExpiresAtUtc <= DateTimeOffset.UtcNow)
        {
            status = AdmissionHoldStatus.EXPIRED;
        }

        return Ok(new HoldResponse
        {
            HoldId = hold.Id,
            ClassId = hold.ClassId,
            Status = StatusName(status),
            ExpiresAt = hold.ExpiresAtUtc
        });
    }

    // POST /holds/{holdId}/confirm
    [HttpPost("holds/{holdId:guid}/confirm")]
    public async Task<IActionResult> ConfirmHold(Guid holdId)
    {
        var studentId = GetStudentId();

        if (studentId == null)
            return BadRequest(new { message = "A valid 17-digit X-Student-Id header is required." });

        await using var transaction =
            await _context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);

        var hold = await _context.AdmissionHolds
            .FromSqlInterpolated(
                $"SELECT * FROM \"AdmissionHolds\" WHERE \"Id\" = {holdId} FOR UPDATE"
            )
            .FirstOrDefaultAsync();

        if (hold == null)
            return NotFound(new { message = "Hold not found." });

        if (hold.StudentId != studentId)
            return NotFound(new { message = "Hold not found." });

        if (hold.Status == AdmissionHoldStatus.CONFIRMED)
        {
            await transaction.CommitAsync();
            return Ok(new { holdId = hold.Id, status = "CONFIRMED" });
        }

        if (hold.Status != AdmissionHoldStatus.HELD)
            return Conflict(new { message = "This hold cannot be confirmed." });

        if (hold.ExpiresAtUtc <= DateTimeOffset.UtcNow)
        {
            hold.Status = AdmissionHoldStatus.EXPIRED;
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Conflict(new { message = "This hold has expired." });
        }

        hold.Status = AdmissionHoldStatus.CONFIRMED;
        hold.ConfirmedAtUtc = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(new { holdId = hold.Id, status = "CONFIRMED" });
    }

    // DELETE /holds/{holdId}
    [HttpDelete("holds/{holdId:guid}")]
    public async Task<IActionResult> CancelHold(Guid holdId)
    {
        var studentId = GetStudentId();

        if (studentId == null)
            return BadRequest(new { message = "A valid 17-digit X-Student-Id header is required." });

        await using var transaction =
            await _context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);

        var hold = await _context.AdmissionHolds
            .FromSqlInterpolated(
                $"SELECT * FROM \"AdmissionHolds\" WHERE \"Id\" = {holdId} FOR UPDATE"
            )
            .FirstOrDefaultAsync();

        if (hold == null || hold.StudentId != studentId)
            return NotFound(new { message = "Hold not found." });

        if (hold.Status == AdmissionHoldStatus.HELD)
        {
            hold.Status = hold.ExpiresAtUtc <= DateTimeOffset.UtcNow
                ? AdmissionHoldStatus.EXPIRED
                : AdmissionHoldStatus.CANCELLED;
        }
        else if (hold.Status == AdmissionHoldStatus.CONFIRMED)
        {
            hold.Status = AdmissionHoldStatus.CANCELLED;
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return NoContent();
    }

    // GET /me/holds
    [HttpGet("me/holds")]
    public async Task<IActionResult> GetMyHolds()
    {
        var studentId = GetStudentId();

        if (studentId == null)
            return BadRequest(new { message = "A valid 17-digit X-Student-Id header is required." });

        var now = DateTimeOffset.UtcNow;

        var holds = await _context.AdmissionHolds
            .AsNoTracking()
            .Where(h => h.StudentId == studentId)
            .OrderByDescending(h => h.CreatedAtUtc)
            .Select(h => new MyHoldResponse
            {
                HoldId = h.Id,
                ClassId = h.ClassId,
                ClassName = h.Class.Name,
                Status = h.Status == AdmissionHoldStatus.HELD &&
                        h.ExpiresAtUtc <= now
                    ? "EXPIRED"
                    : h.Status.ToString(),
                ExpiresAt = h.ExpiresAtUtc
            })
            .ToListAsync();

        return Ok(holds);
    }
}
