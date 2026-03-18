# Chef Claude Backend Architecture

A well-structured Express.js backend with proper separation of concerns, error handling, and validation.

## 📁 Project Structure

```
server/
├── index.js                      # Main entry point & server setup
├── routes/
│   └── ai.routes.js             # Route definitions
├── controllers/
│   └── ai.controller.js         # Request/response handlers
├── services/
│   └── openai.service.js        # Business logic & OpenAI API calls
└── middleware/
    ├── errorHandler.js          # Global error handling
    └── validate.js              # Request validation
```

## 🏗️ Architecture Layers

### 1. **Routes Layer** (`routes/`)
- Defines API endpoints
- Maps URLs to controllers
- Applies middleware (validation, async handling)

**Example:**
```javascript
router.post('/ai', validateRecipeRequest, asyncHandler(generateRecipe));
```

### 2. **Controllers Layer** (`controllers/`)
- Handles HTTP request/response
- Extracts data from requests
- Calls service layer
- Formats responses
- Does NOT contain business logic

**Example:**
```javascript
export const generateRecipe = async (req, res, next) => {
  const { ingredients } = req.body;
  const result = await openAIService.generateRecipe(ingredients);
  res.status(200).json({ success: true, data: result });
};
```

### 3. **Services Layer** (`services/`)
- Contains business logic
- Makes external API calls (OpenAI)
- No knowledge of HTTP (req/res)
- Reusable across different controllers
- Throws custom errors

**Example:**
```javascript
class OpenAIService {
  async generateRecipe(ingredients) {
    // Business logic here
    const response = await fetch(this.apiUrl, { ... });
    return { recipe, model, tokensUsed };
  }
}
```

### 4. **Middleware Layer** (`middleware/`)

#### **Validation Middleware**
- Validates request data before processing
- Checks data types, formats, ranges
- Returns clear error messages

**Validations:**
- ✅ Ingredients must be an array
- ✅ Minimum 2 ingredients required
- ✅ Maximum 20 ingredients allowed
- ✅ Each ingredient must be a string
- ✅ Ingredients cannot be empty
- ✅ Max 100 characters per ingredient

#### **Error Handling Middleware**
- Catches all errors
- Formats error responses consistently
- Handles different error types:
  - Validation errors (400)
  - OpenAI API errors (401, 429, 503)
  - Server errors (500)
  - Not found errors (404)

## 🔌 API Endpoints

### Generate Recipe
```http
POST /api/ai
Content-Type: application/json

{
  "ingredients": ["chicken", "tomatoes", "garlic"]
}
```

**Success Response (200):**
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
    "tokensUsed": 245,
    "ingredientsCount": 3,
    "timestamp": "2026-03-18T09:15:00.000Z"
  }
}
```

**Error Response (400 - Validation):**
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "At least 2 ingredients are required",
  "details": {
    "minRequired": 2,
    "provided": 1
  }
}
```

### Health Check
```http
GET /api/ai/health
```

**Response:**
```json
{
  "success": true,
  "service": "AI Recipe Generator",
  "status": "ready",
  "timestamp": "2026-03-18T09:15:00.000Z"
}
```

### Server Health
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "status": "ok",
  "message": "Server is running",
  "environment": "development",
  "timestamp": "2026-03-18T09:15:00.000Z"
}
```

## 🛡️ Error Handling

### Custom Error Classes

**ValidationError:**
- Thrown by validation middleware
- Returns 400 status code
- Includes validation details

**OpenAIError:**
- Thrown by OpenAI service
- Handles API-specific errors
- Returns appropriate status codes

### Error Flow
```
Request → Validation → Controller → Service → Error?
                                        ↓
                                   Error Handler
                                        ↓
                                  JSON Response
```

## ✅ Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `ingredients` | Must exist | "Missing required field: ingredients" |
| `ingredients` | Must be array | "Ingredients must be an array" |
| `ingredients` | Min length: 2 | "At least 2 ingredients are required" |
| `ingredients` | Max length: 20 | "Too many ingredients. Maximum 20 allowed" |
| Each item | Must be string | "Must be a string" |
| Each item | Not empty | "Cannot be empty" |
| Each item | Max 100 chars | "Too long (max 100 chars)" |

## 🔒 Security Features

1. **Input Validation**: All requests validated before processing
2. **Error Sanitization**: Stack traces hidden in production
3. **API Key Protection**: Never exposed to client
4. **CORS Configuration**: Controlled cross-origin access
5. **Request Size Limits**: Express JSON body parser limits

## 🚀 Benefits of This Architecture

### Separation of Concerns
- Each layer has a single responsibility
- Easy to understand and maintain
- Changes isolated to specific layers

### Testability
- Each layer can be tested independently
- Mock external dependencies easily
- Unit tests for services, integration tests for controllers

### Scalability
- Easy to add new routes/controllers
- Service layer reusable across endpoints
- Middleware composable and reusable

### Error Handling
- Consistent error responses
- Centralized error logic
- Easy to debug with detailed errors

### Maintainability
- Clear code organization
- Self-documenting structure
- Easy for new developers to understand

## 🧪 Testing the API

### Using curl:
```bash
# Generate recipe
curl -X POST http://localhost:3001/api/ai \
  -H "Content-Type: application/json" \
  -d '{"ingredients": ["chicken", "tomatoes", "garlic"]}'

# Health check
curl http://localhost:3001/api/ai/health

# Server health
curl http://localhost:3001/health
```

### Using the Frontend:
1. Start both servers: `npm run dev:all`
2. Open http://localhost:5173
3. Add ingredients and generate recipe
4. Check browser DevTools Network tab for API calls

## 📝 Adding New Features

### Add a New Endpoint

1. **Create Service Method** (`services/`)
```javascript
async newFeature(data) {
  // Business logic
}
```

2. **Create Controller** (`controllers/`)
```javascript
export const handleNewFeature = async (req, res, next) => {
  const result = await service.newFeature(req.body);
  res.json({ success: true, data: result });
};
```

3. **Add Route** (`routes/`)
```javascript
router.post('/new-feature', validateRequest, asyncHandler(handleNewFeature));
```

4. **Add Validation** (`middleware/validate.js`)
```javascript
export const validateNewFeature = (req, res, next) => {
  // Validation logic
};
```

## 🌟 Best Practices Implemented

- ✅ Async/await error handling
- ✅ Environment variable configuration
- ✅ Structured logging
- ✅ Input validation and sanitization
- ✅ Consistent error responses
- ✅ API versioning ready
- ✅ RESTful conventions
- ✅ Single responsibility principle
- ✅ Dependency injection ready
- ✅ Modular and maintainable code
