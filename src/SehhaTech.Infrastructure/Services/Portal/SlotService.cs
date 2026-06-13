using Microsoft.EntityFrameworkCore;
using SehhaTech.Core.DTOs.Portal;
using SehhaTech.Core.Models.Portal;
using SehhaTech.Infrastructure.Data;

namespace SehhaTech.Infrastructure.Services.Portal;

public class SlotService
{
    private readonly AppDbContext _db;

    public SlotService(AppDbContext db)
    {
        _db = db;
    }

    // GET - كل slots بتاعة دكتور معين
    public async Task<List<SlotTemplateResponse>> GetDoctorSlotsAsync(int doctorId, int tenantId)
    {
        return await _db.SlotTemplates
            .Include(s => s.Doctor)
                .ThenInclude(d => d.User)
            .Where(s => s.DoctorId == doctorId && s.TenantId == tenantId && s.IsActive)
            .Select(s => new SlotTemplateResponse
            {
                Id = s.Id,
                DoctorId = s.DoctorId,
                DoctorName = s.Doctor.User.FullName,
                DayOfWeek = s.DayOfWeek,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                SlotDurationMinutes = s.SlotDurationMinutes,
                MaxPatientsPerSlot = s.MaxPatientsPerSlot,
                IsActive = s.IsActive
            }).ToListAsync();
    }

    // POST - إضافة slot template جديد
    public async Task<SlotTemplateResponse> CreateSlotTemplateAsync(
        CreateSlotTemplateRequest request, int tenantId)
    {
        var slot = new SlotTemplate
        {
            DoctorId = request.DoctorId,
            TenantId = tenantId,
            DayOfWeek = request.DayOfWeek,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            SlotDurationMinutes = request.SlotDurationMinutes,
            MaxPatientsPerSlot = request.MaxPatientsPerSlot,
            IsActive = true
        };

        _db.SlotTemplates.Add(slot);
        await _db.SaveChangesAsync();

        var doctor = await _db.Doctors
            .Include(d => d.User)
            .FirstAsync(d => d.Id == request.DoctorId);

        return new SlotTemplateResponse
        {
            Id = slot.Id,
            DoctorId = slot.DoctorId,
            DoctorName = doctor.User!.FullName,
            DayOfWeek = slot.DayOfWeek,
            StartTime = slot.StartTime,
            EndTime = slot.EndTime,
            SlotDurationMinutes = slot.SlotDurationMinutes,
            MaxPatientsPerSlot = slot.MaxPatientsPerSlot,
            IsActive = slot.IsActive
        };
    }

    // DELETE - حذف slot template
    public async Task<bool> DeleteSlotTemplateAsync(int slotId, int tenantId)
    {
        var slot = await _db.SlotTemplates
            .FirstOrDefaultAsync(s => s.Id == slotId && s.TenantId == tenantId);

        if (slot == null) return false;

        _db.SlotTemplates.Remove(slot);
        await _db.SaveChangesAsync();
        return true;
    }

    // GET - الـ available slots لدكتور في يوم معين
    public async Task<List<AvailableSlotResponse>> GetAvailableSlotsAsync(
        int doctorId, int tenantId, DateTime date)
    {
        var dayOfWeek = date.DayOfWeek;

        // جيب الـ templates بتاعة الدكتور في اليوم ده
        var templates = await _db.SlotTemplates
            .Where(s => s.DoctorId == doctorId
                     && s.TenantId == tenantId
                     && s.DayOfWeek == dayOfWeek
                     && s.IsActive)
            .ToListAsync();

        // جيب الحجوزات الموجودة في اليوم ده
        var existingBookings = await _db.PatientBookings
            .Where(b => b.DoctorId == doctorId
                     && b.TenantId == tenantId
                     && b.SlotDate.Date == date.Date
                     && b.Status != SehhaTech.Core.Models.Portal.BookingStatus.Cancelled)
            .Select(b => b.SlotTime)
            .ToListAsync();

        var availableSlots = new List<AvailableSlotResponse>();

        foreach (var template in templates)
        {
            var current = template.StartTime;
            while (current + TimeSpan.FromMinutes(template.SlotDurationMinutes) <= template.EndTime)
            {
                availableSlots.Add(new AvailableSlotResponse
                {
                    Date = date.Date,
                    Time = current,
                    IsAvailable = !existingBookings.Contains(current)
                });
                current = current.Add(TimeSpan.FromMinutes(template.SlotDurationMinutes));
            }
        }

        return availableSlots;
    }
}