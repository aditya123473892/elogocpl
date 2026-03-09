# Rake Departure API Documentation

This document provides comprehensive documentation for the Rake Departure CRUD API endpoints.

## Overview

The Rake Departure API provides complete CRUD (Create, Read, Update, Delete) operations for managing rake departure information in the railway logistics system. This table stores all the departure timing and operational data for rakes.

## Base URL

```
http://localhost:4000/api/rake-departure
```

## Authentication

Currently, the endpoints do not require authentication, but it's recommended to add authentication middleware in production.

## API Endpoints

### 1. Get All Rake Departures

**Endpoint:** `GET /api/rake-departure`

**Description:** Retrieves all active rake departure records.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "DepartureId": 1,
      "RakeName": "RAKE-001",
      "TrainNumber": "12345",
      "TripNo": "TRIP-001",
      "LineTrack": "Line-1",
      "RRNo": "RR-123456",
      "RRDate": "2024-01-15",
      "RRAmount": 50000.00,
      "ArrivalDate": "2024-01-16",
      "ArrivalHour": 8,
      "ArrivalMinute": 30,
      "PlacementArrDate": "2024-01-16",
      "PlacementArrHour": 9,
      "PlacementArrMinute": 0,
      "UnloadingStartDate": "2024-01-16",
      "UnloadingStartHour": 9,
      "UnloadingStartMinute": 30,
      "UnloadingEndDate": "2024-01-16",
      "UnloadingEndHour": 17,
      "UnloadingEndMinute": 0,
      "StablingStartDate": "2024-01-16",
      "StablingStartHour": 17,
      "StablingStartMinute": 30,
      "StablingEndDate": "2024-01-17",
      "StablingEndHour": 6,
      "StablingEndMinute": 0,
      "ReleasedDate": "2024-01-17",
      "ReleasedHour": 7,
      "ReleasedMinute": 0,
      "PlacementDepDate": "2024-01-17",
      "PlacementDepHour": 7,
      "PlacementDepMinute": 30,
      "LoadingStartDate": "2024-01-17",
      "LoadingStartHour": 8,
      "LoadingStartMinute": 0,
      "LoadingEndDate": "2024-01-17",
      "LoadingEndHour": 16,
      "LoadingEndMinute": 30,
      "RemovalDate": "2024-01-17",
      "RemovalHour": 17,
      "RemovalMinute": 0,
      "PowerDemandDate": "2024-01-17",
      "PowerDemandHour": 17,
      "PowerDemandMinute": 30,
      "PowerArrivalDate": "2024-01-17",
      "PowerArrivalHour": 18,
      "PowerArrivalMinute": 0,
      "DepartureDate": "2024-01-17",
      "DepartureHour": 18,
      "DepartureMinute": 30,
      "CreatedAt": "2024-01-17T10:30:00.000Z",
      "UpdatedAt": "2024-01-17T10:30:00.000Z",
      "CreatedBy": "User123",
      "UpdatedBy": "User123",
      "IsActive": true
    }
  ],
  "message": "Rake departures retrieved successfully"
}
```

### 2. Get Rake Departure by ID

**Endpoint:** `GET /api/rake-departure/:id`

**Description:** Retrieves a specific rake departure record by its ID.

**Parameters:**
- `id` (path parameter): The ID of the rake departure record

**Response:**
```json
{
  "success": true,
  "data": {
    "DepartureId": 1,
    "RakeName": "RAKE-001",
    // ... all other fields
  },
  "message": "Rake departure retrieved successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Rake departure not found"
}
```

### 3. Create New Rake Departure

**Endpoint:** `POST /api/rake-departure`

**Description:** Creates a new rake departure record.

**Request Body:**
```json
{
  "RakeName": "RAKE-001",
  "TrainNumber": "12345",
  "TripNo": "TRIP-001",
  "LineTrack": "Line-1",
  "RRNo": "RR-123456",
  "RRDate": "2024-01-15",
  "RRAmount": 50000.00,
  "ArrivalDate": "2024-01-16",
  "ArrivalHour": 8,
  "ArrivalMinute": 30,
  "PlacementArrDate": "2024-01-16",
  "PlacementArrHour": 9,
  "PlacementArrMinute": 0,
  "UnloadingStartDate": "2024-01-16",
  "UnloadingStartHour": 9,
  "UnloadingStartMinute": 30,
  "UnloadingEndDate": "2024-01-16",
  "UnloadingEndHour": 17,
  "UnloadingEndMinute": 0,
  "StablingStartDate": "2024-01-16",
  "StablingStartHour": 17,
  "StablingStartMinute": 30,
  "StablingEndDate": "2024-01-17",
  "StablingEndHour": 6,
  "StablingEndMinute": 0,
  "ReleasedDate": "2024-01-17",
  "ReleasedHour": 7,
  "ReleasedMinute": 0,
  "PlacementDepDate": "2024-01-17",
  "PlacementDepHour": 7,
  "PlacementDepMinute": 30,
  "LoadingStartDate": "2024-01-17",
  "LoadingStartHour": 8,
  "LoadingStartMinute": 0,
  "LoadingEndDate": "2024-01-17",
  "LoadingEndHour": 16,
  "LoadingEndMinute": 30,
  "RemovalDate": "2024-01-17",
  "RemovalHour": 17,
  "RemovalMinute": 0,
  "PowerDemandDate": "2024-01-17",
  "PowerDemandHour": 17,
  "PowerDemandMinute": 30,
  "PowerArrivalDate": "2024-01-17",
  "PowerArrivalHour": 18,
  "PowerArrivalMinute": 0,
  "DepartureDate": "2024-01-17",
  "DepartureHour": 18,
  "DepartureMinute": 30,
  "CreatedBy": "User123",
  "UpdatedBy": "User123"
}
```

**Required Fields:**
- `RakeName` (string, max 50 characters)
- `TrainNumber` (string, max 50 characters)
- `TripNo` (string, max 50 characters)
- `ArrivalDate` (date)
- `ArrivalHour` (integer, 0-23)
- `ArrivalMinute` (integer, 0-59)
- `ReleasedDate` (date)
- `ReleasedHour` (integer, 0-23)
- `ReleasedMinute` (integer, 0-59)
- `DepartureDate` (date)
- `DepartureHour` (integer, 0-23)
- `DepartureMinute` (integer, 0-59)

**Optional Fields:**
- `LineTrack` (string, default: "Line-1")
- `RRNo` (string)
- `RRDate` (date)
- `RRAmount` (decimal)
- All placement, unloading, stabling, loading, removal, and power-related date/time fields
- `CreatedBy` (string)
- `UpdatedBy` (string)

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Rake departure created successfully",
    "DepartureId": 1
  },
  "message": "Rake departure created successfully"
}
```

### 4. Update Rake Departure

**Endpoint:** `PUT /api/rake-departure/:id`

**Description:** Updates an existing rake departure record.

**Parameters:**
- `id` (path parameter): The ID of the rake departure record to update

**Request Body:** Same as create request, but all fields are optional.

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Rake departure updated successfully"
  },
  "message": "Rake departure updated successfully"
}
```

### 5. Delete Rake Departure (Soft Delete)

**Endpoint:** `DELETE /api/rake-departure/:id`

**Description:** Soft deletes a rake departure record by setting IsActive to false.

**Parameters:**
- `id` (path parameter): The ID of the rake departure record to delete

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Rake departure deleted successfully"
  },
  "message": "Rake departure deleted successfully"
}
```

### 6. Filter Rake Departures

**Endpoint:** `GET /api/rake-departure/filter`

**Description:** Retrieves rake departure records based on filter criteria.

**Query Parameters:**
- `RakeName` (string): Filter by rake name (partial match)
- `TrainNumber` (string): Filter by train number (partial match)
- `TripNo` (string): Filter by trip number (partial match)
- `ArrivalDateFrom` (date): Filter by arrival date from
- `ArrivalDateTo` (date): Filter by arrival date to
- `DepartureDateFrom` (date): Filter by departure date from
- `DepartureDateTo` (date): Filter by departure date to

**Example Request:**
```
GET /api/rake-departure/filter?RakeName=RAKE&TrainNumber=123&ArrivalDateFrom=2024-01-01&ArrivalDateTo=2024-12-31
```

**Response:** Same format as GET all endpoint

### 7. Get Rake Departures by Date Range

**Endpoint:** `GET /api/rake-departure/date-range`

**Description:** Retrieves rake departure records within a specified date range.

**Query Parameters:**
- `startDate` (date, required): Start date for the range
- `endDate` (date, required): End date for the range
- All other filter parameters from the filter endpoint are also supported

**Example Request:**
```
GET /api/rake-departure/date-range?startDate=2024-01-01&endDate=2024-12-31&RakeName=RAKE
```

**Response:** Same format as GET all endpoint

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created successfully
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Validation Rules

### Time Fields:
- All hour fields must be between 0 and 23
- All minute fields must be between 0 and 59

### Required Fields for Create:
- All required fields must be provided and not null/empty

### Data Types:
- String fields have maximum length limits as per database schema
- Date fields should be in ISO format (YYYY-MM-DD)
- Decimal fields support up to 18 digits with 2 decimal places

## Testing

A comprehensive test file is provided at `elogivinbackend/test_rake_departure_api.js`. To run the tests:

1. Make sure the backend server is running on `http://localhost:4000`
2. Navigate to the backend directory
3. Run: `node test_rake_departure_api.js`

The test file covers all CRUD operations and edge cases.

## Database Schema

The API operates on the `RakeDeparture` table with the following structure:

```sql
CREATE TABLE RakeDeparture (
    DepartureId INT PRIMARY KEY IDENTITY(1,1),
    RakeName NVARCHAR(50) NOT NULL,
    TrainNumber NVARCHAR(50) NOT NULL,
    TripNo NVARCHAR(50) NOT NULL,
    LineTrack NVARCHAR(50) DEFAULT 'Line-1',
    RRNo NVARCHAR(50) NULL,
    RRDate DATE NULL,
    RRAmount DECIMAL(18,2) NULL,
    -- Arrival Timings
    ArrivalDate DATE NOT NULL,
    ArrivalHour INT NOT NULL CHECK (ArrivalHour BETWEEN 0 AND 23),
    ArrivalMinute INT NOT NULL CHECK (ArrivalMinute BETWEEN 0 AND 59),
    -- ... other timing fields
    DepartureDate DATE NOT NULL,
    DepartureHour INT NOT NULL CHECK (DepartureHour BETWEEN 0 AND 23),
    DepartureMinute INT NOT NULL CHECK (DepartureMinute BETWEEN 0 AND 59),
    -- Audit Fields
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    IsActive BIT DEFAULT 1
);
```

## Usage Examples

### Using fetch (JavaScript)

```javascript
// Create a new rake departure
const createRakeDeparture = async () => {
  const response = await fetch('http://localhost:4000/api/rake-departure', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      RakeName: 'RAKE-001',
      TrainNumber: '12345',
      TripNo: 'TRIP-001',
      ArrivalDate: '2024-01-16',
      ArrivalHour: 8,
      ArrivalMinute: 30,
      ReleasedDate: '2024-01-17',
      ReleasedHour: 7,
      ReleasedMinute: 0,
      DepartureDate: '2024-01-17',
      DepartureHour: 18,
      DepartureMinute: 30
    })
  });
  
  const result = await response.json();
  console.log(result);
};
```

### Using axios (JavaScript)

```javascript
const axios = require('axios');

// Get all rake departures
const getAllDepartures = async () => {
  try {
    const response = await axios.get('http://localhost:4000/api/rake-departure');
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};
```

## Notes

1. The API uses soft delete - records are marked as inactive rather than being physically deleted
2. All date/time fields are stored separately (date field + hour field + minute field)
3. The API includes comprehensive validation for time fields (hours: 0-23, minutes: 0-59)
4. CreatedAt and UpdatedAt fields are automatically managed by the database
5. All queries filter by IsActive = true to exclude soft-deleted records
