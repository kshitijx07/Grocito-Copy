import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../api/authService';
import { toast } from 'react-toastify';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Admin login form submitted with:', { email: formData.email, password: '***' });
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password);
      console.log('Admin login successful:', response);
      
      // Show success toast
      toast.success(`Welcome back, ${response.user.fullName}! 👨‍💼`, {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Navigate to admin dashboard
      setTimeout(() => {
        console.log('Navigating to admin dashboard');
        navigate('/dashboard', { replace: true });
      }, 1000);
      
    } catch (error) {
      console.error('Admin login error:', error);
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-admin-900 mb-2">Admin Login</h1>
          <p className="text-admin-600">Sign in to access the admin dashboard</p>
        </div>

        {/* Admin Info Banner */}
        <div className="bg-admin-50 border border-admin-200 text-admin-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-admin-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-sm">
              <p className="font-medium">Admin Access Only</p>
              <p>This portal is restricted to authorized administrators</p>
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-admin-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-admin-300 rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent"
              placeholder="Enter your admin email"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-admin-700">
                Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-admin-500 hover:text-admin-600 font-medium"
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
              className="w-full px-4 py-3 border border-admin-300 rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent"
              placeholder="Enter your password"
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
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In to Admin Portal'
            )}
          </button>
        </form>

        {/* Demo Admin Account */}
        <div className="mt-6 p-4 bg-admin-50 rounded-lg">
          <h3 className="text-sm font-medium text-admin-700 mb-2">Demo Admin Account:</h3>
          <div className="text-xs text-admin-600 space-y-1">
            <div>Email: admin@grocito.com</div>
            <div>Password: admin123</div>
          </div>
        </div>

        {/* Customer Portal Link */}
        <div className="mt-6 text-center">
          <p className="text-admin-600 text-sm">
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

export default AdminLoginPage;