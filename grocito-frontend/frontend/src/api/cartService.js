import api from './config';

// Mock cart data for fallback
const mockCartItems = [
  {
    id: 1,
    userId: 1,
    productId: 1,
    quantity: 2,
    product: {
      id: 1,
      name: "Fresh Bananas",
      price: 40,
      image: "/api/placeholder/150/150",
      category: "Fruits"
    }
  },
  {
    id: 2,
    userId: 1,
    productId: 2,
    quantity: 1,
    product: {
      id: 2,
      name: "Organic Milk",
      price: 60,
      image: "/api/placeholder/150/150",
      category: "Dairy"
    }
  }
];

// Check if backend is available
const isBackendAvailable = async () => {
  try {
    const response = await api.get('/health', { timeout: 3000 });
    return response.status === 200;
  } catch (error) {
    console.warn('Backend not available, using mock data');
    return false;
  }
};

// Helper to handle API errors with better messages
const handleApiError = (error, defaultMessage) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    
    const errorMessage = 
      error.response.data?.message || 
      error.response.data?.error || 
      error.response.data || 
      `${defaultMessage} (Status: ${error.response.status})`;
    
    throw new Error(errorMessage);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    throw new Error('Server did not respond. Please check your internet connection or try again later.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request error:', error.message);
    throw new Error(`${defaultMessage}: ${error.message}`);
  }
};

export const cartService = {
  // Add item to cart
  addToCart: async (userId, productId, quantity = 1) => {
    try {
      console.log(`Adding item to cart: userId=${userId}, productId=${productId}, quantity=${quantity}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for addToCart');
        // Simulate successful addition
        return { success: true, message: "Item added to cart (mock)" };
      }
      
      const response = await api.post('/cart/add', {
        userId,
        productId,
        quantity
      });
      
      console.log('Add to cart response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to add item to cart');
    }
  },

  // Get cart items for user
  getCartItems: async (userId) => {
    try {
      console.log(`Fetching cart items for userId=${userId}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for getCartItems');
        return mockCartItems;
      }
      
      const response = await api.get(`/cart/${userId}`);
      console.log('Cart items response:', response.data);
      return response.data;
    } catch (error) {
      console.warn('Error fetching cart items, falling back to mock data');
      return mockCartItems;
    }
  },

  // Get cart summary with product details
  getCartSummary: async (userId) => {
    try {
      console.log(`Fetching cart summary for userId=${userId}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for getCartSummary');
        const total = mockCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        return {
          totalItems: mockCartItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: total,
          total: total,
          items: mockCartItems.length
        };
      }
      
      const response = await api.get(`/cart/${userId}/summary`);
      console.log('Cart summary response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch cart summary');
    }
  },

  // Get cart total
  getCartTotal: async (userId) => {
    try {
      console.log(`Fetching cart total for userId=${userId}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for getCartTotal');
        return mockCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      }
      
      const response = await api.get(`/cart/${userId}/total`);
      console.log('Cart total response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to calculate cart total');
    }
  },

  // Validate cart items
  validateCartItems: async (userId) => {
    try {
      console.log(`Validating cart items for userId=${userId}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for validateCartItems');
        return { valid: true, message: "All items are available (mock)" };
      }
      
      const response = await api.get(`/cart/${userId}/validate`);
      console.log('Cart validation response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to validate cart');
    }
  },

  // Update cart item quantity
  updateCartItem: async (userId, productId, quantity) => {
    try {
      console.log(`Updating cart item: userId=${userId}, productId=${productId}, quantity=${quantity}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for updateCartItem');
        return { success: true, message: "Cart updated successfully (mock)" };
      }
      
      const response = await api.put('/cart/update', {
        userId,
        productId,
        quantity
      });
      
      console.log('Update cart response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to update cart item');
    }
  },

  // Remove item from cart
  removeFromCart: async (userId, productId) => {
    try {
      console.log(`Removing item from cart: userId=${userId}, productId=${productId}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for removeFromCart');
        return { success: true, message: "Item removed from cart (mock)" };
      }
      
      const response = await api.delete('/cart/remove', {
        data: { userId, productId }
      });
      
      console.log('Remove from cart response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to remove item from cart');
    }
  },

  // Clear entire cart
  clearCart: async (userId) => {
    try {
      console.log(`Clearing cart for userId=${userId}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for clearCart');
        return { success: true, message: "Cart cleared successfully (mock)" };
      }
      
      const response = await api.delete(`/cart/${userId}/clear`);
      console.log('Clear cart response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to clear cart');
    }
  }
};