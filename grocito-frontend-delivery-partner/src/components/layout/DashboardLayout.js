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
    <div className="flex h-screen bg-green-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-green-50">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
          
          {/* Footer */}
          <footer className="bg-white border-t border-gray-200">
            <div className="container mx-auto px-6 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Company Info */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">G</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">Grocito</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Delivering fresh groceries to customers across the city. 
                    Thank you for being part of our delivery team!
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="/dashboard" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                        Dashboard
                      </a>
                    </li>
                    <li>
                      <a href="/orders" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                        My Orders
                      </a>
                    </li>
                    <li>
                      <a href="/earnings" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                        Earnings
                      </a>
                    </li>
                    <li>
                      <a href="/profile" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                        Profile Settings
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Support */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="tel:+919876543210" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                        📞 +91 98765 43210
                      </a>
                    </li>
                    <li>
                      <a href="mailto:support@grocito.com" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                        ✉️ support@grocito.com
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                        📋 Help Center
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                        💬 Live Chat
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="border-t border-gray-200 mt-8 pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <p className="text-gray-500 text-sm">
                    © 2024 Grocito. All rights reserved.
                  </p>
                  <div className="flex space-x-6 mt-4 sm:mt-0">
                    <a href="#" className="text-gray-500 hover:text-green-600 text-sm transition-colors">
                      Privacy Policy
                    </a>
                    <a href="#" className="text-gray-500 hover:text-green-600 text-sm transition-colors">
                      Terms of Service
                    </a>
                    <a href="#" className="text-gray-500 hover:text-green-600 text-sm transition-colors">
                      Partner Guidelines
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
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