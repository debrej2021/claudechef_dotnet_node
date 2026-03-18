namespace ClaudeChef.Api.Configuration;

public class AiOptions
{
    public string Provider { get; set; } = "openai";
    public int MinIngredients { get; set; } = 2;
    public int MaxIngredients { get; set; } = 20;
    public int MaxIngredientLength { get; set; } = 100;
    public int TimeoutSeconds { get; set; } = 30;
}
