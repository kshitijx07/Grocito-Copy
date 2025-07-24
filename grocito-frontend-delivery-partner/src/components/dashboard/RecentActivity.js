import React, { useState, useEffect } from 'react';
import ordersAPI from '../../services/ordersAPI';

const RecentActivity = ({ partnerId }) => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
  }, [partnerId]);

  const loadRecentActivity = async () => {
    try {
      const orders = await ordersAPI.getMyOrders();
      // Show only completed orders for recent activity
      const completedOrders = orders
        .filter(order => order.status === 'DELIVERED' || order.status === 'CANCELLED')
        .slice(0, 5); // Show last 5 completed orders
      setRecentOrders(completedOrders);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED':
        return '✅';
      case 'CANCELLED':
        return '❌';
      default:
        return '📦';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-600';
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>
      
      <div className="p-6">
        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h4>
            <p className="text-gray-600">Your completed deliveries will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg">
                    {getStatusIcon(order.status)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">
                      Order #{order.id}
                    </p>
                    <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {order.deliveryAddress}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTime(order.deliveredAt || order.updatedAt)}
                  </p>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ₹{order.totalAmount?.toFixed(2) || '0.00'}
                  </p>
                  {order.status === 'DELIVERED' && (
                    <p className="text-xs text-green-600">
                      +₹50 earned
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;