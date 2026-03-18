using ClaudeChef.Api.Domain.Interfaces;
using ClaudeChef.Api.Domain.Models;

namespace ClaudeChef.Api.Infrastructure.Fallback;

public class FallbackRecipeService : IFallbackRecipeService
{
    private static readonly Dictionary<string, string[]> RecipeTemplates = new()
    {
        ["stir-fry"] = [
            "Heat oil in a large pan or wok over high heat",
            "Add aromatics (garlic, ginger, onions) and stir-fry for 30 seconds",
            "Add main ingredients and cook until done",
            "Season with soy sauce, salt, and pepper to taste",
            "Serve hot over rice or noodles"
        ],
        ["soup"] = [
            "Heat oil in a large pot over medium heat",
            "Sauté aromatics until fragrant",
            "Add main ingredients and cook for 2-3 minutes",
            "Add water or broth to cover ingredients",
            "Simmer for 15-20 minutes until vegetables are tender",
            "Season with salt and pepper to taste",
            "Serve hot in bowls"
        ],
        ["pasta"] = [
            "Boil pasta according to package directions",
            "In a separate pan, heat olive oil over medium heat",
            "Add ingredients and sauté until cooked",
            "Drain pasta and add to the pan with ingredients",
            "Toss everything together",
            "Season with salt, pepper, and herbs",
            "Serve immediately"
        ],
        ["baked"] = [
            "Preheat oven to 375°F (190°C)",
            "Prepare a baking dish with oil or butter",
            "Arrange ingredients in the dish",
            "Season with salt, pepper, and herbs",
            "Bake for 25-30 minutes until golden and cooked through",
            "Let rest for 5 minutes before serving"
        ],
        ["salad"] = [
            "Wash and chop all fresh ingredients",
            "Combine ingredients in a large bowl",
            "Drizzle with olive oil and vinegar",
            "Season with salt and pepper",
            "Toss well to combine",
            "Serve fresh"
        ]
    };

    private static readonly string[] Proteins = ["chicken", "beef", "pork", "fish", "tofu", "eggs", "shrimp", "turkey"];
    private static readonly string[] Vegetables = ["tomatoes", "onions", "garlic", "carrots", "broccoli", "spinach", "peppers", "mushrooms", "zucchini"];
    private static readonly string[] Grains = ["rice", "pasta", "noodles", "quinoa", "bread"];
    private static readonly string[] Leafy = ["spinach", "lettuce", "kale", "arugula"];

    public RecipeResult GenerateRecipe(List<string> ingredients)
    {
        var cookingMethod = DetermineCookingMethod(ingredients);
        var recipe = BuildRecipe(ingredients, cookingMethod, RecipeTemplates[cookingMethod]);
        return new RecipeResult(recipe, "fallback-rag", "fallback", 0, true);
    }

    private static string DetermineCookingMethod(List<string> ingredients)
    {
        var lower = ingredients.Select(i => i.ToLower()).ToList();

        if (lower.Any(i => Grains.Contains(i) && i.Contains("pasta"))) return "pasta";
        if (lower.Any(i => Leafy.Contains(i))) return "salad";

        bool hasProtein = lower.Any(i => Proteins.Contains(i));
        bool hasVegetables = lower.Any(i => Vegetables.Contains(i));

        if (hasProtein && hasVegetables) return ingredients.Count >= 5 ? "stir-fry" : "baked";
        if (lower.Count(i => Vegetables.Contains(i)) >= 3) return "soup";

        return "stir-fry";
    }

    private static string BuildRecipe(List<string> ingredients, string cookingMethod, string[] steps)
    {
        var dishName = GenerateDishName(ingredients, cookingMethod);
        var ingredientLines = string.Join("\n", ingredients.Select(i => $"- {i}"));
        var instructionLines = string.Join("\n", steps.Select((step, i) => $"{i + 1}. {step}"));

        return $"""
            # {dishName}

            ### Ingredients
            {ingredientLines}
            - Olive oil or cooking oil
            - Salt and pepper to taste
            - Optional: herbs (basil, oregano, thyme) or spices

            ### Instructions
            {instructionLines}

            **Chef's Tip:** This recipe was created using your available ingredients. Feel free to adjust seasonings and cooking times to your preference.

            **Note:** Recipe generated using our backup system. For more detailed AI-powered recipes, please try again when our AI services are available.
            """;
    }

    private static string GenerateDishName(List<string> ingredients, string cookingMethod)
    {
        var main = char.ToUpper(ingredients[0][0]) + ingredients[0][1..];
        var methodNames = new Dictionary<string, string>
        {
            ["stir-fry"] = "Stir-Fry", ["soup"] = "Soup",
            ["pasta"] = "Pasta", ["baked"] = "Bake", ["salad"] = "Salad"
        };
        return ingredients.Count == 1
            ? $"Simple {main} Dish"
            : $"{main} and {ingredients[1]} {methodNames[cookingMethod]}";
    }
}
