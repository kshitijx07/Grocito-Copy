import api from './config';

export const orderService = {
  // Get all orders with role-based filtering
  getAllOrders: async (params = {}) => {
    const { page = 0, size = 10, sortBy = 'orderTime', status, pincode, search, dateFrom, dateTo } = params;
    let url = `/orders?page=${page}&size=${size}&sortBy=${sortBy}`;
    
    if (status) url += `&status=${status}`;
    if (pincode) url += `&pincode=${pincode}`;
    if (search) url += `&search=${search}`;
    if (dateFrom) url += `&dateFrom=${dateFrom}`;
    if (dateTo) url += `&dateTo=${dateTo}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get orders by pincode (for regional admins)
  getOrdersByPincode: async (pincode, params = {}) => {
    const { page = 0, size = 10, sortBy = 'orderTime' } = params;
    const response = await api.get(`/orders/pincode/${pincode}?page=${page}&size=${size}&sortBy=${sortBy}`);
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Get order summary
  getOrderSummary: async (id) => {
    const response = await api.get(`/orders/${id}/summary`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },

  // Get orders by user
  getOrdersByUser: async (userId) => {
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  },

  // Get order analytics (role-based)
  getOrderAnalytics: async (pincode = null, dateRange = null) => {
    let url = '/orders/analytics';
    const params = new URLSearchParams();
    
    if (pincode) params.append('pincode', pincode);
    if (dateRange?.from) params.append('dateFrom', dateRange.from);
    if (dateRange?.to) params.append('dateTo', dateRange.to);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      // Fallback: calculate analytics from orders list
      const orders = await orderService.getAllOrders();
      const orderList = Array.isArray(orders) ? orders : orders.content || [];
      
      // Filter by pincode if specified
      const filteredOrders = pincode 
        ? orderList.filter(order => order.pincode === pincode)
        : orderList;
      
      // Filter by date range if specified
      let dateFilteredOrders = filteredOrders;
      if (dateRange?.from || dateRange?.to) {
        dateFilteredOrders = filteredOrders.filter(order => {
          const orderDate = new Date(order.orderTime);
          const fromDate = dateRange.from ? new Date(dateRange.from) : null;
          const toDate = dateRange.to ? new Date(dateRange.to) : null;
          
          if (fromDate && orderDate < fromDate) return false;
          if (toDate && orderDate > toDate) return false;
          return true;
        });
      }
      
      return calculateOrderAnalytics(dateFilteredOrders, pincode);
    }
  },

  // Get orders by status
  getOrdersByStatus: async (status, pincode = null) => {
    let url = `/orders/status/${status}`;
    if (pincode) url += `?pincode=${pincode}`;
    
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      // Fallback: filter from all orders
      const orders = await orderService.getAllOrders();
      const orderList = Array.isArray(orders) ? orders : orders.content || [];
      
      return orderList.filter(order => {
        const statusMatch = order.status === status;
        const pincodeMatch = !pincode || order.pincode === pincode;
        return statusMatch && pincodeMatch;
      });
    }
  },

  // Bulk update order status
  bulkUpdateStatus: async (orderIds, status) => {
    const response = await api.patch('/orders/bulk-status-update', {
      orderIds,
      status
    });
    return response.data;
  },

  // Get delivery performance metrics
  getDeliveryMetrics: async (pincode = null, dateRange = null) => {
    let url = '/orders/delivery-metrics';
    const params = new URLSearchParams();
    
    if (pincode) params.append('pincode', pincode);
    if (dateRange?.from) params.append('dateFrom', dateRange.from);
    if (dateRange?.to) params.append('dateTo', dateRange.to);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      // Fallback: calculate from orders
      const orders = await orderService.getAllOrders();
      const orderList = Array.isArray(orders) ? orders : orders.content || [];
      
      return calculateDeliveryMetrics(orderList, pincode, dateRange);
    }
  },

  // Search orders
  searchOrders: async (query, pincode = null) => {
    let url = `/orders/search?q=${encodeURIComponent(query)}`;
    if (pincode) url += `&pincode=${pincode}`;
    
    const response = await api.get(url);
    return response.data;
  }
};

// Helper function to calculate order analytics
const calculateOrderAnalytics = (orders, pincode = null) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const analytics = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length : 0,
    
    // Status distribution
    statusDistribution: orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {}),
    
    // Time-based metrics
    todayOrders: orders.filter(order => new Date(order.orderTime) >= today).length,
    weekOrders: orders.filter(order => new Date(order.orderTime) >= thisWeek).length,
    monthOrders: orders.filter(order => new Date(order.orderTime) >= thisMonth).length,
    
    // Revenue metrics
    todayRevenue: orders
      .filter(order => new Date(order.orderTime) >= today)
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    weekRevenue: orders
      .filter(order => new Date(order.orderTime) >= thisWeek)
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    monthRevenue: orders
      .filter(order => new Date(order.orderTime) >= thisMonth)
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    
    // Pincode info
    pincode: pincode || 'All Regions',
    
    // Order trends (last 7 days)
    dailyTrends: generateDailyTrends(orders, 7)
  };
  
  return analytics;
};

// Helper function to calculate delivery metrics
const calculateDeliveryMetrics = (orders, pincode = null, dateRange = null) => {
  let filteredOrders = orders;
  
  if (pincode) {
    filteredOrders = filteredOrders.filter(order => order.pincode === pincode);
  }
  
  if (dateRange) {
    filteredOrders = filteredOrders.filter(order => {
      const orderDate = new Date(order.orderTime);
      const fromDate = dateRange.from ? new Date(dateRange.from) : null;
      const toDate = dateRange.to ? new Date(dateRange.to) : null;
      
      if (fromDate && orderDate < fromDate) return false;
      if (toDate && orderDate > toDate) return false;
      return true;
    });
  }
  
  const deliveredOrders = filteredOrders.filter(order => order.status === 'DELIVERED');
  const cancelledOrders = filteredOrders.filter(order => order.status === 'CANCELLED');
  
  return {
    totalOrders: filteredOrders.length,
    deliveredOrders: deliveredOrders.length,
    cancelledOrders: cancelledOrders.length,
    deliveryRate: filteredOrders.length > 0 ? (deliveredOrders.length / filteredOrders.length) * 100 : 0,
    cancellationRate: filteredOrders.length > 0 ? (cancelledOrders.length / filteredOrders.length) * 100 : 0,
    averageDeliveryValue: deliveredOrders.length > 0 
      ? deliveredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / deliveredOrders.length 
      : 0
  };
};

// Helper function to generate daily trends
const generateDailyTrends = (orders, days) => {
  const trends = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + (24 * 60 * 60 * 1000));
    
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.orderTime);
      return orderDate >= dayStart && orderDate < dayEnd;
    });
    
    trends.push({
      date: dayStart.toISOString().split('T')[0],
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    });
  }
  
  return trends;
};