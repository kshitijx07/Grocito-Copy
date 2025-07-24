import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const errorInfo = location.state?.errorInfo || {};

  useEffect(() => {
    // Show error toast
    toast.error('Payment failed! Please try again.', {
      position: "bottom-right",
      autoClose: 3000,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          {errorInfo.message || 'There was an issue processing your payment. Please try again.'}
        </p>
        
        {errorInfo.code && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Error Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Error Code: {errorInfo.code}</p>
              <p>Description: {errorInfo.description || 'Unknown error'}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/cart')}
            className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600"
          >
            Try Again
          </button>
          
          <button
            onClick={() => navigate('/products')}
            className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;