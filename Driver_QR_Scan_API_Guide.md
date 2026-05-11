# Driver QR Scan API Guide
## Mobile App Integration - Option 1 (Recommended)

---

## 1. API Overview

| Property | Value |
|----------|-------|
| **Base URL** | `{your_backend_url}/api/driver-master` |
| **Protocol** | HTTP/HTTPS |
| **Content-Type** | `application/json` |
| **Authentication** | Bearer Token (if applicable) |

---

## 2. QR Code Format

The QR code contains driver identification data in this format:

```
DRIVER001|John Doe|9876543210
```

**Format Breakdown:**
| Segment | Example | Description |
|----------|----------|-------------|
| `driver_id` | `DRIVER001` | Unique driver identifier |
| `driver_name` | `John Doe` | Driver's full name |
| `driver_contact` | `9876543210` | Contact number |

---

## 3. Mobile App Implementation

### Step 1: QR Code Scanning
Use any QR code scanning library to get the raw QR data.

### Step 2: Extract Driver ID
Extract the `driver_id` from the QR code data:

```javascript
function extractDriverId(qrCodeData) {
  // Handle pipe-separated format: "DRIVER001|John Doe|9876543210"
  if (qrCodeData.includes('|')) {
    return qrCodeData.split('|')[0]; // Returns "DRIVER001"
  }
  // Handle simple ID format: "DRIVER001"
  return qrCodeData.trim();
}
```

### Step 3: Fetch Driver Details
Call the existing API endpoint with the extracted driver ID:

```javascript
async function getDriverDetails(qrCodeData) {
  // Extract driver ID from QR data
  const driverId = extractDriverId(qrCodeData);
  
  if (!driverId) {
    throw new Error('Invalid QR code format');
  }
  
  try {
    const response = await fetch(
      `${BASE_URL}/api/driver-master/drivers/${driverId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // if auth required
        }
      }
    );
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error fetching driver:', error);
    throw error;
  }
}
```

### Step 4: Complete Mobile App Flow

```javascript
// React Native Example
import React, { useState } from 'react';
import { Camera } from 'react-native-camera'; // or your QR library

const DriverQRScanner = () => {
  const [scanned, setScanned] = useState(false);
  const [driver, setDriver] = useState(null);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    
    try {
      // Extract driver ID and fetch details
      const driverDetails = await getDriverDetails(data);
      setDriver(driverDetails);
    } catch (error) {
      Alert.alert('Error', error.message);
      setScanned(false);
    }
  };

  const extractDriverId = (qrData) => {
    if (qrData.includes('|')) {
      return qrData.split('|')[0];
    }
    return qrData.trim();
  };

  const getDriverDetails = async (qrData) => {
    const driverId = extractDriverId(qrData);
    
    const response = await fetch(
      `${BASE_URL}/api/driver-master/drivers/${driverId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  };

  if (driver) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
          {driver.driver_name}
        </Text>
        <Text>Contact: {driver.driver_contact}</Text>
        <Text>License: {driver.driver_license}</Text>
        <Text>Aadhaar: {driver.aadhaar_number}</Text>
        <Text>PAN: {driver.pan_number}</Text>
        <Text>Status: {driver.is_active ? 'Active' : 'Inactive'}</Text>
        
        <Button 
          title="Scan Again" 
          onPress={() => {
            setScanned(false);
            setDriver(null);
          }} 
        />
      </View>
    );
  }

  return (
    <Camera
      onBarCodeRead={scanned ? undefined : handleBarCodeScanned}
      style={{ flex: 1 }}
    />
  );
};

export default DriverQRScanner;
```

---

## 4. API Endpoint Details

### Get Driver by ID
| Property | Value |
|----------|-------|
| **Method** | GET |
| **Endpoint** | `/api/driver-master/drivers/{driver_id}` |
| **Purpose** | Retrieve driver information using extracted driver ID |

#### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `driver_id` | string | Yes | Driver ID extracted from QR code |

#### Response Format (Success - 200 OK)
```json
{
  "success": true,
  "data": {
    "driver_id": "DRIVER001",
    "driver_name": "John Doe",
    "driver_contact": "9876543210",
    "driver_license": "DL123456789",
    "aadhaar_number": "123456789012",
    "pan_number": "ABCDE1234F",
    "license_image": "<binary_data_or_null>",
    "aadhaar_image": "<binary_data_or_null>",
    "pan_image": "<binary_data_or_null>",
    "license_expiry_date": "2025-12-31",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-05-10T14:20:00.000Z",
    "qr_code_data": "DRIVER001|John Doe|9876543210"
  },
  "message": "Driver retrieved successfully"
}
```

#### Response Format (Error - 404 Not Found)
```json
{
  "success": false,
  "message": "Driver not found"
}
```

---

## 5. Testing Checklist

| Test Case | Expected Result |
|-----------|-----------------|
| Scan valid QR with driver ID | Display driver details |
| Scan invalid/non-existent ID | Show "Driver not found" error |
| Network unavailable | Show connection error |
| Driver has no images | Hide image buttons or show placeholder |
| Driver is inactive | Show inactive status clearly |

---

## 6. Error Handling

### Common HTTP Status Codes

| Status Code | Meaning | Action |
|-------------|-----------|--------|
| 200 | OK | Request successful |
| 404 | Not Found | Driver ID does not exist |
| 500 | Internal Server Error | Backend issue, retry later |
| 401 | Unauthorized | Check authentication token |
| 403 | Forbidden | Insufficient permissions |

---

## 7. Important Notes

### QR Code Generation
- QR codes are generated from web app using: `GET /api/driver-master/drivers/{id}/qr-code`
- QR format: `{driver_id}|{driver_name}|{driver_contact}`
- Mobile app only needs to extract the first segment (driver_id)

### Database Requirement
- Ensure `qr_code_data` field is populated for all drivers
- Run this SQL for existing drivers:
```sql
UPDATE DRIVER_MASTER 
SET qr_code_data = driver_id + '|' + driver_name + '|' + driver_contact
WHERE qr_code_data IS NULL;
```

---

## 8. Complete Implementation Summary

1. **Scan QR** → Get raw string: `"DRIVER001|John Doe|9876543210"`
2. **Extract ID** → Get `"DRIVER001"` using `split('|')[0]`
3. **Call API** → `GET /api/driver-master/drivers/DRIVER001`
4. **Display Results** → Show driver information in mobile UI

---

**Document Version:** 1.0  
**Last Updated:** May 11, 2026  
**Contact:** Development Team
