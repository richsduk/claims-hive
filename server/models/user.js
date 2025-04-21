/**
 * User Model
 * Handles database operations for the user table
 */

const db = require('../database/connection');
const bcrypt = require('bcrypt');

/**
 * Get all users
 * @returns {Promise} - A promise that resolves to an array of users
 */
const getAll = async () => {
  const query = `
    SELECT u.user_id, u.email, u.first, u.last, u.role, 
           u.created, u.updated, c.name as company_name, c.type as company_type
    FROM "user" u
    JOIN company c ON u.company_id = c.company_id
    ORDER BY u.last, u.first
  `;
  
  try {
    const result = await db.query(query);
    return result.rows;
  } catch (err) {
    console.error('Error in getAll users:', err);
    throw err;
  }
};

/**
 * Get a user by ID
 * @param {number} userId - The user ID
 * @returns {Promise} - A promise that resolves to a user object
 */
const getById = async (userId) => {
  const query = `
    SELECT u.user_id, u.email, u.first, u.last, u.role, 
           u.created, u.updated, c.name as company_name, c.type as company_type
    FROM "user" u
    JOIN company c ON u.company_id = c.company_id
    WHERE u.user_id = $1
  `;
  
  try {
    const result = await db.query(query, [userId]);
    return result.rows[0];
  } catch (err) {
    console.error('Error in getById user:', err);
    throw err;
  }
};

/**
 * Get a user by email
 * @param {string} email - The user email
 * @returns {Promise} - A promise that resolves to a user object
 */
const getByEmail = async (email) => {
  const query = `
    SELECT u.user_id, u.email, u.password_hash, u.first, u.last, u.role, 
           u.created, u.updated, c.name as company_name, c.type as company_type
    FROM "user" u
    JOIN company c ON u.company_id = c.company_id
    WHERE u.email = $1
  `;
  
  try {
    const result = await db.query(query, [email]);
    return result.rows[0];
  } catch (err) {
    console.error('Error in getByEmail user:', err);
    throw err;
  }
};

/**
 * Create a new user
 * @param {Object} userData - The user data
 * @returns {Promise} - A promise that resolves to the created user
 */
const create = async (userData) => {
  const { company_id, email, password, first, last, role } = userData;
  
  // Hash the password
  const password_hash = await bcrypt.hash(password, 10);
  
  const query = `
    INSERT INTO "user" (company_id, email, password_hash, first, last, role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING user_id, email, first, last, role, created, updated
  `;
  
  try {
    const result = await db.query(query, [company_id, email, password_hash, first, last, role]);
    return result.rows[0];
  } catch (err) {
    console.error('Error in create user:', err);
    throw err;
  }
};

/**
 * Update a user
 * @param {number} userId - The user ID
 * @param {Object} userData - The user data to update
 * @returns {Promise} - A promise that resolves to the updated user
 */
const update = async (userId, userData) => {
  const { company_id, email, first, last, role } = userData;
  
  const query = `
    UPDATE "user"
    SET company_id = $1, email = $2, first = $3, last = $4, role = $5, updated = NOW()
    WHERE user_id = $6
    RETURNING user_id, email, first, last, role, created, updated
  `;
  
  try {
    const result = await db.query(query, [company_id, email, first, last, role, userId]);
    return result.rows[0];
  } catch (err) {
    console.error('Error in update user:', err);
    throw err;
  }
};

/**
 * Update a user's password
 * @param {number} userId - The user ID
 * @param {string} password - The new password
 * @returns {Promise} - A promise that resolves to the updated user
 */
const updatePassword = async (userId, password) => {
  // Hash the password
  const password_hash = await bcrypt.hash(password, 10);
  
  const query = `
    UPDATE "user"
    SET password_hash = $1, updated = NOW()
    WHERE user_id = $2
    RETURNING user_id, email, first, last, role, created, updated
  `;
  
  try {
    const result = await db.query(query, [password_hash, userId]);
    return result.rows[0];
  } catch (err) {
    console.error('Error in updatePassword user:', err);
    throw err;
  }
};

/**
 * Delete a user
 * @param {number} userId - The user ID
 * @returns {Promise} - A promise that resolves to the deleted user
 */
const remove = async (userId) => {
  const query = `
    DELETE FROM "user"
    WHERE user_id = $1
    RETURNING user_id
  `;
  
  try {
    const result = await db.query(query, [userId]);
    return result.rows[0];
  } catch (err) {
    console.error('Error in remove user:', err);
    throw err;
  }
};

/**
 * Authenticate a user
 * @param {string} email - The user email
 * @param {string} password - The user password
 * @returns {Promise} - A promise that resolves to the authenticated user
 */
const authenticate = async (email, password) => {
  try {
    // Get the user by email
    const user = await getByEmail(email);
    
    // If user not found, return null
    if (!user) {
      return null;
    }
    
    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    // If password doesn't match, return null
    if (!isMatch) {
      return null;
    }
    
    // Remove the password hash from the user object
    delete user.password_hash;
    
    return user;
  } catch (err) {
    console.error('Error in authenticate user:', err);
    throw err;
  }
};

module.exports = {
  getAll,
  getById,
  getByEmail,
  create,
  update,
  updatePassword,
  remove,
  authenticate
};
