using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SehhaTech.Core.Models;
using SehhaTech.Infrastructure.Data;
using SehhaTech.Core.DTOs.Auth;
using SehhaTech.Core.Interfaces;


namespace SehhaTech.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin")]
    public class SuperAdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IChurnPredictionService _churnService;

        public SuperAdminController(AppDbContext context, IChurnPredictionService churnService)
        {
            _context = context;
            _churnService = churnService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var totalClinics = await _context.Tenants.CountAsync();
            var activeClinics = await _context.Tenants.CountAsync(t => t.IsActive);
            var totalDoctors = await _context.Doctors.CountAsync();
            var todayAppointments = await _context.Appointments.CountAsync(a => a.AppointmentDate.Date == DateTime.Today);

            var recentClinics = await _context.Tenants.OrderByDescending(t => t.CreatedAt).Take(5).Select(t => new
            {
                t.Id,
                t.Name,
                t.Email,
                t.IsActive,
                t.CreatedAt
            }).ToListAsync();

            var growth = await _context.Tenants
                .GroupBy(t => new { t.CreatedAt.Year, t.CreatedAt.Month })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    Count = g.Count()
                }).ToListAsync();

            var status = await _context.Appointments.GroupBy(a => a.Status).Select(g => new
            {
                Status = g.Key,
                Count = g.Count()
            }).ToListAsync();

            return Ok(new
            {
                TotalClinics = totalClinics,
                ActiveClinics = activeClinics,
                TotalDoctors = totalDoctors,
                TodayAppointments = todayAppointments,
                ClinicsGrowthChart = growth,
                AppointmentStatusDistribution = status,
                RecentClinics = recentClinics
            });
        }

        [HttpGet("tenants")]
        public async Task<IActionResult> GetAllTenants()
        {
            var tenants = await _context.Tenants.Select(t => new
            {
                t.Id,
                t.Name,
                t.Phone,
                t.Email,
                t.IsActive,
                t.CreatedAt
            }).ToListAsync();

            var tenantIds = tenants.Select(t => t.Id);
            var scores = await _churnService.CalculateScoresBulkAsync(tenantIds);

            var result = tenants.Select(t => new
            {
                t.Id,
                t.Name,
                t.Phone,
                t.Email,
                t.IsActive,
                t.CreatedAt,
                ChurnScore = scores.ContainsKey(t.Id) ? scores[t.Id].Score : 0,
                ChurnRiskLevel = scores.ContainsKey(t.Id) ? scores[t.Id].RiskLevel : "Low"
            });

            return Ok(result);
        }

        [HttpGet("tenants/{id}")]
        public async Task<IActionResult> GetTenantById(int id)
        {
            var tenant = await _context.Tenants.Where(t => t.Id == id).Select(t => new
            {
                t.Id,
                t.Name,
                t.Phone,
                t.Email,
                t.Address,
                t.IsActive,
                t.CreatedAt
            }).FirstOrDefaultAsync();

            if (tenant == null)
                return NotFound("Clinic not found");

            return Ok(tenant);
        }

        [HttpGet("tenants/{id}/churn-risk")]
        public async Task<IActionResult> GetChurnRisk(int id)
        {
            try
            {
                var detail = await _churnService.CalculateDetailedScoreAsync(id);
                return Ok(detail);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = $"Clinic with id {id} not found" });
            }
        }

        [HttpPut("tenants/{id}/toggle")]
        public async Task<IActionResult> ToggleTenant(int id)
        {
            var tenant = await _context.Tenants.FindAsync(id);
            if (tenant == null)
                return NotFound("Clinic not found");

            tenant.IsActive = !tenant.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Clinic status updated",
                tenant.Id,
                tenant.IsActive
            });
        }

        [HttpDelete("tenants/{id}")]
        public async Task<IActionResult> DeleteTenant(int id)
        {
            var tenant = await _context.Tenants.FindAsync(id);
            if (tenant == null)
                return NotFound(new { success = false, message = "Clinic not found" });

            var invoices = _context.PaymentInvoices.Where(x => x.TenantId == id);
            _context.PaymentInvoices.RemoveRange(invoices);

            var appointments = _context.Appointments.Where(a => a.TenantId == id);
            _context.Appointments.RemoveRange(appointments);

            var patients = _context.Patients.Where(p => p.TenantId == id);
            _context.Patients.RemoveRange(patients);

            var doctors = _context.Doctors.Where(d => d.TenantId == id);
            _context.Doctors.RemoveRange(doctors);

            var users = _context.Users.Where(u => u.TenantId == id);
            _context.Users.RemoveRange(users);

            _context.Tenants.Remove(tenant);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Clinic Deleted Successfully" });
        }

        [HttpGet("reports")]
        public async Task<IActionResult> GetReports()
        {
            var clinicsGrowth = await _context.Tenants
                .GroupBy(t => new { t.CreatedAt.Year, t.CreatedAt.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Count = g.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync();

            var appointmentStatus = await _context.Appointments.GroupBy(a => a.Status).Select(g => new
            {
                Status = g.Key,
                Count = g.Count()
            }).ToListAsync();

            var leaderboardRaw = await _context.Tenants
                .Select(t => new
                {
                    t.Name,
                    t.IsActive,
                    Doctors = _context.Doctors.Count(d => d.TenantId == t.Id),
                    Patients = _context.Patients.Count(p => p.TenantId == t.Id),
                    TotalAppointments = _context.Appointments.Count(a => a.TenantId == t.Id),
                    CompletedAppointments = _context.Appointments.Count(a => a.TenantId == t.Id && a.Status == AppointmentStatus.Completed),
                    TodayAppointments = _context.Appointments.Count(a => a.TenantId == t.Id && a.AppointmentDate.Date == DateTime.Today)
                })
                .OrderByDescending(x => x.Patients)
                .Take(5)
                .ToListAsync();

            var leaderboard = leaderboardRaw.Select(x => new
            {
                x.Name,
                x.Doctors,
                x.Patients,
                Load = x.Doctors > 0
                    ? Math.Round((double)x.TodayAppointments / (x.Doctors * 8) * 100, 0)
                    : 0,
                Satisfaction = x.TotalAppointments > 0
                    ? Math.Round((double)x.CompletedAppointments / x.TotalAppointments * 5, 1)
                    : 0,
                Status = x.IsActive ? "Active" : "Inactive"
            }).ToList();

            return Ok(new
            {
                ClinicsGrowthTrend = clinicsGrowth,
                AppointmentStatusDistribution = appointmentStatus,
                PerformanceLeaderboard = leaderboard
            });
        }

        [HttpGet("settings/profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var userIdInt = int.Parse(userId);
            var user = await _context.Users.Where(u => u.Id == userIdInt).Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.Role
            }).FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { success = false, message = "User not found" });

            return Ok(new { success = true, data = user });
        }

        [HttpPut("settings/changepassword")]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var userIdInt = int.Parse(userId);
            var user = await _context.Users.FindAsync(userIdInt);

            if (user == null)
                return NotFound(new { success = false, message = "User not found" });

            if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
                return BadRequest(new { success = false, message = "Old password is wrong" });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Password changed successfully"
            });
        }

        // ─── Monthly Reports ────────────────────────────────────────────
        // GET /api/SuperAdmin/monthly-reports?month=6&year=2026
        [HttpGet("monthly-reports")]
        public async Task<IActionResult> GetMonthlyReports(int? month, int? year)
        {
            var targetMonth = month ?? DateTime.UtcNow.Month;
            var targetYear = year ?? DateTime.UtcNow.Year;

            // ✅ FIX: لو التيبل فاضية → رجّع empty response بدل 500
            var tableHasData = await _context.MonthlyReports.AnyAsync();
            if (!tableHasData)
                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        Month = targetMonth,
                        Year = targetYear,
                        Summary = new
                        {
                            TotalRevenue = 0,
                            TotalAppointments = 0,
                            TotalNewPatients = 0,
                            ClinicsReported = 0
                        },
                        Clinics = new List<object>()
                    }
                });

            var reports = await _context.MonthlyReports
                .Where(r => r.Month == targetMonth && r.Year == targetYear)
                .Join(_context.Tenants, r => r.TenantId, t => t.Id, (r, t) => new
                {
                    r.Id,
                    r.TenantId,
                    TenantName = t.Name,
                    r.Month,
                    r.Year,
                    r.TotalAppointments,
                    r.CompletedAppointments,
                    r.CancelledAppointments,
                    r.NoShowAppointments,
                    r.TotalRevenue,
                    r.PendingRevenue,
                    r.NewPatients,
                    r.GeneratedAt
                })
                .OrderByDescending(r => r.TotalRevenue)
                .ToListAsync();

            var summary = new
            {
                TotalRevenue = reports.Sum(r => r.TotalRevenue),
                TotalAppointments = reports.Sum(r => r.TotalAppointments),
                TotalNewPatients = reports.Sum(r => r.NewPatients),
                ClinicsReported = reports.Count
            };

            return Ok(new
            {
                success = true,
                data = new
                {
                    Month = targetMonth,
                    Year = targetYear,
                    Summary = summary,
                    Clinics = reports
                }
            });
        }

        // GET /api/SuperAdmin/monthly-reports/history?monthsBack=12
        [HttpGet("monthly-reports/history")]
        public async Task<IActionResult> GetMonthlyReportsHistory(int? tenantId, int monthsBack = 12)
        {
            // ✅ FIX: لو التيبل فاضية → رجّع list فاضية بدل 500
            var tableHasData = await _context.MonthlyReports.AnyAsync();
            if (!tableHasData)
                return Ok(new { success = true, data = new List<object>() });

            var cutoff = DateTime.UtcNow.AddMonths(-monthsBack);
            var cutoffDate = new DateTime(cutoff.Year, cutoff.Month, 1);

            var query = _context.MonthlyReports.AsQueryable();

            if (tenantId.HasValue)
                query = query.Where(r => r.TenantId == tenantId.Value);

            var history = await query
                .Where(r => new DateTime(r.Year, r.Month, 1) >= cutoffDate)
                .GroupBy(r => new { r.Year, r.Month })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    TotalRevenue = g.Sum(r => r.TotalRevenue),
                    TotalAppointments = g.Sum(r => r.TotalAppointments),
                    NewPatients = g.Sum(r => r.NewPatients)
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync();

            return Ok(new { success = true, data = history });
        }
    }
}
