import React, { useState, useEffect } from "react";
import { deliveryFeeService } from "../services/deliveryFeeService";

const DeliveryFeeDebug = () => {
  const [testAmount, setTestAmount] = useState(63);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const deliveryInfo =
      deliveryFeeService.getDeliveryFeeDisplaySync(testAmount);
    setResult(deliveryInfo);
    console.log("🧪 DEBUG TEST RESULT:", deliveryInfo);
  }, [testAmount]);

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Delivery Fee Debug</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Test Amount (₹)
        </label>
        <input
          type="number"
          value={testAmount}
          onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {result && (
        <div className="space-y-2 text-sm">
          <div className="font-bold text-lg">Results:</div>
          <div>Order Amount: ₹{result.orderAmount}</div>
          <div>Is Free Delivery: {result.isFreeDelivery ? "YES" : "NO"}</div>
          <div>Delivery Fee: ₹{result.deliveryFee}</div>
          <div>Total Amount: ₹{result.totalAmount}</div>
          <div
            className={`font-bold ${
              result.isFreeDelivery ? "text-green-600" : "text-red-600"
            }`}
          >
            Display: {result.displayText}
          </div>

          <div className="mt-4 p-3 bg-gray-100 rounded">
            <div className="font-bold">Expected for ₹{testAmount}:</div>
            <div>Should be FREE: {testAmount >= 199 ? "YES" : "NO"}</div>
            <div>Should show fee: {testAmount >= 199 ? "₹0" : "₹40"}</div>
            <div
              className={`font-bold ${
                testAmount >= 199 === result.isFreeDelivery
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Status:{" "}
              {testAmount >= 199 === result.isFreeDelivery
                ? "✅ CORRECT"
                : "❌ WRONG"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryFeeDebug;
