// OpenAI service layer
import { fetchWithTimeout, validateRecipeQuality } from '../utils/fetch-with-timeout.js';

class OpenAIError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'OpenAIError';
    this.isAIError = true;
    this.isTimeout = false;
    this.statusCode = statusCode;
  }
}

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-4o-mini';
    this.maxTokens = 500;
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Validate API key
   */
  validateApiKey() {
    if (!this.apiKey) {
      throw new OpenAIError(
        'OpenAI API key is not configured. Please set OPENAI_API_KEY in environment variables.',
        500
      );
    }
  }

  /**
   * Generate prompt for recipe generation
   */
  generatePrompt(ingredients) {
    return `You are Chef Claude, a friendly cooking assistant.

Create a concise recipe using the following ingredients:
${ingredients.join(', ')}

Guidelines:
- Prefer using only the listed ingredients
- Additional ingredients should be OPTIONAL
- Keep the recipe under 10 steps
- Be creative but practical

Format using markdown:

### Ingredients
### Instructions
`;
  }

  /**
   * Call OpenAI API to generate recipe
   */
  async generateRecipe(ingredients) {
    this.validateApiKey();

    const prompt = this.generatePrompt(ingredients);

    try {
      console.log(`[OpenAI] Making request with ${this.timeout}ms timeout...`);

      const response = await fetchWithTimeout(
        this.apiUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: this.maxTokens,
            temperature: 0.7
          })
        },
        this.timeout
      );

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific OpenAI errors
        if (response.status === 401) {
          throw new OpenAIError('Invalid OpenAI API key', 500);
        }

        if (response.status === 429) {
          throw new OpenAIError('OpenAI API rate limit exceeded. Please try again later.', 429);
        }

        if (response.status === 503) {
          throw new OpenAIError('OpenAI service is currently unavailable. Please try again later.', 503);
        }

        throw new OpenAIError(
          errorData.error?.message || `OpenAI API error: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();

      // Validate response structure
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new OpenAIError('Invalid response structure from OpenAI API', 500);
      }

      const recipeText = data.choices[0].message.content;

      // Validate recipe quality
      const validation = validateRecipeQuality(recipeText);

      if (!validation.isValid) {
        console.warn(`[OpenAI] Recipe quality check failed: ${validation.reason}`);
        const error = new OpenAIError(
          `OpenAI returned low-quality response: ${validation.reason}`,
          500
        );
        error.isQualityIssue = true;
        throw error;
      }

      console.log(`[OpenAI] Recipe validated: ${recipeText.length} chars, ${data.usage?.total_tokens || 0} tokens`);

      return {
        recipe: recipeText,
        model: this.model,
        tokensUsed: data.usage?.total_tokens || 0
      };

    } catch (error) {
      // Re-throw AI errors
      if (error.isAIError) {
        throw error;
      }

      // Handle timeout errors
      if (error.isTimeout) {
        const timeoutError = new OpenAIError(
          `OpenAI API request timed out after ${this.timeout}ms`,
          504
        );
        timeoutError.isTimeout = true;
        throw timeoutError;
      }

      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new OpenAIError('Network error: Unable to reach OpenAI API', 503);
      }

      // Handle other errors
      throw new OpenAIError(
        `Failed to generate recipe: ${error.message}`,
        500
      );
    }
  }
}

// Export singleton instance
export default new OpenAIService();
