using ClaudeChef.Api.Configuration;
using ClaudeChef.Api.Domain.Interfaces;
using ClaudeChef.Api.Infrastructure.Fallback;
using ClaudeChef.Api.Infrastructure.Orchestration;
using ClaudeChef.Api.Infrastructure.Providers;
using ClaudeChef.Api.Middleware;

namespace ClaudeChef.Api.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        // Typed options — binds AiOptions section; env var AI_PROVIDER overrides via AddEnvironmentVariables()
        services.Configure<AiOptions>(opts =>
        {
            config.GetSection("AiOptions").Bind(opts);
            // Allow AI_PROVIDER env var to override the config-file provider
            var envProvider = config["AI_PROVIDER"];
            if (!string.IsNullOrEmpty(envProvider))
                opts.Provider = envProvider;
        });

        services.AddHttpClient();

        // Keyed DI: each IAiProvider registered under its own key
        services.AddKeyedSingleton<IAiProvider, OpenAiProvider>("openai");
        services.AddKeyedSingleton<IAiProvider, ClaudeProvider>("claude");

        services.AddSingleton<IFallbackRecipeService, FallbackRecipeService>();
        services.AddSingleton<IAiOrchestrator, AiOrchestrator>();

        // IMiddleware requires explicit DI registration
        services.AddTransient<RequestLoggingMiddleware>();

        return services;
    }
}
