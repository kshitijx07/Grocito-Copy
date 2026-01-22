import api from '../api/config';

export const locationService = {
  // Get locations for management with pagination and filters
  getLocationsForManagement: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await api.get(`/locations/admin/manage?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching locations for management:', error);
      throw error;
    }
  },

  // Get location statistics
  getLocationStatistics: async () => {
    try {
      const response = await api.get('/locations/admin/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching location statistics:', error);
      throw error;
    }
  },

  // Add new location
  addLocation: async (locationData) => {
    try {
      const response = await api.post('/locations/admin/add', locationData);
      return response.data;
    } catch (error) {
      console.error('Error adding location:', error);
      throw error;
    }
  },

  // Update location
  updateLocation: async (id, locationData) => {
    try {
      const response = await api.put(`/locations/admin/update/${id}`, locationData);
      return response.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },

  // Delete location
  deleteLocation: async (id) => {
    try {
      const response = await api.delete(`/locations/admin/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  },

  // Update service availability for a specific pincode
  updateServiceAvailability: async (pincode, available) => {
    try {
      const response = await api.put(`/locations/admin/service-availability/${pincode}?available=${available}`);
      return response.data;
    } catch (error) {
      console.error('Error updating service availability:', error);
      throw error;
    }
  },

  // Bulk update service availability
  bulkUpdateServiceAvailability: async (pincodes, available) => {
    try {
      const response = await api.put('/locations/admin/bulk-service-availability', {
        pincodes,
        available
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating service availability:', error);
      throw error;
    }
  },

  // Bulk enable service for city
  bulkEnableServiceForCity: async (city) => {
    try {
      const response = await api.put(`/locations/admin/bulk-enable-city?city=${encodeURIComponent(city)}`);
      return response.data;
    } catch (error) {
      console.error('Error bulk enabling service for city:', error);
      throw error;
    }
  },

  // Bulk disable service for city
  bulkDisableServiceForCity: async (city) => {
    try {
      const response = await api.put(`/locations/admin/bulk-disable-city?city=${encodeURIComponent(city)}`);
      return response.data;
    } catch (error) {
      console.error('Error bulk disabling service for city:', error);
      throw error;
    }
  },

  // Get location suggestions (for public use)
  getLocationSuggestions: async (query) => {
    try {
      const response = await api.get(`/locations/suggestions?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      throw error;
    }
  },

  // Get location by pincode (for public use)
  getLocationByPincode: async (pincode) => {
    try {
      const response = await api.get(`/locations/pincode/${pincode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching location by pincode:', error);
      throw error;
    }
  },

  // Check service availability (for public use)
  checkServiceAvailability: async (pincode) => {
    try {
      const response = await api.get(`/locations/service-check/${pincode}`);
      return response.data;
    } catch (error) {
      console.error('Error checking service availability:', error);
      throw error;
    }
  },

  // Get all serviceable locations (for public use)
  getServiceableLocations: async () => {
    try {
      const response = await api.get('/locations/serviceable');
      return response.data;
    } catch (error) {
      console.error('Error fetching serviceable locations:', error);
      throw error;
    }
  },

  // Get all unique cities
  getAllCities: async () => {
    try {
      const response = await api.get('/locations/cities');
      return response.data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  },

  // Get all unique states
  getAllStates: async () => {
    try {
      const response = await api.get('/locations/states');
      return response.data;
    } catch (error) {
      console.error('Error fetching states:', error);
      throw error;
    }
  },

  // Search locations by area name
  searchByAreaName: async (areaName) => {
    try {
      const response = await api.get(`/locations/search/area?areaName=${encodeURIComponent(areaName)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching by area name:', error);
      throw error;
    }
  },

  // Get locations by city
  getLocationsByCity: async (city) => {
    try {
      const response = await api.get(`/locations/city/${encodeURIComponent(city)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching locations by city:', error);
      throw error;
    }
  },

  // Get locations by state
  getLocationsByState: async (state) => {
    try {
      const response = await api.get(`/locations/state/${encodeURIComponent(state)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching locations by state:', error);
      throw error;
    }
  },

  // Validate pincode format
  validatePincode: (pincode) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  },

  // Format location display text
  formatLocationDisplay: (location) => {
    if (!location) return '';
    return `${location.areaName}, ${location.city} - ${location.pincode}`;
  },

  // Get location status badge info
  getStatusBadgeInfo: (serviceAvailable) => {
    return serviceAvailable ? {
      text: 'Serviceable',
      className: 'bg-green-100 text-green-800',
      icon: 'check-circle'
    } : {
      text: 'Non-Serviceable',
      className: 'bg-red-100 text-red-800',
      icon: 'x-circle'
    };
  }
};