namespace SehhaTech.Infrastructure.Services.Portal;

/// <summary>
/// Helper موحّد لجلب التوقيت المحلي لمصر.
/// بيجرّب الـ Windows ID الأول ("Egypt Standard Time")، ولو فشل
/// (مثلاً السيرفر شغال على Linux) بيرجع يجرّب IANA ID ("Africa/Cairo").
/// كده الكود بيفضل شغال صحيح على أي OS بدل ما يعمل Exception بصمت
/// أو يرجع نتيجة غلط تسمح بحجز معاد فايت.
/// </summary>
public static class TimeZoneHelper
{
    private static readonly Lazy<TimeZoneInfo> _egyptTimeZone = new(() =>
    {
        try
        {
            // Windows
            return TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
        }
        catch (TimeZoneNotFoundException)
        {
            // Linux / macOS (IANA)
            return TimeZoneInfo.FindSystemTimeZoneById("Africa/Cairo");
        }
    });

    public static TimeZoneInfo EgyptTimeZone => _egyptTimeZone.Value;

    public static DateTime GetEgyptNow()
    {
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, EgyptTimeZone);
    }
}
