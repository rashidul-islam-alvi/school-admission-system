using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Models;

namespace SchoolAdmission.Api.Data;

public class AdmissionDbContext : DbContext
{
    public AdmissionDbContext(
        DbContextOptions<AdmissionDbContext> options
    ) : base(options)
    {
    }

    public DbSet<AdmissionClass> AdmissionClasses => Set<AdmissionClass>();

    public DbSet<AdmissionHold> AdmissionHolds => Set<AdmissionHold>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(AdmissionDbContext).Assembly
        );
    }
}