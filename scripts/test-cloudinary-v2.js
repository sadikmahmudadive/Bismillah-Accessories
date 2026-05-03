/**
 * Script to test Cloudinary configuration.
 * Run with: node scripts/test-cloudinary-v2.js
 */
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

const config = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

console.log('--- Cloudinary Configuration Test ---');
console.log('Cloud Name:', config.cloud_name || 'MISSING');
console.log('API Key:', config.api_key || 'MISSING');
console.log('API Secret:', config.api_secret ? 'PRESENT (hidden)' : 'MISSING');

if (!config.cloud_name || !config.api_key || !config.api_secret) {
  console.error('\n❌ ERROR: Missing one or more configuration values.');
  process.exit(1);
}

cloudinary.config(config);

console.log('\nTesting connection to Cloudinary...');

cloudinary.api.ping()
  .then(result => {
    console.log('✅ SUCCESS: Connection successful!');
    console.log('Result:', result);
  })
  .catch(error => {
    console.error('\n❌ ERROR: Connection failed!');
    console.error('Message:', error.message);
    console.error('Full Error:', error);
    
    if (error.message.includes('Must supply api_secret')) {
      console.log('\n💡 TIP: Your API secret is missing or not being read correctly from .env.local');
    } else if (error.http_code === 401) {
      console.log('\n💡 TIP: Your API key or secret is invalid. Check your Cloudinary dashboard.');
    }
  });
