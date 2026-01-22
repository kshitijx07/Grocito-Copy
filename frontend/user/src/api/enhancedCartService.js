import api from './config';

// Mock products for development/testing - these will be fetched from the backend in production
const mockProducts = [
  // Products will be fetched from the backend
];

// Mock cart data for development/testing - empty by default
// Using localStorage to persist cart data between page refreshes
const getStoredCart = () => {
  try {
    const storedCart = localStorage.getItem('enhancedCartItems');
    return storedCart ? JSON.parse(storedCart) : {};
  } catch (error) {
    console.error('Error parsing stored cart:', error);
    return {};
  }
};

// Initialize cart from localStorage or empty object
let mockCartItems = getStoredCart();

// Function to save cart to localStorage
const saveCartToStorage = () => {
  try {
    localStorage.setItem('enhancedCartItems', JSON.stringify(mockCartItems));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

// Helper to check if backend is available
const isBackendAvailable = async () => {
  try {
    // For testing purposes, we'll always use mock data
    // In production, you would uncomment the code below
    // await api.get('/health-check');
    // return true;
    console.warn('Using mock data for cart (test mode)');
    return false;
  } catch (error) {
    console.warn('Backend appears to be unavailable, using mock data for cart');
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

// Debug function to log the current state of the mock cart
const logCartState = (userId) => {
  console.log('Current cart state for user', userId, ':', mockCartItems[userId] || []);
};

export const enhancedCartService = {
  // Debug function to get the current state of the mock cart
  getCartState: (userId) => {
    return mockCartItems[userId] || [];
  },
  
  // Reset cart (for testing purposes)
  resetCart: (userId) => {
    console.log(`Resetting cart for userId=${userId}`);
    mockCartItems[userId] = [];
    saveCartToStorage();
    logCartState(userId);
    return { success: true, message: "Cart reset successfully" };
  },
  // Add item to cart
  addToCart: async (userId, productId, quantity = 1, productData = null) => {
    try {
      console.log(`Adding item to cart: userId=${userId}, productId=${productId}, quantity=${quantity}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for addToCart');
        
        // Initialize user's cart if it doesn't exist
        if (!mockCartItems[userId]) {
          mockCartItems[userId] = [];
        }
        
        // Use the provided product data or create a generic product
        let product;
        
        if (productData) {
          product = productData;
        } else {
          // Fallback to a generic product if no product data is provided
          product = {
            id: productId,
            name: `Product ${productId}`,
            price: 50.00, // Default price
            category: "General",
            imageUrl: "https://via.placeholder.com/150",
            stock: 100 // Default stock
          };
        }
        
        // In mock mode, we'll assume there's always enough stock
        // In real mode, the backend will handle stock validation
        
        // Check if product already exists in cart
        const existingItemIndex = mockCartItems[userId].findIndex(item => item.product.id === productId);
        
        if (existingItemIndex !== -1) {
          // Update quantity if product already exists
          const existingItem = mockCartItems[userId][existingItemIndex];
          const newQuantity = existingItem.quantity + quantity;
          
          // Check if new quantity exceeds stock
          if (product.stock < newQuantity) {
            throw new Error(`Not enough stock available for ${product.name}. Available: ${product.stock}, Requested: ${newQuantity}`);
          }
          
          mockCartItems[userId][existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity
          };
          
          // Save to localStorage
          saveCartToStorage();
        } else {
          // Add new item to cart
          mockCartItems[userId].push({
            id: Date.now(),
            product: product,
            quantity: quantity
          });
          
          // Save to localStorage
          saveCartToStorage();
        }
        
        return {
          success: true,
          message: "Item added to cart",
          cartItems: mockCartItems[userId]
        };
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

  // Get cart items
  getCartItems: async (userId) => {
    try {
      console.log(`Fetching cart items for userId=${userId}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for getCartItems');
        return mockCartItems[userId] || [];
      }
      
      const response = await api.get(`/cart/${userId}`);
      console.log('Cart items response:', response.data);
      return response.data;
    } catch (error) {
      console.warn('Error fetching cart items, falling back to mock data');
      return mockCartItems[userId] || [];
    }
  },

  // Update cart item quantity
  updateCartItem: async (userId, productId, quantity) => {
    try {
      console.log(`Updating cart item: userId=${userId}, productId=${productId}, quantity=${quantity}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for updateCartItem');
        
        // Initialize user's cart if it doesn't exist
        if (!mockCartItems[userId]) {
          mockCartItems[userId] = [];
        }
        
        // Find the item in the cart
        const existingItem = mockCartItems[userId].find(item => item.product.id === productId);
        if (!existingItem) {
          throw new Error('Item not found in cart');
        }
        
        // Use the product from the existing cart item
        const product = existingItem.product;
        
        // In mock mode, we'll assume there's always enough stock
        // In real mode, the backend will handle stock validation
        
        // Find item in cart
        const existingItemIndex = mockCartItems[userId].findIndex(item => item.product.id === productId);
        
        if (existingItemIndex === -1) {
          throw new Error('Item not found in cart');
        }
        
        // Update quantity
        mockCartItems[userId][existingItemIndex] = {
          ...mockCartItems[userId][existingItemIndex],
          quantity: quantity
        };
        
        return {
          success: true,
          message: "Cart updated successfully",
          cartItem: mockCartItems[userId][existingItemIndex]
        };
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
        
        // Initialize user's cart if it doesn't exist
        if (!mockCartItems[userId]) {
          mockCartItems[userId] = [];
        }
        
        // Remove item from cart
        mockCartItems[userId] = mockCartItems[userId].filter(item => item.product.id !== productId);
        
        // Save to localStorage
        saveCartToStorage();
        
        return {
          success: true,
          message: "Item removed from cart"
        };
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

  // Clear cart
  clearCart: async (userId) => {
    try {
      console.log(`Clearing cart for userId=${userId}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for clearCart');
        
        // Clear user's cart
        mockCartItems[userId] = [];
        
        // Save to localStorage
        saveCartToStorage();
        
        return {
          success: true,
          message: "Cart cleared successfully"
        };
      }
      
      const response = await api.delete(`/cart/${userId}/clear`);
      console.log('Clear cart response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to clear cart');
    }
  },
  
  // Get cart summary
  getCartSummary: async (userId) => {
    try {
      console.log(`Fetching cart summary for userId=${userId}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for getCartSummary');
        
        // Initialize user's cart if it doesn't exist
        if (!mockCartItems[userId]) {
          mockCartItems[userId] = [];
        }
        
        // Calculate totals
        const items = mockCartItems[userId];
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        
        return {
          userId,
          items: items,
          totalItems,
          totalAmount: subtotal
        };
      }
      
      const response = await api.get(`/cart/${userId}/summary`);
      console.log('Cart summary response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch cart summary');
    }
  }
};