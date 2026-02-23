import axios from "axios";

// Use environment variable with fallback to localhost
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://elogivinbackend-1.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Variable to track if we're already handling an auth error to prevent infinite loops
let isHandlingAuthError = false;

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    isHandlingAuthError = false;
    return response;
  },
  (error) => {
    // Just log the error without any redirection or clearing auth data
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("Auth error occurred, but not redirecting or clearing data");
    }

    // Simply return the error without any redirection
    return Promise.reject(error);
  },
);

// Utility function to check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    // Decode JWT token to check expiration
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    // Add 30 second buffer to account for network delays
    return payload.exp < currentTime + 30;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true; // Treat invalid tokens as expired
  }
};

// Function to validate token format
export const isValidTokenFormat = (token) => {
  if (!token) return false;

  // JWT tokens have 3 parts separated by dots
  const parts = token.split(".");
  return parts.length === 3;
};

// Function to clear authentication data
export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete api.defaults.headers.common["Authorization"];
};

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  signup: async (userData) => {
    try {
      const response = await api.post("/auth/signup", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add token validation endpoint
  validateToken: async () => {
    try {
      const response = await api.get("/auth/validate");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add refresh token endpoint (if your backend supports it)
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post("/auth/refresh", { refreshToken });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: () => {
    clearAuthData();
  },

  // Check if current session is valid
  checkSession: async () => {
    const token = localStorage.getItem("token");

    // Check if token exists and has valid format
    if (!token || !isValidTokenFormat(token)) {
      console.log(
        "Token missing or invalid format, but not clearing auth data",
      );
      return false;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log("Token expired, but not clearing auth data");
      return false;
    }

    try {
      // Validate with server
      await authAPI.validateToken();
      return true;
    } catch (error) {
      console.error("Session validation failed:", error);
      // Don't clear auth data on validation failure
      return false;
    }
  },
};

// User Management API
export const userAPI = {
  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get("/users/allusers");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user details
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user role (admin only)
  updateUserRole: async (userId, roleData) => {
    try {
      const response = await api.put(`/users/${userId}/role`, roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new user (admin only)
  createUser: async (userData) => {
    try {
      const response = await api.post("/users/create", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export const transporterAPI = {
  getContainersByRequestId: async (requestId) => {
    try {
      const response = await api.get(
        `/transport-requests/${requestId}/containers`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getTransporterByRequestId: async (requestId) => {
    try {
      const response = await api.get(
        `/transport-requests/${requestId}/transporter`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  createMultipleVehicles: async (requestId, vehicles) => {
    try {
      const response = await api.post(
        `/transport-requests/${requestId}/vehicles/batch`,
        { vehicles },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  updateMultipleVehicleContainers: async (requestId, vehicleContainers) => {
    try {
      const response = await api.post(
        `/transport-requests/${requestId}/vehicles/containers/batch`,
        { vehicleContainers },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getContainersByVehicleNumber: async (requestId, vehicleNumber) => {
    try {
      const response = await api.get(
        `/transport-requests/${requestId}/vehicle/${vehicleNumber}/containers`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  deleteContainer: async (containerId) => {
    try {
      const response = await api.delete(
        `/transporter/container/${containerId}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  deleteTransporter: async (id) => {
    try {
      const response = await api.delete(`/transporter/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  updateVehicle: async (id, vehicleData) => {
    try {
      const response = await api.put(`/transporter/${id}`, vehicleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export const transportRequestAPI = {
  // Create transport request
  createRequest: async (requestData) => {
    try {
      const response = await api.post("/transport/create", requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update transport request
  updateRequest: async (requestId, requestData) => {
    try {
      const response = await api.put(
        `/transport/update/${requestId}`,
        requestData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get customer requests
  getCustomerRequests: async () => {
    try {
      const response = await api.get("/transport/customer-requests");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all requests (admin)
  getAllRequests: async () => {
    try {
      const response = await api.get("/transport/all-requests");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update request status (admin)
  updateRequestStatus: async (requestId, status, adminComment) => {
    try {
      const response = await api.put(`/transport/status/${requestId}`, {
        status,
        adminComment,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export const setAuthToken = (token) => {
  if (token) {
    try {
      // Store token in localStorage
      localStorage.setItem("token", token);

      // Set token in axios headers
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      console.log("Auth token set in headers:", token);
      console.log(
        "Verification - localStorage token:",
        localStorage.getItem("token"),
      );
      console.log(
        "Verification - axios headers:",
        api.defaults.headers.common["Authorization"],
      );

      return true;
    } catch (error) {
      console.error("Error setting auth token:", error);
      return false;
    }
  } else {
    try {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      console.log("Auth token removed from headers");
      return true;
    } catch (error) {
      console.error("Error removing auth token:", error);
      return false;
    }
  }
};

export { api };

export default api;

export const locationAPI = {
  // Get all locations
  getAllLocations: async () => {
    try {
      const response = await api.get("/location-master/locations");
      return response.data;
      console.log("Locations fetched successfully:", response.data);
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
export const transporterListAPI = {
  getAllTransporters: async () => {
    try {
      const response = await api.get("/transporterlist/getall");
      return response.data;
    } catch (error) {
      console.error("Error fetching transporters:", error);
      return [];
    }
  },
};

export const servicesAPI = {
  getAllServices: async () => {
    try {
      const response = await api.get("/services/getallservices");
      return response.data;
    } catch (error) {
      console.error("Error fetching services:", error);
      throw error;
    }
  },

  // Add new method for creating service
  createService: async (serviceData) => {
    try {
      const response = await api.post("/services/services", serviceData);
      return response.data;
    } catch (error) {
      console.error("Error creating service:", error);
      throw error;
    }
  },
};

// Assuming you have a base API instance configured
// import api from './baseApi'; // Your configured axios instance

export const vendorAPI = {
  // Get all vendors
  getAllVendors: async () => {
    try {
      const response = await api.get("/vendors");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get vendor by ID
  getVendorById: async (vendorId) => {
    try {
      const response = await api.get(`/vendors/${vendorId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get vendor document
  getVendorDocument: async (vendorId, documentNumber) => {
    try {
      const response = await api.get(
        `/vendors/${vendorId}/document/${documentNumber}`,
        {
          responseType: "blob",
        },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new vendor with documents
  createVendor: async (formData) => {
    try {
      const response = await api.post("/vendors", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update vendor with documents
  updateVendor: async (vendorId, formData) => {
    try {
      const response = await api.put(`/vendors/${vendorId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete vendor
  deleteVendor: async (vendorId) => {
    try {
      const response = await api.delete(`/vendors/${vendorId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// 2. Update these functions in your VendorDetails component:

const createVendorWithDocuments = async (formData, documentFiles) => {
  const data = new FormData();

  // Append all form data
  Object.keys(formData).forEach((key) => {
    if (
      formData[key] !== null &&
      formData[key] !== undefined &&
      formData[key] !== ""
    ) {
      data.append(key, formData[key]);
    }
  });

  // Append document files
  if (documentFiles?.length > 0) {
    documentFiles.forEach((file) => {
      data.append("documents", file);
    });
  }

  return await vendorAPI.createVendor(data);
};

const updateVendorWithDocuments = async (id, formData, documentFiles) => {
  const data = new FormData();

  // Append all form data
  Object.keys(formData).forEach((key) => {
    if (
      formData[key] !== null &&
      formData[key] !== undefined &&
      formData[key] !== ""
    ) {
      data.append(key, formData[key]);
    }
  });

  // Append document files (only if new files are selected)
  if (documentFiles?.length > 0) {
    documentFiles.forEach((file) => {
      data.append("documents", file);
    });
  }

  return await vendorAPI.updateVendor(id, data);
};

export const driverAPI = {
  // Get all drivers
  getAllDrivers: async () => {
    try {
      const response = await api.get("/drivers");
      return response.data;
    } catch (error) {
      console.error("Error fetching drivers:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get driver by ID
  getDriverById: async (driverId) => {
    try {
      const response = await api.get(`/drivers/${driverId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching driver details:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new driver
  createDriver: async (driverData) => {
    try {
      const response = await api.post("/drivers", driverData);
      return response.data;
    } catch (error) {
      console.error("Error creating driver:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update driver
  updateDriver: async (driverId, driverData) => {
    try {
      const response = await api.put(`/drivers/${driverId}`, driverData);
      return response.data;
    } catch (error) {
      console.error("Error updating driver:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete driver
  deleteDriver: async (driverId) => {
    try {
      const response = await api.delete(`/drivers/${driverId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting driver:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get drivers by vendor ID - Fixed route
  getDriversByVendorId: async (vendorId) => {
    try {
      const response = await api.get(`/drivers/vendor/${vendorId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching drivers by vendor ID:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get vendors for dropdown - Add this method
  getVendors: async () => {
    try {
      const response = await api.get("/vendors"); // or "/drivers/vendors/list" if you prefer the other route
      return response.data;
    } catch (error) {
      console.error("Error fetching vendors:", error);
      throw error.response?.data || error.message;
    }
  },
};

export const equipmentAPI = {
  // Get all equipment
  getAllEquipment: async () => {
    try {
      const response = await api.get("/equipment");
      return response.data;
    } catch (error) {
      console.error("Error fetching equipment:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get equipment by ID
  getEquipmentById: async (equipmentId) => {
    try {
      const response = await api.get(`/equipment/${equipmentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching equipment details:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new equipment
  createEquipment: async (equipmentData) => {
    try {
      const response = await api.post("/equipment", equipmentData);
      return response.data;
    } catch (error) {
      console.error("Error creating equipment:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update equipment
  updateEquipment: async (equipmentId, equipmentData) => {
    try {
      const response = await api.put(
        `/equipment/${equipmentId}`,
        equipmentData,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating equipment:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete equipment
  deleteEquipment: async (equipmentId) => {
    try {
      const response = await api.delete(`/equipment/${equipmentId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting equipment:", error);
      throw error.response?.data || error.message;
    }
  },
};

export const vehicleAPI = {
  getAllvehicles: async () => {
    try {
      const response = await api.get("/vehicles");
      return response.data;
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      throw error.response?.data || error.message;
    }
  },
};
// Add these functions to your existing api.jsx file

export const asnAPI = {
  // Get all ASN records
  getAllASN: async () => {
    try {
      const response = await api.get("/asn");
      return response.data;
    } catch (error) {
      console.error("Error fetching ASN records:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get ASN record by ID
  getASNById: async (asnId) => {
    try {
      const response = await api.get(`/asn/${asnId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching ASN record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update ASN record
  updateASN: async (asnId, asnData) => {
    try {
      const response = await api.put(`/asn/${asnId}`, asnData);
      return response.data;
    } catch (error) {
      console.error("Error updating ASN record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete ASN record
  deleteASN: async (asnId) => {
    try {
      const response = await api.delete(`/asn/${asnId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting ASN record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create ASN record
  createASN: async (asnData) => {
    try {
      const response = await api.post("/asn", asnData);
      return response.data;
    } catch (error) {
      console.error("Error creating ASN record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create bulk ASN records
  createBulkASN: async (asnDataArray) => {
    try {
      const response = await api.post("/asn/bulk", { records: asnDataArray });
      return response.data;
    } catch (error) {
      console.error("Error creating bulk ASN records:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Driver Advance API
export const driverAdvanceAPI = {
  // Get advances by request ID
  getAdvancesByRequestId: async (requestId) => {
    try {
      const response = await api.get(`/driver-advances/request/${requestId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching advances by request ID:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get advances by driver contact
  getAdvancesByDriver: async (driverContact) => {
    try {
      const response = await api.get(
        `/driver-advances/driver/${driverContact}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching advances by driver:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new advance
  createAdvance: async (advanceData) => {
    try {
      const response = await api.post("/driver-advances", advanceData);
      return response.data;
    } catch (error) {
      console.error("Error creating advance:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update advance status
  updateAdvanceStatus: async (advanceId, statusData) => {
    try {
      const response = await api.put(
        `/driver-advances/${advanceId}/status`,
        statusData,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating advance status:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete advance
  deleteAdvance: async (advanceId) => {
    try {
      const response = await api.delete(`/driver-advances/${advanceId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting advance:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Dealer Trip Details API
export const dealerTripDetailsAPI = {
  // Get all Dealer Trip Details records
  getAllDealerTripDetails: async () => {
    try {
      const response = await api.get("/dealer-trip-details");
      return response.data;
    } catch (error) {
      console.error("Error fetching Dealer Trip Details records:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Dealer Trip Details record by ID
  getDealerTripDetailsById: async (id) => {
    try {
      const response = await api.get(`/dealer-trip-details/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Dealer Trip Details record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create Dealer Trip Details record
  createDealerTripDetails: async (data) => {
    try {
      const response = await api.post("/dealer-trip-details", data);
      return response.data;
    } catch (error) {
      console.error("Error creating Dealer Trip Details record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update Dealer Trip Details record
  updateDealerTripDetails: async (id, data) => {
    try {
      const response = await api.put(`/dealer-trip-details/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating Dealer Trip Details record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete Dealer Trip Details record
  deleteDealerTripDetails: async (id) => {
    try {
      const response = await api.delete(`/dealer-trip-details/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting Dealer Trip Details record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create bulk Dealer Trip Details records
  createBulkDealerTripDetails: async (dataArray) => {
    try {
      const response = await api.post("/dealer-trip-details/bulk", {
        records: dataArray,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating bulk Dealer Trip Details records:", error);
      throw error.response?.data || error.message;
    }
  },
};

// OEM Pickup API - Separate Rows Version
export const oemPickupSeparateRowsAPI = {
  // Get all OEM Pickup records
  getAllOEMPickups: async () => {
    try {
      const response = await api.get("/oem-pickup-separate-rows");
      return response.data;
    } catch (error) {
      console.error("Error fetching OEM Pickup records:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get OEM Pickup by ID
  getOEMPickupById: async (id) => {
    try {
      const response = await api.get(`/oem-pickup-separate-rows/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching OEM Pickup record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get available VINs for OEM Pickup
  getAvailableVINs: async () => {
    try {
      const response = await api.get("/oem-pickup-separate-rows/available-vins");
      return response.data;
    } catch (error) {
      console.error("Error fetching available VINs:", error);
      throw error.response?.data || error.message;
    }
  },

  // Validate VINs for OEM Pickup
  validateVINs: async (vinArray) => {
    try {
      const response = await api.post("/oem-pickup-separate-rows/validate-vins", { vinArray });
      return response.data;
    } catch (error) {
      console.error("Error validating VINs:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new OEM Pickup record
  createOEMPickup: async (data) => {
    try {
      const response = await api.post("/oem-pickup-separate-rows", data);
      return response.data;
    } catch (error) {
      console.error("Error creating OEM Pickup record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update OEM Pickup record
  updateOEMPickup: async (id, data) => {
    try {
      const response = await api.put(`/oem-pickup-separate-rows/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating OEM Pickup record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete OEM Pickup record
  deleteOEMPickup: async (id) => {
    try {
      const response = await api.delete(`/oem-pickup-separate-rows/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting OEM Pickup record:", error);
      throw error.response?.data || error.message;
    }
  },
};
// OEM Pickup API - Simple Single Table Approach
export const oemPickupAPI = {
  // Get all OEM Pickup records
  getAllOEMPickups: async () => {
    try {
      const response = await api.get("/oem-pickup");
      return response.data;
    } catch (error) {
      console.error("Error fetching OEM Pickup records:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get OEM Pickup by ID
  getOEMPickupById: async (id) => {
    try {
      const response = await api.get(`/oem-pickup/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching OEM Pickup record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get available VINs for OEM Pickup
  getAvailableVINs: async () => {
    try {
      const response = await api.get("/oem-pickup/available-vins");
      return response.data;
    } catch (error) {
      console.error("Error fetching available VINs:", error);
      throw error.response?.data || error.message;
    }
  },

  // Validate VINs for OEM Pickup
  validateVINs: async (vinDetails) => {
    try {
      const response = await api.post("/oem-pickup/validate-vins", { vinDetails });
      return response.data;
    } catch (error) {
      console.error("Error validating VINs:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new OEM Pickup record
  createOEMPickup: async (data) => {
    try {
      const response = await api.post("/oem-pickup", data);
      return response.data;
    } catch (error) {
      console.error("Error creating OEM Pickup record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update OEM Pickup record
  updateOEMPickup: async (id, data) => {
    try {
      const response = await api.put(`/oem-pickup/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating OEM Pickup record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete OEM Pickup record
  deleteOEMPickup: async (id) => {
    try {
      const response = await api.delete(`/oem-pickup/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting OEM Pickup record:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Location Master API
export const locationMasterAPI = {
  // Get all locations
  getAllLocations: async () => {
    try {
      const response = await api.get("/location-master/locations");
      return response.data;
    } catch (error) {
      console.error("Error fetching locations:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get location by ID
  getLocationById: async (id) => {
    try {
      const response = await api.get(`/location-master/locations/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching location:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new location
  createLocation: async (locationData) => {
    try {
      const response = await api.post("/location-master/locations", locationData);
      return response.data;
    } catch (error) {
      console.error("Error creating location:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update location
  updateLocation: async (id, locationData) => {
    try {
      const response = await api.put(`/location-master/locations/${id}`, locationData);
      return response.data;
    } catch (error) {
      console.error("Error updating location:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete location
  deleteLocation: async (id) => {
    try {
      const response = await api.delete(`/location-master/locations/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting location:", error);
      throw error.response?.data || error.message;
    }
  },

  // Toggle location status
  toggleLocationStatus: async (id) => {
    try {
      const response = await api.patch(`/location-master/locations/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error("Error toggling location status:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Arrival At Plant API
export const arrivalAtPlantAPI = {
  // Get all OEM Pickup vehicles for arrival
  getOEMPickupVehicles: async () => {
    try {
      const response = await api.get("/arrival-at-plant/oem-pickup-vehicles");
      return response.data;
    } catch (error) {
      console.error("Error fetching OEM Pickup vehicles:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get vehicle details by truck number
  getVehicleDetailsByTruck: async (truckNumber) => {
    try {
      const response = await api.get(`/arrival-at-plant/vehicle-details/${truckNumber}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create arrival at plant record
  createArrival: async (arrivalData) => {
    try {
      const response = await api.post("/arrival-at-plant", arrivalData);
      return response.data;
    } catch (error) {
      console.error("Error creating arrival record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update arrival record
  updateArrival: async (id, arrivalData) => {
    try {
      const response = await api.put(`/arrival-at-plant/${id}`, arrivalData);
      return response.data;
    } catch (error) {
      console.error("Error updating arrival record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get all arrival records
  getAllArrivals: async () => {
    try {
      const response = await api.get("/arrival-at-plant");
      return response.data;
    } catch (error) {
      console.error("Error fetching arrival records:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Vehicle Master API
export const vehicleMasterAPI = {
  // Get all vehicles
  getAllVehicles: async () => {
    try {
      const response = await api.get("/vehicle-master/vehicles");
      return response.data;
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get vehicle by ID
  getVehicleById: async (id) => {
    try {
      const response = await api.get(`/vehicle-master/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new vehicle
  createVehicle: async (vehicleData) => {
    try {
      const response = await api.post("/vehicle-master/vehicles", vehicleData);
      return response.data;
    } catch (error) {
      console.error("Error creating vehicle:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update vehicle
  updateVehicle: async (id, vehicleData) => {
    try {
      const response = await api.put(`/vehicle-master/vehicles/${id}`, vehicleData);
      return response.data;
    } catch (error) {
      console.error("Error updating vehicle:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete vehicle
  deleteVehicle: async (id) => {
    try {
      const response = await api.delete(`/vehicle-master/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      throw error.response?.data || error.message;
    }
  },

  // Toggle vehicle status
  toggleVehicleStatus: async (id) => {
    try {
      const response = await api.patch(`/vehicle-master/vehicles/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error("Error toggling vehicle status:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get transporters
  getTransporters: async () => {
    try {
      const response = await api.get("/vehicle-master/transporters");
      return response.data;
    } catch (error) {
      console.error("Error fetching transporters:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get drivers
  getDrivers: async () => {
    try {
      const response = await api.get("/vehicle-master/drivers");
      return response.data;
    } catch (error) {
      console.error("Error fetching drivers:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Driver Master API
export const driverMasterAPI = {
  // Get all drivers
  getAllDrivers: async () => {
    try {
      const response = await api.get("/driver-master/drivers");
      return response.data;
    } catch (error) {
      console.error("Error fetching drivers:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get active drivers for dropdown
  getActiveDrivers: async () => {
    try {
      const response = await api.get("/driver-master/drivers/active");
      return response.data;
    } catch (error) {
      console.error("Error fetching active drivers:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get driver by ID
  getDriverById: async (id) => {
    try {
      const response = await api.get(`/driver-master/drivers/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching driver:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new driver
  createDriver: async (driverData) => {
    try {
      const response = await api.post("/driver-master/drivers", driverData);
      return response.data;
    } catch (error) {
      console.error("Error creating driver:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update driver
  updateDriver: async (id, driverData) => {
    try {
      const response = await api.put(`/driver-master/drivers/${id}`, driverData);
      return response.data;
    } catch (error) {
      console.error("Error updating driver:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete driver
  deleteDriver: async (id) => {
    try {
      const response = await api.delete(`/driver-master/drivers/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting driver:", error);
      throw error.response?.data || error.message;
    }
  },

  // Toggle driver status
  toggleDriverStatus: async (id) => {
    try {
      const response = await api.patch(`/driver-master/drivers/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error("Error toggling driver status:", error);
      throw error.response?.data || error.message;
    }
  },

  // Upload license image for driver
  uploadLicenseImage: async (driverId, file) => {
    try {
      const formData = new FormData();
      formData.append('licenseImage', file);
      
      const response = await api.post(`/driver-master/drivers/${driverId}/license-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading license image:", error);
      throw error.response?.data || error.message;
    }
  },

  // Upload Aadhaar image for driver
  uploadAadhaarImage: async (driverId, file) => {
    try {
      const formData = new FormData();
      formData.append('aadhaarImage', file);
      
      const response = await api.post(`/driver-master/drivers/${driverId}/aadhaar-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading Aadhaar image:", error);
      throw error.response?.data || error.message;
    }
  },

  // Upload PAN image for driver
  uploadPanImage: async (driverId, file) => {
    try {
      const formData = new FormData();
      formData.append('panImage', file);
      
      const response = await api.post(`/driver-master/drivers/${driverId}/pan-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading PAN image:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get license image for driver
  getLicenseImage: async (driverId) => {
    try {
      const response = await api.get(`/driver-master/drivers/${driverId}/license-image`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching license image:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Aadhaar image for driver
  getAadhaarImage: async (driverId) => {
    try {
      const response = await api.get(`/driver-master/drivers/${driverId}/aadhaar-image`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching Aadhaar image:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get PAN image for driver
  getPanImage: async (driverId) => {
    try {
      const response = await api.get(`/driver-master/drivers/${driverId}/pan-image`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching PAN image:", error);
      throw error.response?.data || error.message;
    }
  },
  generateQRCode: async (driverId) => {
    try {
      const response = await api.get(`/driver-master/drivers/${driverId}/qr-code`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw error.response?.data || error.message;
    }
  },
};
