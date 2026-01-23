// Secure Razorpay Integration Service
// Using environment variables for credentials
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
        name: 'Grocito',
        description: 'Payment for grocery order',
        // Note: order_id should only be passed if created via Razorpay backend API
        // Passing invalid/custom order_id causes 400 Bad Request
        // For simple payments, omit order_id
        handler: function (response) {
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
            if (onFailure) onFailure('Payment cancelled by user');
          }
        },
        prefill: {
          name: customerName || 'Customer',
          email: customerEmail || 'customer@example.com',
          contact: customerPhone || '9999999999',
        },
        theme: {
          color: '#0d94fb',
        },
        notes: {
          address: 'Grocito Corporate Office'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      return true;
    } catch (error) {
      if (onFailure) onFailure('Payment system configuration error');
      return false;
    }
  },

  // Verify payment (for backend integration)
  verifyPayment: async (paymentData) => {
    // This would typically be done on the backend
    // Frontend should send payment details to backend for verification
    return true;
  }
};