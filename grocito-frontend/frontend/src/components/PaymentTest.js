import React from 'react';
import { razorpayService } from '../api/razorpayService';
import { toast } from 'react-toastify';

const PaymentTest = () => {
  if (process.env.NODE_ENV !== 'development') return null;

  const testPayment = async (amount = 100) => {
    try {
      toast.info('Testing Razorpay payment...', { autoClose: 1000 });
      
      const paymentResult = await razorpayService.initializePayment({
        amount: amount,
        orderId: 'test_order_' + Date.now(),
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        customerPhone: '9999999999'
      });
      
      if (paymentResult.success) {
        toast.success('Test payment successful! 🎉', {
          position: "bottom-right",
          autoClose: 3000,
        });
        console.log('Payment result:', paymentResult);
      }
    } catch (error) {
      if (error.message.includes('cancelled')) {
        toast.warning('Payment cancelled by user');
      } else {
        toast.error('Payment failed: ' + error.message);
      }
      console.error('Payment error:', error);
    }
  };

  return (
    <div className="fixed top-20 right-4 bg-white p-3 rounded-lg shadow-lg border z-40">
      <h4 className="font-bold mb-2 text-xs">Payment Test</h4>
      <div className="space-y-1">
        <button
          onClick={() => testPayment(10)}
          className="block w-full bg-green-500 text-white px-2 py-1 rounded text-xs"
        >
          Test ₹10
        </button>
        <button
          onClick={() => testPayment(100)}
          className="block w-full bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Test ₹100
        </button>
        <button
          onClick={() => testPayment(500)}
          className="block w-full bg-purple-500 text-white px-2 py-1 rounded text-xs"
        >
          Test ₹500
        </button>
      </div>
      <div className="text-xs text-gray-500 mt-2 space-y-1">
        <p className="font-medium">Test Cards:</p>
        <p>Card: 4111 1111 1111 1111</p>
        <p>Expiry: Any future date</p>
        <p>CVV: Any 3 digits</p>
        <p>Name: Any name</p>
      </div>
    </div>
  );
};

export default PaymentTest;