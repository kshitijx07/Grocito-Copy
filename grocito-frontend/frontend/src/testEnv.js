// Simple script to test environment variables
console.log('Testing environment variables:');
console.log('REACT_APP_WEATHER_API_KEY:', process.env.REACT_APP_WEATHER_API_KEY);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Check if the .env file is being loaded
if (process.env.REACT_APP_WEATHER_API_KEY) {
  console.log('API key is loaded successfully!');
} else {
  console.log('API key is NOT loaded. Check your .env file and make sure it\'s in the correct location.');
}