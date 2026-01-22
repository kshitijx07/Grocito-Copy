import React, { useState, useEffect } from 'react';
import { authService } from '../../api/authService';
import { dashboardService } from '../../api/dashboardService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminHeader from '../common/AdminHeader';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeOrders: 0,
    totalProducts: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    recentOrdersCount: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataScope, setDataScope] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboardData = async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      console.log('AdminDashboard: Loading dashboard data for admin:', currentUser.id);
      
      // Fetch dashboard overview (stats + recent activity)
      const overviewData = await dashboardService.getDashboardOverview(currentUser.id);
      
      if (overviewData.error) {
        console.warn('AdminDashboard: API returned error, using fallback data');
        toast.warning('Using cached data - API connection issue');
      }
      
      // Update dashboard stats
      if (overviewData.stats) {
        setDashboardData(overviewData.stats);
        setDataScope(overviewData.stats.dataScope || '');
      }
      
      // Update recent activity
      if (overviewData.recentActivity) {
        setRecentActivity(overviewData.recentActivity.recentOrders || []);
      }
      
      setLastUpdated(new Date());
      
      console.log('AdminDashboard: Data loaded successfully', {
        totalUsers: overviewData.stats?.totalUsers,
        activeOrders: overviewData.stats?.activeOrders,
        dataScope: overviewData.stats?.dataScope,
        recentOrdersCount: overviewData.recentActivity?.totalCount
      });
      
    } catch (error) {
      console.error('AdminDashboard: Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data on component mount
  useEffect(() => {
    if (!currentUser) {
      console.error('AdminDashboard: No current user found');
      navigate('/login', { replace: true });
      return;
    }

    loadDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [currentUser?.id, navigate]);

  // Safety check for user data - after hooks
  if (!currentUser) {
    return null; // This will be handled by useEffect
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully', {
      position: "bottom-right",
      autoClose: 2000,
    });
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        title="Dashboard" 
        subtitle="Here's what's happening with your grocery delivery platform today."
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome back, {currentUser?.fullName || 'Admin User'}!
          </h2>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              currentUser?.role === 'SUPER_ADMIN' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Regional Admin'}
            </span>
            {currentUser?.pincode && (
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                Pincode: {currentUser.pincode}
              </span>
            )}
          </div>
          
          {/* Data Scope Indicator */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span>
                {loading ? 'Loading...' : 
                 dataScope === 'GLOBAL' ? 'Showing data from all pincodes' : 
                 dataScope === 'PINCODE_SPECIFIC' ? `Showing data for pincode ${currentUser.pincode}` : 
                 'Real-time data'}
              </span>
            </div>
            {lastUpdated && (
              <span className="text-gray-400">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                {loading ? (
                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.totalUsers.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Active Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                {loading ? (
                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.activeOrders.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                {loading ? (
                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.totalProducts.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                {loading ? (
                  <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(dashboardData.todayRevenue)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className={`grid grid-cols-1 gap-4 ${currentUser?.role === 'SUPER_ADMIN' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            <button 
              onClick={() => navigate('/users')}
              className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-600">View and manage all users</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/orders')}
              className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Manage Orders</p>
                <p className="text-sm text-gray-600">Track and update orders</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/products')}
              className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Manage Products</p>
                <p className="text-sm text-gray-600">Add and edit products</p>
              </div>
            </button>

            {/* Location Management - Only for SUPER_ADMIN */}
            {currentUser?.role === 'SUPER_ADMIN' && (
              <button 
                onClick={() => navigate('/locations')}
                className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Manage Locations</p>
                  <p className="text-sm text-gray-600">Control service areas</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Delivered Orders</h3>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent deliveries</h3>
              <p className="mt-1 text-sm text-gray-500">
                {dataScope === 'PINCODE_SPECIFIC' 
                  ? `No delivered orders found for pincode ${currentUser.pincode}` 
                  : 'No delivered orders found across all pincodes'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((order) => (
                <div key={order.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        DELIVERED
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{order.pincode}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{order.user?.fullName || 'Customer'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : 'Recently'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </div>
              ))}
              
              {recentActivity.length > 0 && (
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Showing {recentActivity.length} recent deliveries
                    {dataScope === 'PINCODE_SPECIFIC' && ` for pincode ${currentUser.pincode}`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;