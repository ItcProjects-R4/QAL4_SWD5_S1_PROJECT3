using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SehhaTech.Core.DTOs.Admin;
using SehhaTech.Core.Interfaces;

namespace SehhaTech.API.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "ClinicAdmin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // Helper - يجيب TenantId من الـ Middleware
        private int GetTenantId() => (int)HttpContext.Items["TenantId"]!;

        // ─── Dashboard ───────────────────────────────────────────
        /// <summary>GET /api/admin/dashboard</summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var result = await _adminService.GetDashboardAsync(GetTenantId());
            return Ok(result);
        }

        // ─── Doctors ─────────────────────────────────────────────
        /// <summary>GET /api/admin/doctors</summary>
        [HttpGet("doctors")]
        public async Task<IActionResult> GetDoctors()
        {
            var result = await _adminService.GetDoctorsAsync(GetTenantId());
            return Ok(result);
        }

        /// <summary>POST /api/admin/doctors</summary>
        [HttpPost("doctors")]
        public async Task<IActionResult> AddDoctor([FromBody] AddDoctorDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _adminService.AddDoctorAsync(GetTenantId(), dto);
                return CreatedAtAction(nameof(GetDoctors), result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        /// <summary>DELETE /api/admin/doctors/{id}</summary>
        [HttpDelete("doctors/{id:int}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            try
            {
                await _adminService.DeleteDoctorAsync(GetTenantId(), id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)  // ← أضف ده
            {
                return StatusCode(500, new { message = "حصل خطأ أثناء الحذف", detail = ex.Message });
            }
        }

        /// <summary>PUT /api/admin/doctors/{id}/toggle</summary>
        [HttpPut("doctors/{id:int}/toggle")]
        public async Task<IActionResult> ToggleDoctorStatus(int id)
        {
            try
            {
                await _adminService.ToggleDoctorStatusAsync(GetTenantId(), id);
                return Ok(new { message = "تم تغيير حالة الدكتور" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // ─── Receptionists ───────────────────────────────────────
        /// <summary>GET /api/admin/receptionists</summary>
        [HttpGet("receptionists")]
        public async Task<IActionResult> GetReceptionists()
        {
            var result = await _adminService.GetReceptionistsAsync(GetTenantId());
            return Ok(result);
        }

        /// <summary>POST /api/admin/receptionists</summary>
        [HttpPost("receptionists")]
        public async Task<IActionResult> AddReceptionist([FromBody] AddReceptionistDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _adminService.AddReceptionistAsync(GetTenantId(), dto);
                return CreatedAtAction(nameof(GetReceptionists), result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        /// <summary>DELETE /api/admin/receptionists/{id}</summary>
        [HttpDelete("receptionists/{id:int}")]
        public async Task<IActionResult> DeleteReceptionist(int id)
        {
            try
            {
                await _adminService.DeleteReceptionistAsync(GetTenantId(), id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // ─── Settings ────────────────────────────────────────────
        /// <summary>GET /api/admin/settings</summary>
        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            var result = await _adminService.GetSettingsAsync(GetTenantId());
            return Ok(result);
        }

        /// <summary>PUT /api/admin/settings</summary>
        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateClinicSettingsDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                await _adminService.UpdateSettingsAsync(GetTenantId(), dto);
                return Ok(new { message = "تم تحديث بيانات العيادة" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
        // ─── Monthly Report (تقرير عيادة الأدمن نفسه) ────────────────
        /// <summary>GET /api/admin/monthly-report?month=6&amp;year=2026</summary>
        [HttpGet("monthly-report")]
        public async Task<IActionResult> GetMonthlyReport(int? month, int? year)
        {
            var result = await _adminService.GetMonthlyReportAsync(GetTenantId(), month, year);
            return Ok(result);
        }

        /// <summary>GET /api/admin/monthly-report/history?monthsBack=12</summary>
        [HttpGet("monthly-report/history")]
        public async Task<IActionResult> GetMonthlyReportHistory(int monthsBack = 12)
        {
            var result = await _adminService.GetMonthlyReportHistoryAsync(GetTenantId(), monthsBack);
            return Ok(result);
        }
    }
}
