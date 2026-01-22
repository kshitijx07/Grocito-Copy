import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import api from '../api/config';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Check if pincode and location data are available
  const storedPincode = localStorage.getItem('pincode');
  const storedAreaName = localStorage.getItem('areaName');
  const storedCity = localStorage.getItem('city');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted with:', { email: formData.email, password: '***' });
    setLoading(true);
    setError('');

    try {
      // Get the pincode that was entered on the landing page
      const userPincode = localStorage.getItem('pincode') || storedPincode;
      console.log('Using pincode from landing page:', userPincode);
      
      // If no pincode is found, redirect back to landing page
      if (!userPincode) {
        console.log('No pincode found, redirecting to landing page');
        toast.warning('Please select your delivery location first', {
          position: "bottom-right",
          autoClose: 3000,
        });
        navigate('/');
        setLoading(false);
        return;
      }
      
      // Call the backend API to authenticate the user
      console.log('Calling backend API for authentication');
      const response = await api.post('/users/login', { 
        email: formData.email, 
        password: formData.password 
      });
      
      console.log('Login API response:', response);
      
      // Get user data from response
      const userData = response.data;
      
      // Create a token (since backend doesn't provide one)
      const token = 'token-' + Date.now();
      localStorage.setItem('token', token);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update the pincode in the user data if it's not already set
      if (!userData.pincode && userPincode) {
        userData.pincode = userPincode;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      console.log('Login successful:', userData);
      
      // Show success toast
      toast.success('Login successful!', {
        position: "bottom-right",
        autoClose: 2000,
      });
      
      // Show redirecting toast
      toast.info('Going to products page...', {
        position: "bottom-right",
        autoClose: 1000,
      });
      
      // Navigate to products page
      console.log('Redirecting to products page...');
      window.location.href = '/products';
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
      
      // Show error toast
      toast.error('Login failed. Please try again.', {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Grocito</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Location Info */}
        {storedPincode ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="text-sm">
                <span>Delivering to: </span>
                <div className="font-semibold">
                  {storedAreaName && storedCity ? (
                    <>
                      <span>{storedAreaName}, {storedCity}</span>
                      <span className="text-green-600 ml-2">({storedPincode})</span>
                    </>
                  ) : (
                    <span>{storedPincode}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm">
                <p>No delivery location selected.</p>
                <button
                  onClick={() => navigate('/')}
                  className="text-yellow-600 hover:text-yellow-800 underline font-medium"
                >
                  Select your pincode first
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-green-500 hover:text-green-600 font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>



        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-green-500 hover:text-green-600 font-medium">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;