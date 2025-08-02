import React, { useState } from 'react';

const AvailableOrders = ({ orders = [], onAcceptOrder, isAvailable, loading }) => {
  const [acceptingOrder, setAcceptingOrder] = useState(null);

  const handleAcceptOrder = async (orderId) => {
    setAcceptingOrder(orderId);
    try {
      await onAcceptOrder(orderId);
    } finally {
      setAcceptingOrder(null);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) {
      return 'Time not available';
    }
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  const formatAddress = (address) => {
    if (!address || typeof address !== 'string') {
      return 'Address not available';
    }
    return address.length > 50 ? address.substring(0, 50) + '...' : address;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Available Orders</h2>
            <p className="text-gray-600 text-sm mt-1">
              {isAvailable ? 'New orders ready for pickup' : 'Go online to see available orders'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${orders.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium text-gray-700">{orders.length} orders</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!isAvailable && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center border-2 border-red-200">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">You're Offline</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Toggle your availability to start receiving new orders from customers.
            </p>
          </div>
        )}

        {isAvailable && orders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Available</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              You're online and ready! New orders will appear here automatically when customers place them.
            </p>
          </div>
        )}

        {isAvailable && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        New Order
                      </span>
                      <span className="text-sm text-gray-500">
                        #{order.id} • {formatTime(order.orderTime)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm text-gray-700">{formatAddress(order.deliveryAddress || order.address)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm text-gray-700">{order.user?.fullName || 'Customer'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="text-sm text-gray-700">{order.items?.length || 0} items</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      ₹{order.totalAmount?.toFixed(2) || '0.00'}
                    </div>
                    
                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={acceptingOrder === order.id || loading}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        acceptingOrder === order.id
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      }`}
                    >
                      {acceptingOrder === order.id ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Accepting...</span>
                        </div>
                      ) : (
                        'Accept Order'
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Order Items Preview */}
                {order.items && order.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Items:</span>
                      <div className="flex space-x-1">
                        {order.items.slice(0, 3).map((item, index) => (
                          <span key={index} className="bg-gray-100 px-2 py-1 rounded">
                            {item.product?.name || 'Item'} x{item.quantity}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-gray-400">+{order.items.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableOrders;