// Razorpay Service for Payment Integration
// ✅ Using complete Razorpay key: rzp_test_oaCoVv0RNgL6rf
// Key Secret (backend only): u3MCboeH8t477SIkflHtQLyS
export const razorpayService = {
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
          
          // Using your complete Razorpay key
          const razorpayKey = 'rzp_test_oaCoVv0RNgL6rf';
          console.log('✅ Using complete Razorpay key:', razorpayKey);
          
          const rzpOptions = {
            key: razorpayKey, // Your Razorpay Test Key
            amount: amountInPaise, // Amount in paise
            currency: options.currency || 'INR',
            name: 'Grocito',
            description: options.description || 'Grocery Order Payment',
            image: '/logo192.png',
            order_id: options.orderId,
            prefill: {
              name: options.customerName || '',
              email: options.customerEmail || '',
              contact: options.customerPhone || ''
            },
            theme: {
              color: '#3B82F6'
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
              merchant_order_id: options.merchantOrderId || Date.now().toString()
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

  // Create Razorpay order (you might need to implement this on backend)
  createOrder: async (amount, currency = 'INR') => {
    try {
      // For now, return a mock order ID
      // In production, this should call your backend to create a Razorpay order
      return {
        id: 'order_' + Date.now(),
        amount: amount * 100,
        currency: currency
      };
    } catch (error) {
      throw new Error('Failed to create payment order');
    }
  },

  // Test payment function for debugging
  testPayment: () => {
    return razorpayService.initializePayment({
      amount: 100, // ₹100
      orderId: 'test_order_' + Date.now(),
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerPhone: '9999999999',
      description: 'Test Payment'
    });
  }
};