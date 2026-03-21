import axios from "axios";

// Use environment variable with fallback to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
    // Just log error without any redirection or clearing auth data
    console.log("Auth error occurred, but not redirecting or clearing data");
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    isHandlingAuthError = false;
    return response;
  },
  (error) => {
    // Simply return error without any redirection or clearing auth data
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

// Utility function to validate token format
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

// Rake Visit API - For arrival/departure operations
export const rakeVisitAPI = {
  // Get all rake visits
  getAllRakeVisits: async () => {
    try {
      const response = await api.get("/rake_visits");
      return response.data;
    } catch (error) {
      console.error("Error fetching rake visits:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get rake visit by ID
  getRakeVisitById: async (id) => {
    try {
      const response = await api.get(`/rake_visits/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching rake visit:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new rake visit (from arrival)
  createRakeVisit: async (rakeVisitData) => {
    try {
      const response = await api.post("/rake_visits", rakeVisitData);
      return response.data;
    } catch (error) {
      console.error("Error creating rake visit:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update rake visit (from departure)
  updateRakeVisit: async (id, rakeVisitData) => {
    try {
      const response = await api.put(`/rake_visits/${id}`, rakeVisitData);
      return response.data;
    } catch (error) {
      console.error("Error updating rake visit:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete rake visit
  deleteRakeVisit: async (id) => {
    try {
      const response = await api.delete(`/rake_visits/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting rake visit:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get rake visits by rake ID
  getRakeVisitsByRakeId: async (rakeId) => {
    try {
      const response = await api.get(`/rake_visits/rake/${rakeId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching rake visits by rake ID:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get rake visits by terminal ID
  getRakeVisitsByTerminalId: async (terminalId) => {
    try {
      const response = await api.get(`/rake_visits/terminal/${terminalId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching rake visits by terminal ID:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get rake visits by date range
  getRakeVisitsByDateRange: async (startDate, endDate, additionalFilters = {}) => {
    try {
      const params = { startDate, endDate, ...additionalFilters };
      const response = await api.get("/rake_visits/date-range", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching rake visits by date range:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get rake visits by filters
  getRakeVisitsByFilters: async (filters) => {
    try {
      const response = await api.get("/rake_visits/filter", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching filtered rake visits:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get rake visits by date range
  getRakeVisitsByDateRange: async (startDate, endDate, additionalFilters = {}) => {
    try {
      const params = { startDate, endDate, ...additionalFilters };
      const response = await api.get("/rake_visits/date-range", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching rake visits by date range:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get all rake visits for reporting
  getAllRakeVisitsForReport: async () => {
    try {
      const response = await api.get("/rake_visits/report");
      return response.data;
    } catch (error) {
      console.error("Error fetching rake visits for report:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create multiple rake visits (batch operation)
  createMultipleRakeVisits: async (rakeVisitsData) => {
    try {
      const response = await api.post("/rake_visits/batch", rakeVisitsData);
      return response.data;
    } catch (error) {
      console.error("Error creating multiple rake visits:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update multiple rake visits (batch operation)
  updateMultipleRakeVisits: async (updates) => {
    try {
      const response = await api.put("/rake_visits/batch", updates);
      return response.data;
    } catch (error) {
      console.error("Error updating multiple rake visits:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get rake visit statistics
  getRakeVisitStatistics: async (filters = {}) => {
    try {
      const response = await api.get("/rake_visits/statistics", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching rake visit statistics:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get rake visit summary by date
  getRakeVisitSummaryByDate: async (date) => {
    try {
      const response = await api.get(`/rake_visits/summary/${date}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching rake visit summary:", error);
      throw error.response?.data || error.message;
    }
  }
};
