using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SehhaTech.Core.Interfaces;
using SehhaTech.Core.Models;
using SehhaTech.Core.Models.Portal;
using SehhaTech.Infrastructure.Data;

namespace SehhaTech.Infrastructure.Jobs;

public class AppointmentReminderJob
{
    private readonly AppDbContext _db;
    private readonly ISmsService _sms;
    private readonly ILogger<AppointmentReminderJob> _logger;

    public AppointmentReminderJob(AppDbContext db, ISmsService sms, ILogger<AppointmentReminderJob> logger)
    {
        _db = db;
        _sms = sms;
        _logger = logger;
    }

    /// <summary>
    /// بيتشغل كل يوم الساعة 9 الصبح — بيبعت SMS لكل مريض عنده موعد بكره
    /// </summary>
    public async Task SendRemindersAsync()
    {
        var tomorrow = DateTime.UtcNow.Date.AddDays(1);
        var dayAfter = tomorrow.AddDays(1);

        // ── 1. مواعيد Staff (Appointment table) ──────────────────────────────
        var staffAppointments = await _db.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Where(a =>
                a.AppointmentDate >= tomorrow &&
                a.AppointmentDate < dayAfter &&
                a.Status != AppointmentStatus.Cancelled &&
                a.Status != AppointmentStatus.Completed)
            .ToListAsync();

        foreach (var appt in staffAppointments)
        {
            if (string.IsNullOrWhiteSpace(appt.Patient?.Phone)) continue;

            var doctorName = appt.Doctor?.User?.FullName ?? "الدكتور";
            var time = appt.AppointmentDate.ToString("hh:mm tt");
            var message = $"SehhaTech: تذكير بموعدك غداً مع {doctorName} الساعة {time}. نتمنى لك الشفاء العاجل.";

            var sent = await _sms.SendSmsAsync(appt.Patient.Phone, message);
            if (sent)
                _logger.LogInformation("Reminder sent for Appointment #{Id} to {Phone}", appt.Id, appt.Patient.Phone);
            else
                _logger.LogWarning("Failed to send reminder for Appointment #{Id}", appt.Id);
        }

        // ── 2. حجوزات البوابة (PatientBooking table) ─────────────────────────
        var portalBookings = await _db.PatientBookings
            .Include(b => b.PortalUser)
            .Where(b =>
                b.SlotDate.Date == tomorrow &&
                b.Status == BookingStatus.Confirmed)
            .ToListAsync();

        foreach (var booking in portalBookings)
        {
            if (string.IsNullOrWhiteSpace(booking.PortalUser?.Phone)) continue;

            var time = booking.SlotTime.ToString(@"hh\:mm");
            var message = $"SehhaTech: تذكير بموعدك غداً الساعة {time}. نتمنى لك الشفاء العاجل.";

            var sent = await _sms.SendSmsAsync(booking.PortalUser.Phone, message);
            if (sent)
                _logger.LogInformation("Reminder sent for Booking #{Id} to {Phone}", booking.Id, booking.PortalUser.Phone);
            else
                _logger.LogWarning("Failed to send reminder for Booking #{Id}", booking.Id);
        }

        _logger.LogInformation(
            "Reminder job done: {Staff} staff appts + {Portal} portal bookings",
            staffAppointments.Count, portalBookings.Count);
    }
}