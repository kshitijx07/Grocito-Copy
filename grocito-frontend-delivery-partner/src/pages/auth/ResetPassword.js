import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearError, clearPasswordResetSuccess } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, passwordResetSuccess } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/auth/forgot-password');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (passwordResetSuccess) {
      toast.success('Password reset successful! You can now login with your new password.');
      dispatch(clearPasswordResetSuccess());
      navigate('/auth/login');
    }
  }, [passwordResetSuccess, dispatch, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.newPassword || formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(resetPassword({
        token,
        newPassword: formData.newPassword,
      })).unwrap();
    } catch (error) {
      // Error is handled by useEffect above
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h2>
        <p className="text-gray-600 mb-6">
          This password reset link is invalid or has expired.
        </p>
        
        <Link
          to="/auth/forgot-password"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Request New Reset Link
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
        <p className="mt-2 text-gray-600">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter new password (min 6 characters)"
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
            Confirm New Password
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
              placeholder="Confirm your new password"
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

        {/* Password Requirements */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${
                formData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'
              }`}></span>
              At least 6 characters
            </li>
            <li className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${
                formData.newPassword === formData.confirmPassword && formData.newPassword.length > 0 
                  ? 'bg-green-500' : 'bg-gray-300'
              }`}></span>
              Passwords match
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Resetting...
            </div>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;