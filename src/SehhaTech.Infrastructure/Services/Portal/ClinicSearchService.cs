using Microsoft.EntityFrameworkCore;
using SehhaTech.Core.DTOs.Portal;
using SehhaTech.Infrastructure.Data;

namespace SehhaTech.Infrastructure.Services.Portal;

public class ClinicSearchService
{
    private readonly AppDbContext _db;

    public ClinicSearchService(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/portal/clinics
    public async Task<List<ClinicSummaryResponse>> SearchClinicsAsync(
        string? name, string? specialization, string? city)
    {
        var query = _db.Tenants
            .Where(t => t.IsActive);

        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(t => t.Name.Contains(name));

        if (!string.IsNullOrWhiteSpace(specialization))
            query = query.Where(t => t.Specialization.Contains(specialization));

        if (!string.IsNullOrWhiteSpace(city))
            query = query.Where(t => t.Address.Contains(city));

        return await query.Select(t => new ClinicSummaryResponse
        {
            Id = t.Id,
            Name = t.Name,
            Specialization = t.Specialization,
            Phone = t.Phone,
            Address = t.Address
        }).ToListAsync();
    }

    // GET /api/portal/clinics/{id}
    public async Task<ClinicProfileResponse?> GetClinicProfileAsync(int tenantId)
    {
        var tenant = await _db.Tenants
            .Where(t => t.Id == tenantId && t.IsActive)
            .FirstOrDefaultAsync();

        if (tenant == null) return null;

        var doctors = await _db.Doctors
            .Include(d => d.User)
            .Where(d => d.TenantId == tenantId && d.IsActive)
            .Select(d => new DoctorSummaryResponse
            {
                Id = d.Id,
                FullName = d.User!.FullName,
                Specialization = d.Specialization,
                ProfileImageUrl = d.ProfileImageUrl
            }).ToListAsync();

        return new ClinicProfileResponse
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Specialization = tenant.Specialization,
            Phone = tenant.Phone,
            Address = tenant.Address,
            Email = tenant.Email,
            Doctors = doctors
        };
    }
}