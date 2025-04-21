/**
 * Test script to check API endpoints from inside the container
 */

const http = require('http');

// Function to make a GET request to a specified path
function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, res => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Response from ${path}:`, data);
        resolve(data);
      });
    });

    req.on('error', error => {
      console.error(`Error testing ${path}:`, error);
      reject(error);
    });

    req.end();
  });
}

// Test multiple endpoints
async function runTests() {
  try {
    console.log('Testing API endpoints...');
    
    // Test the auth test endpoint
    await testEndpoint('/api/auth/test');
    
    // Test the general test endpoint
    await testEndpoint('/api/test');
    
    console.log('All tests completed.');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
runTests();
