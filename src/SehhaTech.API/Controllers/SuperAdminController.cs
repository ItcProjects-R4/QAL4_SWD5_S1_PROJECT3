
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SehhaTech.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using SehhaTech.Core.Models;



namespace SehhaTech.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
   [Authorize(Roles="SuperAdmin")]
    public class SuperAdminController:ControllerBase
    {
        private readonly AppDbContext _context;
        public SuperAdminController(AppDbContext context)
        {
            _context = context;
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

            var growth = await _context.Tenants.GroupBy(t => t.CreatedAt.Month).Select(g => new
            {
                Month = g.Key,
                Count = g.Count()
            }).ToListAsync();



            var status = await _context.Appointments.GroupBy(a => a.Status).Select(g => new
            {
                Status= g.Key,
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
        public async Task<IActionResult>GetAllTenants()
        {
            var tenants = await _context.Tenants.Select(t => new
            {
                t.Id,
                t.Name,
                t.Phone,
                t.Email,
                t.IsActive,
                t.CreatedAt
            })
                .ToListAsync();
            return Ok(tenants);

        }
        [HttpGet("tenants/{id}")]
        public async Task<IActionResult>GetTenantById(int id)
        {
            var tenant = await _context.Tenants.Where(t => t.Id == id).Select(t=>new
            {
                t.Id ,
                t.Name ,
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
                return NotFound("Clinic not found ");
            _context.Tenants.Remove(tenant);
            await _context.SaveChangesAsync();
            return Ok(new
            {
                Message = "Clinic Deleted Successfully"
            });
        }
        [HttpGet("reports")]
        public async Task<IActionResult> GetReports()
        {
            var clinicsGrowth = await _context.Tenants.GroupBy(t => t.CreatedAt.Month).Select(g => new
            {
                Month = g.Key,
                Count = g.Count()
            }).OrderBy(x => x.Month).ToListAsync();
            var appointmentStatus = await _context.Appointments.GroupBy(a => a.Status).Select(g => new
            {
                Status = g.Key,
                Count = g.Count()
            }).ToListAsync();
            var leaderboard = await _context.Tenants
             .Select(t => new
             {
                 t.Name,
                 Doctors = _context.Doctors.Count(d => d.TenantId == t.Id),
                 Patients = _context.Patients.Count(p => p.TenantId == t.Id)

             }).OrderByDescending(x => x.Patients).Take(5).ToListAsync();
            return Ok(new
            {
                ClinicsGrowthTrend = clinicsGrowth,
                AppointmentStatusDistribution = appointmentStatus,
                PerformanceLeaderboard = leaderboard
            });
        }

        [HttpGet("settings/profile")]
        public IActionResult GetProfile()
        {
            return Ok(new
            {
                Message = " Super Admin Profile"
            });

        }
        [HttpPut("settings/changepassword")]
        public IActionResult changepassword()
        {
            return Ok(new
            {
                Message = "Password changed successfully"
            });
        }
    }
}