import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerPartner, clearError, clearRegistrationSuccess } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    pincode: '',
    vehicleType: '',
    vehicleNumber: '',
    licenseNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, registrationSuccess } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (registrationSuccess) {
      toast.success('Registration successful! Your application is pending verification.');
      dispatch(clearRegistrationSuccess());
      navigate('/auth/login');
    }
  }, [registrationSuccess, dispatch, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return false;
    }
    
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Valid email is required');
      return false;
    }
    
    if (!formData.phoneNumber.trim() || !/^[0-9]{10}$/.test(formData.phoneNumber)) {
      toast.error('Valid 10-digit phone number is required');
      return false;
    }
    
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    if (!formData.pincode.trim() || !/^[0-9]{6}$/.test(formData.pincode)) {
      toast.error('Valid 6-digit pincode is required');
      return false;
    }
    
    if (!formData.vehicleType) {
      toast.error('Vehicle type is required');
      return false;
    }
    
    if (!formData.vehicleNumber.trim()) {
      toast.error('Vehicle number is required');
      return false;
    }
    
    if (!formData.licenseNumber.trim()) {
      toast.error('License number is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const registrationData = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phoneNumber: formData.phoneNumber.trim(),
      password: formData.password,
      pincode: formData.pincode.trim(),
      vehicleType: formData.vehicleType,
      vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
      licenseNumber: formData.licenseNumber.trim().toUpperCase(),
    };

    try {
      await dispatch(registerPartner(registrationData)).unwrap();
    } catch (error) {
      // Error is handled by useEffect above
    }
  };

  const vehicleTypes = [
    { value: '', label: 'Select Vehicle Type' },
    { value: 'BIKE', label: 'Motorcycle/Bike' },
    { value: 'SCOOTER', label: 'Scooter' },
    { value: 'CAR', label: 'Car' },
  ];

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) {
          toast.error('Full name is required');
          return false;
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error('Valid email is required');
          return false;
        }
        if (!formData.phoneNumber.trim() || !/^[0-9]{10}$/.test(formData.phoneNumber)) {
          toast.error('Valid 10-digit phone number is required');
          return false;
        }
        if (!formData.pincode.trim() || !/^[0-9]{6}$/.test(formData.pincode)) {
          toast.error('Valid 6-digit pincode is required');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.vehicleType) {
          toast.error('Vehicle type is required');
          return false;
        }
        if (!formData.vehicleNumber.trim()) {
          toast.error('Vehicle number is required');
          return false;
        }
        if (!formData.licenseNumber.trim()) {
          toast.error('License number is required');
          return false;
        }
        return true;
      
      case 3:
        if (!formData.password || formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`w-16 h-1 mx-2 ${
                step < currentStep ? 'bg-green-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Personal Information';
      case 2:
        return 'Vehicle Information';
      case 3:
        return 'Account Security';
      default:
        return '';
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Join Our Team</h2>
        <p className="mt-2 text-gray-600">Register as a delivery partner</p>
      </div>

      {renderStepIndicator()}

      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">{getStepTitle()}</h3>
        <p className="text-sm text-gray-600 mt-1">Step {currentStep} of 3</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your email address"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter 10-digit phone number"
                maxLength="10"
              />
            </div>

            {/* Pincode */}
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                Service Pincode *
              </label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                required
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter 6-digit pincode"
                maxLength="6"
              />
            </div>
          </div>
        )}

        {/* Step 2: Vehicle Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            {/* Vehicle Type */}
            <div>
              <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type *
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                required
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {vehicleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Number */}
            <div>
              <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number *
              </label>
              <input
                id="vehicleNumber"
                name="vehicleNumber"
                type="text"
                required
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., MH12AB1234"
              />
            </div>

            {/* License Number */}
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Driving License Number *
              </label>
              <input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                required
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your license number"
              />
            </div>
          </div>
        )}

        {/* Step 3: Account Security */}
        {currentStep === 3 && (
          <div className="space-y-4">
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="ml-auto flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </div>
              ) : (
                'Complete Registration'
              )}
            </button>
          )}
        </div>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="font-medium text-green-600 hover:text-green-500"
          >
            Sign in here
          </Link>
        </p>
      </div>

      {/* Note */}
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>Note:</strong> Your application will be reviewed by our team. You'll receive an email notification once your account is verified and you can start accepting orders.
        </p>
      </div>
    </div>
  );
};

export default Register;