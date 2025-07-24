import { apiRequest } from './api';

const ordersAPI = {
  // Get available orders for partner's pincode
  getAvailableOrders: async () => {
    return await apiRequest('/delivery-partner-dashboard/available-orders', 'GET');
  },

  // Get partner's assigned orders
  getMyOrders: async () => {
    return await apiRequest('/delivery-partner-dashboard/my-orders', 'GET');
  },

  // Accept an available order
  acceptOrder: async (orderId) => {
    return await apiRequest(`/delivery-partner-dashboard/accept-order/${orderId}`, 'POST');
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    return await apiRequest(`/delivery-partner-dashboard/update-order-status/${orderId}`, 'PUT', {
      status
    });
  },

  // Get completed orders (delivered/cancelled)
  getCompletedOrders: async () => {
    return await apiRequest('/delivery-partner-dashboard/completed-orders', 'GET');
  }
};

export default ordersAPI;