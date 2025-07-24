import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  const { isAuthenticated, partner } = useSelector((state) => state.auth);

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