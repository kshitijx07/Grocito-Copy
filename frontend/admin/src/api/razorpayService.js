// Secure Razorpay Integration Service for Admin Frontend
// Using environment variables for credentials - Same as main frontend
export const razorpayService = {
  // Get Razorpay key from environment variables
  getRazorpayKey: () => {
    const key = process.env.REACT_APP_RAZORPAY_KEY_ID;
    if (!key) {
      console.error('Razorpay Key ID not found in environment variables');
      throw new Error('Razorpay configuration missing');
    }
    return key;
  },

  // Load Razorpay script
  loadScript: (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  // Initialize Razorpay payment with secure configuration
  initializePayment: async (paymentData) => {
    const { amount, orderId, customerName, customerEmail, customerPhone, onSuccess, onFailure } = paymentData;
    
    try {
      // Get Razorpay key from environment
      const razorpayKey = razorpayService.getRazorpayKey();
      
      // Load Razorpay SDK
      const res = await razorpayService.loadScript('https://checkout.razorpay.com/v1/checkout.js');
      
      if (!res) {
        if (onFailure) onFailure('Razorpay SDK failed to load.');
        return false;
      }

      const options = {
        key: razorpayKey, // Using environment variable
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        name: 'Grocito Admin',
        description: 'Admin payment processing',
        order_id: orderId, // Pass order ID if provided
        handler: function (response) {
          console.log('Payment Successful!', response);
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
            console.log('Payment cancelled by user');
            if (onFailure) onFailure('Payment cancelled by user');
          }
        },
        prefill: {
          name: customerName || 'Admin User',
          email: customerEmail || 'admin@grocito.com',
          contact: customerPhone || '9999999999',
        },
        theme: {
          color: '#0d94fb',
        },
        notes: {
          address: 'Grocito Admin Panel',
          processed_by: 'admin'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      return true;
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      if (onFailure) onFailure('Payment system configuration error');
      return false;
    }
  },

  // Verify payment (for backend integration)
  verifyPayment: async (paymentData) => {
    // This would typically be done on the backend
    // Frontend should send payment details to backend for verification
    console.log('Payment verification should be done on backend:', paymentData);
    return true;
  },

  // Admin-specific: Process refund
  processRefund: async (paymentId, amount, reason) => {
    try {
      // This would typically call backend API for refund processing
      console.log('Processing refund:', { paymentId, amount, reason });
      // Backend API call would go here
      return { success: true, refundId: 'rfnd_' + Date.now() };
    } catch (error) {
      console.error('Refund processing error:', error);
      return { success: false, error: error.message };
    }
  },

  // Admin-specific: Get payment details
  getPaymentDetails: async (paymentId) => {
    try {
      // This would typically call backend API to get payment details
      console.log('Fetching payment details for:', paymentId);
      // Backend API call would go here
      return { success: true, payment: {} };
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return { success: false, error: error.message };
    }
  }
};