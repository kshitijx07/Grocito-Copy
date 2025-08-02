import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ordersAPI from '../../services/ordersAPI';
import dashboardAPI from '../../services/dashboardAPI';
import earningsService from '../../services/earningsService';
import EarningsBreakdown from '../../components/dashboard/EarningsBreakdown';

const Earnings = () => {
  const [earnings, setEarnings] = useState({});
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Load earnings data
  const loadEarningsData = async () => {
    try {
      setLoading(true);
      
      // Try to get real data from API first
      let orders = [];
      let stats = {};
      
      try {
        [stats, orders] = await Promise.all([
          dashboardAPI.getStats(),
          ordersAPI.getCompletedOrders()
        ]);
      } catch (error) {
        console.log('API not available, using mock data for development');
        
        // Generate realistic mock data for development
        const mockOrders = [];
        const today = new Date();
        
        // Create mock orders for the last 7 days
        for (let i = 0; i < 15; i++) {
          const orderDate = new Date(today.getTime() - (Math.random() * 7 * 24 * 60 * 60 * 1000));
          const orderAmount = Math.floor(Math.random() * 500) + 100; // ₹100-₹600
          
          mockOrders.push({
            id: i + 1,
            totalAmount: orderAmount,
            deliveredAt: orderDate.toISOString(),
            items: [{ 
              product: { price: orderAmount }, 
              quantity: 1 
            }],
            status: 'DELIVERED',
            partnerEarning: orderAmount >= 199 ? 25 : 30 // Basic calculation
          });
        }
        
        orders = mockOrders;
      }
      
      // Calculate earnings using the earnings service
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      let todayEarnings = 0;
      let weekEarnings = 0;
      let totalEarnings = 0;
      let todayDeliveries = 0;
      let weekDeliveries = 0;
      
      const processedOrders = orders.map(order => {
        const orderEarnings = earningsService.calculateDeliveryEarnings(order);
        const orderDate = new Date(order.deliveredAt || order.orderTime);
        
        totalEarnings += orderEarnings.totalEarnings;
        
        if (orderDate.toDateString() === today.toDateString()) {
          todayEarnings += orderEarnings.totalEarnings;
          todayDeliveries++;
        }
        
        if (orderDate >= weekAgo) {
          weekEarnings += orderEarnings.totalEarnings;
          weekDeliveries++;
        }
        
        return {
          ...order,
          earnings: orderEarnings,
          completedAt: order.deliveredAt
        };
      });
      
      // Calculate daily target bonus for today's deliveries
      const dailyTargetBonus = todayDeliveries >= 12 ? 80 : 0;
      todayEarnings += dailyTargetBonus;
      
      const calculatedEarnings = {
        todayEarnings: parseFloat(todayEarnings.toFixed(2)),
        weekEarnings: parseFloat(weekEarnings.toFixed(2)),
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        todayDeliveries,
        weekDeliveries,
        completedDeliveries: orders.length,
        avgEarningsPerDelivery: orders.length > 0 ? parseFloat((totalEarnings / orders.length).toFixed(2)) : 0,
        activeOrders: stats.activeOrders || 0,
        cancelledOrders: stats.cancelledOrders || 0
      };
      
      setEarnings(calculatedEarnings);
      
      // Process earnings history for the selected period
      const history = processEarningsHistory(processedOrders, selectedPeriod);
      setEarningsHistory(history);
      
    } catch (error) {
      console.error('Error loading earnings data:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  // Process earnings history based on selected period
  const processEarningsHistory = (orders, period) => {
    const now = new Date();
    const history = [];
    
    // Filter delivered orders only
    const deliveredOrders = orders.filter(order => order.status === 'DELIVERED');
    
    if (period === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dayOrders = deliveredOrders.filter(order => {
          const orderDate = new Date(order.deliveredAt || order.completedAt);
          return orderDate >= date && orderDate < nextDate;
        });
        
        // Calculate earnings using the earnings service
        const dayEarnings = dayOrders.reduce((sum, order) => {
          const earnings = order.earnings || earningsService.calculateDeliveryEarnings(order);
          return sum + earnings.totalEarnings;
        }, 0);
        
        history.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          earnings: parseFloat(dayEarnings.toFixed(2)),
          orders: dayOrders.length,
          fullDate: date,
          completedAt: date.toISOString()
        });
      }
    } else if (period === 'month') {
      // Last 30 days grouped by week
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const weekOrders = deliveredOrders.filter(order => {
          const orderDate = new Date(order.deliveredAt || order.completedAt);
          return orderDate >= weekStart && orderDate < weekEnd;
        });
        
        // Calculate earnings using the earnings service
        const weekEarnings = weekOrders.reduce((sum, order) => {
          const earnings = order.earnings || earningsService.calculateDeliveryEarnings(order);
          return sum + earnings.totalEarnings;
        }, 0);
        
        history.push({
          date: `Week ${4 - i}`,
          earnings: parseFloat(weekEarnings.toFixed(2)),
          orders: weekOrders.length,
          fullDate: weekStart,
          completedAt: weekStart.toISOString()
        });
      }
    }
    
    return history;
  };

  // Start real-time updates
  const startRealTimeUpdates = () => {
    const interval = setInterval(loadEarningsData, 60000); // Update every minute
    setRefreshInterval(interval);
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (earningsHistory.length > 0) {
      // Reprocess existing data
      const history = processEarningsHistory(earningsHistory, period);
      setEarningsHistory(history);
    }
  };

  // Initialize
  useEffect(() => {
    loadEarningsData();
    startRealTimeUpdates();
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  // Recalculate history when period changes
  useEffect(() => {
    if (!loading) {
      loadEarningsData();
    }
  }, [selectedPeriod]);

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings Overview</h1>
          <p className="text-gray-600 mt-1">
            Track your delivery earnings and performance metrics
          </p>
        </div>
      </div>

      {/* Professional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Today's Earnings</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(earnings.todayEarnings || 0)}</p>
              <p className="text-gray-400 text-xs mt-1">{earnings.todayDeliveries || 0} deliveries completed</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">This Week</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(earnings.weekEarnings || 0)}</p>
              <p className="text-gray-400 text-xs mt-1">{earnings.weekDeliveries || 0} deliveries completed</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Earnings</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{formatCurrency(earnings.totalEarnings || 0)}</p>
              <p className="text-gray-400 text-xs mt-1">{earnings.completedDeliveries || 0} total deliveries</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Average per Delivery</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{formatCurrency(earnings.avgEarningsPerDelivery || 0)}</p>
              <p className="text-gray-400 text-xs mt-1">Based on completed orders</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Earnings Breakdown */}
        <div className="space-y-6">
          <EarningsBreakdown 
            deliveries={earningsHistory}
          />
        </div>

        {/* Right Column - Performance & Tips */}
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold text-green-600">
                  {earnings.completedDeliveries > 0 
                    ? Math.round((earnings.completedDeliveries / (earnings.completedDeliveries + (earnings.cancelledOrders || 0))) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Orders</span>
                <span className="font-semibold text-blue-600">{earnings.activeOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Deliveries</span>
                <span className="font-semibold text-purple-600">{earnings.completedDeliveries || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Best Day Earnings</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(Math.max(...earningsHistory.map(h => h.earnings), 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Earning Tips */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Earning Tips</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Peak Hours</p>
                  <p className="text-sm text-gray-600">Work during morning (7-10 AM) and evening (6-9 PM) for bonus earnings</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Quick Deliveries</p>
                  <p className="text-sm text-gray-600">Faster deliveries mean more orders and higher earnings</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Daily Target</p>
                  <p className="text-sm text-gray-600">Complete 12+ deliveries daily to earn ₹80 bonus</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Stay Available</p>
                  <p className="text-sm text-gray-600">Keep your availability status on to receive more order requests</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;