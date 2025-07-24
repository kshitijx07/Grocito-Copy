import React, { useState } from 'react';
import { geocodingService } from '../api/geocodingService';
import { toast } from 'react-toastify';

const LocationTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState(null);

  const runLocationTest = async () => {
    setTesting(true);
    setTestResults([]);
    
    const results = [];
    
    try {
      // Test 1: Get current position
      results.push({ test: 'Getting coordinates...', status: 'running' });
      setTestResults([...results]);
      
      const position = await geocodingService.getCurrentLocation();
      results[0] = { 
        test: 'Get Coordinates', 
        status: 'success', 
        result: `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)} (±${Math.round(position.accuracy || 0)}m)`
      };
      setTestResults([...results]);

      // Test 2: Get pincode from coordinates
      results.push({ test: 'Getting pincode from coordinates...', status: 'running' });
      setTestResults([...results]);
      
      const locationData = await geocodingService.getPincodeFromCoordinates(
        position.latitude, 
        position.longitude
      );
      
      results[1] = { 
        test: 'Get Pincode', 
        status: 'success', 
        result: `${locationData.pincode} (${locationData.city || 'Unknown City'}, ${locationData.state || 'Unknown State'}) - Source: ${locationData.source}`
      };
      setTestResults([...results]);
      
      // Save detected location
      setDetectedLocation(locationData);

      // Test 3: Check serviceability
      results.push({ test: 'Checking serviceability...', status: 'running' });
      setTestResults([...results]);
      
      const isServiceable = geocodingService.isServiceableLocation(locationData.pincode);
      results[2] = { 
        test: 'Serviceability Check', 
        status: isServiceable ? 'success' : 'warning', 
        result: isServiceable ? 'Location is serviceable' : 'Location may not be in service area'
      };
      setTestResults([...results]);

      // Test 4: Full location detection
      results.push({ test: 'Full location detection...', status: 'running' });
      setTestResults([...results]);
      
      const fullLocation = await geocodingService.getCurrentLocationWithPincode();
      results[3] = { 
        test: 'Full Location Detection', 
        status: 'success', 
        result: `Complete: ${fullLocation.address || 'Address not available'}`
      };
      setTestResults([...results]);

      toast.success('Location tests completed successfully!');

    } catch (error) {
      console.error('Location test error:', error);
      
      const lastIndex = results.length - 1;
      if (lastIndex >= 0) {
        results[lastIndex] = { 
          ...results[lastIndex], 
          status: 'error', 
          result: error.message 
        };
      } else {
        results.push({ 
          test: 'Location Test', 
          status: 'error', 
          result: error.message 
        });
      }
      setTestResults([...results]);
      
      toast.error(`Location test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <span className="text-green-500">✅</span>;
      case 'error':
        return <span className="text-red-500">❌</span>;
      case 'warning':
        return <span className="text-yellow-500">⚠️</span>;
      case 'running':
        return <span className="text-blue-500">🔄</span>;
      default:
        return <span className="text-gray-500">⏳</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Location Detection Test</h2>
        <button
          onClick={runLocationTest}
          disabled={testing}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            testing 
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {testing ? 'Testing...' : 'Run Test'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-4 mb-6">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(result.status)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{result.test}</div>
                {result.result && (
                  <div className={`text-sm mt-1 ${
                    result.status === 'error' ? 'text-red-600' : 
                    result.status === 'warning' ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`}>
                    {result.result}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {detectedLocation && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Detected Location Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Pincode:</strong> {detectedLocation.pincode}</p>
              <p><strong>City:</strong> {detectedLocation.city || 'Unknown'}</p>
              <p><strong>State:</strong> {detectedLocation.state || 'Unknown'}</p>
              <p><strong>Country:</strong> {detectedLocation.country || 'Unknown'}</p>
            </div>
            <div>
              <p><strong>Address:</strong> {detectedLocation.address || 'Not available'}</p>
              <p><strong>Source:</strong> {detectedLocation.source || 'Unknown'}</p>
              <p><strong>Accuracy:</strong> {detectedLocation.accuracy || 'Unknown'}</p>
              <p><strong>Serviceable:</strong> {geocodingService.isServiceableLocation(detectedLocation.pincode) ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        <p><strong>Note:</strong> This test helps verify that location detection is working correctly with accurate pincode fetching.</p>
        <p>For South Nagpur, you should see pincodes like 440010, 440012, etc.</p>
        <p>The test uses multiple geocoding services with automatic fallback for maximum accuracy.</p>
      </div>
    </div>
  );
};

export default LocationTest;