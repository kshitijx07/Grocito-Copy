import React from 'react';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';

const TestLogin = () => {
  const navigate = useNavigate();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  const testLogin = async () => {
    try {
      toast.info('Testing login...', { autoClose: 1000 });
      
      // Test with demo credentials
      const response = await authService.login('john@example.com', 'password123');
      
      toast.success('Test login successful!');
      
      // Set a test pincode
      localStorage.setItem('pincode', '110001');
      
      // Try immediate navigation
      console.log('Attempting navigation to products...');
      setTimeout(() => {
        try {
          navigate('/products', { replace: true });
        } catch (navError) {
          console.error('Navigation failed, trying window.location');
          window.location.href = '/products';
        }
      }, 1000);
    } catch (error) {
      console.error('Test login error:', error);
      toast.error('Test login failed: ' + error.message);
      
      // Check if backend is running
      if (error.message.includes('Network Error') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        toast.error('Backend server is not running! Start your Spring Boot app.', { autoClose: 5000 });
      }
    }
  };

  const checkAuth = () => {
    const isAuth = authService.isAuthenticated();
    const user = authService.getCurrentUser();
    const pincode = localStorage.getItem('pincode');
    
    console.log('Auth Status:', { isAuth, user, pincode });
    toast.info(`Auth: ${isAuth}, User: ${user?.email || 'None'}, Pincode: ${pincode || 'None'}`);
  };

  const clearAuth = () => {
    authService.logout();
    toast.info('Auth cleared');
  };

  const testBackend = async () => {
    try {
      toast.info('Testing backend...', { autoClose: 1000 });
      
      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (response.ok) {
        toast.success('Backend is running!');
      } else {
        toast.error(`Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      toast.error('Backend is NOT running! Start your Spring Boot app.', { autoClose: 5000 });
    }
  };

  const testNavigation = () => {
    toast.info('Testing navigation...', { autoClose: 1000 });
    
    // Set test data
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ email: 'test@test.com', id: 1 }));
    localStorage.setItem('pincode', '110001');
    
    setTimeout(() => {
      try {
        console.log('Attempting navigate to products...');
        navigate('/products', { replace: true });
      } catch (error) {
        console.error('React navigation failed:', error);
        console.log('Trying window.location...');
        window.location.href = '/products';
      }
    }, 500);
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 className="font-bold mb-2">Test Controls</h3>
      <div className="space-y-2">
        <button
          onClick={testLogin}
          className="block w-full bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Login
        </button>
        <button
          onClick={checkAuth}
          className="block w-full bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Check Auth
        </button>
        <button
          onClick={clearAuth}
          className="block w-full bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Clear Auth
        </button>
        <button
          onClick={testBackend}
          className="block w-full bg-purple-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Backend
        </button>
        <button
          onClick={testNavigation}
          className="block w-full bg-yellow-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Navigation
        </button>
        <button
          onClick={() => navigate('/test-redirect')}
          className="block w-full bg-orange-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Redirect Page
        </button>
      </div>
    </div>
  );
};

export default TestLogin;