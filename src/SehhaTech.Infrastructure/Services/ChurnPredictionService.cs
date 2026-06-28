using Microsoft.EntityFrameworkCore;
using SehhaTech.Core.DTOs;
using SehhaTech.Core.Interfaces;
using SehhaTech.Infrastructure.Data;

namespace SehhaTech.Infrastructure.Services
{
    public class ChurnPredictionService : IChurnPredictionService
    {
        private readonly AppDbContext _db;

        private const int WEIGHT_NO_RECENT_APPOINTMENTS = 35;
        private const int WEIGHT_DECLINING_VOLUME = 30;
        private const int WEIGHT_SUBSCRIPTION_EXPIRING = 20;
        private const int WEIGHT_NO_STAFF_GROWTH = 15;

        private const int DAYS_NO_APPOINTMENTS_THRESHOLD = 14;
        private const int DAYS_SUBSCRIPTION_EXPIRY_WARNING = 30;
        private const int DAYS_STAFF_GROWTH_WINDOW = 30;

        public ChurnPredictionService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<ChurnScoreDto> CalculateScoreAsync(int tenantId)
        {
            var detail = await CalculateDetailedScoreAsync(tenantId);
            return new ChurnScoreDto
            {
                TenantId = detail.TenantId,
                Score = detail.Score,
                RiskLevel = detail.RiskLevel
            };
        }

        public async Task<Dictionary<int, ChurnScoreDto>> CalculateScoresBulkAsync(IEnumerable<int> tenantIds)
        {
            var result = new Dictionary<int, ChurnScoreDto>();
            foreach (var id in tenantIds)
            {
                try
                {
                    result[id] = await CalculateScoreAsync(id);
                }
                catch
                {
                    result[id] = new ChurnScoreDto { TenantId = id, Score = 0, RiskLevel = "Low" };
                }
            }
            return result;
        }

        public async Task<ChurnScoreDetailDto> CalculateDetailedScoreAsync(int tenantId)
        {
            var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId);
            if (tenant == null)
                throw new KeyNotFoundException($"Tenant {tenantId} not found");

            var now = DateTime.UtcNow;
            var factors = new List<ChurnFactorDto>();

            // ===== العامل 1: مفيش مواعيد جديدة آخر 14 يوم =====
            var lastAppointmentDate = await _db.Appointments
                .Where(a => a.TenantId == tenantId)
                .OrderByDescending(a => a.AppointmentDate)
                .Select(a => a.AppointmentDate)
                .FirstOrDefaultAsync();

            bool noRecentAppointments = lastAppointmentDate == default
                || (now - lastAppointmentDate).TotalDays > DAYS_NO_APPOINTMENTS_THRESHOLD;

            factors.Add(new ChurnFactorDto
            {
                FactorName = "NoRecentAppointments",
                Params = new Dictionary<string, object> { { "days", DAYS_NO_APPOINTMENTS_THRESHOLD } },
                MaxPoints = WEIGHT_NO_RECENT_APPOINTMENTS,
                PointsContributed = noRecentAppointments ? WEIGHT_NO_RECENT_APPOINTMENTS : 0,
                IsTriggered = noRecentAppointments
            });

            // ===== العامل 2: نزول في عدد المواعيد الشهري =====
            var startOfThisMonth = new DateTime(now.Year, now.Month, 1);
            var startOfLastMonth = startOfThisMonth.AddMonths(-1);

            var thisMonthCount = await _db.Appointments
                .CountAsync(a => a.TenantId == tenantId && a.AppointmentDate >= startOfThisMonth);

            var lastMonthCount = await _db.Appointments
                .CountAsync(a => a.TenantId == tenantId
                    && a.AppointmentDate >= startOfLastMonth
                    && a.AppointmentDate < startOfThisMonth);

            bool decliningVolume = lastMonthCount > 0 && thisMonthCount < lastMonthCount * 0.6;

            int decliningPoints = 0;
            if (lastMonthCount > 0)
            {
                double dropRatio = 1 - ((double)thisMonthCount / lastMonthCount);
                if (dropRatio > 0)
                    decliningPoints = (int)Math.Min(WEIGHT_DECLINING_VOLUME, dropRatio * WEIGHT_DECLINING_VOLUME * 1.5);
            }

            factors.Add(new ChurnFactorDto
            {
                FactorName = "DecliningAppointmentVolume",
                Params = new Dictionary<string, object> { { "thisMonth", thisMonthCount }, { "lastMonth", lastMonthCount } },
                MaxPoints = WEIGHT_DECLINING_VOLUME,
                PointsContributed = decliningPoints,
                IsTriggered = decliningVolume
            });

            // ===== العامل 3: الاشتراك قريب يخلص =====
            var latestSubscription = await _db.Subscriptions
                .Where(s => s.TenantId == tenantId)
                .OrderByDescending(s => s.EndDate)
                .FirstOrDefaultAsync();

            bool subscriptionExpiringSoon = false;
            if (latestSubscription != null)
            {
                var daysUntilExpiry = (latestSubscription.EndDate - now).TotalDays;
                subscriptionExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= DAYS_SUBSCRIPTION_EXPIRY_WARNING;
            }

            factors.Add(new ChurnFactorDto
            {
                FactorName = "SubscriptionExpiringSoon",
                Params = new Dictionary<string, object> { { "days", DAYS_SUBSCRIPTION_EXPIRY_WARNING } },
                MaxPoints = WEIGHT_SUBSCRIPTION_EXPIRING,
                PointsContributed = subscriptionExpiringSoon ? WEIGHT_SUBSCRIPTION_EXPIRING : 0,
                IsTriggered = subscriptionExpiringSoon
            });

            // ===== العامل 4: مفيش نمو في عدد الموظفين آخر 30 يوم =====
            var staffGrowthWindowStart = now.AddDays(-DAYS_STAFF_GROWTH_WINDOW);
            var newStaffCount = await _db.Users
                .CountAsync(u => u.TenantId == tenantId && u.CreatedAt >= staffGrowthWindowStart);

            bool noStaffGrowth = newStaffCount == 0;

            factors.Add(new ChurnFactorDto
            {
                FactorName = "NoStaffGrowth",
                Params = new Dictionary<string, object> { { "days", DAYS_STAFF_GROWTH_WINDOW } },
                MaxPoints = WEIGHT_NO_STAFF_GROWTH,
                PointsContributed = noStaffGrowth ? WEIGHT_NO_STAFF_GROWTH : 0,
                IsTriggered = noStaffGrowth
            });

            // ===== الإجمالي =====
            int totalScore = Math.Min(100, factors.Sum(f => f.PointsContributed));

            string riskLevel = totalScore switch
            {
                >= 70 => "Critical",
                >= 45 => "High",
                >= 20 => "Medium",
                _ => "Low"
            };

            // ملاحظة: تم حذف حساب Recommendation كنص جاهز من هنا
            // الفرونت إند هيبني النص بنفسه عبر مفاتيح الترجمة بناءً على riskLevel

            return new ChurnScoreDetailDto
            {
                TenantId = tenantId,
                ClinicName = tenant.Name,
                Score = totalScore,
                RiskLevel = riskLevel,
                Factors = factors
            };
        }
    }
}
