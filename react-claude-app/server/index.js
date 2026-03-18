// IMPORTANT: Load environment variables FIRST before any other imports
import config from './config/env.js';

import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = config.port;
const NODE_ENV = config.nodeEnv;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'Server is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', aiRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Chef Claude Backend Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📡 Server:      http://localhost:${PORT}`);
  console.log(`🍳 AI Endpoint: http://localhost:${PORT}/api/ai`);
  console.log(`💚 Health:      http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
});
