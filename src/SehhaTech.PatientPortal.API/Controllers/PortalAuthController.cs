using Microsoft.AspNetCore.Mvc;
using SehhaTech.Core.DTOs.Portal;
using SehhaTech.Infrastructure.Services.Portal;

namespace SehhaTech.PatientPortal.API.Controllers;

[ApiController]
[Route("api/portal/auth")]
public class PortalAuthController : ControllerBase
{
    private readonly PortalAuthService _authService;

    public PortalAuthController(PortalAuthService authService)
    {
        _authService = authService;
    }

    // POST /api/portal/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterPortalUserRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var (success, message) = await _authService.RegisterAsync(request, ip);

        if (!success)
            return BadRequest(new { message });

        return Ok(new { message });
    }

    // POST /api/portal/auth/verify-otp
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var (success, message, data) = await _authService.VerifyOtpAsync(request);

        if (!success)
            return BadRequest(new { message });

        return Ok(new { message, data });
    }
}