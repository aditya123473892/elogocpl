# Mobile App: Pickup Without ASN

Use this document to create the **Pickup Without ASN** page in the mobile app. The mobile page must post the same data as the web page to the same backend API.

## Main Endpoint

```txt
POST {API_BASE_URL}/pickup-without-asn/create
```

Example base URL:

```txt
https://your-backend-domain.com/api
```

Local development base URL:

```txt
http://localhost:4000/api
```

For Android emulator, use this instead of localhost:

```txt
http://10.0.2.2:4000/api
```

## Auth From Logged-In User

After login, store the backend token in mobile storage, for example `AsyncStorage`.

Every API request from the mobile app should send:

```txt
Authorization: Bearer <logged_in_user_token>
Content-Type: application/json
```

Backend already reads the logged-in user as:

```js
createdBy: req.user?.id || "system"
```

So if auth middleware is active, the record will be linked to the logged-in user automatically.

## Required Form Fields

These fields must be present before submitting:

| Mobile Label | Payload Key | Required | Format / Example |
| --- | --- | --- | --- |
| Sideing / Plant | `plant` | Yes | `"Pune Yard"` |
| Yard Location | `yardLocation` | Yes | `"YARD-01"` |
| Vendor / Transporter | `vendorTransporter` | Yes | `"Transporter A Ltd."` |
| Truck Number | `truckNumber` | Yes | `"DL6CV7887"` |
| VIN Details | `vinDetails` | Yes | `"VIN001, VIN002"` |
| Pickup Date | `pickupDate` | Yes | `"2026-05-13"` |
| Dispatch Date | `deliveryDate` | Yes | `"2026-05-13"` |
| Driver Name | `driverName` | Yes | `"Ramesh Kumar"` |
| Transportation Type | `transportationType` | Yes | `"TRUCK"` or `"SELF_DRIVEN"` |
| Pickup Time | `arrivalTime` | No | `"09:30"` |
| Dispatch Time | `departureTime` | No | `"14:45"` |
| Remarks | `remarks` | No | `"13/05/2026, 15:40"` |

## Payload Example

```json
{
  "plant": "Pune Yard",
  "yardLocation": "YARD-01",
  "vendorTransporter": "Transporter A Ltd.",
  "truckNumber": "DL6CV7887",
  "vinDetails": "VIN001, VIN002, VIN003",
  "pickupDate": "2026-05-13",
  "deliveryDate": "2026-05-13",
  "arrivalTime": "09:30",
  "departureTime": "14:45",
  "driverName": "Ramesh Kumar",
  "remarks": "13/05/2026, 15:40",
  "transportationType": "TRUCK"
}
```

Important: send `vinDetails` as a string. The backend splits it by comma, space, or new line and stores it as JSON.

## Success Response

```json
{
  "success": true,
  "message": "Pickup without ASN created successfully",
  "data": {
    "id": 1
  }
}
```

## Error Response

Missing fields:

```json
{
  "success": false,
  "message": "Required fields are missing: plant, truckNumber",
  "missingFields": ["plant", "truckNumber"]
}
```

No VIN:

```json
{
  "success": false,
  "message": "At least one VIN is required"
}
```

## Supporting Dropdown APIs

Use these APIs to populate mobile dropdowns.

### Locations

```txt
GET {API_BASE_URL}/location-master/locations
```

Use active locations for the `plant` / Sideing dropdown:

```js
locations.filter((loc) => loc.IsActive).map((loc) => loc.LocationName)
```

Use active YARD locations for `yardLocation`:

```js
locations
  .filter((loc) => loc.LocationType === "YARD" && loc.IsActive)
  .map((loc) => loc.LocationName)
```

### Active Drivers

```txt
GET {API_BASE_URL}/driver-master/drivers/active
```

Use:

```js
drivers.map((driver) => driver.driver_name)
```

Optional driver details to display after selection:

```js
driver.driver_id
driver.driver_contact
```

## Mobile Default Values

On page open and reset:

```js
{
  pickupDate: current date in "YYYY-MM-DD",
  deliveryDate: current date in "YYYY-MM-DD",
  arrivalTime: current time in "HH:mm",
  departureTime: current time in "HH:mm",
  remarks: current date/time text,
  transportationType: "TRUCK"
}
```

## React Native API Helper Example

```js
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://your-backend-domain.com/api";

async function apiRequest(path, options = {}) {
  const token = await AsyncStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function createPickupWithoutASN(payload) {
  return apiRequest("/pickup-without-asn/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getLocations() {
  return apiRequest("/location-master/locations");
}

export function getActiveDrivers() {
  return apiRequest("/driver-master/drivers/active");
}
```

## Submit Flow

```js
async function submitPickupWithoutASN(form) {
  const requiredFields = [
    "plant",
    "yardLocation",
    "vendorTransporter",
    "truckNumber",
    "vinDetails",
    "pickupDate",
    "deliveryDate",
    "driverName",
    "transportationType",
  ];

  const missingFields = requiredFields.filter(
    (field) => !String(form[field] || "").trim()
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  return createPickupWithoutASN({
    plant: form.plant.trim(),
    yardLocation: form.yardLocation.trim(),
    vendorTransporter: form.vendorTransporter.trim(),
    truckNumber: form.truckNumber.trim().toUpperCase(),
    vinDetails: form.vinDetails.trim(),
    pickupDate: form.pickupDate,
    deliveryDate: form.deliveryDate,
    arrivalTime: form.arrivalTime || null,
    departureTime: form.departureTime || null,
    driverName: form.driverName.trim(),
    remarks: form.remarks?.trim() || "",
    transportationType: form.transportationType,
  });
}
```

## Screen Sections

Recommended mobile page sections:

1. Assignment
2. Vehicle
3. Dispatch
4. Driver
5. Fixed bottom Save button

Keep the Save button disabled while the POST request is running. Show success message after `201` response and reset the form to fresh current date/time values.
