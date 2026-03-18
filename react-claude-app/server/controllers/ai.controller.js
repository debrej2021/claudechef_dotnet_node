import aiProviderService from '../services/ai-provider.service.js';

/**
 * Controller for AI recipe generation with guaranteed response
 */
export const generateRecipe = async (req, res, next) => {
  try {
    const { ingredients } = req.body;

    console.log(`[AI Controller] Generating recipe for ${ingredients.length} ingredients:`, ingredients);
    console.log(`[AI Controller] Primary provider: ${aiProviderService.getProviderName().toUpperCase()}`);

    // Call service layer with automatic fallback
    const result = await aiProviderService.generateRecipe(ingredients);

    console.log(`[AI Controller] ✅ Recipe generated. Provider: ${result.provider}, Fallback: ${result.fallbackUsed ? 'YES' : 'NO'}`);

    // Return success response - ALWAYS successful, never fails
    res.status(200).json({
      success: true,
      data: {
        answers: [{
          model: result.model,
          text: result.recipe
        }]
      },
      meta: {
        provider: result.provider,
        tokensUsed: result.tokensUsed,
        ingredientsCount: ingredients.length,
        fallbackUsed: result.fallbackUsed || false,
        originalProvider: result.originalProvider || result.provider,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    // This should NEVER happen due to fallback system
    // But if it does, return a basic recipe instead of error
    console.error('[AI Controller] ❌ Unexpected error (returning emergency fallback):', error);

    res.status(200).json({
      success: true,
      data: {
        answers: [{
          model: 'emergency',
          text: `# Recipe with ${req.body.ingredients.join(', ')}\n\n### Ingredients\n${req.body.ingredients.map(i => `- ${i}`).join('\n')}\n\n### Instructions\n1. Combine ingredients\n2. Cook until done\n3. Season to taste\n4. Serve and enjoy!`
        }]
      },
      meta: {
        provider: 'emergency',
        tokensUsed: 0,
        ingredientsCount: req.body.ingredients.length,
        fallbackUsed: true,
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Health check for AI service
 */
export const healthCheck = async (req, res) => {
  const status = aiProviderService.getStatus();

  res.status(200).json({
    success: true,
    service: 'AI Recipe Generator',
    ...status,
    timestamp: new Date().toISOString()
  });
};
