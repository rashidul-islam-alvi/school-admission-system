using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.DTOs;
using SchoolAdmission.Api.Models;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("classes")]
public class ClassesController : ControllerBase
{
    private readonly AdmissionDbContext _context;

    public ClassesController(AdmissionDbContext context)
    {
        _context = context;
    }

    // POST /classes
    [HttpPost]
    public async Task<IActionResult> CreateClass(
        [FromBody] CreateClassRequest request
    )
    {
        var admissionClass = new AdmissionClass
        {
            Name = request.Name.Trim(),
            TotalSeats = request.TotalSeats
        };

        _context.AdmissionClasses.Add(admissionClass);

        await _context.SaveChangesAsync();

        return Created(
            $"/classes/{admissionClass.Id}",
            new
            {
                id = admissionClass.Id,
                name = admissionClass.Name,
                totalSeats = admissionClass.TotalSeats
            }
        );
    }

    // GET /classes
    [HttpGet]
    public async Task<ActionResult<List<ClassResponse>>> GetClasses()
    {
        var now = DateTime.UtcNow;

        var classes = await _context.AdmissionClasses
            .AsNoTracking()
            .Select(c => new ClassResponse
            {
                Id = c.Id,
                Name = c.Name,
                TotalSeats = c.TotalSeats,

                HeldSeats = c.Holds.Count(h =>
                    h.Status == AdmissionHoldStatus.HELD &&
                    h.ExpiresAtUtc > now
                ),

                ConfirmedSeats = c.Holds.Count(h =>
                    h.Status == AdmissionHoldStatus.CONFIRMED
                ),

                AvailableSeats = c.TotalSeats -
                    c.Holds.Count(h =>
                        (h.Status == AdmissionHoldStatus.HELD &&
                         h.ExpiresAtUtc > now) ||
                        h.Status == AdmissionHoldStatus.CONFIRMED
                    )
            })
            .ToListAsync();

        return Ok(classes);
    }

    // GET /classes/{classId}
    [HttpGet("{classId:guid}")]
    public async Task<ActionResult<ClassResponse>> GetClass(
        Guid classId
    )
    {
        var now = DateTime.UtcNow;

        var admissionClass = await _context.AdmissionClasses
            .AsNoTracking()
            .Where(c => c.Id == classId)
            .Select(c => new ClassResponse
            {
                Id = c.Id,
                Name = c.Name,
                TotalSeats = c.TotalSeats,

                HeldSeats = c.Holds.Count(h =>
                    h.Status == AdmissionHoldStatus.HELD &&
                    h.ExpiresAtUtc > now
                ),

                ConfirmedSeats = c.Holds.Count(h =>
                    h.Status == AdmissionHoldStatus.CONFIRMED
                ),

                AvailableSeats = c.TotalSeats -
                    c.Holds.Count(h =>
                        (h.Status == AdmissionHoldStatus.HELD &&
                         h.ExpiresAtUtc > now) ||
                        h.Status == AdmissionHoldStatus.CONFIRMED
                    )
            })
            .FirstOrDefaultAsync();

        if (admissionClass == null)
        {
            return NotFound(new
            {
                message = "Class not found."
            });
        }

        return Ok(admissionClass);
    }
}