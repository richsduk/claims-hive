/**
 * User Routes
 * Handles CRUD operations for users
 */

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { authenticate, isAdmin, isSelf } = require('../middleware/auth');

/**
 * @route GET /api/user
 * @desc Get all users
 * @access Private/Admin
 */
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/user/:userId
 * @desc Get user by ID
 * @access Private (Admin or Self)
 */
router.get('/:userId', authenticate, isSelf('userId'), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await User.getById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/user
 * @desc Create a new user
 * @access Private/Admin
 */
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
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
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/user/:userId
 * @desc Update a user
 * @access Private (Admin or Self)
 */
router.put('/:userId', authenticate, isSelf('userId'), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const { company_id, email, first, last, role } = req.body;
    
    // Validate input
    if (!email || !first || !last) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if user exists
    const existingUser = await User.getById(userId);
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only admin can change company_id and role
    const updateData = {
      company_id: req.user.role === 'admin' ? company_id : existingUser.company_id,
      email,
      first,
      last,
      role: req.user.role === 'admin' ? role : existingUser.role
    };
    
    // Update user
    const updatedUser = await User.update(userId, updateData);
    
    res.json({
      user_id: updatedUser.user_id,
      email: updatedUser.email,
      first: updatedUser.first,
      last: updatedUser.last,
      role: updatedUser.role
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/user/:userId
 * @desc Delete a user
 * @access Private/Admin
 */
router.delete('/:userId', authenticate, isAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if user exists
    const existingUser = await User.getById(userId);
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting self
    if (userId === req.user.user_id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Delete user
    await User.remove(userId);
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
