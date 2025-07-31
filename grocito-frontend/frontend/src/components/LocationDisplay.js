import React, { useState, useEffect } from 'react';
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
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
        <span>Loading location...</span>
      </div>
    );
  }

  if (!locationInfo) {
    return null;
  }

  return (
    <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div>
          <div className="text-sm font-medium text-gray-900">
            {locationInfo.areaName ? (
              <>
                {locationInfo.areaName}, {locationInfo.city}
                <span className="ml-2 text-xs text-gray-500">({locationInfo.pincode})</span>
              </>
            ) : (
              <span>Pincode: {locationInfo.pincode}</span>
            )}
          </div>
          {locationInfo.state && (
            <div className="text-xs text-gray-500">{locationInfo.state}</div>
          )}
        </div>
      </div>
      
      {showChangeOption && (
        <button
          onClick={handleChangeLocation}
          className="text-xs text-primary-600 hover:text-primary-800 font-medium"
        >
          Change
        </button>
      )}
    </div>
  );
};

export default LocationDisplay;