// Debug script for geocodingService
import { geocodingService } from './api/geocodingService';

// This function will be called when imported
const debugGeocoding = async () => {
  console.log('======= DEBUGGING GEOCODING SERVICE =======');
  console.log('Environment variables:');
  console.log('REACT_APP_WEATHER_API_KEY:', process.env.REACT_APP_WEATHER_API_KEY ? 'Present' : 'Missing');
  
  try {
    // Test getCurrentLocation
    console.log('\nTesting getCurrentLocation...');
    const coordinates = await geocodingService.getCurrentLocation();
    console.log('Coordinates:', coordinates);
    
    // Test getAddressFromCoordinates
    console.log('\nTesting getAddressFromCoordinates...');
    const address = await geocodingService.getAddressFromCoordinates(
      coordinates.latitude,
      coordinates.longitude
    );
    console.log('Address:', address);
    
    // Test searchLocations
    console.log('\nTesting searchLocations...');
    const locations = await geocodingService.searchLocations('Delhi');
    console.log('Locations:', locations);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error during geocoding tests:', error);
  }
  console.log('======= END DEBUGGING =======');
};

// Run the debug function
debugGeocoding();

export default debugGeocoding;