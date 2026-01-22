import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { orderService } from '../../api/orderService';
import { authService } from '../../api/authService';
import OrderTable from './OrderTable';
import OrderModal from './OrderModal';
import OrderFilters from './OrderFilters';
import OrderStats from './OrderStats';
import LoadingSpinner from '../common/LoadingSpinner';
import AdminHeader from '../common/AdminHeader';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminInfo, setAdminInfo] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'orderTime',
    sortOrder: 'desc'
  });

  // Get current user info on component mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setAdminInfo({
        role: user.role,
        pincode: user.pincode,
        name: user.fullName,
        isSuperAdmin: user.role === 'SUPER_ADMIN',
        isRegionalAdmin: user.role === 'ADMIN'
      });
    }
  }, []);

  // Load orders and stats when adminInfo is available
  useEffect(() => {
    if (adminInfo.role) {
      loadOrders();
      loadStats();
    }
  }, [adminInfo]);

  // Apply filters when orders or filters change
  useEffect(() => {
    applyFilters();
  }, [orders, filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      let data;
      
      console.log('Loading orders for admin:', adminInfo);
      console.log('Admin role:', adminInfo.role);
      console.log('Admin pincode:', adminInfo.pincode);
      console.log('Is Super Admin:', adminInfo.isSuperAdmin);
      console.log('Is Regional Admin:', adminInfo.isRegionalAdmin);
      
      // Role-based order loading
      if (adminInfo.isSuperAdmin) {
        console.log('Loading orders for Super Admin - all orders');
        // Super Admin can see all orders from all pincodes
        data = await orderService.getAllOrders();
      } else if (adminInfo.isRegionalAdmin && adminInfo.pincode) {
        console.log('Loading orders for Regional Admin - pincode:', adminInfo.pincode);
        // Regional Admin can only see orders from their assigned pincode
        try {
          data = await orderService.getOrdersByPincode(adminInfo.pincode);
          console.log('Successfully loaded orders for pincode:', adminInfo.pincode, 'Count:', data?.length || 0);
        } catch (pincodeError) {
          console.error('Error loading orders by pincode, falling back to all orders:', pincodeError);
          // Fallback to all orders and filter client-side
          data = await orderService.getAllOrders();
        }
      } else {
        console.log('Fallback - loading all orders');
        // Fallback - load all orders but will be filtered later
        data = await orderService.getAllOrders();
      }
      
      let orderList = Array.isArray(data) ? data : data.content || [];
      
      // Additional client-side filtering for regional admins as a safety measure
      if (adminInfo.isRegionalAdmin && adminInfo.pincode) {
        orderList = orderList.filter(order => order.pincode === adminInfo.pincode);
      }
      
      // If no orders found for regional admin, show a helpful message
      if (adminInfo.isRegionalAdmin && orderList.length === 0) {
        console.warn(`No orders found for pincode ${adminInfo.pincode}. You may need to create test orders.`);
        toast.info(`No orders found for your region (${adminInfo.pincode}). Orders will appear here once customers place orders in your area.`);
      }
      
      // Sort orders by orderTime (newest first) by default
      orderList.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
      
      console.log('Final order list:', orderList);
      console.log('Order count:', orderList.length);
      
      setOrders(orderList);
    } catch (error) {
      console.error('Error loading orders:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error(`Access denied: ${error.response?.data || 'Insufficient permissions'}`);
      } else if (error.response?.status === 404) {
        toast.error('Orders endpoint not found. Please check the API configuration.');
      } else if (error.response?.status >= 500) {
        toast.error(`Server error: ${error.response?.data || 'Please try again later'}`);
      } else if (error.response?.status >= 400) {
        toast.error(`Request error: ${error.response?.data || error.message}`);
      } else if (error.request) {
        toast.error('Network error: Cannot connect to server. Please check if the backend is running.');
      } else {
        toast.error(`Error: ${error.message || 'Failed to load orders'}`);
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Pass pincode for regional admins, null for super admins
      const pincode = adminInfo.isRegionalAdmin ? adminInfo.pincode : null;
      const analytics = await orderService.getOrderAnalytics(pincode);
      setStats(analytics);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toString().includes(searchTerm) ||
        order.user?.email?.toLowerCase().includes(searchTerm) ||
        order.user?.fullName?.toLowerCase().includes(searchTerm) ||
        order.deliveryAddress?.toLowerCase().includes(searchTerm) ||
        order.pincode?.includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(order => new Date(order.orderTime) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(order => new Date(order.orderTime) <= toDate);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      // Handle date sorting
      if (filters.sortBy === 'orderTime') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle numeric sorting
      if (filters.sortBy === 'totalAmount') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      loadOrders();
      loadStats();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      loadOrders();
      loadStats();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleBulkStatusUpdate = async (orderIds, status) => {
    try {
      await orderService.bulkUpdateStatus(orderIds, status);
      toast.success(`${orderIds.length} orders updated to ${status}`);
      loadOrders();
      loadStats();
    } catch (error) {
      console.error('Error in bulk status update:', error);
      toast.error('Failed to update orders');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        title="Order Management" 
        subtitle={adminInfo.isSuperAdmin 
          ? "Manage orders across all regions" 
          : adminInfo.isRegionalAdmin 
            ? `Managing orders for pincode: ${adminInfo.pincode}` 
            : "Manage customer orders"
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 mb-6">
          <button
            onClick={() => loadOrders()}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats */}
        {stats && <OrderStats stats={stats} adminInfo={adminInfo} />}

        {/* Filters */}
        <OrderFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          adminInfo={adminInfo}
        />

        {/* Orders Table */}
        <OrderTable
          orders={filteredOrders}
          onView={handleViewOrder}
          onUpdateStatus={handleUpdateStatus}
          onCancel={handleCancelOrder}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          adminInfo={adminInfo}
        />

        {/* Order Modal */}
        {showModal && selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setShowModal(false)}
            onUpdateStatus={handleUpdateStatus}
            adminInfo={adminInfo}
          />
        )}
      </div>
    </div>
  );
};

export default OrderManagement;