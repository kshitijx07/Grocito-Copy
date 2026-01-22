import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ordersAPI from '../../services/ordersAPI';
import dashboardAPI from '../../services/dashboardAPI';

import { calculateDailyEarnings, calculateWeeklyEarnings, calculateTotalEarnings, formatCurrency } from '../../utils/earningsCalculator';

const Earnings = () => {
  const [earnings, setEarnings] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Load earnings data
  const loadEarningsData = async () => {
    try {
      setLoading(true);
      
      // Get real data from multiple sources exactly like Dashboard does
      let orders = [];
      let stats = {};
      
      try {
        const [activeOrders, completedOrders] = await Promise.all([
          ordersAPI.getMyOrders().catch(() => []),
          ordersAPI.getCompletedOrders().catch(() => [])
        ]);
        
        // Combine all orders and filter delivered ones
        const allOrders = [...activeOrders, ...completedOrders];
        orders = allOrders.filter(order => order.status === 'DELIVERED');
        
        console.log('Earnings Debug:', {
          totalDeliveredOrders: orders.length,
          activeOrders: activeOrders.length,
          completedOrders: completedOrders.length,
          sampleOrder: orders[0]
        });
        
        // Try to get stats, but don't fail if not available
        try {
          stats = await dashboardAPI.getStats();
        } catch (statsError) {
          console.log('Stats API not available, calculating from orders');
          stats = {};
        }
      } catch (error) {
        console.log('Orders API not available, using empty data');
        orders = [];
        stats = {};
      }
      
      // Calculate earnings using unified calculator for consistency
      console.log('Earnings Debug:', {
        totalDeliveredOrders: orders.length,
        sampleOrder: orders[0]
      });

      // Use unified calculator for consistent results across all components
      const dailyEarnings = calculateDailyEarnings(orders);
      const weeklyEarnings = calculateWeeklyEarnings(orders);
      const totalEarnings = calculateTotalEarnings(orders);

      const calculatedEarnings = {
        todayEarnings: dailyEarnings.totalEarnings,
        weekEarnings: weeklyEarnings.totalEarnings,
        totalEarnings: totalEarnings.totalEarnings,
        todayDeliveries: dailyEarnings.totalDeliveries,
        weekDeliveries: weeklyEarnings.totalDeliveries,
        completedDeliveries: orders.length,
        avgEarningsPerDelivery: totalEarnings.averageEarningsPerDelivery,
        activeOrders: stats.activeOrders || 0,
        cancelledOrders: stats.cancelledOrders || 0,
        dailyTargetAchieved: dailyEarnings.dailyTargetAchieved,
        deliveriesNeededForTarget: dailyEarnings.deliveriesNeededForTarget
      };
      
      console.log('Earnings Calculated Stats:', calculatedEarnings);
      setEarnings(calculatedEarnings);

      // No need for earnings history processing since we removed EarningsBreakdown
      
    } catch (error) {
      console.error('Error loading earnings data:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  // Removed processEarningsHistory function since EarningsBreakdown is removed

  // Start real-time updates
  const startRealTimeUpdates = () => {
    const interval = setInterval(async () => {
      try {
        console.log('Earnings: Refreshing data...');
        await loadEarningsData();
      } catch (error) {
        console.error('Error in earnings real-time update:', error);
      }
    }, 30000); // Update every 30 seconds like Dashboard
    setRefreshInterval(interval);
  };

  // Removed handlePeriodChange since EarningsBreakdown is removed

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

  // Removed period change effect since EarningsBreakdown is removed



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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Earnings Overview</h1>
            <p className="text-gray-600 mt-1">
              Track your delivery earnings and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live Updates</span>
            </div>
            <button
              onClick={loadEarningsData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
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
        {/* Left Column - Bonus Status and Policy */}
        <div className="space-y-6">
          {/* Current Bonus Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Current Bonus Status</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${(() => {
                  const now = new Date();
                  const hour = now.getHours();
                  const isPeakHour = (hour >= 7 && hour < 10) || (hour >= 18 && hour < 21);
                  return isPeakHour ? 'bg-orange-100 border border-orange-300' : 'bg-gray-100';
                })()}`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${(() => {
                      const now = new Date();
                      const hour = now.getHours();
                      const isPeakHour = (hour >= 7 && hour < 10) || (hour >= 18 && hour < 21);
                      return isPeakHour ? 'bg-orange-500' : 'bg-gray-400';
                    })()}`}></div>
                    <span className={`font-medium ${(() => {
                      const now = new Date();
                      const hour = now.getHours();
                      const isPeakHour = (hour >= 7 && hour < 10) || (hour >= 18 && hour < 21);
                      return isPeakHour ? 'text-orange-800' : 'text-gray-600';
                    })()}`}>
                      Peak Hours (7-10 AM, 6-9 PM)
                    </span>
                  </div>
                  <div className={`text-sm mt-1 ${(() => {
                    const now = new Date();
                    const hour = now.getHours();
                    const isPeakHour = (hour >= 7 && hour < 10) || (hour >= 18 && hour < 21);
                    return isPeakHour ? 'text-orange-700' : 'text-gray-500';
                  })()}`}>
                    {(() => {
                      const now = new Date();
                      const hour = now.getHours();
                      const isPeakHour = (hour >= 7 && hour < 10) || (hour >= 18 && hour < 21);
                      return isPeakHour ? '+₹5 per delivery ACTIVE' : 'Not active now';
                    })()}
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${(() => {
                  const now = new Date();
                  const day = now.getDay();
                  const isWeekend = day === 0 || day === 6;
                  return isWeekend ? 'bg-purple-100 border border-purple-300' : 'bg-gray-100';
                })()}`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${(() => {
                      const now = new Date();
                      const day = now.getDay();
                      const isWeekend = day === 0 || day === 6;
                      return isWeekend ? 'bg-purple-500' : 'bg-gray-400';
                    })()}`}></div>
                    <span className={`font-medium ${(() => {
                      const now = new Date();
                      const day = now.getDay();
                      const isWeekend = day === 0 || day === 6;
                      return isWeekend ? 'text-purple-800' : 'text-gray-600';
                    })()}`}>
                      Weekend Bonus (Sat & Sun)
                    </span>
                  </div>
                  <div className={`text-sm mt-1 ${(() => {
                    const now = new Date();
                    const day = now.getDay();
                    const isWeekend = day === 0 || day === 6;
                    return isWeekend ? 'text-purple-700' : 'text-gray-500';
                  })()}`}>
                    {(() => {
                      const now = new Date();
                      const day = now.getDay();
                      const isWeekend = day === 0 || day === 6;
                      return isWeekend ? '+₹3 per delivery ACTIVE' : 'Not active now';
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Policy */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Earnings Policy</h3>
            </div>
            <div className="p-6">
              <div className="text-sm text-blue-800 space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <div>
                    <strong className="text-blue-900">Orders ≥₹199:</strong> 
                    <span className="text-blue-800"> ₹25 per delivery (FREE delivery for customer, paid by Grocito)</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <div>
                    <strong className="text-blue-900">Orders &lt;₹199:</strong> 
                    <span className="text-blue-800"> ₹30 per delivery (Customer pays ₹40 fee, you get 75%)</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <div>
                    <strong className="text-blue-900">Daily Target:</strong> 
                    <span className="text-blue-800"> Complete 12+ deliveries for ₹80 bonus</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <div>
                    <strong className="text-blue-900">Peak Hours</strong> 
                    <span className="text-blue-800">(7-10 AM, 6-9 PM): +₹5 per delivery</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <div>
                    <strong className="text-blue-900">Weekends:</strong> 
                    <span className="text-blue-800"> +₹3 per delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                  {formatCurrency(earnings.todayEarnings || 0)}
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