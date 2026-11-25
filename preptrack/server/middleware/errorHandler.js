/**
 * Central Error Handler Middleware
 * Intercepts Mongoose validation errors, duplicate keys, invalid ObjectIds, and JWT issues.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging during development
  console.error('API Error:', err);

  // MongoDB Feature: Mongoose CastError (e.g. invalid 24-character hexadecimal ObjectId)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of '${err.value}'`;
    return res.status(400).json({ success: false, message });
  }

  // MongoDB Feature: Duplicate Key Error (MongoDB E11000 error code)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `A record with this ${field} already exists. Please use another value.`;
    return res.status(409).json({ success: false, message });
  }

  // MongoDB Feature: Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. '),
      errors: messages
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid authentication token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Authentication token has expired' });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
