# Multi-Provider AI Support

Chef Claude backend supports both **OpenAI** and **Claude (Anthropic)** as AI providers. You can easily switch between them using environment variables.

## 🤖 Supported Providers

### 1. **OpenAI** (Default)
- Model: `gpt-4o-mini`
- Max Tokens: 300
- Fast and cost-effective
- Great for quick recipe generation

### 2. **Claude (Anthropic)**
- Model: `claude-3-haiku-20240307`
- Max Tokens: 300
- High-quality responses
- Excellent instruction following

## ⚙️ Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Choose provider: 'openai' or 'claude' (default: openai)
AI_PROVIDER=openai

# OpenAI API Key (required if AI_PROVIDER=openai)
OPENAI_API_KEY=sk-...your-key-here

# Claude API Key (required if AI_PROVIDER=claude)
CLAUDE_API_KEY=sk-ant-...your-key-here

PORT=3001
```

### Switching Providers

#### Use OpenAI:
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...your-openai-key
```

#### Use Claude:
```bash
AI_PROVIDER=claude
CLAUDE_API_KEY=sk-ant-...your-claude-key
```

## 🏗️ Architecture

### Provider Manager Pattern

The system uses a **Factory Pattern** to manage multiple AI providers:

```
Client Request
     ↓
[AI Provider Service] ← Reads AI_PROVIDER env var
     ↓
[OpenAI Service] or [Claude Service]
     ↓
External API Call
     ↓
Response
```

### File Structure

```
server/services/
├── ai-provider.service.js    # Provider manager (factory)
├── openai.service.js          # OpenAI implementation
└── claude.service.js          # Claude implementation
```

## 📝 API Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "answers": [{
      "model": "gpt-4o-mini",
      "text": "### Ingredients\n..."
    }]
  },
  "meta": {
    "provider": "openai",
    "tokensUsed": 245,
    "ingredientsCount": 3,
    "timestamp": "2026-03-18T09:30:00.000Z"
  }
}
```

**Note:** The `meta.provider` field indicates which provider was used.

### Error Response (Provider-specific)

```json
{
  "success": false,
  "error": "AI Service Error",
  "message": "OpenAI API rate limit exceeded. Please try again later.",
  "provider": "openai"
}
```

## 🔍 Health Check

Check provider status:

```bash
curl http://localhost:3001/api/ai/health
```

**Response:**
```json
{
  "success": true,
  "service": "AI Recipe Generator",
  "currentProvider": "openai",
  "isConfigured": true,
  "availableProviders": ["openai", "claude"],
  "status": "ready",
  "timestamp": "2026-03-18T09:30:00.000Z"
}
```

## 🧪 Testing Different Providers

### Test OpenAI

1. Set environment:
```bash
AI_PROVIDER=openai
```

2. Restart server

3. Generate recipe:
```bash
curl -X POST http://localhost:3001/api/ai \
  -H "Content-Type: application/json" \
  -d '{"ingredients": ["chicken", "tomatoes", "garlic"]}'
```

4. Check response `meta.provider` should be `"openai"`

### Test Claude

1. Set environment:
```bash
AI_PROVIDER=claude
CLAUDE_API_KEY=sk-ant-...
```

2. Restart server

3. Generate recipe (same curl command)

4. Check response `meta.provider` should be `"claude"`

## 🛡️ Error Handling

### Provider Not Configured

If API key is missing:

```json
{
  "success": false,
  "error": "AI Service Error",
  "message": "OpenAI API key is not configured. Please set OPENAI_API_KEY in environment variables.",
  "provider": "openai"
}
```

### Invalid Provider

If `AI_PROVIDER` is invalid, system falls back to OpenAI with warning:

```
⚠️  Invalid AI_PROVIDER: xyz. Falling back to OpenAI.
```

### Rate Limits

**OpenAI (429):**
```json
{
  "success": false,
  "error": "AI Service Error",
  "message": "OpenAI API rate limit exceeded. Please try again later.",
  "provider": "openai"
}
```

**Claude (429):**
```json
{
  "success": false,
  "error": "AI Service Error",
  "message": "Claude API rate limit exceeded. Please try again later.",
  "provider": "claude"
}
```

## 📊 Provider Comparison

| Feature | OpenAI | Claude |
|---------|--------|--------|
| Model | gpt-4o-mini | claude-3-haiku-20240307 |
| Speed | Fast | Fast |
| Cost | Low | Low |
| Quality | Excellent | Excellent |
| Max Tokens | 300 | 300 |
| Rate Limits | Varies by tier | Varies by tier |

## 🔧 Advanced Usage

### Runtime Provider Switching (Future)

The architecture supports runtime switching through the `AIProviderService`:

```javascript
// In your code (if needed)
import aiProviderService from './services/ai-provider.service.js';

// Switch provider
aiProviderService.switchProvider('claude');

// Get current status
const status = aiProviderService.getStatus();
```

### Adding New Providers

To add a new provider (e.g., Google Gemini):

1. **Create service** (`services/gemini.service.js`):
```javascript
class GeminiService {
  async generateRecipe(ingredients) {
    // Implementation
  }
}
export default new GeminiService();
```

2. **Register in provider manager** (`services/ai-provider.service.js`):
```javascript
this.providers = {
  openai: openAIService,
  claude: claudeService,
  gemini: geminiService  // Add here
};
```

3. **Update environment**:
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=...
```

## 🚀 Best Practices

### 1. **Environment-Based Configuration**
- Use `.env` for local development
- Use Vercel/platform env vars for production
- Never commit API keys to Git

### 2. **Provider Selection**
- **OpenAI**: Good default, widely available
- **Claude**: Excellent for complex instructions
- Consider cost and rate limits

### 3. **Error Handling**
- Always check `success` field in responses
- Display provider-specific errors to users
- Implement retry logic for rate limits

### 4. **Monitoring**
- Track which provider is used (`meta.provider`)
- Monitor token usage (`meta.tokensUsed`)
- Log provider errors for debugging

### 5. **Testing**
- Test with both providers
- Mock provider services in tests
- Verify fallback behavior

## 📋 Troubleshooting

### Problem: "Provider not configured"

**Solution:**
1. Check `.env` file has correct API key
2. Verify environment variable name (OPENAI_API_KEY or CLAUDE_API_KEY)
3. Restart server after changing `.env`

### Problem: Rate limit errors

**Solution:**
1. Implement exponential backoff
2. Consider switching providers
3. Upgrade API tier if needed

### Problem: Provider returns empty recipe

**Solution:**
1. Check API key validity
2. Verify network connectivity
3. Check provider status page
4. Review request logs

### Problem: Unexpected provider used

**Solution:**
1. Check `AI_PROVIDER` in `.env`
2. Verify no typos (must be 'openai' or 'claude')
3. Check server logs for warnings
4. Restart server to apply changes

## 🌟 Benefits of Multi-Provider Support

### 1. **Flexibility**
- Switch providers without code changes
- Test different models easily
- Choose best provider for use case

### 2. **Reliability**
- Fallback to alternative if one fails
- Avoid single point of failure
- Handle rate limits gracefully

### 3. **Cost Optimization**
- Compare costs between providers
- Use cheaper provider when appropriate
- Optimize based on usage patterns

### 4. **Quality**
- Compare output quality
- Use best model for each scenario
- A/B test different providers

### 5. **Future-Proof**
- Easy to add new providers
- No vendor lock-in
- Adapt to changing AI landscape

## 📚 API Reference

### AIProviderService Methods

```javascript
// Get current provider instance
getProvider()

// Get provider name
getProviderName() // Returns: 'openai' or 'claude'

// Generate recipe (provider-agnostic)
await generateRecipe(ingredients)

// Check if configured
isConfigured() // Returns: boolean

// Get status
getStatus() // Returns: { currentProvider, isConfigured, ... }

// Switch provider (runtime)
switchProvider('claude')
```

## 🎓 Example Usage

### Full Example

```javascript
// 1. Set environment
// .env file:
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

// 2. Server automatically uses OpenAI
// Server logs:
🤖 AI Provider: OPENAI

// 3. Make request
POST /api/ai
{
  "ingredients": ["chicken", "rice", "soy sauce"]
}

// 4. Response includes provider info
{
  "success": true,
  "data": { ... },
  "meta": {
    "provider": "openai",
    "tokensUsed": 189
  }
}

// 5. Switch to Claude
// Update .env:
AI_PROVIDER=claude
CLAUDE_API_KEY=sk-ant-...

// 6. Restart and repeat - now uses Claude!
```

---

## 💡 Quick Start

1. **Choose provider:**
   ```bash
   echo "AI_PROVIDER=openai" >> .env
   ```

2. **Add API key:**
   ```bash
   echo "OPENAI_API_KEY=sk-your-key" >> .env
   ```

3. **Restart server:**
   ```bash
   npm run server
   ```

4. **Verify:**
   ```bash
   curl http://localhost:3001/api/ai/health
   ```

That's it! Your Chef Claude backend now supports multiple AI providers! 🎉
