// Test driver master API directly
const axios = require('axios');

async function testDriverAPI() {
  try {
    console.log('🧪 Testing Driver Master API...');
    
    // Test LOCAL backend (development)
    const localResponse = await axios.get('https://elogivinbackend.onrender.com/api/driver-master/drivers/active');
    
    console.log('✅ LOCAL API Status:', localResponse.status);
    console.log('✅ LOCAL API Data:', localResponse.data);
    console.log('✅ LOCAL Success:', localResponse.data.success);
    console.log('✅ LOCAL Drivers Count:', localResponse.data.data?.length || 0);
    
    if (localResponse.data.data && localResponse.data.data.length > 0) {
      console.log('📋 Sample Driver:', localResponse.data.data[0]);
    }
    
    // Test LIVE backend (production)
    try {
      const liveResponse = await axios.get('https://elogivinbackend-1.onrender.com/api/driver-master/drivers/active');
      
      console.log('✅ LIVE API Status:', liveResponse.status);
      console.log('✅ LIVE API Data:', liveResponse.data);
      console.log('✅ LIVE Success:', liveResponse.data.success);
      console.log('✅ LIVE Drivers Count:', liveResponse.data.data?.length || 0);
      
      if (liveResponse.data.data && liveResponse.data.data.length > 0) {
        console.log('📋 Sample Driver:', liveResponse.data.data[0]);
      }
    } catch (liveError) {
      console.error('❌ LIVE API Failed:', liveError.message);
      console.error('❌ LIVE Status:', liveError.response?.status);
      console.error('❌ LIVE Data:', liveError.response?.data);
    }
    
  } catch (error) {
    console.error('❌ LOCAL API Test Failed:', error.message);
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Data:', error.response?.data);
  }
}

testDriverAPI();
