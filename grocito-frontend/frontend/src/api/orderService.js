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
      
      const requestData = {
        userId,
        deliveryAddress,
        paymentMethod,
        ...(paymentInfo && { paymentInfo })
      };

      console.log('Order request data:', requestData);
      const response = await api.post('/orders/place-from-cart', requestData);
      console.log('Order response:', response.data);
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
  }
};