using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolAdmission.Api.Models;

namespace SchoolAdmission.Api.Data.Configurations;

public class AdmissionHoldConfiguration
    : IEntityTypeConfiguration<AdmissionHold>
{
    public void Configure(EntityTypeBuilder<AdmissionHold> builder)
    {
        builder.ToTable("AdmissionHolds", table =>
        {
            table.HasCheckConstraint(
                "CK_AdmissionHolds_StudentId",
                "\"StudentId\" ~ '^[0-9]{17}$'"
            );

            table.HasCheckConstraint(
                "CK_AdmissionHolds_Expiry",
                "\"ExpiresAtUtc\" > \"CreatedAtUtc\""
            );
        });

        builder.HasKey(x => x.Id);

        builder.Property(x => x.StudentId)
            .IsRequired()
            .HasMaxLength(17);

        builder.Property(x => x.Status)
            .HasConversion(
                status => status.ToString().ToUpperInvariant(),
                value => Enum.Parse<AdmissionHoldStatus>(value, true)
            )
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.CreatedAtUtc)
            .IsRequired();

        builder.Property(x => x.ExpiresAtUtc)
            .IsRequired();

        builder.HasOne(x => x.Class)
            .WithMany(x => x.Holds)
            .HasForeignKey(x => x.ClassId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.ClassId, x.StudentId })
            .IsUnique()
            .HasFilter("\"Status\" IN ('HELD', 'CONFIRMED')");

        builder.HasIndex(x => new
        {
            x.ClassId,
            x.Status,
            x.ExpiresAtUtc
        });

        builder.HasIndex(x => x.StudentId);
    }
}