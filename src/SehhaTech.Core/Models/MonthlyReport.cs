namespace SehhaTech.Core.Models;

public class MonthlyReport
{
    public int Id { get; set; }
    public int TenantId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }

    // مواعيد
    public int TotalAppointments { get; set; }
    public int CompletedAppointments { get; set; }
    public int CancelledAppointments { get; set; }
    public int NoShowAppointments { get; set; }

    // إيرادات
    public decimal TotalRevenue { get; set; }
    public decimal PendingRevenue { get; set; }

    // مرضى
    public int NewPatients { get; set; }

    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Tenant? Tenant { get; set; }
}