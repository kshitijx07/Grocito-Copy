// Mock location service for demonstration
// This is kept for backward compatibility
// For real geocoding, use geocodingService.js which integrates with OpenWeatherMap API

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

  // Convert coordinates to pincode (mock implementation)
  coordinatesToPincode: async (latitude, longitude) => {
    // Mock implementation - in real app, use reverse geocoding
    const mockPincodes = ['110001', '400001', '560001'];
    const randomPincode = mockPincodes[Math.floor(Math.random() * mockPincodes.length)];
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          pincode: randomPincode
        });
      }, 1000);
    });
  },

  // Get pincode suggestions - focusing only on pincode
  getPincodeSuggestions: async (query) => {
    const allPincodes = [
      { pincode: '110001' },
      { pincode: '110002' },
      { pincode: '110003' },
      { pincode: '400001' },
      { pincode: '400002' },
      { pincode: '400003' },
      { pincode: '560001' },
      { pincode: '560002' },
      { pincode: '560003' }
    ];

    return new Promise((resolve) => {
      setTimeout(() => {
        // Filter only by pincode
        const filtered = allPincodes.filter(item => 
          item.pincode.includes(query)
        );
        resolve(filtered.slice(0, 5));
      }, 300);
    });
  },

  // Validate pincode format
  validatePincode: (pincode) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  }
};