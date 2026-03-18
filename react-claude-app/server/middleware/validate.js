// Validation middleware
class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export const validateRecipeRequest = (req, res, next) => {
  const { ingredients } = req.body;

  // Check if ingredients exist
  if (!ingredients) {
    throw new ValidationError('Missing required field: ingredients');
  }

  // Check if ingredients is an array
  if (!Array.isArray(ingredients)) {
    throw new ValidationError('Ingredients must be an array');
  }

  // Check if array is not empty
  if (ingredients.length === 0) {
    throw new ValidationError('Ingredients array cannot be empty');
  }

  // Check minimum ingredients
  if (ingredients.length < 2) {
    throw new ValidationError(
      'At least 2 ingredients are required to generate a recipe',
      { minRequired: 2, provided: ingredients.length }
    );
  }

  // Check maximum ingredients
  if (ingredients.length > 20) {
    throw new ValidationError(
      'Too many ingredients. Maximum 20 allowed',
      { maxAllowed: 20, provided: ingredients.length }
    );
  }

  // Validate each ingredient
  const invalidIngredients = [];
  ingredients.forEach((ingredient, index) => {
    if (typeof ingredient !== 'string') {
      invalidIngredients.push({ index, value: ingredient, reason: 'Must be a string' });
    } else if (ingredient.trim().length === 0) {
      invalidIngredients.push({ index, value: ingredient, reason: 'Cannot be empty' });
    } else if (ingredient.length > 100) {
      invalidIngredients.push({ index, value: ingredient, reason: 'Too long (max 100 chars)' });
    }
  });

  if (invalidIngredients.length > 0) {
    throw new ValidationError(
      'Invalid ingredients found',
      { invalidIngredients }
    );
  }

  // Sanitize ingredients (trim whitespace)
  req.body.ingredients = ingredients.map(ing => ing.trim());

  next();
};
