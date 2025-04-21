/**
 * Company Model
 * Handles database operations for the company table
 */

const db = require('../database/connection');

/**
 * Get all companies
 * @returns {Promise} - A promise that resolves to an array of companies
 */
const getAll = async () => {
  const query = `
    SELECT company_id, name, type, created, updated
    FROM company
    ORDER BY name
  `;
  
  try {
    const result = await db.query(query);
    return result.rows;
  } catch (err) {
    console.error('Error in getAll companies:', err);
    throw err;
  }
};

/**
 * Get companies by type
 * @param {string} type - The company type (admin, affiliate, buyer)
 * @returns {Promise} - A promise that resolves to an array of companies
 */
const getByType = async (type) => {
  const query = `
    SELECT company_id, name, type, created, updated
    FROM company
    WHERE type = $1
    ORDER BY name
  `;
  
  try {
    const result = await db.query(query, [type]);
    return result.rows;
  } catch (err) {
    console.error('Error in getByType companies:', err);
    throw err;
  }
};

/**
 * Get a company by ID
 * @param {number} companyId - The company ID
 * @returns {Promise} - A promise that resolves to a company object
 */
const getById = async (companyId) => {
  const query = `
    SELECT company_id, name, type, created, updated
    FROM company
    WHERE company_id = $1
  `;
  
  try {
    const result = await db.query(query, [companyId]);
    return result.rows[0];
  } catch (err) {
    console.error('Error in getById company:', err);
    throw err;
  }
};

/**
 * Create a new company
 * @param {Object} companyData - The company data
 * @returns {Promise} - A promise that resolves to the created company
 */
const create = async (companyData) => {
  const { name, type } = companyData;
  
  const query = `
    INSERT INTO company (name, type)
    VALUES ($1, $2)
    RETURNING company_id, name, type, created, updated
  `;
  
  try {
    const result = await db.query(query, [name, type]);
    return result.rows[0];
  } catch (err) {
    console.error('Error in create company:', err);
    throw err;
  }
};

/**
 * Update a company
 * @param {number} companyId - The company ID
 * @param {Object} companyData - The company data to update
 * @returns {Promise} - A promise that resolves to the updated company
 */
const update = async (companyId, companyData) => {
  const { name, type } = companyData;
  
  const query = `
    UPDATE company
    SET name = $1, type = $2, updated = NOW()
    WHERE company_id = $3
    RETURNING company_id, name, type, created, updated
  `;
  
  try {
    const result = await db.query(query, [name, type, companyId]);
    return result.rows[0];
  } catch (err) {
    console.error('Error in update company:', err);
    throw err;
  }
};

/**
 * Delete a company
 * @param {number} companyId - The company ID
 * @returns {Promise} - A promise that resolves to the deleted company
 */
const remove = async (companyId) => {
  const query = `
    DELETE FROM company
    WHERE company_id = $1
    RETURNING company_id
  `;
  
  try {
    const result = await db.query(query, [companyId]);
    return result.rows[0];
  } catch (err) {
    console.error('Error in remove company:', err);
    throw err;
  }
};

/**
 * Get users for a company
 * @param {number} companyId - The company ID
 * @returns {Promise} - A promise that resolves to an array of users
 */
const getUsers = async (companyId) => {
  const query = `
    SELECT user_id, email, first, last, role, created, updated
    FROM "user"
    WHERE company_id = $1
    ORDER BY last, first
  `;
  
  try {
    const result = await db.query(query, [companyId]);
    return result.rows;
  } catch (err) {
    console.error('Error in getUsers for company:', err);
    throw err;
  }
};

/**
 * Get claims for a company (as affiliate)
 * @param {number} companyId - The company ID
 * @returns {Promise} - A promise that resolves to an array of claims
 */
const getAffiliatedClaims = async (companyId) => {
  const query = `
    SELECT c.claim_id, c.status, c.created, c.updated,
           ct.name as claim_type_name,
           cl.first as claimant_first, cl.last as claimant_last,
           b.name as buyer_name
    FROM claim c
    JOIN claim_type ct ON c.claim_type_id = ct.claim_type_id
    JOIN claimant cl ON c.claimant_id = cl.claimant_id
    LEFT JOIN company b ON c.buyer_id = b.company_id
    WHERE c.affiliate_id = $1
    ORDER BY c.created DESC
  `;
  
  try {
    const result = await db.query(query, [companyId]);
    return result.rows;
  } catch (err) {
    console.error('Error in getAffiliatedClaims for company:', err);
    throw err;
  }
};

/**
 * Get claims for a company (as buyer)
 * @param {number} companyId - The company ID
 * @returns {Promise} - A promise that resolves to an array of claims
 */
const getBoughtClaims = async (companyId) => {
  const query = `
    SELECT c.claim_id, c.status, c.created, c.updated,
           ct.name as claim_type_name,
           cl.first as claimant_first, cl.last as claimant_last,
           a.name as affiliate_name
    FROM claim c
    JOIN claim_type ct ON c.claim_type_id = ct.claim_type_id
    JOIN claimant cl ON c.claimant_id = cl.claimant_id
    JOIN company a ON c.affiliate_id = a.company_id
    WHERE c.buyer_id = $1
    ORDER BY c.created DESC
  `;
  
  try {
    const result = await db.query(query, [companyId]);
    return result.rows;
  } catch (err) {
    console.error('Error in getBoughtClaims for company:', err);
    throw err;
  }
};

module.exports = {
  getAll,
  getByType,
  getById,
  create,
  update,
  remove,
  getUsers,
  getAffiliatedClaims,
  getBoughtClaims
};
