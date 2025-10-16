import React, { useState } from "react";
import { razorpayService } from "../../api/razorpayService";

// Admin Razorpay Payment Component
// Uses same credentials as main frontend via environment variables
const RazorpayPayment = ({
  amount,
  orderId,
  customerInfo,
  onPaymentSuccess,
  onPaymentFailure,
  isRefund = false,
  refundReason = ""
}) => {
  const [paymentId, setPaymentId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [refundStatus, setRefundStatus] = useState(null);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      await razorpayService.initializePayment({
        amount: amount,
        orderId: orderId,
        customerName: customerInfo?.name || "Admin User",
        customerEmail: customerInfo?.email || "admin@grocito.com",
        customerPhone: customerInfo?.phone || "9999999999",
        onSuccess: (response) => {
          console.log(`Admin Payment Successful! Payment ID: ${response.paymentId}`);
          setPaymentId(response.paymentId);
          setIsProcessing(false);

          // Call success callback
          if (onPaymentSuccess) {
            onPaymentSuccess(response);
          }
        },
        onFailure: (error) => {
          console.error("Admin Payment failed:", error);
          setIsProcessing(false);

          // Call failure callback
          if (onPaymentFailure) {
            onPaymentFailure(error);
          }
        },
      });
    } catch (error) {
      console.error("Admin Payment initialization error:", error);
      setIsProcessing(false);
      if (onPaymentFailure) {
        onPaymentFailure("Payment initialization failed");
      }
    }
  };

  const handleRefund = async () => {
    if (!paymentId) {
      alert("No payment ID available for refund");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await razorpayService.processRefund(paymentId, amount, refundReason);
      setRefundStatus(result);
      setIsProcessing(false);
    } catch (error) {
      console.error("Refund processing error:", error);
      setRefundStatus({ success: false, error: error.message });
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {isRefund ? "Process Refund" : "Admin Payment Processing"}
        </h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Amount:</strong> ₹{amount}</p>
          {orderId && <p><strong>Order ID:</strong> {orderId}</p>}
          <p><strong>Customer:</strong> {customerInfo?.name || "Admin User"}</p>
        </div>
      </div>

      {!isRefund ? (
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? "Processing Payment..." : "Process Payment"}
        </button>
      ) : (
        <button
          onClick={handleRefund}
          disabled={isProcessing || !paymentId}
          className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? "Processing Refund..." : "Process Refund"}
        </button>
      )}

      {paymentId && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            <strong>Payment ID:</strong> {paymentId}
          </p>
        </div>
      )}

      {refundStatus && (
        <div className={`mt-4 p-4 rounded-lg border ${
          refundStatus.success 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="text-sm">
            {refundStatus.success 
              ? `Refund processed successfully. Refund ID: ${refundStatus.refundId}`
              : `Refund failed: ${refundStatus.error}`
            }
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>🔒 Secure payment processing via Razorpay</p>
        <p>Using environment-configured credentials</p>
      </div>
    </div>
  );
};

export default RazorpayPayment;