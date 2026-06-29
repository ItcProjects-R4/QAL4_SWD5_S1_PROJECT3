using Serilog;

namespace SehhaTech.Infrastructure;

public static class LoggingConfig
{
    public static void ConfigureLogging()
    {
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.Console()
            .WriteTo.File("Logs/debug-.log",
                restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Debug,
                rollingInterval: RollingInterval.Day)
            .WriteTo.File("Logs/info-.log",
                restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Information,
                rollingInterval: RollingInterval.Day)
            .WriteTo.File("Logs/warning-.log",
                restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Warning,
                rollingInterval: RollingInterval.Day)
            .WriteTo.File("Logs/error-.log",
                restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Error,
                rollingInterval: RollingInterval.Day)
            .WriteTo.File("Logs/fatal-.log",
                restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Fatal,
                rollingInterval: RollingInterval.Day)
            .CreateLogger();
    }
}
