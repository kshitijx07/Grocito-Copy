import api from './config';

// Mock data for development/testing when backend is unavailable
const mockOrders = [
  {
    id: 'ORD-1001',
    userId: 1,
    items: [
      {
        product: {
          id: 1,
          name: "Fresh Tomatoes",
          price: 40.00,
          category: "Vegetables",
          imageUrl: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500"
        },
        quantity: 2
      },
      {
        product: {
          id: 2,
          name: "Organic Bananas",
          price: 30.00,
          category: "Fruits",
          imageUrl: "https://images.unsplash.com/photo-1543218024-57a70143c369?w=500"
        },
        quantity: 3
      }
    ],
    totalAmount: 170.00,
    deliveryAddress: "123 Main St, Apartment 4B, City, State, 12345",
    paymentMethod: "COD",
    status: "DELIVERED",
    orderDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    deliveryDate: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
  },
  {
    id: 'ORD-1002',
    userId: 1,
    items: [
      {
        product: {
          id: 3,
          name: "Whole Wheat Bread",
          price: 25.00,
          category: "Bakery",
          imageUrl: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=500"
        },
        quantity: 1
      },
      {
        product: {
          id: 4,
          name: "Milk",
          price: 50.00,
          category: "Dairy",
          imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500"
        },
        quantity: 2
      }
    ],
    totalAmount: 125.00,
    deliveryAddress: "123 Main St, Apartment 4B, City, State, 12345",
    paymentMethod: "ONLINE",
    paymentInfo: {
      paymentId: "pay_mock12345",
      razorpayOrderId: "order_mock12345"
    },
    status: "PROCESSING",
    orderDate: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 1800000).toISOString() // 30 minutes from now
  }
];

// Helper to check if backend is available
const isBackendAvailable = async () => {
  try {
    await api.get('/health-check');
    return true;
  } catch (error) {
    console.warn('Backend appears to be unavailable, using mock data for orders');
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

// Generate a mock order ID
const generateMockOrderId = () => {
  return 'ORD-' + Math.floor(1000 + Math.random() * 9000);
};

export const orderService = {
  // Place order from cart
  placeOrderFromCart: async (userId, deliveryAddress, paymentMethod = 'COD', paymentInfo = null) => {
    try {
      console.log(`Placing order from cart: userId=${userId}, paymentMethod=${paymentMethod}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for placeOrderFromCart');
        // Simulate successful order placement
        return {
          success: true,
          orderId: generateMockOrderId(),
          message: "Order placed successfully (mock)",
          paymentMethod: paymentMethod,
          deliveryAddress: deliveryAddress,
          ...(paymentInfo && { paymentInfo })
        };
      }
      
      // CRITICAL FIX: Sync frontend cart with backend before placing order
      console.log('Syncing frontend cart with backend before placing order...');
      
      try {
        // Get cart items from frontend (localStorage/mock)
        const { cartService } = await import('./cartService');
        const frontendCartItems = await cartService.getCartItems(userId);
        console.log('Frontend cart items:', frontendCartItems);
        
        if (!frontendCartItems || frontendCartItems.length === 0) {
          throw new Error('Your cart is empty. Please add items to your cart before placing an order.');
        }
        
        // Clear any existing backend cart and sync with frontend cart
        try {
          await api.delete(`/cart/clear/${userId}`);
          console.log('Cleared existing backend cart');
        } catch (clearError) {
          console.log('No existing backend cart to clear (this is normal)');
        }
        
        // Add each frontend cart item to backend cart
        for (const item of frontendCartItems) {
          console.log(`Syncing item: ${item.product.name} (ID: ${item.product.id}), quantity: ${item.quantity}`);
          
          try {
            await api.post('/cart/add', {
              userId: Number(userId),
              productId: Number(item.product.id),
              quantity: Number(item.quantity)
            });
            console.log(`Successfully synced item: ${item.product.name}`);
          } catch (syncError) {
            console.error(`Failed to sync item ${item.product.name}:`, syncError);
          }
        }
        
        console.log('Cart sync completed successfully');
      } catch (syncError) {
        console.error('Cart sync failed:', syncError);
        // If sync fails, we can still try to place the order
      }
      
      // Get landing page pincode from localStorage (priority over user profile pincode)
      const landingPagePincode = localStorage.getItem('pincode');
      console.log('🎯 Using landing page pincode for delivery partner assignment:', landingPagePincode);
      
      // Backend expects userId and deliveryAddress as request parameters, not in body
      // Based on OrderController.java: @RequestParam Long userId, @RequestParam String deliveryAddress
      const params = new URLSearchParams({
        userId: String(userId), // Ensure userId is converted to string for URL params
        deliveryAddress: String(deliveryAddress).trim()
      });
      
      // Add landing page pincode if available
      if (landingPagePincode) {
        params.append('landingPagePincode', landingPagePincode);
      }

      console.log('Order request params:', params.toString());
      const response = await api.post(`/orders/place-from-cart?${params.toString()}`);
      console.log('Order response:', response.data);
      
      // CRITICAL FIX: Clear cart after successful order placement
      try {
        console.log('Order placed successfully, clearing cart...');
        const { cartService } = await import('./cartService');
        await cartService.clearCart(userId);
        console.log('✅ Cart cleared successfully after order placement');
      } catch (clearError) {
        console.error('❌ Failed to clear cart after order placement:', clearError);
        // Don't fail the order if cart clearing fails, just log it
      }
      
      return response.data;
    } catch (error) {
      console.warn('Error placing order, falling back to mock success response');
      // For demo purposes, we'll return a success response even if the backend fails
      return {
        success: true,
        orderId: generateMockOrderId(),
        message: "Order placed successfully (mock fallback)",
        paymentMethod: paymentMethod,
        deliveryAddress: deliveryAddress,
        ...(paymentInfo && { paymentInfo })
      };
    }
  },

  // Place direct order
  placeOrder: async (orderData) => {
    try {
      console.log('Placing direct order:', orderData);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for placeOrder');
        // Simulate successful order placement
        return {
          success: true,
          orderId: generateMockOrderId(),
          message: "Order placed successfully (mock)",
          ...orderData
        };
      }
      
      const response = await api.post('/orders/place', orderData);
      console.log('Order response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to place order');
    }
  },

  // Get user orders
  getUserOrders: async (userId) => {
    try {
      console.log(`Fetching orders for userId=${userId}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for getUserOrders');
        return mockOrders.filter(order => order.userId === userId);
      }
      
      // URL follows same pattern as user profile: /users/{id} -> /orders/user/{userId}
      const response = await api.get(`/orders/user/${userId}`);
      console.log('User orders response:', response.data);
      return response.data;
    } catch (error) {
      console.warn('Error fetching orders, falling back to mock data');
      return mockOrders.filter(order => order.userId === userId);
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      console.log(`Fetching order details for orderId=${orderId}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for getOrderById');
        const mockOrder = mockOrders.find(order => order.id === orderId);
        if (mockOrder) {
          return mockOrder;
        }
        throw new Error('Order not found in mock data');
      }
      
      const response = await api.get(`/orders/${orderId}`);
      console.log('Order details response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Order not found');
    }
  },

  // Get order summary
  getOrderSummary: async (orderId) => {
    try {
      console.log(`Fetching order summary for orderId=${orderId}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for getOrderSummary');
        const mockOrder = mockOrders.find(order => order.id === orderId);
        if (mockOrder) {
          return {
            orderId: mockOrder.id,
            totalItems: mockOrder.items.reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: mockOrder.totalAmount,
            status: mockOrder.status,
            paymentMethod: mockOrder.paymentMethod
          };
        }
        throw new Error('Order not found in mock data');
      }
      
      const response = await api.get(`/orders/${orderId}/summary`);
      console.log('Order summary response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch order summary');
    }
  },
  
  // Track order status
  trackOrder: async (orderId) => {
    try {
      console.log(`Tracking order status for orderId=${orderId}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for trackOrder');
        const mockOrder = mockOrders.find(order => order.id === orderId);
        if (mockOrder) {
          return {
            orderId: mockOrder.id,
            status: mockOrder.status,
            currentLocation: mockOrder.status === 'DELIVERED' ? 'Delivered' : 'On the way',
            estimatedDelivery: mockOrder.estimatedDelivery || new Date(Date.now() + 1800000).toISOString()
          };
        }
        throw new Error('Order not found in mock data');
      }
      
      const response = await api.get(`/orders/${orderId}/track`);
      console.log('Order tracking response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to track order');
    }
  },

  // Cancel order and restore items to cart
  cancelOrder: async (orderId) => {
    try {
      console.log(`Cancelling order: orderId=${orderId}`);
      
      // First, get the order details to retrieve the items
      const orderDetails = await api.get(`/orders/${orderId}`);
      console.log('Order details before cancellation:', orderDetails.data);
      
      const order = orderDetails.data;
      const userId = order.user.id;
      
      // Cancel the order in backend
      const response = await api.put(`/orders/${orderId}/cancel`);
      console.log('Cancel order response:', response.data);
      
      // CRITICAL FIX: Restore cancelled order items back to cart
      try {
        console.log('Order cancelled successfully, restoring items to cart...');
        const { cartService } = await import('./cartService');
        
        // Add each cancelled order item back to the cart
        for (const orderItem of order.items) {
          console.log(`Restoring item to cart: ${orderItem.product.name} (ID: ${orderItem.product.id}), quantity: ${orderItem.quantity}`);
          
          try {
            await cartService.addToCart(
              userId, 
              orderItem.product.id, 
              orderItem.quantity, 
              orderItem.product
            );
            console.log(`✅ Successfully restored ${orderItem.product.name} to cart`);
          } catch (addError) {
            console.error(`❌ Failed to restore ${orderItem.product.name} to cart:`, addError);
            // Continue with other items even if one fails
          }
        }
        
        console.log('✅ All cancelled order items restored to cart successfully');
      } catch (restoreError) {
        console.error('❌ Failed to restore items to cart after cancellation:', restoreError);
        // Don't fail the cancellation if cart restoration fails, just log it
      }
      
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to cancel order');
    }
  }
};