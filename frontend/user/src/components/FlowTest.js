import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../api/config';

const FlowTest = () => {
  const [testResults, setTestResults] = useState({});
  const navigate = useNavigate();

  if (process.env.NODE_ENV !== 'development') return null;

  const runFlowTest = async () => {
    const results = {};
    
    // Test 1: Check localStorage
    results.localStorage = {
      token: !!localStorage.getItem('token'),
      user: !!localStorage.getItem('user'),
      pincode: !!localStorage.getItem('pincode')
    };

    // Test 2: Check auth service
    try {
      results.authService = {
        isAuthenticated: authService.isAuthenticated(),
        currentUser: !!authService.getCurrentUser(),
        token: !!authService.getToken()
      };
    } catch (error) {
      results.authService = { error: error.message };
    }

    // Test 3: Check API connectivity
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, { 
        method: 'GET',
        timeout: 5000 
      });
      results.apiConnectivity = {
        status: response.status,
        ok: response.ok
      };
    } catch (error) {
      results.apiConnectivity = { error: error.message };
    }

    // Test 4: Check routes
    results.currentRoute = window.location.pathname;
    
    setTestResults(results);
    toast.info('Flow test completed - check results below');
  };

  const clearAllData = () => {
    localStorage.clear();
    toast.success('All localStorage cleared');
    setTestResults({});
  };

  const setTestData = () => {
    localStorage.setItem('token', 'test-token-123');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'test@example.com',
      fullName: 'Test User'
    }));
    localStorage.setItem('pincode', '110001');
    toast.success('Test data set in localStorage');
  };

  return (
    <div className="fixed top-4 right-4 bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-blue-600 mb-3">🔧 Flow Test Panel</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={runFlowTest}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Run Flow Test
        </button>
        
        <button
          onClick={setTestData}
          className="w-full bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Set Test Data
        </button>
        
        <button
          onClick={clearAllData}
          className="w-full bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Clear All Data
        </button>
        
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
          >
            Home
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/products')}
            className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
          >
            Products
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
          >
            Cart
          </button>
        </div>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="bg-gray-50 p-2 rounded text-xs">
          <h4 className="font-semibold mb-2">Test Results:</h4>
          <pre className="overflow-auto max-h-40">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FlowTest;