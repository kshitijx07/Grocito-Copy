import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import StatsCards from "../../components/dashboard/StatsCards";
import ActiveOrders from "../../components/dashboard/ActiveOrders";
import AvailableOrders from "../../components/dashboard/AvailableOrders";
import RecentActivity from "../../components/dashboard/RecentActivity";
import AvailabilityToggle from "../../components/common/AvailabilityToggle";

import dashboardAPI from "../../services/dashboardAPI";
import ordersAPI from "../../services/ordersAPI";
import { calculateDailyEarnings, calculateTotalEarnings, formatCurrency } from "../../utils/earningsCalculator";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      // Get real data from multiple sources like Orders page does
      const [dashboardData, activeOrdersData, availableOrdersData, myOrders, completedOrdersData] = await Promise.all([
        dashboardAPI.getDashboard().catch(() => null),
        ordersAPI.getMyOrders().catch(() => []),
        ordersAPI.getAvailableOrders().catch(() => []),
        ordersAPI.getMyOrders().catch(() => []),
        ordersAPI.getCompletedOrders().catch(() => [])
      ]);

      // Combine all orders and filter delivered ones
      const allOrders = [...myOrders, ...completedOrdersData];
      const deliveredOrders = allOrders.filter(order => order.status === 'DELIVERED');

      // Set dashboard data
      if (dashboardData) {
        setDashboardData(dashboardData);
        setIsAvailable(dashboardData.isAvailable || false);
      } else {
        setIsAvailable(false);
      }

      setActiveOrders(activeOrdersData);
      setAvailableOrders(availableOrdersData);
      setCompletedDeliveries(deliveredOrders);

      // Calculate real stats using unified earnings calculator
      console.log('Dashboard Debug:', {
        totalDeliveredOrders: deliveredOrders.length,
        activeOrders: activeOrdersData.length,
        sampleOrder: deliveredOrders[0]
      });

      // Use unified calculator for consistent results
      const dailyEarnings = calculateDailyEarnings(deliveredOrders);
      const totalEarnings = calculateTotalEarnings(deliveredOrders);

      const calculatedStats = {
        todayDeliveries: dailyEarnings.totalDeliveries,
        activeOrders: activeOrdersData.length,
        completedDeliveries: deliveredOrders.length,
        todayEarnings: dailyEarnings.totalEarnings,
        totalEarnings: totalEarnings.totalEarnings,
        avgEarningsPerDelivery: totalEarnings.averageEarningsPerDelivery,
        dailyTargetAchieved: dailyEarnings.dailyTargetAchieved,
        deliveriesNeededForTarget: dailyEarnings.deliveriesNeededForTarget
      };

      console.log('Dashboard Calculated Stats:', calculatedStats);
      setStats(calculatedStats);

    } catch (error) {
      console.error("Error loading dashboard:", error);

      // Fallback to empty data
      setDashboardData({
        partner: {
          id: 1,
          fullName: "Demo Partner",
          pincode: "441904",
          verificationStatus: "VERIFIED",
        },
        isAvailable: false
      });
      setIsAvailable(false);
      setActiveOrders([]);
      setAvailableOrders([]);
      setStats({
        todayDeliveries: 0,
        activeOrders: 0,
        completedDeliveries: 0,
        todayEarnings: 0,
        totalEarnings: 0,
      });
      setCompletedDeliveries([]);

      toast.warn("Unable to load dashboard data - Please check your connection");
    } finally {
      setLoading(false);
    }
  };

  // Toggle availability
  const handleAvailabilityToggle = async (newAvailability) => {
    try {
      setLoading(true);
      await dashboardAPI.toggleAvailability(newAvailability);
      setIsAvailable(newAvailability);

      if (newAvailability) {
        toast.success("You are now ONLINE and available for orders!");
        startRealTimeUpdates();
      } else {
        toast.info("You are now OFFLINE");
        stopRealTimeUpdates();
      }

      await loadDashboardData();
    } catch (error) {
      console.error("Error toggling availability:", error);
      setIsAvailable(newAvailability);

      if (newAvailability) {
        toast.success("Demo: You are now ONLINE (API not available)");
      } else {
        toast.info("Demo: You are now OFFLINE (API not available)");
      }
    } finally {
      setLoading(false);
    }
  };

  // Accept an order
  const handleAcceptOrder = async (orderId) => {
    try {
      await ordersAPI.acceptOrder(orderId);
      toast.success("Order accepted successfully!");
      await loadDashboardData();
    } catch (error) {
      console.error("Error accepting order:", error);
      if (error.response?.status === 409) {
        toast.error("Order is no longer available");
      } else {
        toast.error("Failed to accept order");
      }
      await loadDashboardData();
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);

      const statusMessages = {
        PICKED_UP: "Order marked as picked up",
        OUT_FOR_DELIVERY: "Order is now out for delivery",
        DELIVERED: "Order delivered successfully!",
        CANCELLED: "Order cancelled",
      };

      toast.success(statusMessages[newStatus] || "Order status updated");
      
      // Force refresh dashboard data to show updated earnings
      setLoading(true);
      await loadDashboardData();
    } catch (error) {
      console.error("Error updating order status:", error);
      const errorMessage = error.response?.data?.error || error.message || "Unknown error";

      if (errorMessage.includes("Cannot mark COD order as delivered without collecting payment")) {
        toast.error("Payment Required: Please collect payment from customer before marking as delivered");
      } else {
        toast.error(`Failed to update order: ${errorMessage}`);
      }

      // Still refresh to get latest data
      await loadDashboardData();
    }
  };

  // Start real-time updates
  const startRealTimeUpdates = () => {
    if (refreshInterval) return;

    const interval = setInterval(async () => {
      try {
        // Refresh all data including completed deliveries
        await loadDashboardData();
      } catch (error) {
        console.error("Error in real-time update:", error);
      }
    }, 10000);

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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Delivery Dashboard</h1>
              <p className="text-gray-600 mt-2 text-lg">
                Welcome back! Monitor your delivery performance and earnings.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className={`text-lg font-semibold ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {isAvailable ? 'ONLINE' : 'OFFLINE'}
                </p>
              </div>
              <AvailabilityToggle 
                isAvailable={isAvailable} 
                onToggle={handleAvailabilityToggle}
              />
            </div>
          </div>
        </div>
        
        {/* Key Metrics Row */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Today's Earnings */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(stats.todayEarnings || 0)}
              </div>
              <div className="text-sm font-medium text-gray-500 mt-1">Today's Earnings</div>
              <div className="text-xs text-gray-400 mt-1">
                {stats.todayDeliveries || 0} deliveries completed
              </div>
            </div>
            
            {/* Active Orders */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.activeOrders || 0}/2
              </div>
              <div className="text-sm font-medium text-gray-500 mt-1">Active Orders</div>
              <div className="text-xs text-gray-400 mt-1">
                {(stats.activeOrders || 0) >= 2 ? 'Limit reached' : 'Available slots'}
              </div>
            </div>
            
            {/* Daily Target */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${stats.dailyTargetAchieved ? 'text-green-600' : 'text-orange-600'}`}>
                {stats.todayDeliveries || 0}/12
              </div>
              <div className="text-sm font-medium text-gray-500 mt-1">Daily Target</div>
              <div className="text-xs text-gray-400 mt-1">
                {stats.dailyTargetAchieved ? '₹80 bonus earned!' : `${stats.deliveriesNeededForTarget || 12} more for ₹80 bonus`}
              </div>
            </div>
            
            {/* Average Earnings */}
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {formatCurrency(stats.avgEarningsPerDelivery || 27.5)}
              </div>
              <div className="text-sm font-medium text-gray-500 mt-1">Per Delivery Avg</div>
              <div className="text-xs text-gray-400 mt-1">
                Based on {stats.completedDeliveries || 0} deliveries
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActiveOrders 
          orders={activeOrders}
          onUpdateStatus={handleUpdateOrderStatus}
          loading={loading}
        />

        <AvailableOrders 
          orders={availableOrders}
          onAcceptOrder={handleAcceptOrder}
          loading={loading}
          isAvailable={isAvailable}
        />
      </div>

      {/* Recent Activity Section */}
      <RecentActivity 
        activities={completedDeliveries}
      />
    </div>
  );
};

export default Dashboard;