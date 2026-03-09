// Test file to verify frontend-backend integration for Rake Departure
// This file can be run in the browser console to test the API integration

// Test data for creating a rake departure
const testRakeDepartureData = {
  RakeName: "TWIL02",
  TrainNumber: "12345",
  TripNo: "TRIP-001",
  LineTrack: "Line-1",
  RRNo: "RR-123456",
  RRDate: "2024-01-15",
  RRAmount: 50000.00,
  ArrivalDate: "2024-01-16",
  ArrivalHour: 8,
  ArrivalMinute: 30,
  PlacementArrDate: "2024-01-16",
  PlacementArrHour: 9,
  PlacementArrMinute: 0,
  UnloadingStartDate: "2024-01-16",
  UnloadingStartHour: 9,
  UnloadingStartMinute: 30,
  UnloadingEndDate: "2024-01-16",
  UnloadingEndHour: 17,
  UnloadingEndMinute: 0,
  StablingStartDate: "2024-01-16",
  StablingStartHour: 17,
  StablingStartMinute: 30,
  StablingEndDate: "2024-01-17",
  StablingEndHour: 6,
  StablingEndMinute: 0,
  ReleasedDate: "2024-01-17",
  ReleasedHour: 7,
  ReleasedMinute: 0,
  PlacementDepDate: "2024-01-17",
  PlacementDepHour: 7,
  PlacementDepMinute: 30,
  LoadingStartDate: "2024-01-17",
  LoadingStartHour: 8,
  LoadingStartMinute: 0,
  LoadingEndDate: "2024-01-17",
  LoadingEndHour: 16,
  LoadingEndMinute: 30,
  RemovalDate: "2024-01-17",
  RemovalHour: 17,
  RemovalMinute: 0,
  PowerDemandDate: "2024-01-17",
  PowerDemandHour: 17,
  PowerDemandMinute: 30,
  PowerArrivalDate: "2024-01-17",
  PowerArrivalHour: 18,
  PowerArrivalMinute: 0,
  DepartureDate: "2024-01-17",
  DepartureHour: 18,
  DepartureMinute: 30,
  CreatedBy: "Test User",
  UpdatedBy: "Test User"
};

// Test functions for browser console
window.testRakeDepartureAPI = {
  // Test creating a rake departure
  async testCreate() {
    try {
      console.log('🧪 Testing CREATE rake departure...');
      const response = await fetch('http://localhost:4000/api/rake-departure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testRakeDepartureData)
      });
      
      const result = await response.json();
      console.log('✅ Create response:', result);
      
      if (result.success) {
        console.log('🎉 Rake departure created successfully with ID:', result.data.DepartureId);
        return result.data.DepartureId;
      } else {
        console.error('❌ Create failed:', result.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Create error:', error);
      return null;
    }
  },

  // Test getting all rake departures
  async testGetAll() {
    try {
      console.log('🧪 Testing GET all rake departures...');
      const response = await fetch('http://localhost:4000/api/rake-departure');
      const result = await response.json();
      console.log('✅ Get all response:', result);
      return result;
    } catch (error) {
      console.error('❌ Get all error:', error);
      return null;
    }
  },

  // Test getting a specific rake departure
  async testGetById(id) {
    try {
      console.log(`🧪 Testing GET rake departure by ID: ${id}...`);
      const response = await fetch(`http://localhost:4000/api/rake-departure/${id}`);
      const result = await response.json();
      console.log('✅ Get by ID response:', result);
      return result;
    } catch (error) {
      console.error('❌ Get by ID error:', error);
      return null;
    }
  },

  // Test updating a rake departure
  async testUpdate(id) {
    try {
      console.log(`🧪 Testing UPDATE rake departure ID: ${id}...`);
      const updateData = {
        ...testRakeDepartureData,
        RakeName: "UPDATED-TWIL02",
        UpdatedBy: "Update Test User"
      };
      
      const response = await fetch(`http://localhost:4000/api/rake-departure/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      const result = await response.json();
      console.log('✅ Update response:', result);
      return result;
    } catch (error) {
      console.error('❌ Update error:', error);
      return null;
    }
  },

  // Test deleting a rake departure (soft delete)
  async testDelete(id) {
    try {
      console.log(`🧪 Testing DELETE rake departure ID: ${id}...`);
      const response = await fetch(`http://localhost:4000/api/rake-departure/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      console.log('✅ Delete response:', result);
      return result;
    } catch (error) {
      console.error('❌ Delete error:', error);
      return null;
    }
  },

  // Test filtering rake departures
  async testFilter() {
    try {
      console.log('🧪 Testing FILTER rake departures...');
      const response = await fetch('http://localhost:4000/api/rake-departure/filter?RakeName=TWIL&TrainNumber=12345');
      const result = await response.json();
      console.log('✅ Filter response:', result);
      return result;
    } catch (error) {
      console.error('❌ Filter error:', error);
      return null;
    }
  },

  // Test date range query
  async testDateRange() {
    try {
      console.log('🧪 Testing DATE RANGE rake departures...');
      const response = await fetch('http://localhost:4000/api/rake-departure/date-range?startDate=2024-01-01&endDate=2024-12-31');
      const result = await response.json();
      console.log('✅ Date range response:', result);
      return result;
    } catch (error) {
      console.error('❌ Date range error:', error);
      return null;
    }
  },

  // Run all tests in sequence
  async runAllTests() {
    console.log('🚀 Starting Rake Departure API Integration Tests...');
    
    // Test 1: Get all (should be empty initially)
    await this.testGetAll();
    
    // Test 2: Create a new record
    const createdId = await this.testCreate();
    
    if (!createdId) {
      console.log('❌ Cannot proceed with tests because creation failed');
      return;
    }
    
    // Test 3: Get all (should have one record now)
    await this.testGetAll();
    
    // Test 4: Get by ID
    await this.testGetById(createdId);
    
    // Test 5: Update
    await this.testUpdate(createdId);
    
    // Test 6: Get updated record
    await this.testGetById(createdId);
    
    // Test 7: Filter
    await this.testFilter();
    
    // Test 8: Date range
    await this.testDateRange();
    
    // Test 9: Delete (soft delete)
    await this.testDelete(createdId);
    
    // Test 10: Try to get deleted record (should return 404)
    await this.testGetById(createdId);
    
    console.log('🎉 All integration tests completed!');
  }
};

// Instructions for use
console.log(`
📋 Rake Departure API Integration Test Instructions:

1. Make sure your backend server is running on http://localhost:4000
2. Open your frontend application in the browser
3. Open browser console (F12)
4. Run individual tests:
   - testRakeDepartureAPI.testCreate()
   - testRakeDepartureAPI.testGetAll()
   - testRakeDepartureAPI.testGetById(id)
   - testRakeDepartureAPI.testUpdate(id)
   - testRakeDepartureAPI.testDelete(id)
   - testRakeDepartureAPI.testFilter()
   - testRakeDepartureAPI.testDateRange()

5. Or run all tests:
   - testRakeDepartureAPI.runAllTests()

6. Test the frontend form:
   - Navigate to the Rake Departure page
   - Fill in the form fields
   - Click "Edit" to enable editing
   - Fill required fields (Rake Name, Train Number, Trip No, Arrival Date, Released Date, Departure Date)
   - Click "Save Changes"
   - Check the browser console for API calls and responses
   - Verify the data is saved in the database

🔍 Key Integration Points:
- Form data is converted to API format in formatFormForAPI()
- Validation is performed before API calls
- Loading states are shown during API operations
- Error handling displays user-friendly messages
- Success feedback is shown to the user
`);
