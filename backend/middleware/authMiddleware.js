const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Try to find the user
      const user = await User.findById(decoded.id).select('-password');
      
      // Check if user exists (could have been deleted)
      if (!user) {
        return res.status(401).json({ 
          message: 'User not found. Your account may have been deleted or deactivated.', 
          code: 'USER_NOT_FOUND' 
        });
      }
      
      // Set user in request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      
      // Handle different types of JWT errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Your session has expired. Please login again.', 
          code: 'TOKEN_EXPIRED' 
        });
      }
      
      res.status(401).json({ 
        message: 'Not authorized, token validation failed', 
        code: 'INVALID_TOKEN' 
      });
    }
  } else {
    res.status(401).json({ 
      message: 'Not authorized, no token provided', 
      code: 'NO_TOKEN' 
    });
  }
};

module.exports = authMiddleware;
