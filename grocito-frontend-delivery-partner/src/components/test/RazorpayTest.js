import React, { useState } from 'react';
import { toast } from 'react-toastify';

const RazorpayTest = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const testRazorpay = async () => {
    setIsLoading(true);
    
    try {
      console.log('🧪 Testing Razorpay Integration...');
      
      // Use hardcoded keys since env vars are working
      const keyId = 'rzp_test_oaCoVv0RNgL6rf';
      const keySecret = 'u3MCboeH8t477SIkflHtQLyS';
      
      console.log('Using Key ID:', keyId);
      console.log('Key Secret: Present');
      
      // Step 1: Remove any existing Razorpay scripts
      const existingScripts = document.querySelectorAll('script[src*="razorpay"]');
      existingScripts.forEach(script => script.remove());
      
      // Step 2: Clear window.Razorpay if it exists
      if (window.Razorpay) {
        delete window.Razorpay;
        console.log('🧹 Cleared existing Razorpay');
      }
      
      // Step 3: Load fresh Razorpay script
      console.log('📦 Loading fresh Razorpay script...');
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      // Use Promise to handle script loading
      const scriptPromise = new Promise((resolve, reject) => {
        script.onload = () => {
          console.log('✅ Razorpay script loaded successfully');
          console.log('Window.Razorpay available:', !!window.Razorpay);
          resolve(true);
        };
        
        script.onerror = (error) => {
          console.error('❌ Razorpay script failed to load:', error);
          reject(new Error('Script loading failed'));
        };
        
        // Set timeout for script loading
        setTimeout(() => {
          reject(new Error('Script loading timeout'));
        }, 10000);
      });
      
      document.head.appendChild(script);
      
      // Wait for script to load
      await scriptPromise;
      
      // Step 4: Wait a bit more to ensure Razorpay is fully initialized
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!window.Razorpay) {
        throw new Error('Razorpay not available after script load');
      }
      
      // Step 5: Create Razorpay options
      const options = {
        key: keyId,
        amount: 10000, // ₹100 in paise
        currency: 'INR',
        name: 'Grocito Test',
        description: 'Test Payment - Click to proceed',
        order_id: 'test_order_' + Date.now(),
        handler: function (response) {
          console.log('✅ Payment Success:', response);
          toast.success('🎉 Test payment successful!');
          setIsLoading(false);
        },
        modal: {
          ondismiss: function() {
            console.log('❌ Payment dismissed by user');
            toast.info('Payment cancelled by user');
            setIsLoading(false);
          }
        },
        prefill: {
          name: 'Test Customer',
          email: 'test@grocito.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3B82F6'
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        }
      };
      
      console.log('🚀 Creating Razorpay instance with options:', options);
      
      // Step 6: Create and open Razorpay
      try {
        const razorpay = new window.Razorpay(options);
        console.log('✅ Razorpay instance created successfully');
        
        // Add event listeners for debugging
        razorpay.on('payment.failed', function (response) {
          console.log('❌ Payment failed:', response);
          toast.error('Payment failed: ' + response.error.description);
          setIsLoading(false);
        });
        
        // Open with a slight delay to ensure everything is ready
        setTimeout(() => {
          console.log('🔓 Opening Razorpay checkout...');
          razorpay.open();
        }, 100);
        
      } catch (razorpayError) {
        console.error('❌ Error creating Razorpay instance:', razorpayError);
        throw new Error('Failed to create Razorpay instance: ' + razorpayError.message);
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      toast.error('Test failed: ' + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">🧪 Razorpay Test</h2>
      
      <div className="space-y-4">
        <div className="text-sm">
          <p><strong>Key ID:</strong> {process.env.REACT_APP_RAZORPAY_KEY_ID || 'Not configured'}</p>
          <p><strong>Key Secret:</strong> {process.env.REACT_APP_RAZORPAY_KEY_SECRET ? 'Present' : 'Missing'}</p>
        </div>
        
        <button
          onClick={testRazorpay}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Testing...' : 'Test Razorpay Payment'}
        </button>
        
        <div className="text-xs text-gray-600">
          <p>This will open Razorpay with ₹100 test payment</p>
          <p>Use test cards: 4111 1111 1111 1111</p>
        </div>
      </div>
    </div>
  );
};

export default RazorpayTest;