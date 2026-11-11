namespace SchoolAdmission.Api.DTOs;

public class MyHoldResponse
{
    public Guid HoldId { get; set; }
    public Guid ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
}