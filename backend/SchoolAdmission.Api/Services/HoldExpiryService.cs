
using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.Models;

namespace SchoolAdmission.Api.Services;

public class HoldExpiryService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<HoldExpiryService> _logger;

    public HoldExpiryService(
        IServiceScopeFactory scopeFactory,
        ILogger<HoldExpiryService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(5));

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();

                var context = scope.ServiceProvider
                    .GetRequiredService<AdmissionDbContext>();

                var now = DateTimeOffset.UtcNow;

                var expiredCount = await context.AdmissionHolds
                    .Where(h =>
                        h.Status == AdmissionHoldStatus.HELD &&
                        h.ExpiresAtUtc <= now)
                    .ExecuteUpdateAsync(
                        setters => setters.SetProperty(
                            h => h.Status,
                            AdmissionHoldStatus.EXPIRED),
                        stoppingToken);

                if (expiredCount > 0)
                {
                    _logger.LogInformation(
                        "Expired {Count} admission holds.",
                        expiredCount);
                }
            }
            catch (Exception ex)
                when (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogError(
                    ex,
                    "An error occurred while expiring admission holds.");
            }

            await timer.WaitForNextTickAsync(stoppingToken);
        }
    }
}
