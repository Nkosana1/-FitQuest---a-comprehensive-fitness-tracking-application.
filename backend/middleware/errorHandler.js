const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      type: 'NOT_FOUND_ERROR',
      message,
      statusCode: 404
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    error = {
      type: 'DUPLICATE_ERROR',
      message,
      statusCode: 409,
      details: { field, value }
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = {};
    Object.values(err.errors).forEach((val) => {
      errors[val.path] = val.message;
    });
    
    error = {
      type: 'VALIDATION_ERROR',
      message: 'Validation failed',
      statusCode: 400,
      details: errors
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      type: 'AUTHENTICATION_ERROR',
      message: 'Invalid token',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      type: 'AUTHENTICATION_ERROR',
      message: 'Token expired',
      statusCode: 401
    };
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      type: 'UPLOAD_ERROR',
      message: 'File too large',
      statusCode: 413
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      type: 'UPLOAD_ERROR',
      message: 'Too many files',
      statusCode: 413
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      type: 'UPLOAD_ERROR',
      message: 'Unexpected file field',
      statusCode: 400
    };
  }

  // Rate limiting error
  if (err.status === 429) {
    error = {
      type: 'RATE_LIMIT_ERROR',
      message: 'Too many requests, please try again later',
      statusCode: 429
    };
  }

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const errorType = error.type || 'SERVER_ERROR';
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      type: errorType,
      message,
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
