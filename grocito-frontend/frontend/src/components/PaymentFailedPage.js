import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../api/authService';
import Header from './Header';

const PaymentFailedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const errorInfo = location.state?.errorInfo || {
    message: 'Payment could not be processed',
    code: 'PAYMENT_ERROR',
    description: 'An unknown error occurred during payment processing'
  };
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!location.state?.errorInfo) {
      // If no error info is provided, redirect to cart page
      navigate('/cart');
    }
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-white">
      <Header user={user} showCart={true} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-red-200 overflow-hidden">
          {/* Error Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white text-center mt-4">
              Payment Failed
            </h1>
          </div>

          <div className="p-8">
            {/* Error Animation */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Error Details */}
            <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-xl p-6 mb-6 border border-red-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Error Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Error Code:</span>
                  <span className="font-semibold text-gray-800">{errorInfo.code || 'PAYMENT_ERROR'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Message:</span>
                  <span className="font-semibold text-gray-800">{errorInfo.message || 'Payment failed'}</span>
                </div>
                {errorInfo.description && (
                  <div className="border-t border-red-200 pt-3 mt-3">
                    <p className="text-gray-600 text-sm">{errorInfo.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="text-center mb-8">
              <p className="text-gray-700 text-lg mb-2">
                Don't worry! No money has been deducted from your account.
              </p>
              <p className="text-gray-500">
                You can try again with a different payment method or contact our support team for assistance.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/checkout')}
                className="bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-600 text-white px-6 py-3 rounded-xl font-bold text-lg hover:from-blue-600 hover:via-yellow-500 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Try Again</span>
              </button>
              
              <button
                onClick={() => navigate('/cart')}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-bold text-lg hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                <span>Back to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentFailedPage;