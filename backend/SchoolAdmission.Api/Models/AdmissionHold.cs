namespace SchoolAdmission.Api.Models;

public class AdmissionHold
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ClassId { get; set; }

    public AdmissionClass Class { get; set; } = null!;

    public string StudentId { get; set; } = string.Empty;

    public AdmissionHoldStatus Status { get; set; }
        = AdmissionHoldStatus.HELD;

    public DateTimeOffset CreatedAtUtc { get; set; }
        = DateTimeOffset.UtcNow;

    public DateTimeOffset ExpiresAtUtc { get; set; }

    public DateTimeOffset? ConfirmedAtUtc { get; set; }
}