// Claude (Anthropic) service layer
import { fetchWithTimeout, validateRecipeQuality } from '../utils/fetch-with-timeout.js';

class ClaudeError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'ClaudeError';
    this.isAIError = true;
    this.isTimeout = false;
    this.statusCode = statusCode;
  }
}

class ClaudeService {
  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.apiUrl = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-3-5-sonnet-20240620'; // Claude 3.5 Sonnet
    this.maxTokens = 500;
    this.anthropicVersion = '2023-06-01';
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Validate API key
   */
  validateApiKey() {
    if (!this.apiKey) {
      throw new ClaudeError(
        'Claude API key is not configured. Please set CLAUDE_API_KEY in environment variables.',
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
   * Call Claude API to generate recipe
   */
  async generateRecipe(ingredients) {
    this.validateApiKey();

    const prompt = this.generatePrompt(ingredients);

    try {
      console.log(`[Claude] Making request with ${this.timeout}ms timeout...`);

      const response = await fetchWithTimeout(
        this.apiUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': this.anthropicVersion
          },
          body: JSON.stringify({
            model: this.model,
            max_tokens: this.maxTokens,
            messages: [{ role: 'user', content: prompt }]
          })
        },
        this.timeout
      );

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        console.error('Claude API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData: JSON.stringify(errorData, null, 2)
        });

        // Handle specific Claude errors
        if (response.status === 401) {
          throw new ClaudeError('Invalid Claude API key', 500);
        }

        if (response.status === 429) {
          throw new ClaudeError('Claude API rate limit exceeded. Please try again later.', 429);
        }

        if (response.status === 529) {
          throw new ClaudeError('Claude service is currently overloaded. Please try again later.', 503);
        }

        // Handle 404 model not found
        if (response.status === 404) {
          throw new ClaudeError(
            `Model not found or invalid: ${this.model}. ${errorData.error?.message || ''}`,
            404
          );
        }

        throw new ClaudeError(
          errorData.error?.message || errorData.message || `Claude API error: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();

      // Validate response structure
      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new ClaudeError('Invalid response structure from Claude API', 500);
      }

      const recipeText = data.content[0].text;

      // Validate recipe quality
      const validation = validateRecipeQuality(recipeText);

      if (!validation.isValid) {
        console.warn(`[Claude] Recipe quality check failed: ${validation.reason}`);
        const error = new ClaudeError(
          `Claude returned low-quality response: ${validation.reason}`,
          500
        );
        error.isQualityIssue = true;
        throw error;
      }

      const totalTokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
      console.log(`[Claude] Recipe validated: ${recipeText.length} chars, ${totalTokens} tokens`);

      return {
        recipe: recipeText,
        model: this.model,
        tokensUsed: totalTokens
      };

    } catch (error) {
      // Re-throw AI errors
      if (error.isAIError) {
        throw error;
      }

      // Handle timeout errors
      if (error.isTimeout) {
        const timeoutError = new ClaudeError(
          `Claude API request timed out after ${this.timeout}ms`,
          504
        );
        timeoutError.isTimeout = true;
        throw timeoutError;
      }

      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new ClaudeError('Network error: Unable to reach Claude API', 503);
      }

      // Handle other errors
      throw new ClaudeError(
        `Failed to generate recipe: ${error.message}`,
        500
      );
    }
  }
}

// Export singleton instance
export default new ClaudeService();
