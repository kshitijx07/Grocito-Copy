import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ordersAPI from '../../services/ordersAPI';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    search: ''
  });
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Load orders
  const loadOrders = async () => {
    try {
      const [activeOrders, completedOrders] = await Promise.all([
        ordersAPI.getMyOrders(),
        ordersAPI.getCompletedOrders() // We'll need to add this endpoint
      ]);
      
      const allOrders = [...activeOrders, ...completedOrders].sort((a, b) => 
        new Date(b.orderTime) - new Date(a.orderTime)
      );
      
      setOrders(allOrders);
      applyFilters(allOrders, filters);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to orders
  const applyFilters = (ordersList, currentFilters) => {
    let filtered = [...ordersList];

    // Status filter
    if (currentFilters.status !== 'all') {
      filtered = filtered.filter(order => order.status === currentFilters.status);
    }

    // Date range filter
    const now = new Date();
    if (currentFilters.dateRange !== 'all') {
      const filterDate = new Date();
      switch (currentFilters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      filtered = filtered.filter(order => new Date(order.orderTime) >= filterDate);
    }

    // Search filter
    if (currentFilters.search.trim()) {
      const searchTerm = currentFilters.search.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.deliveryAddress.toLowerCase().includes(searchTerm) ||
        order.user?.fullName?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    applyFilters(orders, newFilters);
  };

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      
      const statusMessages = {
        'PICKED_UP': 'Order marked as picked up',
        'OUT_FOR_DELIVERY': 'Order is now out for delivery',
        'DELIVERED': 'Order delivered successfully!',
        'CANCELLED': 'Order cancelled'
      };
      
      toast.success(statusMessages[newStatus] || 'Order status updated');
      await loadOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Start real-time updates
  const startRealTimeUpdates = () => {
    const interval = setInterval(loadOrders, 30000); // Update every 30 seconds
    setRefreshInterval(interval);
  };

  // Initialize
  useEffect(() => {
    loadOrders();
    startRealTimeUpdates();
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

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
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextAction = (status) => {
    switch (status) {
      case 'ASSIGNED':
        return { action: 'PICKED_UP', label: 'Mark as Picked Up', color: 'bg-yellow-600' };
      case 'PICKED_UP':
        return { action: 'OUT_FOR_DELIVERY', label: 'Start Delivery', color: 'bg-purple-600' };
      case 'OUT_FOR_DELIVERY':
        return { action: 'DELIVERED', label: 'Mark as Delivered', color: 'bg-green-600' };
      default:
        return null;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">Manage your delivery orders and track earnings</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Order ID, address, customer..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={loadOrders}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Orders ({filteredOrders.length})
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Updates</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h4>
                <p className="text-gray-600">No orders match your current filters</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const nextAction = getNextAction(order.status);
                
                return (
                  <div key={order.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium text-gray-900">
                            Order #{order.id}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatTime(order.orderTime)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Customer:</span> {order.user?.fullName || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Address:</span> {order.deliveryAddress}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Items:</span> {order.items?.length || 0} items
                            </p>
                          </div>
                          <div>
                            {(() => {
                              // Calculate correct values based on delivery policy
                              const subtotal = order.items?.reduce((total, item) => {
                                const itemPrice = item.price || item.product?.price || 0;
                                return total + (itemPrice * item.quantity);
                              }, 0) || 0;
                              
                              const deliveryFee = subtotal >= 199 ? 0 : 40;
                              const partnerEarning = subtotal >= 199 ? 25 : 30;
                              
                              return (
                                <>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Order Amount:</span> ₹{subtotal.toFixed(2)}
                                  </p>
                                  <p className="text-sm text-green-600 font-medium">
                                    <span className="font-medium">Your Earning:</span> ₹{partnerEarning.toFixed(2)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Delivery Fee:</span> {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {order.assignedAt && (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Assigned: {formatTime(order.assignedAt)}</span>
                            </div>
                          )}
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

                      {/* Action Button */}
                      <div className="ml-6">
                        {nextAction && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, nextAction.action)}
                            className={`px-4 py-2 text-white text-sm font-medium rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 ${nextAction.color}`}
                          >
                            {nextAction.label}
                          </button>
                        )}
                        
                        {order.status === 'DELIVERED' && (
                          <div className="text-right">
                            {(() => {
                              // Calculate correct partner earning based on delivery policy
                              const subtotal = order.items?.reduce((total, item) => {
                                const itemPrice = item.price || item.product?.price || 0;
                                return total + (itemPrice * item.quantity);
                              }, 0) || 0;
                              
                              const partnerEarning = subtotal >= 199 ? 25 : 30;
                              
                              return (
                                <>
                                  <div className="text-lg font-semibold text-green-600">
                                    +₹{partnerEarning.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-500">Earned</div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;