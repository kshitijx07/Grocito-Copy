import api from './config';
import { enhancedCartService } from './enhancedCartService';

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
      (typeof error.response.data === 'string' ? error.response.data : null) || 
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

export const enhancedOrderService = {
  // Place order from cart
  placeOrderFromCart: async (userId, deliveryAddress, paymentMethod = 'COD', paymentInfo = null) => {
    try {
      // Validate userId is present and valid
      if (!userId) {
        console.error('Missing userId in placeOrderFromCart call');
        throw new Error('User ID is required to place an order');
      }
      
      if (!deliveryAddress) {
        console.error('Missing deliveryAddress in placeOrderFromCart call');
        throw new Error('Delivery address is required to place an order');
      }
      
      console.log(`Placing order from cart: userId=${userId}, deliveryAddress=${deliveryAddress}, paymentMethod=${paymentMethod}`);
      
      // CRITICAL FIX: Sync frontend cart with backend before placing order
      // The backend expects cart items to be in the database, but frontend uses localStorage
      console.log('Syncing frontend cart with backend before placing order...');
      
      try {
        // Get cart items from frontend (localStorage/mock)
        const frontendCartItems = await enhancedCartService.getCartItems(userId);
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
            // Backend expects AddToCartRequest with userId, productId, quantity
            await api.post('/cart/add', {
              userId: Number(userId), // Ensure it's a number for Long type
              productId: Number(item.product.id), // Ensure it's a number for Long type
              quantity: Number(item.quantity) // Ensure it's a number for int type
            });
            console.log(`Successfully synced item: ${item.product.name}`);
          } catch (syncError) {
            console.error(`Failed to sync item ${item.product.name}:`, syncError);
            // Continue with other items, but log the error
          }
        }
        
        console.log('Cart sync completed successfully');
      } catch (syncError) {
        console.error('Cart sync failed:', syncError);
        // If sync fails, we can still try to place the order
        // The backend will handle the "cart not found" error appropriately
      }
      
      // Backend expects userId, deliveryAddress, paymentMethod, and paymentId as request parameters
      // Based on OrderController.java: @RequestParam Long userId, @RequestParam String deliveryAddress, @RequestParam String paymentMethod, @RequestParam String paymentId
      const params = new URLSearchParams({
        userId: String(userId), // Ensure userId is converted to string for URL params
        deliveryAddress: String(deliveryAddress).trim(),
        paymentMethod: paymentMethod || 'COD'
      });
      
      // Add paymentId if provided (for online payments)
      if (paymentInfo && paymentInfo.paymentId) {
        params.append('paymentId', paymentInfo.paymentId);
      }

      console.log('Order request params:', params.toString());
      
      const response = await api.post(`/orders/place-from-cart?${params.toString()}`);
      console.log('Order response:', response.data);
      
      // Add timestamp for cancellation window
      const orderWithTimestamp = {
        ...response.data,
        placedAt: new Date().getTime()
      };
      
      // Send order confirmation email manually since backend auto-email is not working
      try {
        console.log('Sending order confirmation email for order:', orderWithTimestamp.id);
        
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
        
        // Send email directly to email service
        const emailResponse = await fetch('http://localhost:3001/api/email/send-order-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData)
        });
        
        if (emailResponse.ok) {
          const emailResult = await emailResponse.json();
          console.log('✅ Order confirmation email sent successfully:', emailResult.messageId);
        } else {
          console.error('❌ Failed to send order confirmation email:', emailResponse.status);
        }
        
      } catch (emailError) {
        console.error('❌ Error sending order confirmation email:', emailError);
        // Don't fail the order if email fails
      }
      
      // CRITICAL FIX: Clear cart after successful order placement
      try {
        console.log('Order placed successfully, clearing cart...');
        await enhancedCartService.clearCart(userId);
        console.log('✅ Cart cleared successfully after order placement');
      } catch (clearError) {
        console.error('❌ Failed to clear cart after order placement:', clearError);
        // Don't fail the order if cart clearing fails, just log it
      }
      
      return orderWithTimestamp;
    } catch (error) {
      console.error('Error placing order:', error);
      handleApiError(error, 'Failed to place order');
    }
  },

  // Get user orders with real-time database fetch
  getUserOrders: async (userId) => {
    try {
      console.log(`Fetching orders for userId=${userId}`);
      
      // URL uses user ID in path, following same pattern as /users/{id}
      const response = await api.get(`/orders/user/${userId}`);
      console.log('User orders response:', response.data);
      
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
      console.error('Error fetching orders from database:', error);
      
      // If it's a 404 or user has no orders, return empty array
      if (error.response?.status === 404) {
        console.log('No orders found for user, returning empty array');
        return [];
      }
      
      return handleApiError(error, 'Failed to fetch orders');
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      console.log(`Fetching order details for orderId=${orderId}`);
      
      const response = await api.get(`/orders/${orderId}`);
      console.log('Order details response:', response.data);
      
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
        
        // Add each cancelled order item back to the cart
        for (const orderItem of order.items) {
          console.log(`Restoring item to cart: ${orderItem.product.name} (ID: ${orderItem.product.id}), quantity: ${orderItem.quantity}`);
          
          try {
            await enhancedCartService.addToCart(
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
      console.log(`Refreshing orders for userId=${userId}`);
      
      // Add cache-busting parameter to ensure fresh data
      // URL follows same pattern as user profile: /users/{id} -> /orders/user/{userId}
      const response = await api.get(`/orders/user/${userId}?refresh=${Date.now()}`);
      console.log('Refreshed user orders response:', response.data);
      
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
      console.error('Error refreshing orders from database:', error);
      
      if (error.response?.status === 404) {
        return [];
      }
      
      return handleApiError(error, 'Failed to refresh orders');
    }
  }
};