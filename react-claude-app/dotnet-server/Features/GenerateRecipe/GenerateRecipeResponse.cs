namespace ClaudeChef.Api.Features.GenerateRecipe;

public class GenerateRecipeResponse
{
    public bool Success { get; init; }
    public GenerateRecipeData? Data { get; init; }
    public GenerateRecipeMeta? Meta { get; init; }
    public string? Error { get; init; }
}

public class GenerateRecipeData
{
    public List<RecipeAnswer> Answers { get; init; } = [];
}

public class RecipeAnswer
{
    public string Model { get; init; } = "";
    public string Text { get; init; } = "";
}

public class GenerateRecipeMeta
{
    public string Provider { get; init; } = "";
    public int TokensUsed { get; init; }
    public int IngredientsCount { get; init; }
    public bool FallbackUsed { get; init; }
    public string OriginalProvider { get; init; } = "";
    public string Timestamp { get; init; } = "";
}
