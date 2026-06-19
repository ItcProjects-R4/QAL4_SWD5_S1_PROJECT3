using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SehhaTech.Core.DTOs.Portal;
using SehhaTech.Infrastructure.Services.Portal;

namespace SehhaTech.PatientPortal.API.Controllers;

[ApiController]
[Route("api/portal")]
public class SlotController : ControllerBase
{
    private readonly SlotService _slotService;

    public SlotController(SlotService slotService)
    {
        _slotService = slotService;
    }

    // GET /api/portal/doctors/{id}/slots?date=2026-06-15
    [HttpGet("doctors/{doctorId}/slots")]
    public async Task<IActionResult> GetAvailableSlots(
        int doctorId,
        [FromQuery] int tenantId = 0,               // ✅ optional - الـ frontend مش بيبعته
        [FromQuery] DateTime? date = null)           // ✅ optional - لو مش موجود يرجع slots المستقبل
    {
        // ✅ لو مفيش date ابدأ من النهارده
        var targetDate = date?.Date ?? DateTime.UtcNow.Date;

        if (targetDate < DateTime.UtcNow.Date)
            return BadRequest(new { message = "Cannot view slots for past dates." });

        var slots = await _slotService.GetAvailableSlotsAsync(doctorId, tenantId, targetDate);
        return Ok(slots);
    }

    // ─── Admin Endpoints ─────────────────────────────────────────────────────

    // GET /api/portal/admin/slots/{doctorId}
    [HttpGet("admin/slots/{doctorId}")]
    [Authorize]                                      // ✅ كان [AllowAnonymous]
    public async Task<IActionResult> GetDoctorSlotTemplates(
        int doctorId,
        [FromQuery] int tenantId)
    {
        var slots = await _slotService.GetDoctorSlotsAsync(doctorId, tenantId);
        return Ok(slots);
    }

    // POST /api/portal/admin/slots
    [HttpPost("admin/slots")]
    [Authorize]                                      // ✅ كان [AllowAnonymous]
    public async Task<IActionResult> CreateSlotTemplate(
        [FromBody] CreateSlotTemplateRequest request,
        [FromQuery] int tenantId)
    {
        var result = await _slotService.CreateSlotTemplateAsync(request, tenantId);
        return CreatedAtAction(nameof(GetDoctorSlotTemplates),
            new { doctorId = result.DoctorId, tenantId }, result);
    }

    // DELETE /api/portal/admin/slots/{id}
    [HttpDelete("admin/slots/{id}")]
    [Authorize]                                      // ✅ كان [AllowAnonymous]
    public async Task<IActionResult> DeleteSlotTemplate(
        int id,
        [FromQuery] int tenantId)
    {
        var success = await _slotService.DeleteSlotTemplateAsync(id, tenantId);
        if (!success)
            return NotFound(new { message = "Slot template not found." });

        return Ok(new { message = "Slot template deleted successfully." });
    }
}