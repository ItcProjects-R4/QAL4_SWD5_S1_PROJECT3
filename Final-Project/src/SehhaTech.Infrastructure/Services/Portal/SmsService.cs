using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SehhaTech.Core.Interfaces;
using Vonage;
using Vonage.Messaging;
using Vonage.Request;

namespace SehhaTech.Infrastructure.Services.Portal;

public class SmsService : ISmsService
{
    private readonly ILogger<SmsService> _logger;
    private readonly VonageClient _vonageClient;
    private readonly string _senderId;

    public SmsService(ILogger<SmsService> logger, IConfiguration config)
    {
        _logger = logger;

        var apiKey = config["Vonage:ApiKey"]
            ?? throw new InvalidOperationException("Vonage:ApiKey is missing in configuration.");
        var apiSecret = config["Vonage:ApiSecret"]
            ?? throw new InvalidOperationException("Vonage:ApiSecret is missing in configuration.");

        _senderId = config["Vonage:SenderId"] ?? "SehhaTech";

        var credentials = Credentials.FromApiKeyAndSecret(apiKey, apiSecret);
        _vonageClient = new VonageClient(credentials);
    }

    public async Task<bool> SendOtpAsync(string phone, string code)
    {
        var message = $"SehhaTech: Your verification code is {code}. Valid for 5 minutes.";
        return await SendSmsAsync(phone, message);
    }

    public async Task<bool> SendSmsAsync(string phone, string message)
    {
        var formattedPhone = FormatToInternational(phone);

        var request = new SendSmsRequest
        {
            To = formattedPhone,
            From = _senderId,
            Text = message
        };

        try
        {
            var response = await _vonageClient.SmsClient.SendAnSmsAsync(request);
            var success = response.Messages.All(m => m.Status == "0");

            if (success)
                _logger.LogInformation("SMS sent successfully to {Phone}", phone);
            else
            {
                var errorText = string.Join(", ", response.Messages.Select(m => m.ErrorText));
                _logger.LogWarning("Failed to send SMS to {Phone}: {Error}", phone, errorText);
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while sending SMS to {Phone}", phone);
            return false;
        }
    }

    private static string FormatToInternational(string phone)
    {
        phone = phone.Trim();

        if (phone.StartsWith("+"))
            return phone[1..];

        if (phone.StartsWith("00"))
            return phone[2..];

        if (phone.StartsWith("0"))
            return "20" + phone[1..];

        return phone;
    }
}