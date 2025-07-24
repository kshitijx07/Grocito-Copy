/**
 * Location Service for detecting user location and fetching pincode
 * Uses browser geolocation API and reverse geocoding services
 */

class LocationService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || null;
    this.fallbackApiKey = process.env.REACT_APP_OPENCAGE_API_KEY || null;
  }

  /**
   * Get current location coordinates using browser geolocation with high accuracy
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout for better accuracy
        maximumAge: 60000 // Reduced cache time for fresher location
      };

      // Try to get high accuracy position first
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location detected:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toISOString()
          });
          
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          });
        },
        (error) => {
          console.error('High accuracy location failed, trying standard accuracy:', error);
          
          // Fallback to standard accuracy
          const fallbackOptions = {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
          };
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Fallback location detected:', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
              });
              
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                fallback: true
              });
            },
            (fallbackError) => {
              let errorMessage = 'Location access denied';
              switch (fallbackError.code) {
                case fallbackError.PERMISSION_DENIED:
                  errorMessage = 'Location access denied by user';
                  break;
                case fallbackError.POSITION_UNAVAILABLE:
                  errorMessage = 'Location information unavailable';
                  break;
                case fallbackError.TIMEOUT:
                  errorMessage = 'Location request timed out';
                  break;
                default:
                  errorMessage = 'Unknown location error';
                  break;
              }
              reject(new Error(errorMessage));
            },
            fallbackOptions
          );
        },
        options
      );
    });
  }

  /**
   * Get pincode from coordinates using Google Maps Geocoding API with enhanced accuracy
   */
  async getPincodeFromCoordinates(latitude, longitude) {
    console.log(`Getting pincode for coordinates: ${latitude}, ${longitude}`);
    
    if (!this.apiKey) {
      console.warn('Google Maps API key not found, trying fallback service');
      return this.getPincodeFromCoordinatesFallback(latitude, longitude);
    }

    try {
      // First try with postal_code result type for most accurate pincode
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}&result_type=postal_code&location_type=ROOFTOP`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Google Maps API response:', data);

      if (data.status === 'OK' && data.results.length > 0) {
        // Find the most accurate postal code result
        for (const result of data.results) {
          for (const component of result.address_components) {
            if (component.types.includes('postal_code')) {
              const locationData = {
                pincode: component.long_name,
                address: result.formatted_address,
                city: this.extractCity(result.address_components),
                state: this.extractState(result.address_components),
                country: this.extractCountry(result.address_components),
                source: 'google',
                accuracy: 'high'
              };
              console.log('Google Maps result:', locationData);
              return locationData;
            }
          }
        }
      }

      // If postal_code specific search fails, try general geocoding
      const generalResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}`
      );

      if (generalResponse.ok) {
        const generalData = await generalResponse.json();
        if (generalData.status === 'OK' && generalData.results.length > 0) {
          for (const result of generalData.results) {
            for (const component of result.address_components) {
              if (component.types.includes('postal_code')) {
                const locationData = {
                  pincode: component.long_name,
                  address: result.formatted_address,
                  city: this.extractCity(result.address_components),
                  state: this.extractState(result.address_components),
                  country: this.extractCountry(result.address_components),
                  source: 'google',
                  accuracy: 'medium'
                };
                console.log('Google Maps general result:', locationData);
                return locationData;
              }
            }
          }
        }
      }

      // If Google fails, try fallback
      console.log('Google Maps failed, trying fallback services');
      return this.getPincodeFromCoordinatesFallback(latitude, longitude);
    } catch (error) {
      console.error('Google Geocoding API error:', error);
      return this.getPincodeFromCoordinatesFallback(latitude, longitude);
    }
  }

  /**
   * Fallback method using multiple geocoding services for better accuracy
   */
  async getPincodeFromCoordinatesFallback(latitude, longitude) {
    console.log('Using fallback geocoding services');
    
    try {
      // Try with OpenCage API if key is available (most accurate fallback)
      if (this.fallbackApiKey) {
        console.log('Trying OpenCage API...');
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${this.fallbackApiKey}&countrycode=in&limit=1&no_annotations=1`
        );

        if (response.ok) {
          const data = await response.json();
          console.log('OpenCage API response:', data);
          
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const components = result.components;
            
            const locationData = {
              pincode: components.postcode || components.postal_code,
              address: result.formatted,
              city: components.city || components.town || components.village || components.suburb,
              state: components.state,
              country: components.country,
              source: 'opencage',
              accuracy: 'medium',
              confidence: result.confidence || 0
            };
            
            console.log('OpenCage result:', locationData);
            if (locationData.pincode) {
              return locationData;
            }
          }
        }
      }

      // Try Nominatim with higher zoom for better accuracy
      console.log('Trying Nominatim API...');
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&countrycodes=in&accept-language=en`
      );

      if (nominatimResponse.ok) {
        const nominatimData = await nominatimResponse.json();
        console.log('Nominatim API response:', nominatimData);
        
        if (nominatimData && nominatimData.address) {
          const locationData = {
            pincode: nominatimData.address.postcode,
            address: nominatimData.display_name,
            city: nominatimData.address.city || nominatimData.address.town || 
                  nominatimData.address.village || nominatimData.address.suburb,
            state: nominatimData.address.state,
            country: nominatimData.address.country,
            source: 'nominatim',
            accuracy: 'low'
          };
          
          console.log('Nominatim result:', locationData);
          if (locationData.pincode) {
            return locationData;
          }
        }
      }

      // Try alternative Nominatim with different zoom levels
      for (const zoom of [16, 14, 12]) {
        console.log(`Trying Nominatim with zoom ${zoom}...`);
        try {
          const altResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=${zoom}&addressdetails=1&countrycodes=in`
          );

          if (altResponse.ok) {
            const altData = await altResponse.json();
            if (altData && altData.address && altData.address.postcode) {
              const locationData = {
                pincode: altData.address.postcode,
                address: altData.display_name,
                city: altData.address.city || altData.address.town || altData.address.village,
                state: altData.address.state,
                country: altData.address.country,
                source: `nominatim-zoom${zoom}`,
                accuracy: 'low'
              };
              
              console.log(`Nominatim zoom ${zoom} result:`, locationData);
              return locationData;
            }
          }
        } catch (zoomError) {
          console.log(`Zoom ${zoom} failed:`, zoomError.message);
          continue;
        }
      }

      throw new Error('No address data found from any geocoding service');
    } catch (error) {
      console.error('All fallback geocoding services failed:', error);
      throw new Error('Unable to determine pincode from location. Please try again or enter manually.');
    }
  }

  /**
   * Extract city from Google Maps address components
   */
  extractCity(components) {
    const cityTypes = ['locality', 'administrative_area_level_2', 'sublocality'];
    for (const component of components) {
      if (component.types.some(type => cityTypes.includes(type))) {
        return component.long_name;
      }
    }
    return null;
  }

  /**
   * Extract state from Google Maps address components
   */
  extractState(components) {
    for (const component of components) {
      if (component.types.includes('administrative_area_level_1')) {
        return component.long_name;
      }
    }
    return null;
  }

  /**
   * Extract country from Google Maps address components
   */
  extractCountry(components) {
    for (const component of components) {
      if (component.types.includes('country')) {
        return component.long_name;
      }
    }
    return null;
  }

  /**
   * Get current location with pincode - main method to use
   */
  async getCurrentLocationWithPincode() {
    try {
      // Step 1: Get coordinates
      const position = await this.getCurrentPosition();
      
      // Step 2: Get pincode from coordinates
      const locationData = await this.getPincodeFromCoordinates(
        position.latitude, 
        position.longitude
      );

      if (!locationData.pincode) {
        throw new Error('Could not determine pincode for your location');
      }

      return {
        ...locationData,
        coordinates: {
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Location detection error:', error);
      throw error;
    }
  }

  /**
   * Validate if a pincode is serviceable (you can customize this based on your service areas)
   */
  isServiceableLocation(pincode) {
    // Define your serviceable pincodes here
    const serviceablePincodes = [
      // Delhi NCR
      '110001', '110002', '110003', '110004', '110005', '110006', '110007', '110008',
      '110009', '110010', '110011', '110012', '110013', '110014', '110015', '110016',
      
      // Mumbai
      '400001', '400002', '400003', '400004', '400005', '400006', '400007', '400008',
      '400009', '400010', '400011', '400012', '400013', '400014', '400015', '400016',
      
      // Pune
      '411001', '411002', '411003', '411004', '411005', '411006', '411007', '411008',
      '412105', '412106', '412107', '412108', '412109', '412110',
      
      // Nagpur
      '440001', '440002', '440003', '440004', '440005', '440006', '440007', '440008',
      '440009', '440010', '440011', '440012', '440013', '440014', '440015', '440016',
      '441904', '441905', '441906', '441907', '441908'
    ];

    return serviceablePincodes.includes(pincode);
  }

  /**
   * Get location suggestions based on partial pincode or city name
   */
  async getLocationSuggestions(query) {
    if (!query || query.length < 3) return [];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`
      );

      if (!response.ok) return [];

      const data = await response.json();
      
      return data.map(item => ({
        display_name: item.display_name,
        pincode: item.address?.postcode,
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      })).filter(item => item.pincode); // Only return items with pincode
    } catch (error) {
      console.error('Location suggestions error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;