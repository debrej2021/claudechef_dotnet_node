using ClaudeChef.Api.Domain.Models;

namespace ClaudeChef.Api.Domain.Interfaces;

public interface IFallbackRecipeService
{
    RecipeResult GenerateRecipe(List<string> ingredients);
}
