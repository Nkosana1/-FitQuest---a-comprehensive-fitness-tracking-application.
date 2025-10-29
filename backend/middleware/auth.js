const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            type: 'AUTHENTICATION_ERROR',
            message: 'User not found'
          }
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          error: {
            type: 'AUTHORIZATION_ERROR',
            message: 'Account is deactivated'
          }
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      let message = 'Not authorized, token failed';
      if (error.name === 'TokenExpiredError') {
        message = 'Token expired';
      } else if (error.name === 'JsonWebTokenError') {
        message = 'Invalid token';
      }

      return res.status(401).json({
        success: false,
        error: {
          type: 'AUTHENTICATION_ERROR',
          message
        }
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        type: 'AUTHENTICATION_ERROR',
        message: 'Not authorized, no token provided'
      }
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          type: 'AUTHORIZATION_ERROR',
          message: `User role '${req.user.role}' is not authorized to access this resource`
        }
      });
    }
    next();
  };
};

// Optional auth - don't fail if no token, but set user if token exists
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Don't fail, just continue without user
      req.user = null;
    }
  }

  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth
};
