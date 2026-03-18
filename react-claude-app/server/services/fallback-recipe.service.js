// Fallback recipe generator using RAG (Retrieval Augmented Generation)
// This provides a backup when both AI providers fail

class FallbackRecipeService {
  constructor() {
    // Recipe templates and knowledge base
    this.recipeTemplates = {
      'stir-fry': {
        cookingMethod: 'stir-fry',
        baseInstructions: [
          'Heat oil in a large pan or wok over high heat',
          'Add aromatics (garlic, ginger, onions) and stir-fry for 30 seconds',
          'Add main ingredients and cook until done',
          'Season with soy sauce, salt, and pepper to taste',
          'Serve hot over rice or noodles'
        ]
      },
      'soup': {
        cookingMethod: 'soup',
        baseInstructions: [
          'Heat oil in a large pot over medium heat',
          'Sauté aromatics until fragrant',
          'Add main ingredients and cook for 2-3 minutes',
          'Add water or broth to cover ingredients',
          'Simmer for 15-20 minutes until vegetables are tender',
          'Season with salt and pepper to taste',
          'Serve hot in bowls'
        ]
      },
      'pasta': {
        cookingMethod: 'pasta',
        baseInstructions: [
          'Boil pasta according to package directions',
          'In a separate pan, heat olive oil over medium heat',
          'Add ingredients and sauté until cooked',
          'Drain pasta and add to the pan with ingredients',
          'Toss everything together',
          'Season with salt, pepper, and herbs',
          'Serve immediately'
        ]
      },
      'baked': {
        cookingMethod: 'baked',
        baseInstructions: [
          'Preheat oven to 375°F (190°C)',
          'Prepare a baking dish with oil or butter',
          'Arrange ingredients in the dish',
          'Season with salt, pepper, and herbs',
          'Bake for 25-30 minutes until golden and cooked through',
          'Let rest for 5 minutes before serving'
        ]
      },
      'salad': {
        cookingMethod: 'salad',
        baseInstructions: [
          'Wash and chop all fresh ingredients',
          'Combine ingredients in a large bowl',
          'Drizzle with olive oil and vinegar',
          'Season with salt and pepper',
          'Toss well to combine',
          'Serve fresh'
        ]
      }
    };

    // Common ingredient categories
    this.ingredientCategories = {
      protein: ['chicken', 'beef', 'pork', 'fish', 'tofu', 'eggs', 'shrimp', 'turkey'],
      vegetables: ['tomatoes', 'onions', 'garlic', 'carrots', 'broccoli', 'spinach', 'peppers', 'mushrooms', 'zucchini'],
      grains: ['rice', 'pasta', 'noodles', 'quinoa', 'bread'],
      aromatics: ['garlic', 'onion', 'ginger', 'shallots'],
      leafy: ['spinach', 'lettuce', 'kale', 'arugula']
    };
  }

  /**
   * Determine the best cooking method based on ingredients
   */
  determineCookingMethod(ingredients) {
    const lowerIngredients = ingredients.map(i => i.toLowerCase());

    // Check for pasta
    if (lowerIngredients.some(i => this.ingredientCategories.grains.includes(i) && i.includes('pasta'))) {
      return 'pasta';
    }

    // Check for salad ingredients
    if (lowerIngredients.some(i => this.ingredientCategories.leafy.includes(i))) {
      return 'salad';
    }

    // Check for proteins + vegetables = stir-fry or baked
    const hasProtein = lowerIngredients.some(i => this.ingredientCategories.protein.includes(i));
    const hasVegetables = lowerIngredients.some(i => this.ingredientCategories.vegetables.includes(i));

    if (hasProtein && hasVegetables) {
      return ingredients.length >= 5 ? 'stir-fry' : 'baked';
    }

    // Check for soup (many vegetables)
    if (lowerIngredients.filter(i => this.ingredientCategories.vegetables.includes(i)).length >= 3) {
      return 'soup';
    }

    // Default to stir-fry
    return 'stir-fry';
  }

  /**
   * Generate a recipe using template-based approach
   */
  generateRecipe(ingredients) {
    if (!ingredients || ingredients.length === 0) {
      throw new Error('No ingredients provided');
    }

    const cookingMethod = this.determineCookingMethod(ingredients);
    const template = this.recipeTemplates[cookingMethod];

    // Create the recipe
    const recipe = this.buildRecipe(ingredients, template);

    return {
      recipe,
      model: 'fallback-rag',
      tokensUsed: 0,
      provider: 'fallback'
    };
  }

  /**
   * Build the full recipe text
   */
  buildRecipe(ingredients, template) {
    const dishName = this.generateDishName(ingredients, template.cookingMethod);

    // Build ingredients section
    const ingredientsSection = ingredients.map(ing => `- ${ing}`).join('\n');

    // Build instructions with ingredient names
    const instructions = template.baseInstructions.map((instruction, index) => {
      return `${index + 1}. ${instruction}`;
    }).join('\n');

    return `# ${dishName}

### Ingredients
${ingredientsSection}
- Olive oil or cooking oil
- Salt and pepper to taste
- Optional: herbs (basil, oregano, thyme) or spices

### Instructions
${instructions}

**Chef's Tip:** This recipe was created using your available ingredients. Feel free to adjust seasonings and cooking times to your preference. Add extra herbs or spices for more flavor!

**Note:** Recipe generated using our backup system. For more detailed AI-powered recipes, please try again when our AI services are available.`;
  }

  /**
   * Generate a dish name based on ingredients
   */
  generateDishName(ingredients, cookingMethod) {
    const mainIngredient = ingredients[0];
    const capitalizedMain = mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1);

    const methodNames = {
      'stir-fry': 'Stir-Fry',
      'soup': 'Soup',
      'pasta': 'Pasta',
      'baked': 'Bake',
      'salad': 'Salad'
    };

    if (ingredients.length === 1) {
      return `Simple ${capitalizedMain} Dish`;
    }

    const secondIngredient = ingredients[1];
    return `${capitalizedMain} and ${secondIngredient} ${methodNames[cookingMethod]}`;
  }
}

// Export singleton instance
export default new FallbackRecipeService();
