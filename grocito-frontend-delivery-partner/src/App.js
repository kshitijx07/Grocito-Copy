import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { restorePartnerFromToken } from './store/slices/authSlice';
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import Orders from './pages/orders/Orders';
import Profile from './pages/profile/Profile';
import Earnings from './pages/earnings/Earnings';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, partner, loading } = useSelector((state) => state.auth);

  // Restore partner data on app initialization
  useEffect(() => {
    const token = localStorage.getItem('deliveryPartnerToken');
    if (token && !partner) {
      dispatch(restorePartnerFromToken());
    }
  }, [dispatch, partner]);

  // Show loading screen while restoring partner data
  if (loading && !partner && localStorage.getItem('deliveryPartnerToken')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">G</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Restoring your session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="profile" element={<Profile />} />
          <Route path="earnings" element={<Earnings />} />
        </Route>

        {/* Redirect logic */}
        <Route path="*" element={
          isAuthenticated && partner?.verificationStatus === 'VERIFIED' 
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/auth/login" replace />
        } />
      </Routes>
    </div>
  );
}

export default App;