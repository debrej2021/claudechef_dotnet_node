// AI Provider Manager - Factory pattern for switching between AI providers with fallback
import openAIService from './openai.service.js';
import claudeService from './claude.service.js';
import fallbackRecipeService from './fallback-recipe.service.js';

class AIProviderError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AIProviderError';
    this.isAIError = true;
    this.statusCode = statusCode;
  }
}

class AIProviderService {
  constructor() {
    this.providers = {
      openai: openAIService,
      claude: claudeService
    };

    // Get provider from environment variable, default to OpenAI
    this.currentProvider = (process.env.AI_PROVIDER || 'openai').toLowerCase();

    // Validate provider
    if (!this.providers[this.currentProvider]) {
      console.warn(`Invalid AI_PROVIDER: ${this.currentProvider}. Falling back to OpenAI.`);
      this.currentProvider = 'openai';
    }

    console.log(`🤖 AI Provider: ${this.currentProvider.toUpperCase()}`);
    console.log(`🔄 Fallback Strategy: ${this.currentProvider} → ${this.currentProvider === 'openai' ? 'claude' : 'openai'} → RAG`);
  }

  /**
   * Get the current active provider
   */
  getProvider() {
    return this.providers[this.currentProvider];
  }

  /**
   * Get provider name
   */
  getProviderName() {
    return this.currentProvider;
  }

  /**
   * Generate recipe with automatic fallback strategy
   * Primary Provider → Secondary Provider → RAG Fallback
   */
  async generateRecipe(ingredients) {
    const primaryProvider = this.currentProvider;
    const secondaryProvider = primaryProvider === 'openai' ? 'claude' : 'openai';

    // Try primary provider
    try {
      console.log(`[AI Provider] Attempting ${primaryProvider.toUpperCase()}...`);
      const startTime = Date.now();
      const result = await this.providers[primaryProvider].generateRecipe(ingredients);
      const duration = Date.now() - startTime;

      console.log(`[AI Provider] ✅ ${primaryProvider.toUpperCase()} succeeded in ${duration}ms`);

      return {
        ...result,
        provider: primaryProvider,
        fallbackUsed: false,
        responseTime: duration
      };
    } catch (primaryError) {
      const errorType = primaryError.isTimeout ? 'TIMEOUT' :
                        primaryError.isQualityIssue ? 'QUALITY_ISSUE' :
                        'ERROR';
      console.warn(`[AI Provider] ⚠️  ${primaryProvider.toUpperCase()} failed (${errorType}):`, primaryError.message);

      // Try secondary provider
      try {
        console.log(`[AI Provider] Attempting fallback to ${secondaryProvider.toUpperCase()}...`);
        const startTime = Date.now();
        const result = await this.providers[secondaryProvider].generateRecipe(ingredients);
        const duration = Date.now() - startTime;

        console.log(`[AI Provider] ✅ ${secondaryProvider.toUpperCase()} succeeded (fallback) in ${duration}ms`);

        return {
          ...result,
          provider: secondaryProvider,
          fallbackUsed: true,
          originalProvider: primaryProvider,
          fallbackReason: primaryError.message,
          responseTime: duration
        };
      } catch (secondaryError) {
        const errorType = secondaryError.isTimeout ? 'TIMEOUT' :
                          secondaryError.isQualityIssue ? 'QUALITY_ISSUE' :
                          'ERROR';
        console.warn(`[AI Provider] ⚠️  ${secondaryProvider.toUpperCase()} failed (${errorType}):`, secondaryError.message);

        // Use RAG fallback - this should NEVER fail
        try {
          console.log(`[AI Provider] Using RAG fallback generator...`);
          const result = fallbackRecipeService.generateRecipe(ingredients);
          console.log(`[AI Provider] ✅ RAG fallback succeeded`);

          return {
            ...result,
            fallbackUsed: true,
            originalProvider: primaryProvider,
            fallbackReason: 'AI services unavailable'
          };
        } catch (fallbackError) {
          // This should never happen, but just in case
          console.error(`[AI Provider] ❌ Even RAG fallback failed:`, fallbackError.message);

          // Return a super basic fallback
          return {
            recipe: this.getEmergencyRecipe(ingredients),
            model: 'emergency-fallback',
            provider: 'emergency',
            tokensUsed: 0,
            fallbackUsed: true,
            originalProvider: primaryProvider,
            fallbackReason: 'All systems unavailable'
          };
        }
      }
    }
  }

  /**
   * Emergency fallback - super simple recipe
   */
  getEmergencyRecipe(ingredients) {
    return `# Simple Recipe with ${ingredients.join(', ')}

### Ingredients
${ingredients.map(ing => `- ${ing}`).join('\n')}
- Oil for cooking
- Salt and pepper

### Instructions
1. Prepare all ingredients by washing and chopping as needed
2. Heat oil in a pan over medium heat
3. Cook main ingredients until done
4. Season with salt and pepper
5. Serve and enjoy!

**Note:** This is a simplified recipe. Our AI services are temporarily unavailable. Please try again later for a more detailed recipe.`;
  }

  /**
   * Check if provider is configured and ready
   */
  isConfigured() {
    try {
      const provider = this.getProvider();
      provider.validateApiKey();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get provider status information
   */
  getStatus() {
    const isConfigured = this.isConfigured();

    return {
      currentProvider: this.currentProvider,
      isConfigured,
      availableProviders: Object.keys(this.providers),
      status: isConfigured ? 'ready' : 'not configured'
    };
  }

  /**
   * Switch provider (useful for testing or runtime switching)
   */
  switchProvider(providerName) {
    const provider = providerName.toLowerCase();

    if (!this.providers[provider]) {
      throw new AIProviderError(
        `Invalid provider: ${providerName}. Available providers: ${Object.keys(this.providers).join(', ')}`,
        400
      );
    }

    this.currentProvider = provider;
    console.log(`🔄 Switched AI provider to: ${provider.toUpperCase()}`);

    return this.getStatus();
  }
}

// Export singleton instance
export default new AIProviderService();
