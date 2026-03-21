# RAKE_PLANNING to RAKE_VISIT Integration Implementation

## Overview
This implementation ensures that when a rake plan is created in the `RAKE_PLANNING` table, a corresponding entry is automatically created in the `RAKE_VISIT` table in the fleet3 database.

## Implementation Details

### Backend Changes

#### 1. Rake Planning Controller (`elogivinbackend/Src/controller/rakePlanningController.js`)
- **Modified**: `createRakePlan` method
- **Added**: Import for `rakeVisitModel`
- **Functionality**: 
  - Creates rake plan in `RAKE_PLANNING` table
  - Maps planning data to `RAKE_VISIT` table structure
  - Creates corresponding entry in `RAKE_VISIT` table
  - Returns both plan and visit IDs in response

#### 2. Data Mapping Logic
The following fields are mapped from `RAKE_PLANNING` to `RAKE_VISIT`:

| RAKE_PLANNING Field | RAKE_VISIT Field | Mapping Logic |
|-------------------|------------------|--------------|
| `IB_Train_No` | `IB_TRAIN_NO` | Direct mapping |
| `Train_No` | `OB_TRAIN_NO` | Direct mapping |
| `Base_Depot` | `IB_LOAD_TERMINAL` | Direct mapping |
| `Plan_Date` | `ARRVAL_DATE` | Date conversion |
| `Haulage_Paid_By` | `HAULAGE_PAID_BY` | First character |
| `Trip_No` | `TRIP_NO` | Direct mapping |
| `Device_ID` | `DEVICE_ID` | Direct mapping |
| `Plan_Type` | `PLANE_TYPE` | First character |
| `Sub_Route` | `SUB_ROUTE_ID` | Conditional mapping |
| `Train_No` | `MAIN_OB_TRAIN_NO` | Direct mapping |

#### 3. Default Values
- `DISPATCH_MAIL_STATUS`: 'N' (Not sent)
- `ARRIVAL_MAIL_STATUS`: 'N' (Not sent)
- `REROUTE_STATUS`: 'N' (Not rerouted)
- `DOUBLE_STACK`: 'N' (No)
- `POOLING`: 'N' (No)
- `CREATED_BY`: Authenticated user or 'System'
- `REMARKS`: Auto-generated with plan details

### Frontend Changes

#### 1. API Utils (`src/utils/Api.jsx`)
- **Verified**: `rakeVisitAPI` already exists with all required methods
- **Available Methods**:
  - `getAllRakeVisits()`
  - `getRakeVisitById(id)`
  - `createRakeVisit(data)`
  - `updateRakeVisit(id, data)`
  - `deleteRakeVisit(id)`
  - `getRakeVisitsByRakeId(rakeId)`
  - `getRakeVisitsByTerminalId(terminalId)`

## Database Schema

### RAKE_VISIT Table Structure
The target table includes the following key fields:
- `VISIT_ID` (Primary Key, Identity)
- `IB_TRAIN_NO` (varchar(20))
- `OB_TRAIN_NO` (varchar(20))
- `TERMINAL_ID` (int)
- `IB_LOAD_TERMINAL` (varchar(20))
- `OB_DISCHARGE_TERMINAL` (varchar(20))
- `ARRVAL_DATE` (datetime)
- `DEPARTURE_DATE` (datetime)
- `TRIP_NO` (varchar(30))
- `DEVICE_ID` (varchar(50))
- `HAULAGE_PAID_BY` (char(1))
- And many more fields for comprehensive tracking

## Testing

### Test Script
Created `test_rake_planning_integration.js` to verify:
1. ✅ Rake plan creation
2. ✅ Rake visit creation
3. ✅ Data mapping accuracy
4. ✅ API response structure

### Running the Test
```bash
cd c:\Users\adity\elogisolvin
node test_rake_planning_integration.js
```

## Usage Example

### Creating a Rake Plan (Frontend)
```javascript
const rakePlanData = {
  Rake_Name: "RAKE_001",
  Base_Depot: "CCH",
  Rake_Operator: "INDIAN RAILWAY",
  Haulage_Paid_By: "Owner",
  Trip_No: "TRIP_001",
  Plan_Type: "Back Loading",
  Device_ID: "Device-001",
  Route: "CCH-NDLS",
  Plan_Date: "19/03/2026 16:30"
};

const response = await rakePlanningAPI.createRakePlan(rakePlanData);
console.log(response.data);
// Returns: { plan: {...}, visit: {...} }
```

### Response Structure
```json
{
  "success": true,
  "data": {
    "plan": {
      "success": true,
      "message": "Rake plan created successfully",
      "PlanId": 123
    },
    "visit": {
      "success": true,
      "message": "Rake visit created successfully",
      "VISIT_ID": 456
    }
  },
  "message": "Rake plan and visit created successfully"
}
```

## Benefits

1. **Data Consistency**: Ensures all planned rakes have corresponding visit records
2. **Automatic Tracking**: No manual intervention required for visit creation
3. **Comprehensive Data**: All relevant planning data is preserved in visit table
4. **Scalability**: Easy to extend with additional mappings
5. **Audit Trail**: Complete tracking of rake movements from planning to execution

## Future Enhancements

1. **Route Mapping**: Implement automatic `IB_ROUTE_ID` and `OB_ROUTE_ID` mapping
2. **Terminal ID Mapping**: Map base depot to terminal ID
3. **Rake ID Mapping**: Map rake name to rake ID
4. **Distance Calculation**: Auto-calculate billable distance based on route
5. **Status Updates**: Implement status field updates during rake lifecycle

## Notes

- The integration maintains backward compatibility
- All existing rake planning functionality continues to work
- The RAKE_VISIT entry is created transactionally with the plan
- Error handling ensures data integrity (if visit creation fails, plan creation is rolled back)
