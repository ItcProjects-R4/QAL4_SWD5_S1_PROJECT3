using Microsoft.Extensions.Logging;
using SehhaTech.Core.Interfaces;

namespace SehhaTech.Infrastructure.Services.Portal;

public class SmsService : ISmsService
{
    private readonly ILogger<SmsService> _logger;

    public SmsService(ILogger<SmsService> logger)
    {
        _logger = logger;
    }

    public async Task<bool> SendOtpAsync(string phone, string code)
    {
        // Placeholder — هنربطه بـ Vonage/Twilio لاحقاً
        // دلوقتي بيعمل log للـ code عشان نقدر نتيست
        _logger.LogInformation("OTP for {Phone}: {Code}", phone, code);
        return await Task.FromResult(true);
    }
}