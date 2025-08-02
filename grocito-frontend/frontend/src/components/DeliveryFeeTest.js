import React, { useState, useEffect } from 'react';
import { deliveryFeeService } from '../services/deliveryFeeService';

const DeliveryFeeTest = () => {
  const [orderAmount, setOrderAmount] = useState(150);
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  useEffect(() => {
    const info = deliveryFeeService.getDeliveryFeeDisplaySync(orderAmount);
    setDeliveryInfo(info);
    console.log('Delivery fee calculation:', info);
  }, [orderAmount]);

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Delivery Fee Test</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Order Amount (₹)</label>
        <input
          type="number"
          value={orderAmount}
          onChange={(e) => setOrderAmount(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          step="0.01"
        />
      </div>

      {deliveryInfo && (
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Order Amount:</span>
            <span>₹{deliveryInfo.orderAmount.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span className={deliveryInfo.isFreeDelivery ? 'text-green-600 font-bold' : 'text-red-600'}>
              {deliveryInfo.displayText}
            </span>
          </div>
          
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>₹{deliveryInfo.totalAmount.toFixed(2)}</span>
          </div>

          {deliveryInfo.savingsText && (
            <div className="bg-green-100 text-green-800 p-2 rounded text-sm">
              {deliveryInfo.savingsText}
            </div>
          )}

          {deliveryInfo.promotionText && (
            <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-sm">
              {deliveryInfo.promotionText}
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <strong>Policy:</strong>
            <br />• Orders ≥₹199: FREE delivery
            <br />• Orders &lt;₹199: ₹40 delivery fee
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryFeeTest;