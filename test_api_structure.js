// Test script to verify API structure
const { driverAdvanceAPI } = require("./src/utils/Api");

console.log("Testing driver advance API structure...");
console.log("Available methods:", Object.keys(driverAdvanceAPI));

// Test payload structure
const testPayload = {
  request_id: 299,
  driver_name: "Test Driver",
  driver_contact: "1234567890",
  vehicle_number: "TEST123",
  advance_amount: 5000,
  advance_type: "initial",
  notes: "Test advance",
};

console.log("Test payload structure:", JSON.stringify(testPayload, null, 2));
