// Test the driver master API directly
const axios = require('axios');

async function testDriverAPI() {
  try {
    console.log('🧪 Testing Driver Master API...');
    
    const response = await axios.get('https://elogivinbackend-1.onrender.com/api/driver-master/drivers/active');
    
    console.log('✅ API Status:', response.status);
    console.log('✅ API Data:', response.data);
    console.log('✅ Success:', response.data.success);
    console.log('✅ Drivers Count:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('📋 Sample Driver:', response.data.data[0]);
    }
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Data:', error.response?.data);
  }
}

testDriverAPI();
