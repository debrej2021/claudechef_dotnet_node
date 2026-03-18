import express from 'express';
import { generateRecipe, healthCheck } from '../controllers/ai.controller.js';
import { validateRecipeRequest } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /api/ai
 * Generate a recipe from ingredients
 */
router.post('/ai', validateRecipeRequest, asyncHandler(generateRecipe));

/**
 * GET /api/ai/health
 * Health check endpoint
 */
router.get('/ai/health', healthCheck);

export default router;
