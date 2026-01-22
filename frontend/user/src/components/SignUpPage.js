import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import api from '../api/config';
import { toast } from 'react-toastify';

const SignUpPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    pincode: '',
    contactNumber: ''
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

  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      const errorMsg = 'Full name is required';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    
    if (!formData.email.trim()) {
      const errorMsg = 'Email is required';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }
    
    if (formData.password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters long';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (formData.pincode && !/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      const errorMsg = 'Please enter a valid 6-digit pincode';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    if (formData.contactNumber && !/^[6-9]\d{9}$/.test(formData.contactNumber)) {
      const errorMsg = 'Please enter a valid 10-digit mobile number';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      setError('');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        pincode: formData.pincode || localStorage.getItem('pincode') || '',
        contactNumber: formData.contactNumber
      };

      console.log('Registering user:', userData);
      
      // Call the backend API directly to register the user
      const registerResponse = await api.post('/users/register', userData);
      console.log('Registration response:', registerResponse);
      
      // Show success toast
      toast.success('Account created successfully!', {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Auto login after successful registration
      setTimeout(() => {
        toast.info('Logging you in...', {
          position: "bottom-right",
          autoClose: 1500,
        });
      }, 1000);
      
      console.log('Auto-logging in user');
      
      // Call the backend API directly to login the user
      const loginResponse = await api.post('/users/login', {
        email: formData.email,
        password: formData.password
      });
      
      console.log('Login response:', loginResponse);
      
      // Get user data from response
      const loggedInUserData = loginResponse.data;
      
      // Create a token (since backend doesn't provide one)
      const token = 'token-' + Date.now();
      localStorage.setItem('token', token);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(loggedInUserData));
      
      // Keep the landing page pincode - DON'T override with user profile pincode
      const landingPagePincode = localStorage.getItem('pincode');
      if (landingPagePincode) {
        console.log('Keeping landing page pincode:', landingPagePincode);
        // Don't override - keep the pincode from landing page
      } else if (userData.pincode) {
        // Only set user's pincode if no landing page pincode exists
        localStorage.setItem('pincode', userData.pincode);
        console.log('No landing page pincode, using user profile pincode:', userData.pincode);
      }
      console.log('Final pincode for delivery:', localStorage.getItem('pincode'));
      
      setTimeout(() => {
        toast.success('Welcome to Grocito!', {
          position: "bottom-right",
          autoClose: 2000,
        });
      }, 2000);
      
      // Add delay before navigation for better user experience
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 3000); // 3 seconds delay
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data || error.message || 'Registration failed. Please try again.', {
        position: "bottom-right",
        autoClose: 4000,
      });
      setError(error.response?.data || error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill pincode if available from location selection
  React.useEffect(() => {
    const storedPincode = localStorage.getItem('pincode');
    if (storedPincode && !formData.pincode) {
      setFormData(prev => ({ ...prev, pincode: storedPincode }));
    }
  }, [formData.pincode]);

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Grocito</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">
            {currentStep === 1 ? 'Step 1: Basic Information' : 'Step 2: Contact Details'}
          </p>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center mt-4 space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Basic Info</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Contact Details</span>
            </div>
          </div>
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

        {/* Sign Up Form */}
        {currentStep === 1 ? (
          /* Step 1: Basic Information */
          <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Confirm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-semibold transition-colors"
            >
              Continue to Step 2 →
            </button>
          </form>
        ) : (
          /* Step 2: Contact Details */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your pincode"
                maxLength="6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Enter your complete address"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-500 hover:text-green-600 font-medium">
              Sign in here
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

export default SignUpPage;