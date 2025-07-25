import React, { useState } from 'react';
import { razorpayService } from '../api/razorpayService';

// Working Razorpay Component following the provided sample
const RazorpayPayment = ({ amount, orderId, customerInfo, onPaymentSuccess, onPaymentFailure }) => {
    const [paymentId, setPaymentId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            await razorpayService.initializePayment({
                amount: amount,
                orderId: orderId,
                customerName: customerInfo?.name || 'Customer',
                customerEmail: customerInfo?.email || 'customer@example.com',
                customerPhone: customerInfo?.phone || '9999999999',
                onSuccess: (response) => {
                    console.log(`Payment Successful! Payment ID: ${response.paymentId}`);
                    setPaymentId(response.paymentId);
                    setIsProcessing(false);

                    // Only place order after successful payment
                    if (onPaymentSuccess) {
                        onPaymentSuccess(response);
                    }
                },
                onFailure: (error) => {
                    console.error('Payment failed:', error);
                    setIsProcessing(false);

                    // Do not place order on failure
                    if (onPaymentFailure) {
                        onPaymentFailure(error);
                    }
                }
            });
        } catch (error) {
            console.error('Payment initialization error:', error);
            setIsProcessing(false);
            if (onPaymentFailure) {
                onPaymentFailure('Payment initialization failed');
            }
        }
    };

    return (
        <div>
            <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                {isProcessing ? 'Processing Payment...' : 'Pay Now'}
            </button>
            {paymentId && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">Payment ID: {paymentId}</p>
                </div>
            )}
        </div>
    );
};

export default RazorpayPayment;