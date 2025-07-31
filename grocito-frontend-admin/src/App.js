import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLoginPage from './components/auth/AdminLoginPage';
import AdminForgotPasswordPage from './components/auth/AdminForgotPasswordPage';
import AdminDashboard from './components/dashboard/AdminDashboard';
import UserManagement from './components/users/UserManagement';
import ProductManagement from './components/products/ProductManagement';
import OrderManagement from './components/orders/OrderManagement';
import DeliveryPartnerManagement from './components/delivery-partners/DeliveryPartnerManagement';
import LocationManagement from './components/LocationManagement';
import AdminRoute from './components/auth/AdminRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  // Check environment variables when the app loads
  useEffect(() => {
    console.log('Admin App mounted - Environment variables check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL || 'Using default: http://localhost:8080/api');
  }, []);

  return (
    <Router>
      <div className="App">
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            fontSize: '14px',
            borderRadius: '8px',
          }}
        />
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route path="/forgot-password" element={<AdminForgotPasswordPage />} />
          <Route path="/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/users" element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          } />
          <Route path="/products" element={
            <AdminRoute>
              <ProductManagement />
            </AdminRoute>
          } />
          <Route path="/orders" element={
            <AdminRoute>
              <OrderManagement />
            </AdminRoute>
          } />
          <Route path="/delivery-partners" element={
            <AdminRoute>
              <DeliveryPartnerManagement />
            </AdminRoute>
          } />
          <Route path="/locations" element={
            <AdminRoute>
              <LocationManagement />
            </AdminRoute>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;