import axios from "axios";



// Use environment variable with fallback to localhost

const API_BASE_URL =

  process.env.REACT_APP_API_URL || "http://localhost:4000/api";



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



// VIN Survey API

export const vinSurveyAPI = {

  // Get all surveys

  getAllSurveys: async () => {

    try {

      const response = await api.get("/vin-survey/surveys");

      return response.data;

    } catch (error) {

      console.error("Error fetching surveys:", error);

      throw error.response?.data || error.message;

    }

  },



  // Get survey statistics

  getSurveyStats: async () => {

    try {

      const response = await api.get("/vin-survey/surveys/stats");

      return response.data;

    } catch (error) {

      console.error("Error fetching survey statistics:", error);

      throw error.response?.data || error.message;

    }

  },



  // Get survey by ID

  getSurveyById: async (surveyId) => {

    try {

      const response = await api.get(`/vin-survey/surveys/${surveyId}`);

      return response.data;

    } catch (error) {

      console.error("Error fetching survey:", error);

      throw error.response?.data || error.message;

    }

  },



  // Create new survey

  createSurvey: async (surveyData) => {

    console.log("vinSurveyAPI.createSurvey called with:", surveyData);

    try {

      console.log("Making POST request to /vin-survey/surveys");

      const response = await api.post("/vin-survey/surveys", surveyData);

      console.log("API response received:", response);

      return response.data;

    } catch (error) {

      console.error("Error in createSurvey:", error);

      console.error("Error response:", error.response);

      throw error.response?.data || error.message;

    }

  },



  // Update survey

  updateSurvey: async (surveyId, surveyData) => {

    try {

      const response = await api.put(`/vin-survey/surveys/${surveyId}`, surveyData);

      return response.data;

    } catch (error) {

      console.error("Error updating survey:", error);

      throw error.response?.data || error.message;

    }

  },



  // Delete survey

  deleteSurvey: async (surveyId) => {

    try {

      const response = await api.delete(`/vin-survey/surveys/${surveyId}`);

      return response.data;

    } catch (error) {

      console.error("Error deleting survey:", error);

      throw error.response?.data || error.message;

    }

  },



  // Get surveys by VIN

  getSurveysByVin: async (vin) => {

    try {

      const response = await api.get(`/vin-survey/surveys/vin/${vin}`);

      return response.data;

    } catch (error) {

      console.error("Error fetching surveys by VIN:", error);

      throw error.response?.data || error.message;

    }

  },



  // Get surveys by date range

  getSurveysByDateRange: async (startDate, endDate) => {

    try {

      const response = await api.get("/vin-survey/surveys/date-range", {

        params: { startDate, endDate }

      });

      return response.data;

    } catch (error) {

      console.error("Error fetching surveys by date range:", error);

      throw error.response?.data || error.message;

    }

  },



  // Add photo to survey

  addPhoto: async (surveyId, photoData) => {

    try {

      const response = await api.post(`/vin-survey/surveys/${surveyId}/photos`, photoData);

      return response.data;

    } catch (error) {

      console.error("Error adding photo:", error);

      throw error.response?.data || error.message;

    }

  },



  // Remove photo from survey

  removePhoto: async (photoId) => {

    try {

      const response = await api.delete(`/vin-survey/photos/${photoId}`);

      return response.data;

    } catch (error) {

      console.error("Error removing photo:", error);

      throw error.response?.data || error.message;

    }

  },



  // Get photo by ID (for displaying images)

  getPhoto: async (photoId) => {

    try {

      const response = await api.get(`/vin-survey/photos/${photoId}`, {

        responseType: 'blob'

      });

      return response.data;

    } catch (error) {

      console.error("Error fetching photo:", error);

      throw error.response?.data || error.message;

    }

  },

};



// Rake Master API

export const rakeMasterAPI = {

  // Get all rakes

  getAllRakes: async () => {

    try {

      const response = await api.get("/rake-master");

      return response.data;

    } catch (error) {

      console.error("Error fetching rakes:", error);

      throw error.response?.data || error.message;

    }

  },



  // Get rake by ID

  getRakeById: async (id) => {

    try {

      const response = await api.get(`/rake-master/${id}`);

      return response.data;

    } catch (error) {

      console.error("Error fetching rake:", error);

      throw error.response?.data || error.message;

    }

  },



  // Get rake by name

  getRakeByName: async (rakeName) => {

    try {

      const response = await api.get(`/rake-master/name/${rakeName}`);

      return response.data;

    } catch (error) {

      console.error("Error fetching rake by name:", error);

      throw error.response?.data || error.message;

    }

  },



  // Create new rake

  createRake: async (rakeData) => {

    try {

      const response = await api.post("/rake-master", rakeData);

      return response.data;

    } catch (error) {

      console.error("Error creating rake:", error);

      throw error.response?.data || error.message;

    }

  },



  // Update existing rake

  updateRake: async (id, rakeData) => {

    try {

      const response = await api.put(`/rake-master/${id}`, rakeData);

      return response.data;

    } catch (error) {

      console.error("Error updating rake:", error);

      throw error.response?.data || error.message;

    }

  },



  // Delete rake

  deleteRake: async (id) => {

    try {

      const response = await api.delete(`/rake-master/${id}`);

      return response.data;

    } catch (error) {

      console.error("Error deleting rake:", error);

      throw error.response?.data || error.message;

    }

  },



  // Get wagons for a rake

  getWagonsByRakeId: async (rakeId) => {

    try {

      const response = await api.get(`/rake-master/${rakeId}/wagons`);

      return response.data;

    } catch (error) {

      console.error("Error fetching wagons:", error);

      throw error.response?.data || error.message;

    }

  },

};



// Article Master API

export const articleMasterAPI = {

  // Get all articles

  getAllArticles: async () => {

    try {

      const response = await api.get("/article-master/articles");

      return response.data;

    } catch (error) {

      console.error("Error fetching articles:", error);

      throw error.response?.data || error.message;

    }

  },



  // Get article by ID

  getArticleById: async (id) => {

    try {

      const response = await api.get(`/article-master/articles/${id}`);

      return response.data;

    } catch (error) {

      console.error("Error fetching article:", error);

      throw error.response?.data || error.message;

    }

  },



  // Create new article

  createArticle: async (formData) => {

    try {

      const response = await api.post("/article-master/articles", formData, {

        headers: {

          "Content-Type": "multipart/form-data",

        },

      });

      return response.data;

    } catch (error) {

      console.error("Error creating article:", error);

      throw error.response?.data || error.message;

    }

  },



  // Update article

  updateArticle: async (id, formData) => {

    try {

      const response = await api.put(`/article-master/articles/${id}`, formData, {

        headers: {

          "Content-Type": "multipart/form-data",

        },

      });

      return response.data;

    } catch (error) {

      console.error("Error updating article:", error);

      throw error.response?.data || error.message;

    }

  },



  // Delete article

  deleteArticle: async (id) => {

    try {

      const response = await api.delete(`/article-master/articles/${id}`);

      return response.data;

    } catch (error) {

      console.error("Error deleting article:", error);

      throw error.response?.data || error.message;

    }

  },



  // Get article groups

  getArticleGroups: async () => {

    try {

      const response = await api.get("/article-master/groups");

      return response.data;

    } catch (error) {

      console.error("Error fetching article groups:", error);

      throw error.response?.data || error.message;

    }

  },

};



// Route Master API

export const routeMasterAPI = {

  // Get all routes

  getAllRoutes: async () => {

    try {

      const response = await api.get("/route-master/routes");

      return response.data;

    } catch (error) {

      console.error("Error fetching routes:", error);

      throw error.response?.data || error.message;

    }

  },



  // Get route by ID

  getRouteById: async (id) => {

    try {

      const response = await api.get(`/route-master/routes/${id}`);

      return response.data;

    } catch (error) {

      console.error("Error fetching route:", error);

      throw error.response?.data || error.message;

    }

  },



  // Create new route

  createRoute: async (routeData) => {

    try {

      const response = await api.post("/route-master/routes", routeData);

      return response.data;

    } catch (error) {

      console.error("Error creating route:", error);

      throw error.response?.data || error.message;

    }

  },



  // Update route

  updateRoute: async (id, routeData) => {

    try {

      const response = await api.put(`/route-master/routes/${id}`, routeData);

      return response.data;

    } catch (error) {

      console.error("Error updating route:", error);

      throw error.response?.data || error.message;

    }

  },



  // Delete route

  deleteRoute: async (id) => {

    try {

      const response = await api.delete(`/route-master/routes/${id}`);

      return response.data;

    } catch (error) {

      console.error("Error deleting route:", error);

      throw error.response?.data || error.message;

    }

  },



  // Search routes
  searchRoutes: async (searchTerm) => {
    try {
      const response = await api.get(`/route-master/routes/search?term=${searchTerm}`);
      return response.data;
    } catch (error) {
      console.error("Error searching routes:", error);
      throw error.response?.data || error.message;
    }
  },


  // Toggle route status

  toggleRouteStatus: async (id) => {

    try {

      const response = await api.patch(`/route-master/routes/${id}/toggle-status`);

      return response.data;

    } catch (error) {

      console.error("Error toggling route status:", error);

      throw error.response?.data || error.message;

    }

  },

};

// Rake Planning API
export const rakePlanningAPI = {
  // Get all rake plans
  getAllRakePlans: async () => {
    try {
      const response = await api.get("/rake-planning");
      return response.data;
    } catch (error) {
      console.error("Error fetching rake plans:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get rake plan by ID
  getRakePlanById: async (id) => {
    try {
      const response = await api.get(`/rake-planning/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching rake plan:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new rake plan
  createRakePlan: async (rakePlanData) => {
    try {
      const response = await api.post("/rake-planning", rakePlanData);
      return response.data;
    } catch (error) {
      console.error("Error creating rake plan:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update rake plan
  updateRakePlan: async (id, rakePlanData) => {
    try {
      const response = await api.put(`/rake-planning/${id}`, rakePlanData);
      return response.data;
    } catch (error) {
      console.error("Error updating rake plan:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete rake plan
  deleteRakePlan: async (id) => {
    try {
      const response = await api.delete(`/rake-planning/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting rake plan:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Rake Visit API - For arrival/departure operations
export const rakeVisitAPI = {
  // Get all rake visits
  getAllRakeVisits: async () => {
    try {
      const response = await api.get("/rake-visit");
      return response.data;
    } catch (error) {
      console.error("Error fetching rake visits:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get rake visit by ID
  getRakeVisitById: async (id) => {
    try {
      const response = await api.get(`/rake-visit/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching rake visit:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new rake visit (from arrival)
  createRakeVisit: async (rakeVisitData) => {
    try {
      const response = await api.post("/rake-visit", rakeVisitData);
      return response.data;
    } catch (error) {
      console.error("Error creating rake visit:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update rake visit (from departure)
  updateRakeVisit: async (id, rakeVisitData) => {
    try {
      const response = await api.put(`/rake-visit/${id}`, rakeVisitData);
      return response.data;
    } catch (error) {
      console.error("Error updating rake visit:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete rake visit
  deleteRakeVisit: async (id) => {
    try {
      const response = await api.delete(`/rake-visit/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting rake visit:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get rake visits by rake ID
  getRakeVisitsByRakeId: async (rakeId) => {
    try {
      const response = await api.get(`/rake-visit/rake/${rakeId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching rake visits by rake ID:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get rake visits by terminal ID
  getRakeVisitsByTerminalId: async (terminalId) => {
    try {
      const response = await api.get(`/rake-visit/terminal/${terminalId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching rake visits by terminal ID:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Rake Departure API
export const rakeDepartureAPI = {
  // Get all rake departures
  getAllRakeDepartures: async () => {
    try {
      const response = await api.get("/rake-departure");
      return response.data;
    } catch (error) {
      console.error("Error fetching rake departures:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get rake departure by ID
  getRakeDepartureById: async (id) => {
    try {
      const response = await api.get(`/rake-departure/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching rake departure:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new rake departure
  createRakeDeparture: async (rakeDepartureData) => {
    try {
      const response = await api.post("/rake-departure", rakeDepartureData);
      return response.data;
    } catch (error) {
      console.error("Error creating rake departure:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update rake departure
  updateRakeDeparture: async (id, rakeDepartureData) => {
    try {
      const response = await api.put(`/rake-departure/${id}`, rakeDepartureData);
      return response.data;
    } catch (error) {
      console.error("Error updating rake departure:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete rake departure (soft delete)
  deleteRakeDeparture: async (id) => {
    try {
      const response = await api.delete(`/rake-departure/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting rake departure:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get rake departures by filters
  getRakeDeparturesByFilters: async (filters) => {
    try {
      const response = await api.get("/rake-departure/filter", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching filtered rake departures:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get rake departures by date range
  getRakeDeparturesByDateRange: async (startDate, endDate, additionalFilters = {}) => {
    try {
      const params = { startDate, endDate, ...additionalFilters };
      const response = await api.get("/rake-departure/date-range", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching rake departures by date range:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Terminal Master API
export const terminalMasterAPI = {
  // Get all terminals
  getAllTerminals: async () => {
    try {
      const response = await api.get("/terminal-master");
      return response.data;
    } catch (error) {
      console.error("Error fetching terminals:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get terminal by ID
  getTerminalById: async (id) => {
    try {
      const response = await api.get(`/terminal-master/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching terminal:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get terminal by code
  getTerminalByCode: async (code) => {
    try {
      const response = await api.get(`/terminal-master/code/${code}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching terminal by code:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get terminal codes only (for dropdowns)
  getTerminalCodes: async () => {
    try {
      const response = await api.get("/terminal-master/codes/list");
      return response.data;
    } catch (error) {
      console.error("Error fetching terminal codes:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new terminal
  createTerminal: async (terminalData) => {
    try {
      const response = await api.post("/terminal-master", terminalData);
      return response.data;
    } catch (error) {
      console.error("Error creating terminal:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update terminal
  updateTerminal: async (id, terminalData) => {
    try {
      const response = await api.put(`/terminal-master/${id}`, terminalData);
      return response.data;
    } catch (error) {
      console.error("Error updating terminal:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete terminal
  deleteTerminal: async (id) => {
    try {
      const response = await api.delete(`/terminal-master/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting terminal:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Exam Type API
export const examTypeAPI = {
  // Get all exam types
  getAllExamTypes: async () => {
    try {
      const response = await api.get("/exam-types");
      return response.data;
    } catch (error) {
      console.error("Error fetching exam types:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get exam type by ID
  getExamTypeById: async (examId) => {
    try {
      const response = await api.get(`/exam-types/${examId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching exam type:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new exam type
  createExamType: async (examData) => {
    try {
      const response = await api.post("/exam-types", examData);
      return response.data;
    } catch (error) {
      console.error("Error creating exam type:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update exam type
  updateExamType: async (examId, examData) => {
    try {
      const response = await api.put(`/exam-types/${examId}`, examData);
      return response.data;
    } catch (error) {
      console.error("Error updating exam type:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete exam type
  deleteExamType: async (examId) => {
    try {
      const response = await api.delete(`/exam-types/${examId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting exam type:", error);
      throw error.response?.data || error.message;
    }
  },

  // Search exam types
  searchExamTypes: async (searchTerm) => {
    try {
      const response = await api.get(`/exam-types/search/${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      console.error("Error searching exam types:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Rake Exam API
export const rakeExamAPI = {
  // Get all exams
  getAllExams: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      const response = await api.get(`/rake-exams?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching exams:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get exam by ID
  getExamById: async (examId) => {
    try {
      const response = await api.get(`/rake-exams/${examId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching exam:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new exam
  createExam: async (examData) => {
    try {
      const response = await api.post("/rake-exams", examData);
      return response.data;
    } catch (error) {
      console.error("Error creating exam:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update exam
  updateExam: async (examId, examData) => {
    try {
      const response = await api.put(`/rake-exams/${examId}`, examData);
      return response.data;
    } catch (error) {
      console.error("Error updating exam:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete exam
  deleteExam: async (examId) => {
    try {
      const response = await api.delete(`/rake-exams/${examId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting exam:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get exams by rake ID
  getExamsByRakeId: async (rakeId) => {
    try {
      const response = await api.get(`/rake-exams/rake/${rakeId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching exams by rake ID:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get exam details only
  getExamDetails: async (examId) => {
    try {
      const response = await api.get(`/rake-exams/${examId}/details`);
      return response.data;
    } catch (error) {
      console.error("Error fetching exam details:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Survey Type API
export const surveyTypeAPI = {
  // Get all survey types
  getAllSurveyTypes: async () => {
    try {
      const response = await api.get("/survey-types");
      return response.data;
    } catch (error) {
      console.error("Error fetching survey types:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get survey type by ID
  getSurveyTypeById: async (surveyTypeId) => {
    try {
      const response = await api.get(`/survey-types/${surveyTypeId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching survey type by ID:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get survey types by status
  getSurveyTypesByStatus: async (status) => {
    try {
      const response = await api.get(`/survey-types/status/${status}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching survey types by status:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get survey type count by status
  getSurveyTypeCountByStatus: async () => {
    try {
      const response = await api.get("/survey-types/count/status");
      return response.data;
    } catch (error) {
      console.error("Error fetching survey type count by status:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Damage Type API
export const damageTypeAPI = {
  // Get all damage types
  getAllDamageTypes: async () => {
    try {
      const response = await api.get("/damage-types");
      return response.data;
    } catch (error) {
      console.error("Error fetching damage types:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get damage type by ID
  getDamageTypeById: async (damageTypeId) => {
    try {
      const response = await api.get(`/damage-types/${damageTypeId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching damage type by ID:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get damage types by status
  getDamageTypesByStatus: async (status) => {
    try {
      const response = await api.get(`/damage-types/status/${status}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching damage types by status:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get damage type count by status
  getDamageTypeCountByStatus: async () => {
    try {
      const response = await api.get("/damage-types/count/status");
      return response.data;
    } catch (error) {
      console.error("Error fetching damage type count by status:", error);
      throw error.response?.data || error.message;
    }
  },
};
