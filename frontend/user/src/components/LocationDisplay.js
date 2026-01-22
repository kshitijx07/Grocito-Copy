import React, { useState, useEffect } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { locationService } from '../api/locationService';

const LocationDisplay = ({ pincode, showChangeOption = true, onLocationChange }) => {
  const [locationInfo, setLocationInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pincode) {
      fetchLocationInfo(pincode);
    }
  }, [pincode]);

  const fetchLocationInfo = async (pincodeToFetch) => {
    setLoading(true);
    try {
      // First try to get from localStorage
      const storedAreaName = localStorage.getItem('areaName');
      const storedCity = localStorage.getItem('city');
      const storedState = localStorage.getItem('state');
      
      if (storedAreaName && storedCity) {
        setLocationInfo({
          pincode: pincodeToFetch,
          areaName: storedAreaName,
          city: storedCity,
          state: storedState
        });
      } else {
        // Fetch from API
        const location = await locationService.getLocationByPincode(pincodeToFetch);
        if (location) {
          setLocationInfo(location);
          // Store in localStorage for future use
          localStorage.setItem('areaName', location.areaName);
          localStorage.setItem('city', location.city);
          localStorage.setItem('state', location.state);
        }
      }
    } catch (error) {
      console.error('Error fetching location info:', error);
      // Fallback to just showing pincode
      setLocationInfo({
        pincode: pincodeToFetch,
        areaName: null,
        city: null,
        state: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLocation = () => {
    if (onLocationChange) {
      onLocationChange();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-xs text-gray-600">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-500"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (!locationInfo) {
    return null;
  }

  return (
    <div className="text-xs">
      <div className="flex items-center space-x-1">
        <div className="font-medium text-green-800 truncate max-w-24 sm:max-w-none">
          {locationInfo.areaName ? (
            <span className="hidden sm:inline">
              {locationInfo.areaName}, {locationInfo.city}
            </span>
          ) : null}
          <span className="font-bold">{locationInfo.pincode}</span>
        </div>
        {showChangeOption && (
          <button
            onClick={handleChangeLocation}
            className="text-green-600 hover:text-green-800 font-medium underline ml-1 whitespace-nowrap focus-nature"
          >
            Change
          </button>
        )}
      </div>
    </div>
  );
};

export default LocationDisplay;