import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { enhancedOrderService } from '../api/enhancedOrderService';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
import Header from './Header';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get any state passed from checkout
  const { newOrderId, justPlaced } = location.state || {};

  // Fetch orders function with proper error handling
  const fetchOrders = useCallback(async (userId, showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      console.log('Fetching orders for user:', userId);
      
      // Use enhanced order service for better database integration
      const userOrders = await enhancedOrderService.refreshUserOrders(userId);
      console.log('Orders received from database:', userOrders);

      // Sort orders by date (newest first)
      const sortedOrders = userOrders.sort((a, b) => {
        return new Date(b.orderTime) - new Date(a.orderTime);
      });

      setOrders(sortedOrders);
      
      // Show success message if this was a refresh
      if (showRefreshing && sortedOrders.length > 0) {
        toast.success('Orders refreshed successfully!');
      }
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Failed to load orders');
      
      // Only show toast error if it's not a simple "no orders" case
      if (!error.message?.includes('404')) {
        toast.error(error.message || 'Failed to load orders');
      }
      
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.log('No valid user found, redirecting to login');
      toast.warning('Please login to view your orders');
      navigate('/login');
      return;
    }
    
    setUser(currentUser);
    fetchOrders(currentUser.id);

    // Show toast if coming from checkout with a new order
    if (justPlaced && newOrderId) {
      toast.success('Order placed successfully! 🎉', {
        position: "bottom-right",
        autoClose: 5000,
      });
      
      // Refresh orders after a short delay to ensure the new order is in the database
      setTimeout(() => {
        fetchOrders(currentUser.id, true);
      }, 2000);
    }
  }, [navigate, newOrderId, justPlaced, fetchOrders]);

  // Auto-refresh orders every 30 seconds to get real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const autoRefreshInterval = setInterval(() => {
      console.log('Auto-refreshing orders...');
      fetchOrders(user.id, false); // Silent refresh
    }, 30000); // 30 seconds

    return () => clearInterval(autoRefreshInterval);
  }, [user?.id, fetchOrders]);

  // Manual refresh function
  const handleRefresh = () => {
    if (user?.id) {
      fetchOrders(user.id, true);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-soft animate-pulse">
            <span className="text-4xl">📦</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Loading Your Orders...
          </h2>
          <p className="text-gray-600">Please wait while we fetch your order history from the database</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showOrders={false} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="section-header mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-soft">
                <span className="text-3xl">📦</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Your Orders
                </h1>
                <p className="text-gray-600 mt-1">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'} • Real-time updates from database
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-secondary flex items-center space-x-2"
                title="Refresh orders from database"
              >
                <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <button
                onClick={() => navigate('/products')}
                className="btn-primary flex items-center space-x-2"
              >
                <span>🛍️</span>
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="card mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <div className="card-body">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">⚠️</span>
                </div>
                <div>
                  <h3 className="font-bold text-red-900">Error Loading Orders</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📦</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h3>
              <p className="text-gray-600 text-lg mb-6">
                You haven't placed any orders yet. Start shopping to see your orders here!
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/products')}
                  className="btn-primary"
                >
                  🛍️ Start Shopping
                </button>
                <button
                  onClick={() => navigate('/payment-history')}
                  className="btn-secondary"
                >
                  💳 Payment History
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const isNewOrder = newOrderId && order.id === newOrderId;
              
              return (
                <div 
                  key={order.id} 
                  className={`order-card ${isNewOrder ? 'ring-2 ring-green-500' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                        <span className="text-xl">📦</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-bold text-xl text-gray-900">Order #{order.id}</h3>
                          <span className={`px-3 py-1 rounded-xl text-sm font-semibold ${getStatusColor(order.status)} border`}>
                            {formatStatus(order.status)}
                          </span>
                          {isNewOrder && (
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-xl text-sm font-semibold animate-pulse">
                              🎉 New!
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          Placed on {new Date(order.orderTime || order.orderDate).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                      <p className="text-sm text-green-700 font-medium">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center space-x-2">
                      <span>🛍️</span>
                      <span>Order Items ({order.items?.length || order.orderItems?.length || 0})</span>
                    </h4>
                    <div className="space-y-4">
                      {(order.items || order.orderItems || []).length > 0 ? (order.items || order.orderItems).map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                          <img
                            src={item.product?.imageUrl || "https://via.placeholder.com/60"}
                            alt={item.product?.name || 'Product'}
                            className="w-16 h-16 object-cover rounded-xl mr-4 shadow-soft"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/60";
                            }}
                          />
                          <div className="flex-grow">
                            <h5 className="font-bold text-gray-900">{item.product?.name || 'Product'}</h5>
                            <p className="text-sm text-gray-600 font-medium">
                              Quantity: {item.quantity} × ₹{item.price || item.product?.price || '0.00'}
                            </p>
                            {item.product?.category && (
                              <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-lg">
                                {item.product.category}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              ₹{((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                          <span className="text-4xl mb-2 block">📦</span>
                          <p className="text-gray-500 font-medium">No items available for this order</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address & Payment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">📍</span>
                        <h5 className="font-bold text-blue-900">Delivery Address</h5>
                      </div>
                      <p className="text-blue-800 font-medium">{order.deliveryAddress || 'Not available'}</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">💳</span>
                        <h5 className="font-bold text-green-900">Payment Method</h5>
                      </div>
                      <p className="text-green-800 font-medium">
                        {order.paymentMethod || 'COD'}
                        {order.paymentInfo?.paymentId && (
                          <span className="block text-sm text-green-600">
                            ID: {order.paymentInfo.paymentId}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;