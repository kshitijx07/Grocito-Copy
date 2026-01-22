import axios from 'axios';

// Simple direct API calls without complex error handling
const API_BASE_URL = 'http://localhost:8080/api';

export const simpleCartService = {
  // Update cart item quantity - simplified version
  updateCart: async (userId, productId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios({
        method: 'put',
        url: `${API_BASE_URL}/cart/update`,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        data: {
          userId,
          productId,
          quantity
        }
      });

      return response.data;
    } catch (error) {
      console.error('Simple cart update error:', error);
      throw new Error('Failed to update cart');
    }
  },

  // Remove item from cart - simplified version
  removeItem: async (userId, productId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios({
        method: 'delete',
        url: `${API_BASE_URL}/cart/remove`,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        data: {
          userId,
          productId
        }
      });

      return response.data;
    } catch (error) {
      console.error('Simple cart remove error:', error);
      throw new Error('Failed to remove item');
    }
  },

  // Get cart items - simplified version
  getCart: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_BASE_URL}/cart/${userId}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Simple get cart error:', error);
      return [];
    }
  }
};