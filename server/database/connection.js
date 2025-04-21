/**
 * Database Connection Module
 * Provides a connection pool to the PostgreSQL database
 */

const { Pool } = require('pg');

// Get database configuration from environment variables
const config = {
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'claims_hive',
  user: process.env.DB_USER || 'claims_hive_user',
  password: process.env.DB_PASSWORD || 'claims_hive_password',
  // Additional options
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
};

// Create a new pool instance
const pool = new Pool(config);

// Log connection events
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Execute a query on the database
 * @param {string} text - The SQL query text
 * @param {Array} params - The query parameters
 * @returns {Promise} - A promise that resolves to the query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Error executing query', { text, error: err.message });
    throw err;
  }
};

/**
 * Get a client from the pool
 * @returns {Promise} - A promise that resolves to a client
 */
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
    console.error(`The last executed query on this client was: ${client.lastQuery}`);
  }, 5000);

  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };

  client.release = () => {
    // Clear the timeout
    clearTimeout(timeout);
    // Set the methods back to their old implementation
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

module.exports = {
  query,
  getClient,
  pool,
};
