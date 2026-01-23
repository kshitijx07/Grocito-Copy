import { API_BASE_URL } from './config';

// API base with /api prefix for location endpoints
const API_URL = `${API_BASE_URL}/api`;

// Enhanced location service with real-time data
export const locationService = {
  // Get user's current location
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error('Unable to retrieve your location'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  },

  // Convert coordinates to pincode using real reverse geocoding
  coordinatesToPincode: async (latitude, longitude) => {
    try {
      // Use a real reverse geocoding service (like Google Maps API or OpenStreetMap)
      // For now, we'll use a simple approach to find the nearest location in our database
      const response = await fetch(`${API_URL}/locations/serviceable`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const locations = await response.json();
      
      // Simple distance calculation to find nearest location
      // In production, use proper reverse geocoding service
      let nearestLocation = null;
      let minDistance = Infinity;
      
      locations.forEach(location => {
        // Approximate coordinates for major Indian cities (you should have actual coordinates in DB)
        const cityCoords = {
          'New Delhi': { lat: 28.6139, lng: 77.2090 },
          'Mumbai': { lat: 19.0760, lng: 72.8777 },
          'Bangalore': { lat: 12.9716, lng: 77.5946 },
          'Chennai': { lat: 13.0827, lng: 80.2707 },
          'Kolkata': { lat: 22.5726, lng: 88.3639 }
        };
        
        const cityCoord = cityCoords[location.city];
        if (cityCoord) {
          const distance = Math.sqrt(
            Math.pow(latitude - cityCoord.lat, 2) + 
            Math.pow(longitude - cityCoord.lng, 2)
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            nearestLocation = location;
          }
        }
      });
      
      if (nearestLocation) {
        return {
          pincode: nearestLocation.pincode,
          areaName: nearestLocation.areaName,
          city: nearestLocation.city,
          state: nearestLocation.state
        };
      } else {
        throw new Error('Unable to determine pincode for your location');
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      throw new Error('Unable to determine pincode for your location');
    }
  },

  // Get location suggestions (area name or pincode) from real-time API
  getLocationSuggestions: async (query) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const response = await fetch(`${API_URL}/locations/suggestions?query=${encodeURIComponent(query.trim())}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle the new response format
      if (data.suggestions && Array.isArray(data.suggestions)) {
        return data.suggestions.map(location => ({
          pincode: location.pincode,
          areaName: location.areaName,
          city: location.city,
          state: location.state,
          district: location.district,
          displayText: `${location.areaName}, ${location.city} - ${location.pincode}`,
          serviceAvailable: location.serviceAvailable
        }));
      }
      
      // Fallback for old format
      return Array.isArray(data) ? data.map(location => ({
        pincode: location.pincode,
        areaName: location.areaName,
        city: location.city,
        state: location.state,
        district: location.district,
        displayText: `${location.areaName}, ${location.city} - ${location.pincode}`,
        serviceAvailable: location.serviceAvailable
      })) : [];
    } catch (error) {
      throw error;
    }
  },

  // Get autocomplete data for enhanced UI
  getAutocompleteData: async (query) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const response = await fetch(`${API_URL}/locations/autocomplete?query=${encodeURIComponent(query.trim())}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Backward compatibility method
  getPincodeSuggestions: async (query) => {
    try {
      const suggestions = await locationService.getLocationSuggestions(query);
      // Return in the old format for backward compatibility
      return suggestions.map(suggestion => ({
        pincode: suggestion.pincode,
        areaName: suggestion.areaName,
        displayText: suggestion.displayText
      }));
    } catch (error) {
      console.error('Error fetching pincode suggestions:', error);
      return [];
    }
  },

  // Get location by pincode
  getLocationByPincode: async (pincode) => {
    try {
      const response = await fetch(`${API_URL}/locations/pincode/${pincode}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching location by pincode:', error);
      throw error;
    }
  },

  // Check service availability
  checkServiceAvailability: async (pincode) => {
    try {
      const response = await fetch(`${API_URL}/locations/service-check/${pincode}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking service availability:', error);
      throw error;
    }
  },

  // Search by area name
  searchByAreaName: async (areaName) => {
    try {
      const response = await fetch(`${API_URL}/locations/search/area?areaName=${encodeURIComponent(areaName)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching by area name:', error);
      throw error;
    }
  },

  // Get all serviceable locations
  getServiceableLocations: async () => {
    try {
      const response = await fetch(`${API_URL}/locations/serviceable`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching serviceable locations:', error);
      throw error;
    }
  },

  // Validate pincode format
  validatePincode: (pincode) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  }
};