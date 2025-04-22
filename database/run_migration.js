/**
 * Run Database Migration Script
 * 
 * This script executes the SQL migration to add soft delete functionality
 * to the Claims Hive database.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

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

async function runMigration() {
  console.log('Starting migration to add soft delete functionality...');
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'add_soft_delete_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Start a transaction
      await client.query('BEGIN');
      
      console.log('Executing migration SQL...');
      
      // Execute the migration SQL
      await client.query(migrationSQL);
      
      // Commit the transaction
      await client.query('COMMIT');
      
      console.log('Migration completed successfully!');
      console.log('The following tables now have soft delete functionality:');
      console.log('- company');
      console.log('- user');
      console.log('- claim_type');
      console.log('- role');
      console.log('- claimant');
      console.log('- raw_data');
      console.log('- claim');
    } catch (err) {
      // Rollback the transaction if there's an error
      await client.query('ROLLBACK');
      console.error('Error executing migration:', err);
      throw err;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the migration
runMigration();
