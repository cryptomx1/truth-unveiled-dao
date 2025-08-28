import fetch from 'node-fetch';

const API_KEY = process.env.PINATA_API_KEY;
const SECRET_KEY = process.env.PINATA_SECRET_KEY;

console.log('Testing Pinata connectivity...');
console.log('API Key preview:', API_KEY?.substring(0, 8) + '...');
console.log('Secret Key preview:', SECRET_KEY?.substring(0, 8) + '...');

// Test authentication
async function testAuth() {
  try {
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'pinata_api_key': API_KEY,
        'pinata_secret_api_key': SECRET_KEY
      }
    });
    
    const result = await response.text();
    console.log('Auth test result:', result);
    
    if (response.ok) {
      console.log('✅ Pinata authentication successful');
    } else {
      console.log('❌ Pinata authentication failed');
    }
    
  } catch (error) {
    console.error('Error testing auth:', error.message);
  }
}

testAuth();