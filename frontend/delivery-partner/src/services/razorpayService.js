// Secure Razorpay Integration Service for Delivery Partner Frontend
// Using environment variables for credentials - Same as main frontend
import { getRazorpayKey, validateRazorpayConfig, isTestMode } from '../config/razorpayConfig';

export const razorpayService = {
  // Get Razorpay key from environment variables via config
  getRazorpayKey: () => {
    return getRazorpayKey();
  },

  // Validate configuration
  validateConfig: () => {
    return validateRazorpayConfig();
  },

  // Check if in test mode
  isTestMode: () => {
    return isTestMode();
  },

  // Load Razorpay script
  loadScript: (src) => {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        console.log('✅ Razorpay already loaded');
        resolve(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        console.log('📦 Razorpay script already exists, waiting for load...');
        existingScript.onload = () => resolve(true);
        existingScript.onerror = () => resolve(false);
        return;
      }

      const script = document.createElement('script');
      script.src = src || 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('❌ Razorpay script failed to load');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  },

  // Initialize Razorpay payment for delivery partner use cases
  initializePayment: async (paymentData) => {
    const { amount, orderId, customerName, customerEmail, customerPhone, onSuccess, onFailure } = paymentData;
    
    try {
      // Validate configuration first
      if (!razorpayService.validateConfig()) {
        throw new Error('Razorpay configuration is invalid');
      }

      // Get Razorpay key from config
      const razorpayKey = razorpayService.getRazorpayKey();
      
      // Load Razorpay SDK
      const res = await razorpayService.loadScript();
      
      if (!res) {
        if (onFailure) onFailure('Razorpay SDK failed to load.');
        return false;
      }

      const options = {
        key: razorpayKey, // Using environment variable via config
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        name: 'Grocito Delivery',
        description: 'COD Payment Collection',
        order_id: orderId, // Pass order ID if provided
        handler: function (response) {
          console.log('✅ Delivery Partner Payment Successful!', response);
          // Only call onSuccess after payment is confirmed
          if (onSuccess) {
            onSuccess({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            });
          }
        },
        modal: {
          ondismiss: function() {
            console.log('❌ Payment cancelled by customer');
            if (onFailure) onFailure('Payment cancelled by customer');
          }
        },
        prefill: {
          name: customerName || 'Customer',
          email: customerEmail || 'customer@example.com',
          contact: customerPhone || '9999999999',
        },
        theme: {
          color: '#3B82F6', // Blue theme for delivery partner
        },
        notes: {
          address: 'Grocito Delivery Partner Collection',
          collected_by: 'delivery_partner'
        }
      };

      // Add payment failure handler
      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        console.error('❌ Payment failed:', response);
        if (onFailure) {
          onFailure(`Payment failed: ${response.error?.description || 'Unknown error'}`);
        }
      });

      paymentObject.open();
      return true;
    } catch (error) {
      console.error('❌ Razorpay initialization error:', error);
      if (onFailure) onFailure('Payment system configuration error: ' + error.message);
      return false;
    }
  },

  // Delivery Partner specific: Process COD collection
  processCODCollection: async (orderData) => {
    const { orderId, amount, customerInfo, paymentMethod = 'CASH' } = orderData;
    
    try {
      console.log(`💰 Processing COD collection for Order #${orderId}`);
      
      if (paymentMethod === 'DIGITAL') {
        // Use Razorpay for digital payment
        return new Promise((resolve, reject) => {
          razorpayService.initializePayment({
            amount: amount,
            orderId: `cod_${orderId}_${Date.now()}`,
            customerName: customerInfo?.name || 'Customer',
            customerEmail: customerInfo?.email || 'customer@example.com',
            customerPhone: customerInfo?.phone || '9999999999',
            onSuccess: (response) => {
              resolve({
                success: true,
                paymentMethod: 'UPI',
                paymentId: response.paymentId,
                collectionMethod: 'digital'
              });
            },
            onFailure: (error) => {
              reject({
                success: false,
                error: error,
                collectionMethod: 'digital'
              });
            }
          });
        });
      } else {
        // Cash collection - just return success
        return Promise.resolve({
          success: true,
          paymentMethod: 'CASH',
          paymentId: `cash_${orderId}_${Date.now()}`,
          collectionMethod: 'cash'
        });
      }
    } catch (error) {
      console.error('❌ COD collection error:', error);
      return Promise.reject({
        success: false,
        error: error.message,
        collectionMethod: paymentMethod.toLowerCase()
      });
    }
  },

  // Get payment status for delivery partner dashboard
  getPaymentStatus: (paymentId) => {
    // This would typically call backend API to get payment status
    console.log('📊 Fetching payment status for:', paymentId);
    return Promise.resolve({
      paymentId: paymentId,
      status: 'captured',
      amount: 0,
      method: 'unknown'
    });
  },

  // Delivery Partner specific: Validate payment before delivery
  validatePaymentForDelivery: (orderData) => {
    const { paymentStatus, paymentMethod, totalAmount } = orderData;
    
    if (paymentStatus === 'PAID') {
      return {
        canDeliver: true,
        message: 'Payment verified. Order can be delivered.',
        paymentVerified: true
      };
    }
    
    if (paymentMethod === 'COD') {
      return {
        canDeliver: false,
        message: `Please collect ₹${totalAmount} before marking as delivered.`,
        paymentVerified: false,
        requiresCollection: true
      };
    }
    
    return {
      canDeliver: false,
      message: 'Payment status unclear. Please contact support.',
      paymentVerified: false
    };
  }
};

export default razorpayService;