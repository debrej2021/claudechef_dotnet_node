using ClaudeChef.Api.Domain.Interfaces;

namespace ClaudeChef.Api.Features.GenerateRecipe;

public class GenerateRecipeHandler(IAiOrchestrator orchestrator, ILogger<GenerateRecipeHandler> logger)
{
    public async Task<GenerateRecipeResponse> HandleAsync(GenerateRecipeRequest request, CancellationToken ct)
    {
        logger.LogInformation("Generating recipe for {Count} ingredients: {Ingredients}",
            request.Ingredients.Count, string.Join(", ", request.Ingredients));

        var result = await orchestrator.GenerateRecipeAsync(request.Ingredients, ct);

        return new GenerateRecipeResponse
        {
            Success = true,
            Data = new GenerateRecipeData
            {
                Answers = [new RecipeAnswer { Model = result.Model, Text = result.Recipe }]
            },
            Meta = new GenerateRecipeMeta
            {
                Provider = result.Provider,
                TokensUsed = result.TokensUsed,
                IngredientsCount = request.Ingredients.Count,
                FallbackUsed = result.FallbackUsed,
                OriginalProvider = result.OriginalProvider,
                Timestamp = DateTime.UtcNow.ToString("o")
            }
        };
    }
}
