using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SehhaTech.Infrastructure.Data;

namespace SehhaTech.Infrastructure.Jobs;

public class SessionCleanupJob
{
    private readonly AppDbContext _db;
    private readonly ILogger<SessionCleanupJob> _logger;

    public SessionCleanupJob(AppDbContext db, ILogger<SessionCleanupJob> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// بيتشغل كل ساعة — بيحذف:
    /// 1. Refresh tokens منتهية الصلاحية
    /// 2. OTP records منتهية (أكتر من 10 دقايق)
    /// 3. Portal bookings فضلت Pending أكتر من 30 دقيقة
    /// </summary>
    public async Task CleanupAsync()
    {
        var now = DateTime.UtcNow;

        // ── 1. Portal Refresh Tokens منتهية ──────────────────────────────────
        var expiredTokens = await _db.RefreshTokens
            .Where(t => t.ExpiresAt < now)
            .ToListAsync();

        if (expiredTokens.Count > 0)
        {
            _db.RefreshTokens.RemoveRange(expiredTokens);
            _logger.LogInformation("Deleted {Count} expired refresh tokens", expiredTokens.Count);
        }

        // ── 2. OTP Records منتهية الصلاحية ──────────────────────────────────
        var expiredOtps = await _db.OTPRecords
            .Where(o => o.ExpiresAt < now)
            .ToListAsync();

        if (expiredOtps.Count > 0)
        {
            _db.OTPRecords.RemoveRange(expiredOtps);
            _logger.LogInformation("Deleted {Count} expired OTP records", expiredOtps.Count);
        }

        // ── 3. Bookings فضلت Pending أكتر من 30 دقيقة (مالهاش لازمة) ────────
        var bookingCutoff = now.AddMinutes(-30);
        var stalePendingBookings = await _db.PatientBookings
            .Where(b =>
                b.Status == Core.Models.Portal.BookingStatus.Pending &&
                b.CreatedAt < bookingCutoff)
            .ToListAsync();

        foreach (var booking in stalePendingBookings)
        {
            booking.Status = Core.Models.Portal.BookingStatus.Cancelled;
            booking.CancelledAt = now;
            booking.CancellationReason = "Auto-cancelled: pending timeout";
        }

        if (stalePendingBookings.Count > 0)
            _logger.LogInformation("Auto-cancelled {Count} stale pending bookings", stalePendingBookings.Count);

        await _db.SaveChangesAsync();

        _logger.LogInformation("Session cleanup done at {Time}", now);
    }
}