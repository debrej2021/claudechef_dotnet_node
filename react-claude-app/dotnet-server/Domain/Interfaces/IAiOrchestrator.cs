using ClaudeChef.Api.Domain.Models;

namespace ClaudeChef.Api.Domain.Interfaces;

public interface IAiOrchestrator
{
    Task<RecipeResult> GenerateRecipeAsync(List<string> ingredients, CancellationToken ct);
    AiProviderStatus GetStatus();
}
