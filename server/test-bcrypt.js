/**
 * Simple script to test bcrypt
 */

// Import required modules
const bcrypt = require('bcrypt');

// Test bcrypt hash
async function testBcrypt() {
  try {
    // Generate a hash for the password '12345678'
    const hash = await bcrypt.hash('12345678', 10);
    console.log('Generated hash for "12345678":', hash);
    
    // Test if the hash can be verified
    const isMatch = await bcrypt.compare('12345678', hash);
    console.log('Verification of generated hash:', isMatch);
    
    // Create a new hash with 6 salt rounds
    const hashWithSixRounds = await bcrypt.hash('12345678', 6);
    console.log('Generated hash with 6 rounds:', hashWithSixRounds);
    
    // Test if the hash with 6 rounds can be verified
    const isMatchSixRounds = await bcrypt.compare('12345678', hashWithSixRounds);
    console.log('Verification of hash with 6 rounds:', isMatchSixRounds);
    
    // Test with a known hash from the database (if available)
    const knownHash = '$2a$06$Gian28/JbxkH4KmYZzApzuJJe9Yrh.h6gPVU8JW6XsHXK/N0z0GbK';
    const isMatchKnown = await bcrypt.compare('12345678', knownHash);
    console.log('Verification with known hash:', isMatchKnown);
    
    // Test with a different password
    const isMatchWrong = await bcrypt.compare('wrongpassword', knownHash);
    console.log('Verification with wrong password:', isMatchWrong);
  } catch (err) {
    console.error('Error testing bcrypt:', err);
  }
}

// Run the test
testBcrypt();
