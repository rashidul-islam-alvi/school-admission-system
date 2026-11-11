namespace SchoolAdmission.Api.Models;

public class AdmissionClass
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public int TotalSeats { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }
        = DateTimeOffset.UtcNow;

    public ICollection<AdmissionHold> Holds { get; set; }
        = new List<AdmissionHold>();
}