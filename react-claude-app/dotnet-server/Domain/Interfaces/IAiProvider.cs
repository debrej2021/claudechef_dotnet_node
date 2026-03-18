namespace ClaudeChef.Api.Domain.Interfaces;

public interface IAiProvider
{
    string ProviderKey { get; }
    string ModelName { get; }
    bool IsConfigured { get; }
    Task<(string recipe, int tokensUsed)> GenerateRecipeAsync(List<string> ingredients, CancellationToken ct);
}
