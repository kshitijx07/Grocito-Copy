import api from './config';

// Razorpay Service for Payment Integration
// Using the provided test keys
const RAZORPAY_KEY_ID = 'rzp_test_cSaPgCCDgkPbkb';

// Helper to check if backend is available
const isBackendAvailable = async () => {
  try {
    await api.get('/health-check');
    return true;
  } catch (error) {
    console.warn('Backend appears to be unavailable, using mock data for payments');
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

export const enhancedRazorpayService = {
  // Create a Razorpay order through the backend
  createOrder: async (amount, orderId, userId, currency = 'INR') => {
    try {
      console.log(`Creating Razorpay order: amount=${amount}, orderId=${orderId}, userId=${userId}`);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for createOrder');
        
        // Create a mock order for testing
        return {
          id: 'order_' + Date.now(),
          amount: amount * 100, // Convert to paise
          currency: currency,
          receipt: orderId.toString(),
          status: 'created'
        };
      }
      
      // Call backend to create Razorpay order
      const response = await api.post('/payments/create-order', {
        amount,
        orderId,
        userId,
        currency
      });
      
      console.log('Create order response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to create payment order');
    }
  },

  // Initialize Razorpay payment
  initializePayment: (options) => {
    return new Promise((resolve, reject) => {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        console.log('Loading Razorpay script...');
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          console.log('Razorpay script loaded successfully');
          createPayment();
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          reject(new Error('Failed to load Razorpay SDK'));
        };
        document.body.appendChild(script);
      } else {
        console.log('Razorpay already loaded');
        createPayment();
      }

      function createPayment() {
        try {
          console.log('Creating Razorpay payment with options:', options);
          
          // Format amount to ensure it's in paise (multiply by 100)
          const amountInPaise = Math.round(parseFloat(options.amount) * 100);
          
          const rzpOptions = {
            key: RAZORPAY_KEY_ID,
            amount: amountInPaise, // Amount in paise
            currency: options.currency || 'INR',
            name: 'Grocito',
            description: options.description || 'Grocery Order Payment',
            image: 'https://via.placeholder.com/150?text=Grocito', // Replace with your logo
            order_id: options.orderId,
            prefill: {
              name: options.customerName || '',
              email: options.customerEmail || '',
              contact: options.customerPhone || ''
            },
            theme: {
              color: '#22c55e' // Green color to match your app theme
            },
            modal: {
              ondismiss: function() {
                console.log('Payment modal dismissed by user');
                reject(new Error('Payment cancelled by user'));
              },
              escape: false,
              animation: true
            },
            notes: {
              address: options.address || 'Customer Address',
              merchant_order_id: options.merchantOrderId || Date.now().toString(),
              userId: options.userId || ''
            },
            // Enable specific payment methods
            config: {
              display: {
                blocks: {
                  upi: {
                    name: 'Pay via UPI',
                    instruments: [
                      { method: 'upi' }
                    ]
                  },
                  card: {
                    name: 'Pay via Card',
                    instruments: [
                      { method: 'card' }
                    ]
                  },
                  netbanking: {
                    name: 'Pay via Netbanking',
                    instruments: [
                      { method: 'netbanking' }
                    ]
                  }
                },
                sequence: ['block.upi', 'block.card', 'block.netbanking'],
                preferences: {
                  show_default_blocks: true
                }
              }
            },
            handler: function (response) {
              console.log('Payment successful:', response);
              resolve({
                success: true,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature
              });
            }
          };

          console.log('Razorpay options:', rzpOptions);
          const rzp = new window.Razorpay(rzpOptions);

          rzp.on('payment.failed', function (response) {
            console.error('Payment failed:', response.error);
            console.error('Full error response:', response);
            
            let errorMessage = 'Payment failed';
            if (response.error) {
              errorMessage = response.error.description || response.error.reason || errorMessage;
            }
            
            reject({
              message: errorMessage,
              code: response.error?.code || 'PAYMENT_FAILED',
              description: response.error?.description || 'Payment could not be processed',
              source: response.error?.source,
              step: response.error?.step,
              reason: response.error?.reason
            });
          });

          // Open Razorpay payment form
          rzp.open();
          console.log('Razorpay payment form opened');
        } catch (error) {
          console.error('Error creating Razorpay instance:', error);
          reject(new Error('Failed to initialize payment: ' + error.message));
        }
      }
    });
  },

  // Verify payment with backend
  verifyPayment: async (paymentData) => {
    try {
      console.log('Verifying payment:', paymentData);
      
      // Check if backend is available
      if (!await isBackendAvailable()) {
        console.log('Using mock data for verifyPayment');
        
        // Mock verification success
        return {
          success: true,
          message: 'Payment verified successfully (mock)',
          orderId: paymentData.orderId
        };
      }
      
      // Call backend to verify payment
      const response = await api.post('/payments/verify', paymentData);
      
      console.log('Verify payment response:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to verify payment');
    }
  },
  
  // Process payment for an order
  processPayment: async (orderId, userId, amount, customerInfo) => {
    try {
      console.log(`Processing payment for order ${orderId}, amount: ${amount}`);
      
      // 1. Create Razorpay order
      const orderResponse = await enhancedRazorpayService.createOrder(
        amount, 
        orderId,
        userId
      );
      
      if (!orderResponse || !orderResponse.id) {
        throw new Error('Failed to create payment order');
      }
      
      console.log('Razorpay order created:', orderResponse);
      
      // 2. Initialize payment
      const paymentResponse = await enhancedRazorpayService.initializePayment({
        amount: amount,
        orderId: orderResponse.id,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        address: customerInfo.address,
        userId: userId,
        merchantOrderId: orderId
      });
      
      console.log('Payment initialized:', paymentResponse);
      
      if (!paymentResponse.success) {
        throw new Error('Payment failed');
      }
      
      // 3. Verify payment with backend
      const verificationResponse = await enhancedRazorpayService.verifyPayment({
        paymentId: paymentResponse.paymentId,
        orderId: paymentResponse.orderId,
        signature: paymentResponse.signature,
        merchantOrderId: orderId,
        userId: userId
      });
      
      console.log('Payment verification:', verificationResponse);
      
      return {
        success: true,
        paymentId: paymentResponse.paymentId,
        orderId: orderId,
        razorpayOrderId: paymentResponse.orderId,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }
};