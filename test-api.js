/**
 * Simple script to test the API
 */

// Import required modules
const bcrypt = require('bcrypt');

// Test bcrypt hash
async function testBcrypt() {
  try {
    // Generate a hash for the password '12345678'
    const hash = await bcrypt.hash('12345678', 10);
    console.log('Generated hash for "12345678":', hash);
    
    // Compare with the stored hash from the database
    const storedHash = '$2a$06$Gian28/JbxkH4KmYZzApzuJJe9Yrh.h6gPVU8JW6XsHXK/N0z0GbK';
    const isMatch = await bcrypt.compare('12345678', storedHash);
    console.log('Comparing with stored hash:', isMatch);
    
    // Create a new hash with the same salt rounds as in the database (06)
    const hashWithSameRounds = await bcrypt.hash('12345678', 6);
    console.log('Generated hash with same rounds (6):', hashWithSameRounds);
    
    // Compare the new hash with the stored hash
    const isMatchWithSameRounds = await bcrypt.compare('12345678', hashWithSameRounds);
    console.log('Comparing new hash with same rounds:', isMatchWithSameRounds);
  } catch (err) {
    console.error('Error testing bcrypt:', err);
  }
}

// Run the test
testBcrypt();
