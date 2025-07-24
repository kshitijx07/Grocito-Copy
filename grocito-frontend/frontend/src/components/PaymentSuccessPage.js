import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../api/authService';
import Header from './Header';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentInfo = location.state?.paymentInfo || {};
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!location.state?.paymentInfo) {
      // If no payment info is provided, redirect to orders page
      navigate('/orders');
    }
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-white">
      <Header user={user} showCart={false} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-green-200 overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white text-center mt-4">
              Payment Successful!
            </h1>
          </div>

          <div className="p-8">
            {/* Success Animation */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6 border border-green-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-semibold text-gray-800">{paymentInfo.paymentId || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-semibold text-gray-800">{paymentInfo.orderId || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-bold text-green-600">₹{paymentInfo.amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Successful
                  </span>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="text-center mb-8">
              <p className="text-gray-700 text-lg mb-2">
                Your order has been placed successfully and will be delivered soon!
              </p>
              <p className="text-gray-500">
                A confirmation email has been sent to your registered email address.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/orders')}
                className="bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-600 text-white px-6 py-3 rounded-xl font-bold text-lg hover:from-blue-600 hover:via-yellow-500 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>View My Orders</span>
              </button>
              
              <button
                onClick={() => navigate('/products')}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccessPage;