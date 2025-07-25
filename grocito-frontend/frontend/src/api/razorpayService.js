import React, { useState } from 'react';

// Correct Razorpay Integration Service
// Following the provided working sample code
export const razorpayService = {
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

  // Initialize Razorpay payment with correct flow
  initializePayment: async (paymentData) => {
    const { amount, orderId, customerName, customerEmail, customerPhone, onSuccess, onFailure } = paymentData;
    
    // Load Razorpay SDK
    const res = await razorpayService.loadScript('https://checkout.razorpay.com/v1/checkout.js');
    
    if (!res) {
      if (onFailure) onFailure('Razorpay SDK failed to load.');
      return false;
    }

    const options = {
      key: 'rzp_test_JhQ3fuFClaPubE', // Using the provided test key
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      name: 'Grocito',
      description: 'Payment for grocery order',
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
        name: customerName || 'Customer',
        email: customerEmail || 'customer@example.com',
        contact: customerPhone || '9999999999',
      },
      theme: {
        color: '#0d94fb',
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    return true;
  }
};