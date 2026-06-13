using Microsoft.EntityFrameworkCore;
using SehhaTech.Core.DTOs.Portal;
using SehhaTech.Core.Interfaces;
using SehhaTech.Core.Models.Portal;
using SehhaTech.Infrastructure.Data;

namespace SehhaTech.Infrastructure.Services.Portal;

public class PortalAuthService
{
    private readonly AppDbContext _db;
    private readonly OtpService _otpService;
    private readonly ISmsService _smsService;
    private readonly PortalJwtService _jwtService;

    public PortalAuthService(
        AppDbContext db,
        OtpService otpService,
        ISmsService smsService,
        PortalJwtService jwtService)
    {
        _db = db;
        _otpService = otpService;
        _smsService = smsService;
        _jwtService = jwtService;
    }

    public async Task<(bool Success, string Message)> RegisterAsync(
        RegisterPortalUserRequest request, string ipAddress)
    {
        // تحقق إن الرقم مش موجود
        var exists = await _db.PortalUsers.AnyAsync(u => u.Phone == request.Phone);
        if (exists)
            return (false, "Phone number already registered.");

        // اعمل الـ PortalUser
        var user = new PortalUser
        {
            FullName = request.FullName,
            Phone = request.Phone,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsPhoneVerified = false,
            Level = VerificationLevel.Unverified,
            CreatedAt = DateTime.UtcNow
        };

        _db.PortalUsers.Add(user);
        await _db.SaveChangesAsync();

        // ابعت OTP
        var otpRecord = await _otpService.CreateOtpAsync(request.Phone, OTPPurpose.Register, ipAddress);
        await _smsService.SendOtpAsync(request.Phone, otpRecord.CodeHash); // CodeHash هنا بيحتوي على الـ plain code مؤقتاً

        return (true, "Registration successful. OTP sent to your phone.");
    }

    public async Task<(bool Success, string Message, PortalAuthResponse? Data)> VerifyOtpAsync(
        VerifyOtpRequest request)
    {
        var valid = await _otpService.VerifyOtpAsync(request.Phone, request.Code, request.Purpose);
        if (!valid)
            return (false, "Invalid or expired OTP.", null);

        var user = await _db.PortalUsers.FirstOrDefaultAsync(u => u.Phone == request.Phone);
        if (user == null)
            return (false, "User not found.", null);

        // فعّل الـ phone verification
        if (request.Purpose == OTPPurpose.Register)
        {
            user.IsPhoneVerified = true;
            user.Level = VerificationLevel.PhoneVerified;
            await _db.SaveChangesAsync();
        }

        // اعمل JWT
        var tokenPair = _jwtService.GenerateTokenPair(user);
        return (true, "OTP verified successfully.", tokenPair);
    }
}