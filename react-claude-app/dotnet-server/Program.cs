using ClaudeChef.Api.Features.AiHealth;
using ClaudeChef.Api.Features.GenerateRecipe;
using ClaudeChef.Api.Infrastructure;
using ClaudeChef.Api.Middleware;
using Serilog;

// ── Load .env from project root ──────────────────────────────────────────────
var envFile = Path.Combine(Directory.GetCurrentDirectory(), "..", ".env");
if (File.Exists(envFile))
{
    foreach (var line in File.ReadAllLines(envFile))
    {
        var trimmed = line.Trim();
        if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith('#')) continue;
        var eq = trimmed.IndexOf('=');
        if (eq <= 0) continue;
        Environment.SetEnvironmentVariable(
            trimmed[..eq].Trim(),
            trimmed[(eq + 1)..].Trim(),
            EnvironmentVariableTarget.Process);
    }
}

// ── Bootstrap Serilog before the host builds ─────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Serilog — reads full config from appsettings.json "Serilog" section
    builder.Host.UseSerilog((ctx, services, cfg) => cfg
        .ReadFrom.Configuration(ctx.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    // Environment variables override appsettings (e.g. AI_PROVIDER, OPENAI_API_KEY)
    builder.Configuration.AddEnvironmentVariables();

    builder.Services.AddControllers()
        .AddJsonOptions(opts =>
            opts.JsonSerializerOptions.PropertyNamingPolicy =
                System.Text.Json.JsonNamingPolicy.CamelCase);

    builder.Services.AddCors(opt =>
        opt.AddDefaultPolicy(p =>
            p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

    // ── Infrastructure layer ──────────────────────────────────────────────────
    builder.Services.AddInfrastructure(builder.Configuration);

    // ── Feature slice handlers & validators ──────────────────────────────────
    builder.Services.AddScoped<GenerateRecipeHandler>();
    builder.Services.AddScoped<GenerateRecipeValidator>();
    builder.Services.AddScoped<AiHealthHandler>();

    // ── Build ─────────────────────────────────────────────────────────────────
    var app = builder.Build();

    app.UseCors();
    app.UseMiddleware<RequestLoggingMiddleware>();
    app.MapControllers();

    var port = Environment.GetEnvironmentVariable("DOTNET_PORT") ?? "5000";
    app.Urls.Add($"http://localhost:{port}");

    var provider = app.Configuration["AI_PROVIDER"]
        ?? app.Configuration["AiOptions:Provider"]
        ?? "openai";

    Log.Information("Claude Chef .NET 10 Backend | Port: {Port} | Provider: {Provider}", port, provider.ToUpper());
    Log.Information("Fallback chain: {P} → {S} → RAG", provider, provider == "openai" ? "claude" : "openai");
    Log.Information("Log file: {Path}", Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "logs", "api.log")));

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
