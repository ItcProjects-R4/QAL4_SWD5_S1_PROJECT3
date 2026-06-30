using Microsoft.EntityFrameworkCore;
using SehhaTech.Core.DTOs.Admin;
using SehhaTech.Core.Interfaces;
using SehhaTech.Infrastructure.Data;
using SehhaTech.Core.Models;

namespace SehhaTech.Infrastructure.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _db;

        public AdminService(AppDbContext db)
        {
            _db = db;
        }

        // ─── Dashboard ───────────────────────────────────────────
        public async Task<AdminDashboardDto> GetDashboardAsync(int tenantId)
        {
            var today = DateTime.Today;

            var totalDoctors = await _db.Users
                .CountAsync(u => u.TenantId == tenantId && u.Role == UserRole.Doctor && u.IsActive);

            var totalReceptionists = await _db.Users
                .CountAsync(u => u.TenantId == tenantId && u.Role == UserRole.Reception && u.IsActive);

            var todayAppointments = await _db.Appointments
                .CountAsync(a => a.TenantId == tenantId && a.AppointmentDate.Date == today);

            var upcoming = await _db.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor).ThenInclude(d => d!.User)
                .Where(a => a.TenantId == tenantId
                         && a.AppointmentDate >= DateTime.Now
                         && a.Status == AppointmentStatus.Scheduled)
                .OrderBy(a => a.AppointmentDate)
                .Take(5)
                .Select(a => new UpcomingAppointmentDto
                {
                    Id = a.Id,
                    PatientName = a.Patient!.FullName,
                    DoctorName = a.Doctor!.User!.FullName,
                    ScheduledAt = a.AppointmentDate,
                    Status = a.Status.ToString()
                })
                .ToListAsync();

            var recentRegistrations = await _db.Users
                .Where(u => u.TenantId == tenantId && u.Role != UserRole.ClinicAdmin)
                .OrderByDescending(u => u.CreatedAt)
                .Take(5)
                .Select(u => new RecentRegistrationDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Role = u.Role.ToString(),
                    ProfileImageUrl = u.ProfileImageUrl,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            var rawChart = await _db.Appointments
                .Where(a => a.TenantId == tenantId &&
                            a.AppointmentDate >= DateTime.Today.AddDays(-7))
                .GroupBy(a => a.AppointmentDate.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            var activityChart = rawChart.Select(x => new ActivityChartDto
            {
                Date = x.Date.ToString("yyyy-MM-dd"),
                Count = x.Count
            }).ToList();

            return new AdminDashboardDto
            {
                TotalDoctors = totalDoctors,
                TotalReceptionists = totalReceptionists,
                TodayAppointments = todayAppointments,
                UpcomingAppointments = upcoming,
                RecentRegistrations = recentRegistrations,
                ActivityChart = activityChart
            };
        }

        // ─── Doctors ─────────────────────────────────────────────
        public async Task<List<DoctorListItemDto>> GetDoctorsAsync(int tenantId)
        {
            return await _db.Doctors
                .Include(d => d.User)
                .Where(d => d.TenantId == tenantId)
                .Select(d => new DoctorListItemDto
                {
                    Id = d.Id,
                    FullName = d.User!.FullName,
                    Specialization = d.Specialization,
                    Email = d.User.Email,
                    ProfileImageUrl = d.ProfileImageUrl,
                    IsActive = d.IsActive
                })
                .ToListAsync();
        }

        public async Task<DoctorListItemDto> AddDoctorAsync(int tenantId, AddDoctorDto dto)
        {
            // Validation
            if (string.IsNullOrWhiteSpace(dto.FullName))
                throw new ArgumentException("اسم الدكتور مطلوب");

            if (string.IsNullOrWhiteSpace(dto.Specialization))
                throw new ArgumentException("التخصص مطلوب");

            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new ArgumentException("البريد الإلكتروني مطلوب");

            var emailExists = await _db.Users.AnyAsync(u => u.Email == dto.Email);
            if (emailExists)
                throw new InvalidOperationException("البريد الإلكتروني مستخدم بالفعل");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                ProfileImageUrl = dto.ProfileImageUrl,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("SehhaTech@123"),
                Role = UserRole.Doctor,
                TenantId = tenantId,
                MustResetPassword = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var doctor = new Doctor
            {
                UserId = user.Id,
                TenantId = tenantId,
                Specialization = dto.Specialization,
                ProfileImageUrl = dto.ProfileImageUrl,
                IsActive = true
            };

            _db.Doctors.Add(doctor);
            await _db.SaveChangesAsync();

            return new DoctorListItemDto
            {
                Id = doctor.Id,
                FullName = user.FullName,
                Specialization = doctor.Specialization,
                Email = user.Email,
                ProfileImageUrl = doctor.ProfileImageUrl,
                IsActive = doctor.IsActive
            };
        }

        public async Task DeleteDoctorAsync(int tenantId, int doctorId)
        {
            var doctor = await _db.Doctors
                .Include(d => d.User)
                .Include(d => d.Appointments)
                .FirstOrDefaultAsync(d => d.Id == doctorId && d.TenantId == tenantId)
                ?? throw new KeyNotFoundException("الدكتور مش موجود");

            // احذف الـ appointments الأول عشان مفيش FK error
            if (doctor.Appointments.Any())
                _db.Appointments.RemoveRange(doctor.Appointments);

            // بعدين احذف الـ Doctor
            _db.Doctors.Remove(doctor);

            // بعدين احذف الـ User
            if (doctor.User != null)
                _db.Users.Remove(doctor.User);

            await _db.SaveChangesAsync();
        }

        public async Task ToggleDoctorStatusAsync(int tenantId, int doctorId)
        {
            var doctor = await _db.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == doctorId && d.TenantId == tenantId)
                ?? throw new KeyNotFoundException("الدكتور مش موجود");

            doctor.IsActive = !doctor.IsActive;

            // sync الـ User كمان
            if (doctor.User != null)
                doctor.User.IsActive = doctor.IsActive;

            await _db.SaveChangesAsync();
        }

        // ─── Receptionists ───────────────────────────────────────
        public async Task<List<ReceptionistListItemDto>> GetReceptionistsAsync(int tenantId)
        {
            return await _db.Users
                .Where(u => u.TenantId == tenantId && u.Role == UserRole.Reception)
                .Select(u => new ReceptionistListItemDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    ProfileImageUrl = u.ProfileImageUrl,
                    IsActive = u.IsActive
                })
                .ToListAsync();
        }

        public async Task<ReceptionistListItemDto> AddReceptionistAsync(int tenantId, AddReceptionistDto dto)
        {
            // Validation
            if (string.IsNullOrWhiteSpace(dto.FullName))
                throw new ArgumentException("اسم الموظف مطلوب");

            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new ArgumentException("البريد الإلكتروني مطلوب");

            var emailExists = await _db.Users.AnyAsync(u => u.Email == dto.Email);
            if (emailExists)
                throw new InvalidOperationException("البريد الإلكتروني مستخدم بالفعل");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                ProfileImageUrl = dto.ProfileImageUrl,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("SehhaTech@123"),
                Role = UserRole.Reception,
                TenantId = tenantId,
                MustResetPassword = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return new ReceptionistListItemDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                ProfileImageUrl = user.ProfileImageUrl,
                IsActive = user.IsActive
            };
        }

        public async Task DeleteReceptionistAsync(int tenantId, int receptionistId)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Id == receptionistId
                                       && u.TenantId == tenantId
                                       && u.Role == UserRole.Reception)
                ?? throw new KeyNotFoundException("الموظف مش موجود");

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
        }

        // ─── Settings ────────────────────────────────────────────
        public async Task<ClinicSettingsDto> GetSettingsAsync(int tenantId)
        {
            var tenant = await _db.Tenants
                .Include(t => t.Subscription)
                .FirstOrDefaultAsync(t => t.Id == tenantId)
                ?? throw new KeyNotFoundException("العيادة مش موجودة");

            return new ClinicSettingsDto
            {
                TenantId = tenant.Id,
                ClinicName = tenant.Name,
                Phone = tenant.Phone,
                Address = tenant.Address,
                SubscriptionStart = tenant.Subscription?.StartDate ?? DateTime.MinValue,
                SubscriptionEnd = tenant.Subscription?.EndDate ?? DateTime.MinValue,
                IsSubscriptionActive = tenant.Subscription?.Status == SubscriptionStatus.Active
            };
        }

        public async Task UpdateSettingsAsync(int tenantId, UpdateClinicSettingsDto dto)
        {
            var tenant = await _db.Tenants.FindAsync(tenantId)
                ?? throw new KeyNotFoundException("العيادة مش موجودة");

            // ✅ مش هنمسح القيم القديمة لو الـ dto فاضي
            if (!string.IsNullOrWhiteSpace(dto.ClinicName))
                tenant.Name = dto.ClinicName;

            if (!string.IsNullOrWhiteSpace(dto.Phone))
                tenant.Phone = dto.Phone;

            if (!string.IsNullOrWhiteSpace(dto.Address))
                tenant.Address = dto.Address;

            await _db.SaveChangesAsync();
        }

        // ─── Monthly Report ────────────────────────────────────────
        public async Task<MonthlyReportDto> GetMonthlyReportAsync(int tenantId, int? month, int? year)
        {
            var targetMonth = month ?? DateTime.UtcNow.Month;
            var targetYear = year ?? DateTime.UtcNow.Year;

            // 1) جرب تجيب السجل المحفوظ اللي Hangfire ولّده الأول
            var saved = await _db.MonthlyReports
                .Where(r => r.TenantId == tenantId && r.Month == targetMonth && r.Year == targetYear)
                .Select(r => new MonthlyReportDto
                {
                    Month = r.Month,
                    Year = r.Year,
                    TotalAppointments = r.TotalAppointments,
                    CompletedAppointments = r.CompletedAppointments,
                    CancelledAppointments = r.CancelledAppointments,
                    NoShowAppointments = r.NoShowAppointments,
                    TotalRevenue = r.TotalRevenue,
                    PendingRevenue = r.PendingRevenue,
                    NewPatients = r.NewPatients,
                    GeneratedAt = r.GeneratedAt,
                    IsLive = false
                })
                .FirstOrDefaultAsync();

            if (saved != null)
                return saved;

            // 2) لو لسه ما اتعملش (مثلاً الشهر الحالي قبل ما الجوب يشغّل)، احسبه live
            var startOfMonth = new DateTime(targetYear, targetMonth, 1, 0, 0, 0, DateTimeKind.Utc);
            var startOfNextMonth = startOfMonth.AddMonths(1);

            var appointmentsQuery = _db.Appointments
                .Where(a => a.TenantId == tenantId
                         && a.AppointmentDate >= startOfMonth
                         && a.AppointmentDate < startOfNextMonth);

            var totalAppointments = await appointmentsQuery.CountAsync();
            var completed = await appointmentsQuery.CountAsync(a => a.Status == AppointmentStatus.Completed);
            var cancelled = await appointmentsQuery.CountAsync(a => a.Status == AppointmentStatus.Cancelled);
            var noShow = await appointmentsQuery.CountAsync(a => a.Status == AppointmentStatus.NoShow);

            // PaymentInvoice فيها TenantId مباشر، فنستخدمها بدون الحاجة لـ join
            var invoicesQuery = _db.PaymentInvoices
                .Where(i => i.TenantId == tenantId
                         && i.CreatedAt >= startOfMonth
                         && i.CreatedAt < startOfNextMonth);

            var totalRevenue = await invoicesQuery.SumAsync(i => (decimal?)i.PaidAmount) ?? 0;
            var pendingRevenue = await invoicesQuery.SumAsync(i => (decimal?)i.RemainingAmount) ?? 0;

            var newPatients = await _db.Patients
                .CountAsync(p => p.TenantId == tenantId
                              && p.CreatedAt >= startOfMonth
                              && p.CreatedAt < startOfNextMonth);

            return new MonthlyReportDto
            {
                Month = targetMonth,
                Year = targetYear,
                TotalAppointments = totalAppointments,
                CompletedAppointments = completed,
                CancelledAppointments = cancelled,
                NoShowAppointments = noShow,
                TotalRevenue = totalRevenue,
                PendingRevenue = pendingRevenue,
                NewPatients = newPatients,
                GeneratedAt = null,
                IsLive = true
            };
        }

        public async Task<List<MonthlyReportHistoryItemDto>> GetMonthlyReportHistoryAsync(int tenantId, int monthsBack)
        {
            var cutoff = DateTime.UtcNow.AddMonths(-monthsBack);
            var cutoffYear = cutoff.Year;
            var cutoffMonth = cutoff.Month;

            return await _db.MonthlyReports
                .Where(r => r.TenantId == tenantId
                         && (r.Year > cutoffYear || (r.Year == cutoffYear && r.Month >= cutoffMonth)))
                .OrderBy(r => r.Year).ThenBy(r => r.Month)
                .Select(r => new MonthlyReportHistoryItemDto
                {
                    Month = r.Month,
                    Year = r.Year,
                    TotalAppointments = r.TotalAppointments,
                    TotalRevenue = r.TotalRevenue,
                    NewPatients = r.NewPatients
                })
                .ToListAsync();
        }
    }
}