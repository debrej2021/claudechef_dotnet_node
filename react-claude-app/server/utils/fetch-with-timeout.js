// Fetch with timeout utility
export async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request timed out after ${timeoutMs}ms`);
      timeoutError.isTimeout = true;
      throw timeoutError;
    }

    throw error;
  }
}

// Validate recipe quality
export function validateRecipeQuality(recipeText) {
  if (!recipeText || typeof recipeText !== 'string') {
    return {
      isValid: false,
      reason: 'Recipe is empty or invalid'
    };
  }

  const trimmedRecipe = recipeText.trim();

  // Check minimum length (should be at least 100 characters for a basic recipe)
  if (trimmedRecipe.length < 100) {
    return {
      isValid: false,
      reason: `Recipe too short (${trimmedRecipe.length} chars, minimum 100)`
    };
  }

  // Check for common recipe sections
  const hasIngredients = /ingredient/i.test(trimmedRecipe);
  const hasInstructions = /instruction|step|direction/i.test(trimmedRecipe);

  if (!hasIngredients && !hasInstructions) {
    return {
      isValid: false,
      reason: 'Recipe missing standard sections (ingredients/instructions)'
    };
  }

  // Check if it's just an error message
  const errorKeywords = [
    'error',
    'failed',
    'unable',
    'cannot',
    'sorry',
    'apologize',
    'unavailable'
  ];

  const lowerRecipe = trimmedRecipe.toLowerCase();
  const hasErrorKeywords = errorKeywords.some(keyword =>
    lowerRecipe.startsWith(keyword) || lowerRecipe.includes(`i ${keyword}`)
  );

  if (hasErrorKeywords && trimmedRecipe.length < 200) {
    return {
      isValid: false,
      reason: 'Response appears to be an error message'
    };
  }

  return {
    isValid: true,
    reason: 'Recipe meets quality standards'
  };
}
