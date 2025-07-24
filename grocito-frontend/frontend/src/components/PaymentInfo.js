import React from 'react';

const PaymentInfo = ({ paymentInfo }) => {
  if (!paymentInfo) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Payment ID</span>
          <span className="font-medium">{paymentInfo.paymentId || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Order ID</span>
          <span className="font-medium">{paymentInfo.orderId || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Amount</span>
          <span className="font-medium">₹{parseFloat(paymentInfo.amount || 0).toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Status</span>
          <span className="font-medium text-green-600">Successful</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Payment Method</span>
          <span className="font-medium">{paymentInfo.method || 'Online'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Date</span>
          <span className="font-medium">{new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;