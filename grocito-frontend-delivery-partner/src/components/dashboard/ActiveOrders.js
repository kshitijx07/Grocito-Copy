import React, { useState } from 'react';

const ActiveOrders = ({ orders, onUpdateStatus, loading }) => {
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      await onUpdateStatus(orderId, newStatus);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'PICKED_UP':
        return 'bg-yellow-100 text-yellow-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextAction = (status) => {
    switch (status) {
      case 'ASSIGNED':
        return { action: 'PICKED_UP', label: 'Mark as Picked Up', icon: '📦' };
      case 'PICKED_UP':
        return { action: 'OUT_FOR_DELIVERY', label: 'Start Delivery', icon: '🚚' };
      case 'OUT_FOR_DELIVERY':
        return { action: 'DELIVERED', label: 'Mark as Delivered', icon: '✅' };
      default:
        return null;
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address) => {
    return address.length > 60 ? address.substring(0, 60) + '...' : address;
  };

  const getTimeElapsed = (dateString) => {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ${diffInMinutes % 60}m ago`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Active Orders</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${orders.length > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">{orders.length} active</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Orders</h4>
            <p className="text-gray-600">Your accepted orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const nextAction = getNextAction(order.status);
              const isUpdating = updatingOrder === order.id;
              
              return (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">
                          #{order.id} • {getTimeElapsed(order.orderTime)}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm text-gray-700">{formatAddress(order.deliveryAddress)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm text-gray-700">{order.user?.fullName || 'Customer'}</span>
                          {order.user?.contactNumber && (
                            <a 
                              href={`tel:${order.user.contactNumber}`}
                              className="text-blue-600 hover:text-blue-800 text-sm ml-2"
                            >
                              📞 Call
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold text-gray-900 mb-2">
                        ₹{order.totalAmount?.toFixed(2) || '0.00'}
                      </div>
                      
                      {nextAction && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, nextAction.action)}
                          disabled={isUpdating || loading}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            isUpdating
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                          }`}
                        >
                          {isUpdating ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Updating...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span>{nextAction.icon}</span>
                              <span>{nextAction.label}</span>
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Order Timeline */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Assigned: {formatTime(order.assignedAt || order.orderTime)}</span>
                      </div>
                      
                      {order.pickedUpAt && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Picked: {formatTime(order.pickedUpAt)}</span>
                        </div>
                      )}
                      
                      {order.deliveredAt && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Delivered: {formatTime(order.deliveredAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>Items:</span>
                        <div className="flex flex-wrap gap-1">
                          {order.items.slice(0, 4).map((item, index) => (
                            <span key={index} className="bg-gray-100 px-2 py-1 rounded">
                              {item.product?.name || 'Item'} x{item.quantity}
                            </span>
                          ))}
                          {order.items.length > 4 && (
                            <span className="text-gray-400">+{order.items.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Emergency Actions */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                      disabled={isUpdating || loading}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveOrders;