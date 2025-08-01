import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationService } from '../api/locationService';
import { geocodingService } from '../api/geocodingService';
import { productService } from '../api/productService';
import { toast } from 'react-toastify';
import WeatherWidget from './WeatherWidget';

const LandingPage = () => {
  const [pincode, setPincode] = useState('');
  const [areaName, setAreaName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
  const [showWeather, setShowWeather] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();

  // Handle input change with debounced search
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setAreaName(value);
    
    // Clear selected location when typing
    setSelectedLocation(null);
    setPincode('');

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Hide suggestions if input is too short
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce search
    const timeoutId = setTimeout(async () => {
      try {
        console.log('Fetching autocomplete data for:', value);
        console.log('API URL will be: http://localhost:8080/api/locations/autocomplete?query=' + encodeURIComponent(value));
        
        // Use the new autocomplete endpoint for better structured data
        const results = await locationService.getAutocompleteData(value);
        console.log('Received autocomplete data:', results);
        console.log('Number of results:', results ? results.length : 0);
        
        if (results && Array.isArray(results) && results.length > 0) {
          setSuggestions(results);
          setShowSuggestions(true);
          console.log('Showing suggestions dropdown');
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
          console.log('No results found, hiding suggestions');
        }
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
        console.error('Error details:', error.message);
        setSuggestions([]);
        setShowSuggestions(false);
        toast.error('Unable to fetch location suggestions. Please try again.');
      }
    }, 300); // 300ms debounce

    setSearchTimeout(timeoutId);
    setSelectedIndex(-1); // Reset keyboard selection
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion selection with automatic pincode assignment
  const handleSuggestionSelect = (suggestion) => {
    // Set the area name in the input field
    setAreaName(suggestion.value);
    
    // Automatically assign the pincode and location data
    setPincode(suggestion.pincode);
    setSelectedLocation(suggestion);
    
    // Hide suggestions
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Show success message with complete location info
    toast.success(
      <div>
        <div className="font-bold">📍 Location Selected!</div>
        <div>{suggestion.value}, {suggestion.city}</div>
        <div className="text-sm">Pincode: {suggestion.pincode}</div>
        <div className="text-xs">
          Service: {suggestion.serviceAvailable ? '✅ Available' : '❌ Not Available'}
        </div>
      </div>, 
      {
        position: "top-right",
        autoClose: 4000,
      }
    );
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

  // Handle service check with enhanced validation
  const handleCheckService = async () => {
    // Check if we have a selected location or valid pincode
    let pincodeToCheck = pincode;
    let locationData = selectedLocation;

    if (!pincodeToCheck && !selectedLocation) {
      toast.warning('Please select an area from suggestions or enter a pincode');
      return;
    }

    // If no location selected but we have input, try to match from suggestions
    if (!selectedLocation && areaName && !pincodeToCheck) {
      toast.error('Please select a location from the dropdown suggestions');
      return;
    }

    // If user entered a pincode directly, validate it
    if (!selectedLocation && pincodeToCheck) {
      if (!locationService.validatePincode(pincodeToCheck)) {
        toast.error('Please enter a valid 6-digit pincode');
        return;
      }
    }

    setLoading(true);
    toast.info('Checking service availability...', {
      position: "top-right",
      autoClose: 2000,
    });
    
    try {
      const serviceData = await productService.checkServiceAvailability(pincodeToCheck);
      
      // Store complete location information
      localStorage.setItem('pincode', pincodeToCheck);
      
      if (selectedLocation) {
        // Store data from selected location
        localStorage.setItem('areaName', selectedLocation.value);
        localStorage.setItem('city', selectedLocation.city);
        localStorage.setItem('state', selectedLocation.state);
        localStorage.setItem('district', selectedLocation.district || '');
      } else if (serviceData.areaName) {
        // Store data from service response
        localStorage.setItem('areaName', serviceData.areaName);
        localStorage.setItem('city', serviceData.city);
        localStorage.setItem('state', serviceData.state);
      }
      
      if (serviceData.available) {
        const locationText = serviceData.areaName ? 
          `${serviceData.areaName}, ${serviceData.city} (${pincodeToCheck})` : 
          pincodeToCheck;
          
        toast.success(
          <div>
            <div className="font-bold">🎉 Service Available!</div>
            <div className="text-sm">{locationText}</div>
            {serviceData.productCount && (
              <div className="text-xs">{serviceData.productCount} products available</div>
            )}
          </div>, 
          {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
        
        // Show redirecting message
        setTimeout(() => {
          toast.info('Please login or signup to continue...', {
            position: "bottom-right",
            autoClose: 2000,
          });
        }, 2000);
        
        // Add delay before navigation to login page
        setTimeout(() => {
          console.log('Redirecting to login page');
          navigate('/login', { replace: true });
        }, 4000); // 4 seconds delay
      } else {
        const locationText = serviceData.areaName ? 
          `${serviceData.areaName}, ${serviceData.city} (${pincodeToCheck})` : 
          pincodeToCheck;
          
        toast.error(
          <div>
            <div className="font-bold">😔 Service Not Available</div>
            <div className="text-sm">{locationText}</div>
            <div className="text-xs">We'll notify you when we expand to your area!</div>
          </div>, 
          {
            position: "bottom-right",
            autoClose: 4000,
          }
        );
        
        // Add delay before navigation for better user experience
        setTimeout(() => {
          console.log('Redirecting to not-available page');
          navigate('/not-available', { replace: true });
        }, 4500); // 4.5 seconds delay
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
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Grocito</span>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/login');
                }}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/signup');
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-medium"
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
            <span className="text-green-500"> minutes</span>
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
            {/* Area Name Input with Autocomplete */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Area Name or Pincode
              </label>
              <input
                type="text"
                value={areaName}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type area name (e.g., Dadar, Connaught Place) or pincode"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                autoComplete="off"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id || index}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className={`w-full px-4 py-3 text-left border-b border-gray-100 last:border-b-0 transition-colors ${
                        index === selectedIndex 
                          ? 'bg-blue-100 border-blue-200' 
                          : 'hover:bg-blue-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {suggestion.value}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {suggestion.city}, {suggestion.state} - {suggestion.pincode}
                        {suggestion.serviceAvailable ? (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            ✅ Service Available
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            ❌ Not Available
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Location Display */}
            {selectedLocation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-green-800">Selected Location</h4>
                    <div className="mt-1 text-sm text-green-700">
                      <div className="font-medium">{selectedLocation.value}</div>
                      <div>{selectedLocation.city}, {selectedLocation.state}</div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span>Pincode: <strong>{selectedLocation.pincode}</strong></span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          selectedLocation.serviceAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedLocation.serviceAvailable ? '✅ Service Available' : '❌ Service Not Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Detect Location Button */}
            <div className="flex items-center justify-center">
              <span className="text-gray-400 text-sm">or</span>
            </div>
            
            <button
              onClick={handleDetectLocation}
              disabled={locationLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              {locationLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-green-500 font-medium">
                    Detect my location
                  </span>
                </>
              )}
            </button>

            {/* Check Service Button */}
            <button
              onClick={handleCheckService}
              disabled={loading || (!selectedLocation && !pincode)}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                selectedLocation && selectedLocation.serviceAvailable
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : selectedLocation && !selectedLocation.serviceAvailable
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Checking availability...</span>
                </div>
              ) : selectedLocation ? (
                selectedLocation.serviceAvailable 
                  ? `Continue with ${selectedLocation.value}` 
                  : `Check ${selectedLocation.value} (Service may not be available)`
              ) : (
                'Select a location to continue'
              )}
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="lg:col-span-1">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">G</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    Grocito
                  </span>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Your trusted partner for fresh groceries delivered in minutes. 
                  Quality products, lightning-fast delivery, unbeatable prices.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-xl flex items-center justify-center transition-colors duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-xl flex items-center justify-center transition-colors duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-xl flex items-center justify-center transition-colors duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-white">Quick Links</h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/login');
                      }}
                      className="text-gray-300 hover:text-green-400 transition-colors duration-200 flex items-center space-x-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>Shop Now</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('FAQs button clicked');
                        navigate('/faqs');
                      }}
                      className="text-gray-300 hover:text-green-400 transition-colors duration-200 flex items-center space-x-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>FAQs</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/about');
                      }}
                      className="text-gray-300 hover:text-green-400 transition-colors duration-200 flex items-center space-x-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>About Us</span>
                    </button>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-200 flex items-center space-x-2 group">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>Careers</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-200 flex items-center space-x-2 group">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>Blog</span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-white">Support</h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/contact');
                      }}
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center space-x-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>Contact Us</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/help');
                      }}
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center space-x-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>Help Center</span>
                    </button>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center space-x-2 group">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>Track Order</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center space-x-2 group">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>Returns</span>
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/faqs');
                      }}
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center space-x-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>FAQs</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Business */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-white">Business</h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/become-seller');
                      }}
                      className="text-gray-300 hover:text-purple-400 transition-colors duration-200 flex items-center space-x-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>Become a Seller</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/delivery-partner');
                      }}
                      className="text-gray-300 hover:text-purple-400 transition-colors duration-200 flex items-center space-x-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>Delivery Partner</span>
                    </button>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 flex items-center space-x-2 group">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>Partner with Us</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 flex items-center space-x-2 group">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>Advertise</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 flex items-center space-x-2 group">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <span>API Access</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="border-t border-gray-700 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Stay Updated</h3>
                <p className="text-gray-300">
                  Get the latest updates on new products, offers, and delivery areas.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-700 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
                <p className="text-gray-400 text-sm">
                  © 2025 Grocito. All rights reserved.
                </p>
                <div className="flex space-x-6">
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Terms of Service
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Cookie Policy
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">Available on:</span>
                <div className="flex space-x-3">
                  <a href="#" className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                  </a>
                  <a href="#" className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;