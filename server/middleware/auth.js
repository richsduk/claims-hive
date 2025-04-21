/**
 * Authentication Middleware
 * Verifies JWT tokens and adds the user to the request object
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Verify JWT token and add user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.getById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user to request
    req.user = user;
    
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    console.error('Authentication error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Check if user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

/**
 * Check if user belongs to an admin company
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAdminCompany = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.company_type !== 'admin') {
    return res.status(403).json({ message: 'Admin company access required' });
  }
  
  next();
};

/**
 * Check if user belongs to an affiliate company
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAffiliateCompany = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.company_type !== 'affiliate' && req.user.company_type !== 'admin') {
    return res.status(403).json({ message: 'Affiliate company access required' });
  }
  
  next();
};

/**
 * Check if user belongs to a buyer company
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isBuyerCompany = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.company_type !== 'buyer' && req.user.company_type !== 'admin') {
    return res.status(403).json({ message: 'Buyer company access required' });
  }
  
  next();
};

/**
 * Check if user is accessing their own resource
 * @param {string} paramName - The parameter name containing the user ID
 * @returns {Function} - Express middleware function
 */
const isSelf = (paramName = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const resourceUserId = parseInt(req.params[paramName]);
    
    if (isNaN(resourceUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    if (req.user.user_id !== resourceUserId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
  };
};

/**
 * Check if user belongs to the same company as the resource
 * @param {string} paramName - The parameter name containing the company ID
 * @returns {Function} - Express middleware function
 */
const isSameCompany = (paramName = 'companyId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const resourceCompanyId = parseInt(req.params[paramName]);
    
    if (isNaN(resourceCompanyId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    
    if (req.user.company_id !== resourceCompanyId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  isAdmin,
  isAdminCompany,
  isAffiliateCompany,
  isBuyerCompany,
  isSelf,
  isSameCompany
};
