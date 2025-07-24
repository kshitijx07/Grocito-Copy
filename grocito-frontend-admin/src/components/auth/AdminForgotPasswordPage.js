import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../api/authService';
import { toast } from 'react-toastify';

const AdminForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email.trim());
      
      // Show success message
      setEmailSent(true);
      toast.success('Password reset email sent! 📧', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
    } catch (error) {
      console.error('Admin forgot password error:', error);
      const errorMessage = error.message || 'Failed to send reset email. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email.trim());
      toast.success('Reset email sent again! 📧', {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Resend email error:', error);
      const errorMessage = error.message || 'Failed to resend email. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-admin-50 to-admin-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-admin-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold text-admin-900">Grocito</span>
                <div className="text-sm text-admin-600 font-medium">Admin Portal</div>
              </div>
            </div>
            
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-admin-900 mb-2">Check Your Email</h1>
            <p className="text-admin-600">We've sent a password reset link to</p>
            <p className="text-admin-700 font-medium">{email}</p>
          </div>

          {/* Instructions */}
          <div className="bg-admin-50 border border-admin-200 text-admin-700 px-4 py-4 rounded-lg mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-admin-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="font-medium mb-1">What's next?</p>
                <ul className="space-y-1 text-admin-600">
                  <li>• Check your email inbox</li>
                  <li>• Look for an email from Grocito Admin</li>
                  <li>• Use the temporary password to log in</li>
                  <li>• Change your password after logging in</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full bg-admin-700 text-white py-3 rounded-lg hover:bg-admin-800 disabled:bg-admin-300 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                'Resend Email'
              )}
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-admin-100 text-admin-700 py-3 rounded-lg hover:bg-admin-200 font-semibold transition-colors"
            >
              Back to Login
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-admin-500 text-sm">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={handleResendEmail}
                disabled={loading}
                className="text-admin-600 hover:text-admin-700 font-medium underline"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-admin-50 to-admin-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-admin-700 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-admin-900">Grocito</span>
              <div className="text-sm text-admin-600 font-medium">Admin Portal</div>
            </div>
          </div>
          
          {/* Lock Icon */}
          <div className="w-16 h-16 bg-admin-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-admin-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-admin-900 mb-2">Forgot Password?</h1>
          <p className="text-admin-600">Enter your admin email to reset your password</p>
        </div>

        {/* Admin Warning */}
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-sm">
              <p className="font-medium">Admin Account Required</p>
              <p>Only admin accounts can reset passwords through this portal</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Forgot Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-admin-700 mb-2">
              Admin Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-admin-300 rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent"
              placeholder="Enter your admin email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-admin-700 text-white py-3 rounded-lg hover:bg-admin-800 disabled:bg-admin-300 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Sending Reset Email...</span>
              </div>
            ) : (
              'Send Reset Email'
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <p className="text-admin-600">
            Remember your password?{' '}
            <Link to="/login" className="text-admin-600 hover:text-admin-700 font-medium">
              Back to Login
            </Link>
          </p>
        </div>

        {/* Customer Portal Link */}
        <div className="mt-4 text-center">
          <p className="text-admin-500 text-sm">
            Looking for the customer portal?{' '}
            <a 
              href="http://localhost:3000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Go to Customer App
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPasswordPage;