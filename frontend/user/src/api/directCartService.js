import axios from 'axios';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080') + '/api';

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const directCartService = {
  // Add item to cart - exactly like Postman
  addToCart: async (userId, productId, quantity) => {
    try {
      console.log('Adding to cart:', { userId, productId, quantity });
      const response = await axios.post(`${API_BASE_URL}/cart/add`, {
        userId: parseInt(userId),
        productId: parseInt(productId),
        quantity: parseInt(quantity)
      }, {
        headers: getAuthHeaders()
      });
      console.log('Add to cart response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Add to cart error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get cart items - exactly like Postman
  getCartItems: async (userId) => {
    try {
      console.log('Getting cart for user:', userId);
      const response = await axios.get(`${API_BASE_URL}/cart/${userId}`, {
        headers: getAuthHeaders()
      });
      console.log('Get cart response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Get cart error:', error.response?.data || error.message);
      return [];
    }
  },

  // Update cart item - exactly like Postman
  updateCartItem: async (userId, productId, quantity) => {
    try {
      console.log('Updating cart item:', { userId, productId, quantity });
      const response = await axios.put(`${API_BASE_URL}/cart/update`, {
        userId: parseInt(userId),
        productId: parseInt(productId),
        quantity: parseInt(quantity)
      }, {
        headers: getAuthHeaders()
      });
      console.log('Update cart response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update cart error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Remove item from cart - exactly like Postman
  removeFromCart: async (userId, productId) => {
    try {
      console.log('Removing from cart:', { userId, productId });
      const response = await axios.delete(`${API_BASE_URL}/cart/remove`, {
        headers: getAuthHeaders(),
        data: {
          userId: parseInt(userId),
          productId: parseInt(productId)
        }
      });
      console.log('Remove from cart response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Remove from cart error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Clear cart - exactly like Postman
  clearCart: async (userId) => {
    try {
      console.log('Clearing cart for user:', userId);
      const response = await axios.delete(`${API_BASE_URL}/cart/${userId}/clear`, {
        headers: getAuthHeaders()
      });
      console.log('Clear cart response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Clear cart error:', error.response?.data || error.message);
      throw error;
    }
  }
};