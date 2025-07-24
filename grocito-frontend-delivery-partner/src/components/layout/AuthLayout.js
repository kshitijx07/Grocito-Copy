import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthLayout = () => {
  const { isAuthenticated, partner } = useSelector((state) => state.auth);

  // Redirect if already authenticated and verified
  if (isAuthenticated && partner?.verificationStatus === 'VERIFIED') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Grocito Delivery</h1>
            <p className="text-gray-600">Partner Dashboard</p>
          </div>

          {/* Auth Form Container */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <Outlet />
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>&copy; 2024 Grocito. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;