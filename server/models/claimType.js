/**
 * Claim Type Model
 * Handles database operations for the claim_type table
 */

const db = require('../database/connection');

/**
 * Get all claim types
 * @returns {Promise} - A promise that resolves to an array of claim types
 */
const getAll = async () => {
  const query = `
    SELECT claim_type_id, name, schema_json, created, updated
    FROM claim_type
    ORDER BY name
  `;
  
  try {
    const result = await db.query(query);
    return result.rows;
  } catch (err) {
    console.error('Error in getAll claim types:', err);
    throw err;
  }
};

/**
 * Get a claim type by ID
 * @param {number} claimTypeId - The claim type ID
 * @returns {Promise} - A promise that resolves to a claim type object
 */
const getById = async (claimTypeId) => {
  const query = `
    SELECT claim_type_id, name, schema_json, created, updated
    FROM claim_type
    WHERE claim_type_id = $1
  `;
  
  try {
    const result = await db.query(query, [claimTypeId]);
    return result.rows[0];
  } catch (err) {
    console.error('Error in getById claim type:', err);
    throw err;
  }
};

/**
 * Get a claim type by name
 * @param {string} name - The claim type name
 * @returns {Promise} - A promise that resolves to a claim type object
 */
const getByName = async (name) => {
  const query = `
    SELECT claim_type_id, name, schema_json, created, updated
    FROM claim_type
    WHERE name = $1
  `;
  
  try {
    const result = await db.query(query, [name]);
    return result.rows[0];
  } catch (err) {
    console.error('Error in getByName claim type:', err);
    throw err;
  }
};

/**
 * Create a new claim type
 * @param {Object} claimTypeData - The claim type data
 * @returns {Promise} - A promise that resolves to the created claim type
 */
const create = async (claimTypeData) => {
  const { name, schema_json } = claimTypeData;
  
  const query = `
    INSERT INTO claim_type (name, schema_json)
    VALUES ($1, $2)
    RETURNING claim_type_id, name, schema_json, created, updated
  `;
  
  try {
    const result = await db.query(query, [name, schema_json]);
    return result.rows[0];
  } catch (err) {
    console.error('Error in create claim type:', err);
    throw err;
  }
};

/**
 * Update a claim type
 * @param {number} claimTypeId - The claim type ID
 * @param {Object} claimTypeData - The claim type data to update
 * @returns {Promise} - A promise that resolves to the updated claim type
 */
const update = async (claimTypeId, claimTypeData) => {
  const { name, schema_json } = claimTypeData;
  
  const query = `
    UPDATE claim_type
    SET name = $1, schema_json = $2, updated = NOW()
    WHERE claim_type_id = $3
    RETURNING claim_type_id, name, schema_json, created, updated
  `;
  
  try {
    const result = await db.query(query, [name, schema_json, claimTypeId]);
    return result.rows[0];
  } catch (err) {
    console.error('Error in update claim type:', err);
    throw err;
  }
};

/**
 * Delete a claim type
 * @param {number} claimTypeId - The claim type ID
 * @returns {Promise} - A promise that resolves to the deleted claim type
 */
const remove = async (claimTypeId) => {
  const query = `
    DELETE FROM claim_type
    WHERE claim_type_id = $1
    RETURNING claim_type_id
  `;
  
  try {
    const result = await db.query(query, [claimTypeId]);
    return result.rows[0];
  } catch (err) {
    console.error('Error in remove claim type:', err);
    throw err;
  }
};

/**
 * Get claims for a claim type
 * @param {number} claimTypeId - The claim type ID
 * @returns {Promise} - A promise that resolves to an array of claims
 */
const getClaims = async (claimTypeId) => {
  const query = `
    SELECT c.claim_id, c.status, c.created, c.updated,
           cl.first as claimant_first, cl.last as claimant_last,
           a.name as affiliate_name, b.name as buyer_name
    FROM claim c
    JOIN claimant cl ON c.claimant_id = cl.claimant_id
    JOIN company a ON c.affiliate_id = a.company_id
    LEFT JOIN company b ON c.buyer_id = b.company_id
    WHERE c.claim_type_id = $1
    ORDER BY c.created DESC
  `;
  
  try {
    const result = await db.query(query, [claimTypeId]);
    return result.rows;
  } catch (err) {
    console.error('Error in getClaims for claim type:', err);
    throw err;
  }
};

/**
 * Validate data against a claim type schema
 * @param {number} claimTypeId - The claim type ID
 * @param {Object} data - The data to validate
 * @returns {Promise} - A promise that resolves to a validation result object
 */
const validateData = async (claimTypeId, data) => {
  try {
    // Get the claim type schema
    const claimType = await getById(claimTypeId);
    
    if (!claimType) {
      return {
        valid: false,
        errors: ['Claim type not found']
      };
    }
    
    const schema = claimType.schema_json;
    
    // Basic validation - check required fields
    const requiredFields = [];
    
    // Extract required fields from schema
    if (schema.required && Array.isArray(schema.required)) {
      requiredFields.push(...schema.required);
    }
    
    // Check if all required fields are present
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return {
        valid: false,
        errors: missingFields.map(field => `Missing required field: ${field}`)
      };
    }
    
    // For a more comprehensive validation, we would use a JSON Schema validator library
    // like Ajv, but for now, we'll just check required fields
    
    return {
      valid: true,
      errors: []
    };
  } catch (err) {
    console.error('Error in validateData for claim type:', err);
    throw err;
  }
};

module.exports = {
  getAll,
  getById,
  getByName,
  create,
  update,
  remove,
  getClaims,
  validateData
};
