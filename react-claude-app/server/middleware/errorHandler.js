// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message,
      details: err.details || null
    });
  }

  // AI API errors (OpenAI, Claude, etc.)
  if (err.isAIError) {
    return res.status(err.statusCode || 500).json({
      success: false,
      error: 'AI Service Error',
      message: err.message,
      provider: err.provider || null
    });
  }

  // Default server error
  res.status(err.statusCode || 500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message
  });
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
};

// Async handler wrapper to catch errors
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
