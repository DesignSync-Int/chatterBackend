import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Test login rate limiting
async function testLoginRateLimit() {
  console.log('Testing login rate limiting...');
  
  for (let i = 1; i <= 7; i++) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        name: 'testuser',
        password: 'wrongpassword'
      });
      console.log(`Attempt ${i}: Success (unexpected)`);
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`Attempt ${i}: Rate limited - ${error.response.data.message}`);
      } else {
        console.log(`Attempt ${i}: Failed - Status: ${error.response?.status}, Message: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Test buy request rate limiting
async function testBuyRequestRateLimit() {
  console.log('\nTesting buy request rate limiting...');
  
  for (let i = 1; i <= 5; i++) {
    try {
      const response = await axios.post(`${API_BASE_URL}/buy-request`, {
        name: 'Test User',
        email: 'test@example.com',
        contactNumber: '1234567890',
        timeToCall: '10:00 AM',
        description: 'Test description'
      });
      console.log(`Attempt ${i}: Success - ${response.data.message}`);
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`Attempt ${i}: Rate limited - ${error.response.data.message}`);
      } else {
        console.log(`Attempt ${i}: Failed - Status: ${error.response?.status}, Message: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Run tests
async function runTests() {
  try {
    await testLoginRateLimit();
    await testBuyRequestRateLimit();
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

runTests();
