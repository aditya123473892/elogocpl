// Test the driver master API
const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing driver master API...');
    
    const response = await axios.get('https://elogivinbackend.onrender.com/api/driver-master/drivers');
    console.log('✅ API Response:', response.data);
    
    if (response.data.success && response.data.data.length === 0) {
      console.log('⚠️  No drivers found in database. You need to run the SQL script to insert sample data.');
      console.log('📝 Run this SQL in your fleet3 database:');
      console.log('   INSERT INTO DRIVER_MASTER (driver_name, driver_contact, driver_license, is_active)');
      console.log('   VALUES (\'Test Driver\', \'9999999999\', \'DL-TEST123\', 1)');
    } else {
      console.log(`📊 Found ${response.data.data.length} drivers`);
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }
}

testAPI();
