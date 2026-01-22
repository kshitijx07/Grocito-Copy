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
    <div className="min-h-screen bg-green-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Grocito</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Delivery Partner</h1>
            <p className="text-gray-600">Join our delivery team</p>
          </div>

          {/* Auth Form Container */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <Outlet />
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>&copy; 2025 Grocito. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;