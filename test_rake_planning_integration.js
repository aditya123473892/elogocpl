const axios = require('axios');

// Test script for rake planning integration with RAKE_VISIT table
const API_BASE_URL = 'http://localhost:4000/api';

// Test data for creating a rake plan
const testRakePlanData = {
  Rake_Name: "TEST_RAKE_001",
  Base_Depot: "CCH",
  Rake_Operator: "INDIAN RAILWAY",
  Haulage_Paid_By: "Owner",
  Trip_No: "TEST_TRIP_001",
  Sub_Route: "Main Route",
  Journey_Id: "CCH-NDLS-12345678",
  IB_Train_No: "CCH-NDLS-1912031430",
  Rake_Owner: "INDIAN RAILWAY",
  Plan_Type: "Back Loading",
  Device_ID: "Device-001",
  Route: "CCH-NDLS",
  Train_No: "CCH-NDLS-12345678",
  Plan_Date: "19/03/2026 16:30"
};

async function testRakePlanningIntegration() {
  try {
    console.log('🚀 Testing Rake Planning Integration with RAKE_VISIT table...\n');

    // Step 1: Create a new rake plan
    console.log('📝 Step 1: Creating new rake plan...');
    const createResponse = await axios.post(`${API_BASE_URL}/rake-planning`, testRakePlanData);
    
    if (createResponse.data.success) {
      console.log('✅ Rake plan created successfully!');
      console.log('📋 Plan ID:', createResponse.data.data.plan.PlanId);
      console.log('🏗️ Visit ID:', createResponse.data.data.visit.VISIT_ID);
      
      const planId = createResponse.data.data.plan.PlanId;
      const visitId = createResponse.data.data.visit.VISIT_ID;

      // Step 2: Verify the rake plan was saved
      console.log('\n📝 Step 2: Verifying rake plan was saved...');
      const planResponse = await axios.get(`${API_BASE_URL}/rake-planning/${planId}`);
      
      if (planResponse.data.success) {
        console.log('✅ Rake plan verified in RAKE_PLANNING table!');
        console.log('🔍 Plan details:', {
          Rake_Name: planResponse.data.data.Rake_Name,
          Route: planResponse.data.data.Route,
          Trip_No: planResponse.data.data.Trip_No,
          Plan_Type: planResponse.data.data.Plan_Type
        });
      } else {
        console.log('❌ Failed to verify rake plan');
        return;
      }

      // Step 3: Verify the rake visit was saved
      console.log('\n📝 Step 3: Verifying rake visit was saved...');
      const visitResponse = await axios.get(`${API_BASE_URL}/rake-visit/${visitId}`);
      
      if (visitResponse.data.success) {
        console.log('✅ Rake visit verified in RAKE_VISIT table!');
        console.log('🔍 Visit details:', {
          IB_TRAIN_NO: visitResponse.data.data.IB_TRAIN_NO,
          IB_LOAD_TERMINAL: visitResponse.data.data.IB_LOAD_TERMINAL,
          TRIP_NO: visitResponse.data.data.TRIP_NO,
          DEVICE_ID: visitResponse.data.data.DEVICE_ID,
          HAULAGE_PAID_BY: visitResponse.data.data.HAULAGE_PAID_BY,
          REMARKS: visitResponse.data.data.REMARKS
        });
      } else {
        console.log('❌ Failed to verify rake visit');
        return;
      }

      // Step 4: Check data mapping
      console.log('\n📝 Step 4: Verifying data mapping...');
      const visit = visitResponse.data.data;
      const plan = planResponse.data.data;
      
      const mappingChecks = [
        { field: 'IB_TRAIN_NO', plan: plan.IB_Train_No, visit: visit.IB_TRAIN_NO },
        { field: 'TRIP_NO', plan: plan.Trip_No, visit: visit.TRIP_NO },
        { field: 'DEVICE_ID', plan: plan.Device_ID, visit: visit.DEVICE_ID },
        { field: 'IB_LOAD_TERMINAL', plan: plan.Base_Depot, visit: visit.IB_LOAD_TERMINAL }
      ];

      let allMappingsCorrect = true;
      mappingChecks.forEach(check => {
        if (check.plan === check.visit) {
          console.log(`✅ ${check.field}: ${check.plan} → ${check.visit}`);
        } else {
          console.log(`❌ ${check.field}: ${check.plan} → ${check.visit} (MISMATCH)`);
          allMappingsCorrect = false;
        }
      });

      if (allMappingsCorrect) {
        console.log('\n🎉 SUCCESS: All data mappings are correct!');
        console.log('🔄 Integration between RAKE_PLANNING and RAKE_VISIT tables is working properly.');
      } else {
        console.log('\n⚠️ WARNING: Some data mappings are incorrect.');
      }

    } else {
      console.log('❌ Failed to create rake plan:', createResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Run the test
testRakePlanningIntegration();
