import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationService } from '../api/locationService';
import { geocodingService } from '../api/geocodingService';
import { productService } from '../api/productService';
import { toast } from 'react-toastify';
import WeatherWidget from './WeatherWidget';

const LandingPage = () => {
  const [pincode, setPincode] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
  const [showWeather, setShowWeather] = useState(false);
  const navigate = useNavigate();

  // Handle pincode input change - focusing only on pincode detection
  const handlePincodeChange = async (e) => {
    const value = e.target.value;
    setPincode(value);

    // Only proceed if we have at least 2 digits for the pincode
    if (value.length >= 2 && /^\d+$/.test(value)) {
      try {
        console.log('Fetching pincode suggestions for:', value);
        
        // Use the locationService for pincode suggestions
        const results = await locationService.getPincodeSuggestions(value);
        console.log('Received pincode suggestions:', results);
        
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching pincode suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
        toast.error('Unable to fetch pincode suggestions. Please try again.');
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setPincode(suggestion.pincode);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Handle location detection with improved accuracy
  const handleDetectLocation = async () => {
    setLocationLoading(true);
    console.log('Starting enhanced location detection process...');
    toast.info('Detecting your location...', {
      position: "top-right",
      autoClose: 2000,
    });
    
    try {
      console.log('Calling getCurrentLocationWithPincode for complete location data...');
      // Use the enhanced method that gets complete location data in one call
      const locationData = await geocodingService.getCurrentLocationWithPincode();
      console.log('Received complete location data:', locationData);
      
      // Save coordinates for weather widget
      setCoordinates(locationData.coordinates);
      setShowWeather(true);
      console.log('Coordinates saved for weather widget');
      
      // Set the pincode from the location data
      setPincode(locationData.pincode);
      console.log('Pincode set to:', locationData.pincode);
      
      // Show detailed success message with location information
      toast.success(
        <div>
          <div className="font-bold">Location detected!</div>
          <div>Pincode: {locationData.pincode}</div>
          <div className="text-xs">{locationData.city}, {locationData.state}</div>
        </div>, 
        {
          position: "top-right",
          autoClose: 4000,
        }
      );
      
      // Check if the location is serviceable
      if (locationData.pincode && geocodingService.isServiceableLocation(locationData.pincode)) {
        toast.info('Your area is serviceable! Click "Check Service Availability" to continue.', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.warn('We may not service this area yet. Please check availability.', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Location detection error:', error);
      console.error('Error details:', error.message, error.stack);
      
      // Show user-friendly error message based on error type
      let errorMessage = 'Unable to detect location. Please enter your pincode manually.';
      
      if (error.message.includes('denied')) {
        errorMessage = 'Location access denied. Please enable location permissions and try again.';
      } else if (error.message.includes('unavailable')) {
        errorMessage = 'Location services unavailable. Please check your GPS settings.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Location detection timed out. Please try again.';
      } else if (error.message.includes('pincode')) {
        errorMessage = 'Could not determine pincode for your location. Please enter manually.';
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
      
      // Try to get more information about the error
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      }
      
      // Try fallback method if available
      try {
        console.log('Attempting fallback location detection...');
        const position = await geocodingService.getCurrentLocation();
        setCoordinates(position);
        setShowWeather(true);
        toast.info('Got your approximate location, but couldn\'t determine pincode. Please enter it manually.', {
          position: "top-right",
          autoClose: 4000,
        });
      } catch (fallbackError) {
        console.error('Fallback location detection failed:', fallbackError);
      }
    } finally {
      setLocationLoading(false);
      console.log('Location detection process completed');
    }
  };

  // Handle service check
  const handleCheckService = async () => {
    if (!pincode) {
      toast.warning('Please enter a pincode');
      return;
    }

    if (!locationService.validatePincode(pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    toast.info('Checking service availability...', {
      position: "top-right",
      autoClose: 2000,
    });
    
    try {
      const serviceData = await productService.checkServiceAvailability(pincode);
      
      localStorage.setItem('pincode', pincode);
      
      if (serviceData.available) {
        toast.success(`🎉 Service available at ${pincode}!`, {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Show redirecting message
        setTimeout(() => {
          toast.info('Please login or signup to continue...', {
            position: "bottom-right",
            autoClose: 2000,
          });
        }, 1500);
        
        // Add delay before navigation to login page
        setTimeout(() => {
          console.log('Redirecting to login page');
          navigate('/login', { replace: true });
        }, 3000); // 3 seconds delay
      } else {
        toast.error(`😔 Sorry, service not available at ${pincode}`, {
          position: "bottom-right",
          autoClose: 3000,
        });
        
        // Add delay before navigation for better user experience
        setTimeout(() => {
          console.log('Redirecting to not-available page');
          navigate('/not-available', { replace: true });
        }, 3500); // 3.5 seconds delay
      }
    } catch (error) {
      console.error('Error checking service:', error);
      toast.error('Service check failed. Please try again later.', {
        position: "bottom-right",
        autoClose: 3000,
      });
      
      // Add delay before navigation for better user experience
      setTimeout(() => {
        console.log('Error occurred, redirecting to not-available page');
        navigate('/not-available', { replace: true });
      }, 3500); // 3.5 seconds delay
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Grocito</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Groceries delivered in
            <span className="text-primary-500"> minutes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get your daily essentials delivered to your doorstep in just 10 minutes
          </p>
        </div>

        {/* Weather Widget - Show when location is detected */}
        {showWeather && coordinates.latitude && coordinates.longitude && (
          <div className="mb-6 max-w-md mx-auto">
            <WeatherWidget 
              latitude={coordinates.latitude} 
              longitude={coordinates.longitude} 
            />
          </div>
        )}
        
        {/* Location Input Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Enter your location to get started
          </h2>
          
          <div className="space-y-6">
            {/* Pincode Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={handlePincodeChange}
                placeholder="e.g., 110001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                maxLength="6"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        Pincode: {suggestion.pincode}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detect Location Button */}
            <div className="flex items-center justify-center">
              <span className="text-gray-400 text-sm">or</span>
            </div>
            
            <button
              onClick={handleDetectLocation}
              disabled={locationLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              {locationLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-primary-500 font-medium">
                    Detect my location
                  </span>
                </>
              )}
            </button>

            {/* Check Service Button */}
            <button
              onClick={handleCheckService}
              disabled={loading || !pincode}
              className="w-full bg-primary-500 text-white py-4 rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Checking availability...</span>
                </div>
              ) : (
                'Check Service Availability'
              )}
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Get your groceries delivered in just 10 minutes</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fresh Quality</h3>
            <p className="text-gray-600">Hand-picked fresh products delivered to your door</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Best Prices</h3>
            <p className="text-gray-600">Competitive prices with regular offers and discounts</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;