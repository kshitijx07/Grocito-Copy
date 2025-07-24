import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import PaymentInfo from './PaymentInfo';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentInfo = location.state?.paymentInfo;

  useEffect(() => {
    // Show success toast
    toast.success('Payment successful! 🎉', {
      position: "bottom-right",
      autoClose: 3000,
    });

    // Redirect to orders page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/orders');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your order has been placed successfully and will be delivered soon.
        </p>
        
        {paymentInfo && <PaymentInfo paymentInfo={paymentInfo} />}
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600"
          >
            View My Orders
          </button>
          
          <button
            onClick={() => navigate('/products')}
            className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200"
          >
            Continue Shopping
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          You will be redirected to your orders in 5 seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;