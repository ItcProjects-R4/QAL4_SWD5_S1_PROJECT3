using BCrypt.Net;
using Hangfire;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SehhaTech.Core.Interfaces;
using SehhaTech.Core.Models;
using SehhaTech.Infrastructure.Data;
using SehhaTech.Infrastructure.Jobs;
using SehhaTech.Infrastructure.Services;
using SehhaTech.Infrastructure.Services.Portal;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Hangfire ──────────────────────────────────────────────────────────────────
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new SqlServerStorageOptions
        {
            CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
            SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
            QueuePollInterval = TimeSpan.Zero,
            UseRecommendedIsolationLevel = true,
            DisableGlobalLocks = true
        }));

builder.Services.AddHangfireServer();

// ── Background Jobs (Scoped — Hangfire بيعمل لهم scope تلقائي) ───────────────
builder.Services.AddScoped<AppointmentReminderJob>();
builder.Services.AddScoped<SessionCleanupJob>();
builder.Services.AddScoped<MonthlyReportJob>();

// Services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISmsService, SmsService>();
builder.Services.AddScoped<SlotService>();
builder.Services.AddScoped<ChatBotService>();
builder.Services.AddScoped<IChurnPredictionService, ChurnPredictionService>(); // ✅ Churn AI

// JWT Auth
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]!;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAdminService, AdminService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Paymob
builder.Services.AddHttpClient<IPaymobService, PaymobService>();

// Cloudinary
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
// Email
builder.Services.AddScoped<IEmailService, EmailService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<SehhaTech.API.Middleware.TenantMiddleware>();

// ── Hangfire Dashboard (شوف الـ jobs من /hangfire) ───────────────────────────
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    // في Production: ضيف authorization هنا
    Authorization = []
});

// ── Schedule الـ Recurring Jobs ───────────────────────────────────────────────
RecurringJob.AddOrUpdate<AppointmentReminderJob>(
    "appointment-reminders",
    job => job.SendRemindersAsync(),
    "0 9 * * *",          // كل يوم الساعة 9 صباحاً
    new RecurringJobOptions { TimeZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time") });

RecurringJob.AddOrUpdate<SessionCleanupJob>(
    "session-cleanup",
    job => job.CleanupAsync(),
    "0 * * * *");          // كل ساعة

RecurringJob.AddOrUpdate<MonthlyReportJob>(
    "monthly-reports",
    job => job.GenerateReportsAsync(),
    "0 6 1 * *");          // أول كل شهر الساعة 6 صباحاً

app.MapControllers();

app.Run();
