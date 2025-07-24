import React, { useState } from 'react';
import { locationService } from '../../services/locationService';

const LocationTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const runLocationTest = async () => {
    setTesting(true);
    setTestResults([]);
    
    const results = [];
    
    try {
      // Test 1: Get current position
      results.push({ test: 'Getting coordinates...', status: 'running' });
      setTestResults([...results]);
      
      const position = await locationService.getCurrentPosition();
      results[0] = { 
        test: 'Get Coordinates', 
        status: 'success', 
        result: `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)} (±${Math.round(position.accuracy)}m)`
      };
      setTestResults([...results]);

      // Test 2: Get pincode from coordinates
      results.push({ test: 'Getting pincode...', status: 'running' });
      setTestResults([...results]);
      
      const locationData = await locationService.getPincodeFromCoordinates(
        position.latitude, 
        position.longitude
      );
      
      results[1] = { 
        test: 'Get Pincode', 
        status: 'success', 
        result: `${locationData.pincode} (${locationData.city}, ${locationData.state}) - Source: ${locationData.source}`
      };
      setTestResults([...results]);

      // Test 3: Check serviceability
      results.push({ test: 'Checking serviceability...', status: 'running' });
      setTestResults([...results]);
      
      const isServiceable = locationService.isServiceableLocation(locationData.pincode);
      results[2] = { 
        test: 'Serviceability Check', 
        status: isServiceable ? 'success' : 'warning', 
        result: isServiceable ? 'Location is serviceable' : 'Location may not be in service area'
      };
      setTestResults([...results]);

      // Test 4: Full location detection
      results.push({ test: 'Full location detection...', status: 'running' });
      setTestResults([...results]);
      
      const fullLocation = await locationService.getCurrentLocationWithPincode();
      results[3] = { 
        test: 'Full Location Detection', 
        status: 'success', 
        result: `Complete: ${fullLocation.address}`
      };
      setTestResults([...results]);

    } catch (error) {
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
    <div className="location-test p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Location Detection Test</h3>
        <button
          onClick={runLocationTest}
          disabled={testing}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            testing 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {testing ? 'Testing...' : 'Run Test'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-3">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
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

      <div className="mt-4 text-sm text-gray-500">
        <p><strong>Note:</strong> This test helps verify that location detection is working correctly.</p>
        <p>For South Nagpur, you should see pincodes like 440010, 440012, etc.</p>
      </div>
    </div>
  );
};

export default LocationTest;