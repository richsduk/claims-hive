/**
 * Authentication Routes
 * Handles user authentication (login, register, etc.)
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Company = require('../models/company');
const { authenticate } = require('../middleware/auth');

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Authenticate user
    const user = await User.authenticate(email, password);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        first: user.first,
        last: user.last,
        role: user.role,
        company_name: user.company_name,
        company_type: user.company_type
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user
 * @access Private
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    // User is already attached to req by authenticate middleware
    res.json({
      user_id: req.user.user_id,
      email: req.user.email,
      first: req.user.first,
      last: req.user.last,
      role: req.user.role,
      company_name: req.user.company_name,
      company_type: req.user.company_type
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user (admin only)
 * @access Private/Admin
 */
router.post('/register', authenticate, async (req, res) => {
  try {
    // Only admin users can register new users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { company_id, email, password, first, last, role } = req.body;
    
    // Validate input
    if (!company_id || !email || !password || !first || !last || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if user already exists
    const existingUser = await User.getByEmail(email);
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Check if company exists
    const company = await Company.getById(company_id);
    
    if (!company) {
      return res.status(400).json({ message: 'Company not found' });
    }
    
    // Create user
    const newUser = await User.create({
      company_id,
      email,
      password,
      first,
      last,
      role
    });
    
    res.status(201).json({
      user_id: newUser.user_id,
      email: newUser.email,
      first: newUser.first,
      last: newUser.last,
      role: newUser.role
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }
    
    // Verify current password
    const user = await User.authenticate(req.user.email, currentPassword);
    
    if (!user) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    await User.updatePassword(req.user.user_id, newPassword);
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
