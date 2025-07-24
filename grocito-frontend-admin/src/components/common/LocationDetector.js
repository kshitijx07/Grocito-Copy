import React, { useState } from 'react';
import { locationService } from '../../services/locationService';
import { toast } from 'react-toastify';

const LocationDetector = ({ onLocationDetected, onError, className = '' }) => {
  const [detecting, setDetecting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const detectLocation = async () => {
    setDetecting(true);
    
    try {
      toast.info('Detecting your location...', { autoClose: 2000 });
      
      const locationData = await locationService.getCurrentLocationWithPincode();
      
      setCurrentLocation(locationData);
      
      // Check if location is serviceable
      const isServiceable = locationService.isServiceableLocation(locationData.pincode);
      
      toast.success(
        `Location detected: ${locationData.city}, ${locationData.state} - ${locationData.pincode}`,
        { autoClose: 4000 }
      );

      if (!isServiceable) {
        toast.warn(
          `Pincode ${locationData.pincode} may not be in our service area. Please verify.`,
          { autoClose: 6000 }
        );
      }

      // Call the callback with location data
      if (onLocationDetected) {
        onLocationDetected(locationData);
      }

    } catch (error) {
      console.error('Location detection failed:', error);
      
      let errorMessage = 'Failed to detect location';
      
      if (error.message.includes('denied')) {
        errorMessage = 'Location access denied. Please enable location permissions and try again.';
      } else if (error.message.includes('unavailable')) {
        errorMessage = 'Location services unavailable. Please check your GPS settings.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Location detection timed out. Please try again.';
      } else if (error.message.includes('pincode')) {
        errorMessage = 'Could not determine pincode for your location. Please enter manually.';
      }

      toast.error(errorMessage, { autoClose: 6000 });
      
      if (onError) {
        onError(error);
      }
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className={`location-detector ${className}`}>
      <div className="flex items-center space-x-3">
        <button
          onClick={detectLocation}
          disabled={detecting}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${detecting 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md'
            }
          `}
        >
          {detecting ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Detecting...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Detect My Location</span>
            </>
          )}
        </button>

        {currentLocation && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>
              {currentLocation.city}, {currentLocation.state} - {currentLocation.pincode}
            </span>
          </div>
        )}
      </div>

      {currentLocation && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">
            <div className="font-medium">Location Detected Successfully:</div>
            <div className="mt-1">
              <div><strong>Address:</strong> {currentLocation.address}</div>
              <div><strong>Pincode:</strong> {currentLocation.pincode}</div>
              <div><strong>City:</strong> {currentLocation.city}</div>
              <div><strong>State:</strong> {currentLocation.state}</div>
              <div className="text-xs text-green-600 mt-1">
                Source: {currentLocation.source} • Accuracy: ~{Math.round(currentLocation.coordinates?.accuracy || 0)}m
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDetector;