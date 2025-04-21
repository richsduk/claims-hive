/**
 * Claim Type Routes
 * Handles CRUD operations for claim types
 */

const express = require('express');
const router = express.Router();
const ClaimType = require('../models/claimType');
const { authenticate, isAdmin, isAdminCompany } = require('../middleware/auth');

/**
 * @route GET /api/claim-type
 * @desc Get all claim types
 * @access Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const claimTypes = await ClaimType.getAll();
    res.json(claimTypes);
  } catch (err) {
    console.error('Get all claim types error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/claim-type/:claimTypeId
 * @desc Get claim type by ID
 * @access Private
 */
router.get('/:claimTypeId', authenticate, async (req, res) => {
  try {
    const claimTypeId = parseInt(req.params.claimTypeId);
    
    if (isNaN(claimTypeId)) {
      return res.status(400).json({ message: 'Invalid claim type ID' });
    }
    
    const claimType = await ClaimType.getById(claimTypeId);
    
    if (!claimType) {
      return res.status(404).json({ message: 'Claim type not found' });
    }
    
    res.json(claimType);
  } catch (err) {
    console.error('Get claim type by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/claim-type
 * @desc Create a new claim type
 * @access Private/Admin
 */
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, schema_json } = req.body;
    
    // Validate input
    if (!name || !schema_json) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if claim type already exists
    const existingClaimType = await ClaimType.getByName(name);
    
    if (existingClaimType) {
      return res.status(400).json({ message: 'Claim type already exists' });
    }
    
    // Create claim type
    const newClaimType = await ClaimType.create({
      name,
      schema_json
    });
    
    res.status(201).json(newClaimType);
  } catch (err) {
    console.error('Create claim type error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/claim-type/:claimTypeId
 * @desc Update a claim type
 * @access Private/Admin
 */
router.put('/:claimTypeId', authenticate, isAdmin, async (req, res) => {
  try {
    const claimTypeId = parseInt(req.params.claimTypeId);
    
    if (isNaN(claimTypeId)) {
      return res.status(400).json({ message: 'Invalid claim type ID' });
    }
    
    const { name, schema_json } = req.body;
    
    // Validate input
    if (!name || !schema_json) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if claim type exists
    const existingClaimType = await ClaimType.getById(claimTypeId);
    
    if (!existingClaimType) {
      return res.status(404).json({ message: 'Claim type not found' });
    }
    
    // Update claim type
    const updatedClaimType = await ClaimType.update(claimTypeId, {
      name,
      schema_json
    });
    
    res.json(updatedClaimType);
  } catch (err) {
    console.error('Update claim type error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/claim-type/:claimTypeId
 * @desc Delete a claim type
 * @access Private/Admin
 */
router.delete('/:claimTypeId', authenticate, isAdmin, async (req, res) => {
  try {
    const claimTypeId = parseInt(req.params.claimTypeId);
    
    if (isNaN(claimTypeId)) {
      return res.status(400).json({ message: 'Invalid claim type ID' });
    }
    
    // Check if claim type exists
    const existingClaimType = await ClaimType.getById(claimTypeId);
    
    if (!existingClaimType) {
      return res.status(404).json({ message: 'Claim type not found' });
    }
    
    // Delete claim type
    await ClaimType.remove(claimTypeId);
    
    res.json({ message: 'Claim type deleted successfully' });
  } catch (err) {
    console.error('Delete claim type error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/claim-type/:claimTypeId/claims
 * @desc Get claims for a claim type
 * @access Private
 */
router.get('/:claimTypeId/claims', authenticate, async (req, res) => {
  try {
    const claimTypeId = parseInt(req.params.claimTypeId);
    
    if (isNaN(claimTypeId)) {
      return res.status(400).json({ message: 'Invalid claim type ID' });
    }
    
    const claims = await ClaimType.getClaims(claimTypeId);
    
    res.json(claims);
  } catch (err) {
    console.error('Get claims for claim type error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/claim-type/:claimTypeId/validate
 * @desc Validate data against a claim type schema
 * @access Private
 */
router.post('/:claimTypeId/validate', authenticate, async (req, res) => {
  try {
    const claimTypeId = parseInt(req.params.claimTypeId);
    
    if (isNaN(claimTypeId)) {
      return res.status(400).json({ message: 'Invalid claim type ID' });
    }
    
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ message: 'Please provide data to validate' });
    }
    
    const validationResult = await ClaimType.validateData(claimTypeId, data);
    
    res.json(validationResult);
  } catch (err) {
    console.error('Validate data error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
