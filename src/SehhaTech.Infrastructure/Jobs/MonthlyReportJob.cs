using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SehhaTech.Core.Interfaces;
using SehhaTech.Core.Models;
using SehhaTech.Infrastructure.Data;

namespace SehhaTech.Infrastructure.Jobs;

public class MonthlyReportJob
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;
    private readonly ILogger<MonthlyReportJob> _logger;

    public MonthlyReportJob(AppDbContext db, IEmailService email, ILogger<MonthlyReportJob> logger)
    {
        _db = db;
        _email = email;
        _logger = logger;
    }

    /// <summary>
    /// بيتشغل أول كل شهر — بيحفظ إحصائيات الشهر اللي فات في DB ويبعت email للـ Admin
    /// </summary>
    public async Task GenerateReportsAsync()
    {
        var now = DateTime.UtcNow;
        var firstOfLastMonth = new DateTime(now.Year, now.Month, 1).AddMonths(-1);
        var firstOfThisMonth = new DateTime(now.Year, now.Month, 1);
        var reportMonth = firstOfLastMonth.Month;
        var reportYear = firstOfLastMonth.Year;

        var tenants = await _db.Tenants
            .Where(t => t.IsActive)
            .ToListAsync();

        _logger.LogInformation(
            "Monthly report job started for {Month}/{Year} — {Count} tenants",
            reportMonth, reportYear, tenants.Count);

        foreach (var tenant in tenants)
        {
            // ── تجنب التكرار لو الـ job اتشغل مرتين ────────────────────────
            var exists = await _db.MonthlyReports.AnyAsync(r =>
                r.TenantId == tenant.Id &&
                r.Month == reportMonth &&
                r.Year == reportYear);

            if (exists)
            {
                _logger.LogInformation("Report already exists for Tenant #{Id} {Month}/{Year}", tenant.Id, reportMonth, reportYear);
                continue;
            }

            // ── مواعيد الشهر ─────────────────────────────────────────────────
            var appointments = await _db.Appointments
                .Where(a =>
                    a.TenantId == tenant.Id &&
                    a.AppointmentDate >= firstOfLastMonth &&
                    a.AppointmentDate < firstOfThisMonth)
                .ToListAsync();

            // ── إيرادات الشهر ─────────────────────────────────────────────────
            var invoices = await _db.PaymentInvoices
                .Where(i =>
                    i.TenantId == tenant.Id &&
                    i.CreatedAt >= firstOfLastMonth &&
                    i.CreatedAt < firstOfThisMonth)
                .ToListAsync();

            // ── مرضى جدد ─────────────────────────────────────────────────────
            var newPatients = await _db.Patients
                .CountAsync(p =>
                    p.TenantId == tenant.Id &&
                    p.CreatedAt >= firstOfLastMonth &&
                    p.CreatedAt < firstOfThisMonth);

            // ── حفظ في DB ─────────────────────────────────────────────────────
            var report = new MonthlyReport
            {
                TenantId = tenant.Id,
                Month = reportMonth,
                Year = reportYear,
                TotalAppointments = appointments.Count,
                CompletedAppointments = appointments.Count(a => a.Status == AppointmentStatus.Completed),
                CancelledAppointments = appointments.Count(a => a.Status == AppointmentStatus.Cancelled),
                NoShowAppointments = appointments.Count(a => a.Status == AppointmentStatus.NoShow),
                TotalRevenue = invoices.Sum(i => i.PaidAmount),
                PendingRevenue = invoices.Sum(i => i.RemainingAmount),
                NewPatients = newPatients,
                GeneratedAt = now
            };

            _db.MonthlyReports.Add(report);
            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "Report saved for Tenant #{Id} ({Name}) — {Month}/{Year}",
                tenant.Id, tenant.Name, reportMonth, reportYear);

            // ── بعت Email للـ Admin ───────────────────────────────────────────
            var monthName = firstOfLastMonth.ToString("MMMM yyyy");
            var subject = $"SehhaTech — تقرير {monthName} للعيادة";
            var html = BuildEmailHtml(tenant.Name, monthName, report);

            await _email.SendEmailAsync(tenant.Email, tenant.Name, subject, html);
        }

        _logger.LogInformation("Monthly report job completed for {Count} tenants", tenants.Count);
    }

    private static string BuildEmailHtml(string tenantName, string monthName, MonthlyReport r)
    {
        var style = "<style>" +
            "body{font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;color:#333}" +
            ".card{background:white;border-radius:8px;padding:30px;max-width:600px;margin:auto}" +
            "h1{color:#2563eb;font-size:22px}" +
            "table{width:100%;border-collapse:collapse;margin-top:20px}" +
            "th{background:#2563eb;color:white;padding:10px;text-align:right}" +
            "td{padding:10px;border-bottom:1px solid #eee}" +
            ".highlight{font-size:18px;font-weight:bold;color:#16a34a}" +
            ".footer{margin-top:20px;font-size:12px;color:#888;text-align:center}" +
            "</style>";

        return "<!DOCTYPE html><html dir='rtl' lang='ar'><head><meta charset='UTF-8'>" + style + "</head><body>" +
            "<div class='card'>" +
            $"<h1>تقرير {monthName}</h1>" +
            $"<p>مرحباً بعيادة <strong>{tenantName}</strong>، هذا ملخص أداء العيادة للشهر الماضي.</p>" +
            "<table>" +
            "<tr><th colspan='2'>المواعيد</th></tr>" +
            $"<tr><td>إجمالي المواعيد</td><td>{r.TotalAppointments}</td></tr>" +
            $"<tr><td>مكتملة</td><td>{r.CompletedAppointments}</td></tr>" +
            $"<tr><td>ملغاة</td><td>{r.CancelledAppointments}</td></tr>" +
            $"<tr><td>لم يحضر</td><td>{r.NoShowAppointments}</td></tr>" +
            "<tr><th colspan='2'>الإيرادات</th></tr>" +
            $"<tr><td>إجمالي المحصّل</td><td class='highlight'>{r.TotalRevenue:N0} ج.م</td></tr>" +
            $"<tr><td>متبقي غير محصّل</td><td>{r.PendingRevenue:N0} ج.م</td></tr>" +
            "<tr><th colspan='2'>المرضى</th></tr>" +
            $"<tr><td>مرضى جدد هذا الشهر</td><td>{r.NewPatients}</td></tr>" +
            "</table>" +
            "<div class='footer'>SehhaTech — نظام إدارة العيادات</div>" +
            "</div></body></html>";
    }
}