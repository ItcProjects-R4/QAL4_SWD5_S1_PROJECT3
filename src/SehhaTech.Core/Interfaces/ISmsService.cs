namespace SehhaTech.Core.Interfaces;

public interface ISmsService
{
    /// <summary>بيبعت OTP code للمستخدم</summary>
    Task<bool> SendOtpAsync(string phone, string code);

    /// <summary>بيبعت رسالة SMS عامة (reminders، notifications)</summary>
    Task<bool> SendSmsAsync(string phone, string message);
}