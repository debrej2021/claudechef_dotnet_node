namespace ClaudeChef.Api.Domain.Models;

public record RecipeResult(
    string Recipe,
    string Model,
    string Provider,
    int TokensUsed,
    bool FallbackUsed,
    string OriginalProvider = "");
