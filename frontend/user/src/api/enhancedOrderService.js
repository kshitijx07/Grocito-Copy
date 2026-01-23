import api from './config';
import { enhancedCartService } from './enhancedCartService';

// Helper to handle API errors with better messages
const handleApiError = (error, defaultMessage) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const errorMessage = 
      error.response.data?.message || 
      error.response.data?.error || 
      (typeof error.response.data === 'string' ? error.response.data : null) || 
      `${defaultMessage} (Status: ${error.response.status})`;
    
    throw new Error(errorMessage);
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('Server did not respond. Please check your internet connection or try again later.');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(`${defaultMessage}: ${error.message}`);
  }
};

export const enhancedOrderService = {
  // Place order from cart
  placeOrderFromCart: async (userId, deliveryAddress, paymentMethod = 'COD', paymentInfo = null) => {
    try {
      // Validate userId is present and valid
      if (!userId) {
        throw new Error('User ID is required to place an order');
      }
      
      if (!deliveryAddress) {
        throw new Error('Delivery address is required to place an order');
      }
      
      // Sync frontend cart with backend before placing order
      // The backend expects cart items to be in the database, but frontend uses localStorage
      try {
        // Get cart items from frontend (localStorage/mock)
        const frontendCartItems = await enhancedCartService.getCartItems(userId);
        
        if (!frontendCartItems || frontendCartItems.length === 0) {
          throw new Error('Your cart is empty. Please add items to your cart before placing an order.');
        }
        
        // Clear any existing backend cart and sync with frontend cart
        try {
          await api.delete(`/cart/clear/${userId}`);
        } catch (clearError) {
          // No existing backend cart to clear (this is normal)
        }
        
        // Add each frontend cart item to backend cart
        for (const item of frontendCartItems) {
          try {
            // Backend expects AddToCartRequest with userId, productId, quantity
            await api.post('/cart/add', {
              userId: Number(userId),
              productId: Number(item.product.id),
              quantity: Number(item.quantity)
            });
          } catch (syncError) {
            // Continue with other items
          }
        }
      } catch (syncError) {
        // If sync fails, we can still try to place the order
      }
      
      // Get landing page pincode from localStorage (priority over user profile pincode)
      const landingPagePincode = localStorage.getItem('pincode');
      
      const params = new URLSearchParams({
        userId: String(userId),
        deliveryAddress: String(deliveryAddress).trim(),
        paymentMethod: paymentMethod || 'COD'
      });
      
      // Add landing page pincode if available
      if (landingPagePincode) {
        params.append('landingPagePincode', landingPagePincode);
      }
      
      // Add paymentId if provided (for online payments)
      if (paymentInfo && paymentInfo.paymentId) {
        params.append('paymentId', paymentInfo.paymentId);
      }
      
      const response = await api.post(`/orders/place-from-cart?${params.toString()}`);
      
      // Add timestamp for cancellation window
      const orderWithTimestamp = {
        ...response.data,
        placedAt: new Date().getTime()
      };
      
      // Send order confirmation email via backend API
      try {
        // Prepare email data
        const emailData = {
          orderData: {
            order: {
              id: orderWithTimestamp.id,
              orderTime: orderWithTimestamp.orderTime,
              status: orderWithTimestamp.status,
              totalAmount: orderWithTimestamp.totalAmount,
              deliveryAddress: orderWithTimestamp.deliveryAddress,
              pincode: orderWithTimestamp.pincode,
              items: orderWithTimestamp.items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                product: {
                  name: item.product.name,
                  price: item.product.price
                }
              }))
            },
            user: {
              fullName: orderWithTimestamp.user.fullName,
              email: orderWithTimestamp.user.email,
              pincode: orderWithTimestamp.user.pincode
            }
          },
          paymentInfo: {
            paymentMethod: paymentMethod,
            paymentId: paymentInfo?.paymentId || null,
            paidAmount: orderWithTimestamp.totalAmount
          },
          userEmail: orderWithTimestamp.user.email
        };
        
        // Send email via backend API
        await api.post('/email/send-order-confirmation', emailData);
        
      } catch (emailError) {
        // Don't fail the order if email fails - backend will handle email separately
      }
      
      // Clear cart after successful order placement
      try {
        await enhancedCartService.clearCart(userId);
      } catch (clearError) {
        // Don't fail the order if cart clearing fails
      }
      
      return orderWithTimestamp;
    } catch (error) {
      handleApiError(error, 'Failed to place order');
    }
  },

  // Get user orders with real-time database fetch
  getUserOrders: async (userId) => {
    try {
      // URL uses user ID in path, following same pattern as /users/{id}
      const response = await api.get(`/orders/user/${userId}`);
      
      // Ensure we have an array
      const orders = Array.isArray(response.data) ? response.data : [];
      
      // Add cancellation eligibility to each order
      const ordersWithCancellation = orders.map(order => {
        const orderTime = new Date(order.orderTime).getTime();
        const now = new Date().getTime();
        const timeDiff = now - orderTime;
        const canCancel = timeDiff <= 2 * 60 * 1000 && order.status === 'PLACED'; // 2 minutes in milliseconds
        
        return {
          ...order,
          placedAt: orderTime,
          canCancel
        };
      });
      
      return ordersWithCancellation;
    } catch (error) {
      // If it's a 404 or user has no orders, return empty array
      if (error.response?.status === 404) {
        return [];
      }
      
      return handleApiError(error, 'Failed to fetch orders');
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      
      const order = response.data;
      
      // Add cancellation eligibility
      const orderTime = new Date(order.orderTime).getTime();
      const now = new Date().getTime();
      const timeDiff = now - orderTime;
      const canCancel = timeDiff <= 2 * 60 * 1000 && order.status === 'PLACED';
      
      return {
        ...order,
        placedAt: orderTime,
        canCancel
      };
    } catch (error) {
      return handleApiError(error, 'Order not found');
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      // First, get the order details to retrieve the items
      const orderDetails = await api.get(`/orders/${orderId}`);
      
      const order = orderDetails.data;
      const userId = order.user.id;
      
      // Cancel the order in backend
      const response = await api.put(`/orders/${orderId}/cancel`);
      
      // Restore cancelled order items back to cart
      try {
        // Add each cancelled order item back to the cart
        for (const orderItem of order.items) {
          try {
            await enhancedCartService.addToCart(
              userId, 
              orderItem.product.id, 
              orderItem.quantity, 
              orderItem.product
            );
          } catch (addError) {
            // Continue with other items even if one fails
          }
        }
      } catch (restoreError) {
        // Don't fail the cancellation if cart restoration fails
      }
      
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to cancel order');
    }
  },
  
  // Check if order can be cancelled
  canCancelOrder: (order) => {
    if (!order) return false;
    
    // Order must be in PLACED status
    if (order.status !== 'PLACED') return false;
    
    // Order must be within 2 minutes of placing
    const orderTime = order.placedAt || new Date(order.orderTime).getTime();
    const now = new Date().getTime();
    const timeDiff = now - orderTime;
    
    return timeDiff <= 2 * 60 * 1000; // 2 minutes in milliseconds
  },
  
  // Get time remaining for cancellation (in seconds)
  getCancellationTimeRemaining: (order) => {
    if (!order) return 0;
    
    const orderTime = order.placedAt || new Date(order.orderTime).getTime();
    const now = new Date().getTime();
    const timeDiff = now - orderTime;
    const timeRemaining = 2 * 60 * 1000 - timeDiff; // 2 minutes in milliseconds
    
    return Math.max(0, Math.floor(timeRemaining / 1000)); // Convert to seconds
  },

  // Refresh orders (force fetch from database)
  refreshUserOrders: async (userId) => {
    try {
      // Add cache-busting parameter to ensure fresh data
      const response = await api.get(`/orders/user/${userId}?refresh=${Date.now()}`);
      
      const orders = Array.isArray(response.data) ? response.data : [];
      
      // Add cancellation eligibility to each order
      const ordersWithCancellation = orders.map(order => {
        const orderTime = new Date(order.orderTime).getTime();
        const now = new Date().getTime();
        const timeDiff = now - orderTime;
        const canCancel = timeDiff <= 2 * 60 * 1000 && order.status === 'PLACED';
        
        return {
          ...order,
          placedAt: orderTime,
          canCancel
        };
      });
      
      return ordersWithCancellation;
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      
      return handleApiError(error, 'Failed to refresh orders');
    }
  }
};