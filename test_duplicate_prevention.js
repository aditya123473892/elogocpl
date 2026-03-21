// Test script to verify duplicate prevention in ASN upload functionality
const { dealerTripDetailsAPI } = require('./src/utils/Api');

// Test data for duplicate prevention
const testRecord = {
  Rake_NO: "TEST001",
  Load_No: "1001",
  Trip_No: "2001",
  INVOICE_NO: "INV001",
  Invoice_Date: "2024-01-15",
  Destination_City: "Test City",
  Production_Model: "Test Model",
  GR_Number: "GR001",
  Engine_No: "ENG001",
  VIN_Number: "VIN123456789",
  Sales_Model: "Sales Model",
  Dealer_Name: "Test Dealer",
  LOCATION: "Test Location",
  EWAY_BILL: "EWAY001",
  VALID_TILL: "2024-12-31"
};

const duplicateRecord = {
  ...testRecord,
  Rake_NO: "TEST002", // Different rake but same Load_No, Trip_No, VIN_Number
};

const bulkRecords = [
  testRecord,
  { ...testRecord, Load_No: "1002", Trip_No: "2002" }, // Different Load/Trip
  { ...testRecord, Load_No: "1003", Trip_No: "2003", VIN_Number: "VIN987654321" }, // Different VIN
  duplicateRecord // Should be caught as duplicate
];

async function testSingleDuplicatePrevention() {
  console.log('\n=== Testing Single Upload Duplicate Prevention ===');
  
  try {
    // First submission - should succeed
    console.log('Submitting first record...');
    const result1 = await dealerTripDetailsAPI.createDealerTripDetails(testRecord);
    console.log('✅ First submission successful:', result1.message);
    
    // Second submission with same Load_No and Trip_No - should fail
    console.log('Submitting duplicate record...');
    try {
      const result2 = await dealerTripDetailsAPI.createDealerTripDetails(testRecord);
      console.log('❌ Duplicate prevention failed - second submission succeeded');
    } catch (error) {
      console.log('✅ Duplicate prevention working:', error.message);
    }
    
    // Third submission with different Load_No/Trip_No but same VIN - should fail
    console.log('Submitting record with different Load/Trip but same VIN...');
    try {
      const result3 = await dealerTripDetailsAPI.createDealerTripDetails({
        ...testRecord,
        Load_No: "9999",
        Trip_No: "8888"
      });
      console.log('❌ VIN duplicate prevention failed');
    } catch (error) {
      console.log('✅ VIN duplicate prevention working:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testBulkDuplicatePrevention() {
  console.log('\n=== Testing Bulk Upload Duplicate Prevention ===');
  
  try {
    console.log('Submitting bulk records with duplicates...');
    const result = await dealerTripDetailsAPI.createBulkDealerTripDetails(bulkRecords);
    console.log('❌ Bulk duplicate prevention failed - submission succeeded');
  } catch (error) {
    if (error.duplicates && error.duplicates.length > 0) {
      console.log('✅ Bulk duplicate prevention working');
      console.log('Found duplicates:', error.duplicates.length);
      error.duplicates.forEach((dup, index) => {
        console.log(`  Duplicate ${index + 1}: Record ${dup.index} - ${dup.message}`);
      });
    } else {
      console.log('❌ Bulk duplicate prevention failed - unexpected error:', error.message);
    }
  }
}

async function cleanupTestData() {
  console.log('\n=== Cleaning Up Test Data ===');
  
  try {
    // Note: This would require a delete API endpoint
    console.log('⚠️  Manual cleanup may be required - delete test records from database');
    console.log('Look for records with:');
    console.log('  - Load_No: "1001", "1002", "1003", "9999"');
    console.log('  - Trip_No: "2001", "2002", "2003", "8888"');
    console.log('  - VIN_Number: "VIN123456789", "VIN987654321"');
  } catch (error) {
    console.error('Cleanup failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Starting Duplicate Prevention Tests');
  console.log('=====================================');
  
  await testSingleDuplicatePrevention();
  await testBulkDuplicatePrevention();
  await cleanupTestData();
  
  console.log('\n✅ Tests completed');
  console.log('\n📋 Summary:');
  console.log('- Single upload duplicate prevention: Tested');
  console.log('- Bulk upload duplicate prevention: Tested');
  console.log('- VIN-based duplicate checking: Tested');
  console.log('- Multi-field duplicate checking: Tested');
}

// Export for use in other files or run directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testSingleDuplicatePrevention,
  testBulkDuplicatePrevention,
  cleanupTestData,
  runTests
};
