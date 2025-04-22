/**
 * Company Routes
 * Handles CRUD operations for companies
 */

const express = require('express');
const router = express.Router();
const Company = require('../models/company');
const { authenticate, isAdmin, isAdminCompany, isSameCompany } = require('../middleware/auth');

/**
 * @route GET /api/company
 * @desc Get all active companies
 * @access Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // Filter by type if provided
    const { type } = req.query;
    
    let companies;
    
    if (type) {
      companies = await Company.getByType(type);
    } else {
      companies = await Company.getAll();
    }
    
    res.json(companies);
  } catch (err) {
    console.error('Get all companies error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/company/all
 * @desc Get all companies including deleted ones
 * @access Private/Admin
 */
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const companies = await Company.getAllWithDeleted();
    res.json(companies);
  } catch (err) {
    console.error('Get all companies with deleted error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/company/deleted
 * @desc Get all deleted companies
 * @access Private/Admin
 */
router.get('/deleted', authenticate, isAdmin, async (req, res) => {
  try {
    const companies = await Company.getDeleted();
    res.json(companies);
  } catch (err) {
    console.error('Get deleted companies error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/company/:companyId
 * @desc Get company by ID
 * @access Private
 */
router.get('/:companyId', authenticate, async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    
    if (isNaN(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    
    const company = await Company.getById(companyId);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Non-admin users can only view their own company or admin companies
    if (req.user.role !== 'admin' && 
        req.user.company_id !== companyId && 
        company.type !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(company);
  } catch (err) {
    console.error('Get company by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/company
 * @desc Create a new company
 * @access Private/Admin
 */
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, type } = req.body;
    
    // Validate input
    if (!name || !type) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Create company
    const newCompany = await Company.create({
      name,
      type
    });
    
    res.status(201).json(newCompany);
  } catch (err) {
    console.error('Create company error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/company/:companyId
 * @desc Update a company
 * @access Private/Admin
 */
router.put('/:companyId', authenticate, isAdmin, async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    
    if (isNaN(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    
    const { name, type } = req.body;
    
    // Validate input
    if (!name || !type) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if company exists
    const existingCompany = await Company.getById(companyId);
    
    if (!existingCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Update company
    const updatedCompany = await Company.update(companyId, {
      name,
      type
    });
    
    res.json(updatedCompany);
  } catch (err) {
    console.error('Update company error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/company/:companyId
 * @desc Soft delete a company
 * @access Private/Admin
 */
router.delete('/:companyId', authenticate, isAdmin, async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    
    if (isNaN(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    
    // Check if company exists
    const existingCompany = await Company.getById(companyId);
    
    if (!existingCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Prevent deleting own company
    if (companyId === req.user.company_id) {
      return res.status(400).json({ message: 'Cannot delete your own company' });
    }
    
    // Soft delete company
    const deletedCompany = await Company.remove(companyId);
    
    res.json({ 
      message: 'Company marked as deleted successfully',
      company: deletedCompany
    });
  } catch (err) {
    console.error('Delete company error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/company/:companyId/restore
 * @desc Restore a previously deleted company
 * @access Private/Admin
 */
router.post('/:companyId/restore', authenticate, isAdmin, async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    
    if (isNaN(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    
    // Check if company exists and is deleted
    const existingCompany = await Company.getByIdWithDeleted(companyId);
    
    if (!existingCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    if (existingCompany.deleted_at === null) {
      return res.status(400).json({ message: 'Company is not deleted' });
    }
    
    // Restore company
    const restoredCompany = await Company.restore(companyId);
    
    res.json({ 
      message: 'Company restored successfully',
      company: restoredCompany
    });
  } catch (err) {
    console.error('Restore company error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/company/:companyId/permanent
 * @desc Permanently delete a company (hard delete)
 * @access Private/Admin
 */
router.delete('/:companyId/permanent', authenticate, isAdmin, async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    
    if (isNaN(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    
    // Check if company exists
    const existingCompany = await Company.getByIdWithDeleted(companyId);
    
    if (!existingCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Prevent deleting own company
    if (companyId === req.user.company_id) {
      return res.status(400).json({ message: 'Cannot delete your own company' });
    }
    
    // Hard delete company
    await Company.hardDelete(companyId);
    
    res.json({ message: 'Company permanently deleted' });
  } catch (err) {
    console.error('Permanent delete company error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/company/:companyId/users
 * @desc Get users for a company
 * @access Private (Admin or Same Company)
 */
router.get('/:companyId/users', authenticate, isSameCompany('companyId'), async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    
    if (isNaN(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    
    const users = await Company.getUsers(companyId);
    
    res.json(users);
  } catch (err) {
    console.error('Get company users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/company/:companyId/claims/affiliated
 * @desc Get claims for a company (as affiliate)
 * @access Private (Admin or Same Company)
 */
router.get('/:companyId/claims/affiliated', authenticate, isSameCompany('companyId'), async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    
    if (isNaN(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    
    const claims = await Company.getAffiliatedClaims(companyId);
    
    res.json(claims);
  } catch (err) {
    console.error('Get affiliated claims error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/company/:companyId/claims/bought
 * @desc Get claims for a company (as buyer)
 * @access Private (Admin or Same Company)
 */
router.get('/:companyId/claims/bought', authenticate, isSameCompany('companyId'), async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    
    if (isNaN(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    
    const claims = await Company.getBoughtClaims(companyId);
    
    res.json(claims);
  } catch (err) {
    console.error('Get bought claims error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
