using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolAdmission.Api.Models;

namespace SchoolAdmission.Api.Data.Configurations;

public class AdmissionClassConfiguration
    : IEntityTypeConfiguration<AdmissionClass>
{
    public void Configure(EntityTypeBuilder<AdmissionClass> builder)
    {
        builder.ToTable("AdmissionClasses", table =>
        {
            table.HasCheckConstraint(
                "CK_AdmissionClasses_TotalSeats_Positive",
                "\"TotalSeats\" > 0"
            );
        });

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.TotalSeats)
            .IsRequired();

        builder.Property(x => x.CreatedAtUtc)
            .IsRequired();
    }
}