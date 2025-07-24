import { apiRequest } from "./api";

const dashboardAPI = {
  // Get dashboard data
  getDashboard: async () => {
    return await apiRequest("/delivery-partner-dashboard/dashboard", "GET");
  },

  // Toggle availability
  toggleAvailability: async (isAvailable) => {
    return await apiRequest(
      "/delivery-partner-dashboard/toggle-availability",
      "POST",
      {
        isAvailable,
      }
    );
  },

  // Get partner statistics
  getStats: async () => {
    return await apiRequest("/delivery-partner-dashboard/stats", "GET");
  },

  // Get partner statistics (alias for Redux compatibility)
  getPartnerStats: async (partnerId) => {
    return await apiRequest("/delivery-partner-dashboard/stats", "GET");
  },

  // Update availability (for Redux compatibility)
  updateAvailability: async (partnerId, isAvailable, availabilityStatus) => {
    return await apiRequest(
      "/delivery-partner-dashboard/toggle-availability",
      "POST",
      {
        isAvailable,
      }
    );
  },

  // Update location (placeholder for future implementation)
  updateLocation: async (partnerId, latitude, longitude) => {
    // This endpoint doesn't exist yet, return success for now
    return {
      success: true,
      currentLatitude: latitude,
      currentLongitude: longitude,
    };
  },

  // Send heartbeat to keep partner alive
  heartbeat: async () => {
    return await apiRequest("/delivery-partner-dashboard/heartbeat", "POST");
  },
};

export default dashboardAPI;
