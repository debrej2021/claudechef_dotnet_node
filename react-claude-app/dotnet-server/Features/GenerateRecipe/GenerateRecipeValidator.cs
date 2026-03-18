using ClaudeChef.Api.Configuration;
using Microsoft.Extensions.Options;

namespace ClaudeChef.Api.Features.GenerateRecipe;

public class GenerateRecipeValidator(IOptions<AiOptions> options)
{
    public (bool IsValid, string ErrorMessage) Validate(GenerateRecipeRequest request)
    {
        var opts = options.Value;

        if (request.Ingredients is null || request.Ingredients.Count < opts.MinIngredients)
            return (false, $"Please provide at least {opts.MinIngredients} ingredients.");

        if (request.Ingredients.Count > opts.MaxIngredients)
            return (false, $"Maximum {opts.MaxIngredients} ingredients allowed.");

        var invalid = request.Ingredients.FirstOrDefault(
            i => string.IsNullOrWhiteSpace(i) || i.Length > opts.MaxIngredientLength);

        if (invalid is not null)
            return (false, $"Each ingredient must be a non-empty string under {opts.MaxIngredientLength} characters.");

        return (true, string.Empty);
    }
}
