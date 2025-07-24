import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import StatsCards from '../../components/dashboard/StatsCards';
import ActiveOrders from '../../components/dashboard/ActiveOrders';
import AvailableOrders from '../../components/dashboard/AvailableOrders';
import RecentActivity from '../../components/dashboard/RecentActivity';
import AvailabilityToggle from '../../components/common/AvailabilityToggle';
import dashboardAPI from '../../services/dashboardAPI';
import ordersAPI from '../../services/ordersAPI';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      const data = await dashboardAPI.getDashboard();
      setDashboardData(data);
      setIsAvailable(data.isAvailable || false);
      setActiveOrders(data.activeOrders || []);
      setAvailableOrders(data.availableOrders || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error loading dashboard:', error);
      
      // Fallback to mock data for development
      const mockData = {
        partner: {
          id: 1,
          fullName: 'Demo Partner',
          pincode: '441904',
          verificationStatus: 'VERIFIED'
        },
        isAvailable: false,
        activeOrders: [],
        availableOrders: [],
        stats: {
          todayDeliveries: 0,
          activeOrders: 0,
          completedDeliveries: 0,
          todayEarnings: 0,
          totalEarnings: 0
        }
      };
      
      setDashboardData(mockData);
      setIsAvailable(mockData.isAvailable);
      setActiveOrders(mockData.activeOrders);
      setAvailableOrders(mockData.availableOrders);
      setStats(mockData.stats);
      
      toast.warn('Using demo data - Backend API not available');
    } finally {
      setLoading(false);
    }
  };

  // Toggle availability
  const handleAvailabilityToggle = async (newAvailability) => {
    console.log('handleAvailabilityToggle called with:', newAvailability);
    try {
      setLoading(true);
      
      // Try to call the API
      await dashboardAPI.toggleAvailability(newAvailability);
      setIsAvailable(newAvailability);
      
      if (newAvailability) {
        toast.success('You are now ONLINE and available for orders!');
        // Start real-time updates when going online
        startRealTimeUpdates();
      } else {
        toast.info('You are now OFFLINE');
        // Stop real-time updates when going offline
        stopRealTimeUpdates();
      }
      
      // Refresh dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error('Error toggling availability:', error);
      
      // Fallback: Update state locally for demo purposes
      setIsAvailable(newAvailability);
      
      if (newAvailability) {
        toast.success('Demo: You are now ONLINE (API not available)');
      } else {
        toast.info('Demo: You are now OFFLINE (API not available)');
      }
    } finally {
      setLoading(false);
    }
  };

  // Accept an order
  const handleAcceptOrder = async (orderId) => {
    try {
      await ordersAPI.acceptOrder(orderId);
      toast.success('Order accepted successfully!');
      
      // Refresh dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error('Error accepting order:', error);
      if (error.response?.status === 409) {
        toast.error('Order is no longer available');
      } else {
        toast.error('Failed to accept order');
      }
      // Refresh to get updated data
      await loadDashboardData();
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      
      const statusMessages = {
        'PICKED_UP': 'Order marked as picked up',
        'OUT_FOR_DELIVERY': 'Order is now out for delivery',
        'DELIVERED': 'Order delivered successfully!',
        'CANCELLED': 'Order cancelled'
      };
      
      toast.success(statusMessages[newStatus] || 'Order status updated');
      
      // Refresh dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Start real-time updates
  const startRealTimeUpdates = () => {
    if (refreshInterval) return; // Already running
    
    const interval = setInterval(async () => {
      try {
        // Send heartbeat to keep partner alive
        await dashboardAPI.heartbeat();
        
        // Refresh available orders and stats
        const [availableOrdersData, statsData] = await Promise.all([
          ordersAPI.getAvailableOrders(),
          dashboardAPI.getStats()
        ]);
        
        setAvailableOrders(availableOrdersData);
        setStats(statsData);
      } catch (error) {
        console.error('Error in real-time update:', error);
      }
    }, 10000); // Update every 10 seconds
    
    setRefreshInterval(interval);
  };

  // Stop real-time updates
  const stopRealTimeUpdates = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  };

  // Initialize dashboard
  useEffect(() => {
    loadDashboardData();
    
    // Cleanup on unmount
    return () => {
      stopRealTimeUpdates();
    };
  }, []);

  // Start real-time updates if available
  useEffect(() => {
    if (isAvailable) {
      startRealTimeUpdates();
    } else {
      stopRealTimeUpdates();
    }
  }, [isAvailable]);

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {dashboardData?.partner?.fullName || 'Partner'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Pincode: {dashboardData?.partner?.pincode} | 
                Status: {dashboardData?.partner?.verificationStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Availability Control Section */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Delivery Status</h2>
              <p className="text-gray-600 mt-1">
                {isAvailable 
                  ? 'You are online and ready to receive orders' 
                  : 'You are offline - toggle to start receiving orders'
                }
              </p>
              {stats.activeOrders >= 2 && (
                <p className="text-orange-600 text-sm mt-1 font-medium">
                  ⚠️ You have reached the maximum limit of 2 active orders
                </p>
              )}
            </div>
            
            <AvailabilityToggle
              isAvailable={isAvailable}
              onToggle={handleAvailabilityToggle}
              loading={loading}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards stats={stats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Orders */}
          <div className="lg:col-span-1">
            <ActiveOrders
              orders={activeOrders}
              onUpdateStatus={handleUpdateOrderStatus}
              loading={loading}
            />
          </div>

          {/* Available Orders */}
          <div className="lg:col-span-1">
            <AvailableOrders
              orders={availableOrders}
              onAcceptOrder={handleAcceptOrder}
              isAvailable={isAvailable}
              loading={loading}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <RecentActivity partnerId={dashboardData?.partner?.id} />
        </div>

        {/* Real-time Status Indicator */}
        {isAvailable && (
          <div className="fixed bottom-4 right-4">
            <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">LIVE</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;