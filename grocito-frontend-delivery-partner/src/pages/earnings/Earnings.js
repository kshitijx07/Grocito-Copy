import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ordersAPI from '../../services/ordersAPI';
import dashboardAPI from '../../services/dashboardAPI';

const Earnings = () => {
  const [earnings, setEarnings] = useState({});
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Load earnings data
  const loadEarningsData = async () => {
    try {
      const [stats, completedOrders] = await Promise.all([
        dashboardAPI.getStats(),
        ordersAPI.getCompletedOrders()
      ]);
      
      setEarnings(stats);
      
      // Process earnings history
      const history = processEarningsHistory(completedOrders, selectedPeriod);
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
          const orderDate = new Date(order.deliveredAt);
          return orderDate >= date && orderDate < nextDate;
        });
        
        const dayEarnings = dayOrders.reduce((sum, order) => sum + (order.partnerEarning || 0), 0);
        
        history.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          earnings: dayEarnings,
          orders: dayOrders.length,
          fullDate: date
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
          const orderDate = new Date(order.deliveredAt);
          return orderDate >= weekStart && orderDate < weekEnd;
        });
        
        const weekEarnings = weekOrders.reduce((sum, order) => sum + (order.partnerEarning || 0), 0);
        
        history.push({
          date: `Week ${4 - i}`,
          earnings: weekEarnings,
          orders: weekOrders.length,
          fullDate: weekStart
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600 mt-1">Track your delivery earnings and performance</p>
        </div>

        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(earnings.todayEarnings)}</p>
                <p className="text-xs text-gray-500">{earnings.todayDeliveries || 0} deliveries</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(earnings.weekEarnings)}</p>
                <p className="text-xs text-gray-500">{earnings.weekDeliveries || 0} deliveries</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(earnings.totalEarnings)}</p>
                <p className="text-xs text-gray-500">{earnings.completedDeliveries || 0} total deliveries</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg per Delivery</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(earnings.avgEarningsPerDelivery)}</p>
                <p className="text-xs text-gray-500">Average earning</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Chart */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Earnings Trend</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePeriodChange('week')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedPeriod === 'week'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => handlePeriodChange('month')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedPeriod === 'month'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {earningsHistory.length > 0 ? (
              <div className="space-y-4">
                {earningsHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.date}</p>
                      <p className="text-sm text-gray-600">{item.orders} deliveries</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(item.earnings)}</p>
                      {item.orders > 0 && (
                        <p className="text-xs text-gray-500">
                          {formatCurrency(item.earnings / item.orders)} avg
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No earnings data available for the selected period</p>
              </div>
            )}
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Performance Metrics</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold">
                  {earnings.completedDeliveries > 0 
                    ? Math.round((earnings.completedDeliveries / (earnings.completedDeliveries + (earnings.cancelledOrders || 0))) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Orders</span>
                <span className="font-semibold">{earnings.activeOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Deliveries</span>
                <span className="font-semibold">{earnings.completedDeliveries || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Best Day Earnings</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(Math.max(...earningsHistory.map(h => h.earnings), 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Earnings Tips */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Earning Tips</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-sm">💡</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Peak Hours</p>
                  <p className="text-sm text-gray-600">Work during lunch (12-2 PM) and dinner (7-9 PM) for higher earnings</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm">⚡</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Quick Deliveries</p>
                  <p className="text-sm text-gray-600">Faster deliveries mean more orders and higher customer satisfaction</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 text-sm">🎯</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Large Orders</p>
                  <p className="text-sm text-gray-600">Orders above ₹1000 give you ₹20 bonus earnings</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 text-sm">📱</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Stay Online</p>
                  <p className="text-sm text-gray-600">Keep your availability on to receive more order notifications</p>
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