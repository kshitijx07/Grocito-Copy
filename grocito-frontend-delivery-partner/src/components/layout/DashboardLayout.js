import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import { fetchDashboardStats } from '../../store/slices/dashboardSlice';
import { fetchOrders } from '../../store/slices/ordersSlice';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const { partner } = useSelector((state) => state.auth);

  // Fetch initial data when layout loads
  useEffect(() => {
    if (partner?.id) {
      dispatch(fetchDashboardStats(partner.id));
      dispatch(fetchOrders({ partnerId: partner.id }));
    }
  }, [dispatch, partner]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (partner?.id) {
      const interval = setInterval(() => {
        dispatch(fetchOrders({ partnerId: partner.id }));
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [dispatch, partner]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;