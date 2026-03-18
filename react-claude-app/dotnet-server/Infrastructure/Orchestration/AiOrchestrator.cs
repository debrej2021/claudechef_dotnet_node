using ClaudeChef.Api.Configuration;
using ClaudeChef.Api.Domain.Interfaces;
using ClaudeChef.Api.Domain.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace ClaudeChef.Api.Infrastructure.Orchestration;

public class AiOrchestrator(
    [FromKeyedServices("openai")] IAiProvider openAiProvider,
    [FromKeyedServices("claude")] IAiProvider claudeProvider,
    IFallbackRecipeService fallbackService,
    IOptions<AiOptions> options,
    ILogger<AiOrchestrator> logger) : IAiOrchestrator
{
    private string PrimaryKey => options.Value.Provider.ToLower() == "claude" ? "claude" : "openai";

    public async Task<RecipeResult> GenerateRecipeAsync(List<string> ingredients, CancellationToken ct)
    {
        var primary = PrimaryKey == "claude" ? claudeProvider : openAiProvider;
        var secondary = PrimaryKey == "claude" ? openAiProvider : claudeProvider;

        logger.LogInformation("Fallback chain: {Primary} → {Secondary} → RAG", primary.ProviderKey, secondary.ProviderKey);

        // Try primary provider
        try
        {
            logger.LogInformation("[Orchestrator] Attempting {Provider}...", primary.ProviderKey.ToUpper());
            var (recipe, tokens) = await primary.GenerateRecipeAsync(ingredients, ct);
            logger.LogInformation("[Orchestrator] {Provider} succeeded", primary.ProviderKey.ToUpper());
            return new RecipeResult(recipe, primary.ModelName, primary.ProviderKey, tokens, false);
        }
        catch (Exception ex)
        {
            logger.LogWarning("[Orchestrator] {Provider} failed: {Message}", primary.ProviderKey.ToUpper(), ex.Message);
        }

        // Try secondary provider
        try
        {
            logger.LogInformation("[Orchestrator] Falling back to {Provider}...", secondary.ProviderKey.ToUpper());
            var (recipe, tokens) = await secondary.GenerateRecipeAsync(ingredients, ct);
            logger.LogInformation("[Orchestrator] {Provider} succeeded (fallback)", secondary.ProviderKey.ToUpper());
            return new RecipeResult(recipe, secondary.ModelName, secondary.ProviderKey, tokens, true, primary.ProviderKey);
        }
        catch (Exception ex)
        {
            logger.LogWarning("[Orchestrator] {Provider} failed: {Message}", secondary.ProviderKey.ToUpper(), ex.Message);
        }

        // RAG template fallback — never throws
        logger.LogInformation("[Orchestrator] Using RAG fallback generator...");
        var fallbackResult = fallbackService.GenerateRecipe(ingredients);
        return fallbackResult with { FallbackUsed = true, OriginalProvider = primary.ProviderKey };
    }

    public AiProviderStatus GetStatus()
    {
        var primaryConfigured = (PrimaryKey == "claude" ? claudeProvider : openAiProvider).IsConfigured;
        return new AiProviderStatus(
            PrimaryKey,
            primaryConfigured,
            ["openai", "claude"],
            openAiProvider.IsConfigured,
            claudeProvider.IsConfigured,
            primaryConfigured ? "ready" : "not configured");
    }
}
