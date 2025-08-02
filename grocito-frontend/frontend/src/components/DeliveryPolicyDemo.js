import React, { useState, useEffect } from 'react';
import { deliveryFeeService } from '../services/deliveryFeeService';

const DeliveryPolicyDemo = () => {
  const [orderAmount, setOrderAmount] = useState(150);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [partnerEarnings, setPartnerEarnings] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateFees();
  }, [orderAmount]);

  const calculateFees = async () => {
    setLoading(true);
    try {
      const info = deliveryFeeService.getDeliveryFeeDisplaySync(orderAmount);
      
      // Calculate partner earnings correctly based on policy
      const isFreeDelivery = orderAmount >= 199;
      const partnerEarnings = {
        orderAmount: orderAmount,
        deliveryType: isFreeDelivery ? 'FREE_DELIVERY' : 'PAID_DELIVERY',
        baseEarnings: isFreeDelivery ? 25 : 30, // ₹25 for free delivery, ₹30 for paid delivery
        totalBonuses: 0,
        totalEarnings: isFreeDelivery ? 25 : 30,
        customerPaid: isFreeDelivery ? 0 : 40, // Customer pays ₹40 for orders < ₹199
        grocitoPaid: isFreeDelivery ? 25 : 0, // Grocito pays ₹25 for free delivery orders
        grocitoRevenue: isFreeDelivery ? -25 : 10 // Grocito loses ₹25 on free delivery, gains ₹10 on paid delivery
      };
      
      console.log('Policy Implementation:');
      console.log('Order Amount:', orderAmount);
      console.log('Is Free Delivery:', isFreeDelivery);
      console.log('Customer Pays:', partnerEarnings.customerPaid);
      console.log('Partner Gets:', partnerEarnings.baseEarnings);
      console.log('Grocito Revenue/Cost:', partnerEarnings.grocitoRevenue);
      
      setDeliveryInfo(info);
      setPartnerEarnings(partnerEarnings);
    } catch (error) {
      console.error('Error calculating fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const testScenarios = [
    { amount: 100, label: '₹100 Order' },
    { amount: 150, label: '₹150 Order' },
    { amount: 199, label: '₹199 Order (Threshold)' },
    { amount: 250, label: '₹250 Order' },
    { amount: 500, label: '₹500 Order' },
    { amount: 1000, label: '₹1000 Order' }
  ];

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Grocito Delivery Fee Policy Demo
          </h1>
          <p className="text-xl text-gray-600">
            Interactive demonstration of our delivery fee calculation and partner earnings
          </p>
        </div>

        {/* Policy Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Policy Overview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                📦 Orders ≥ ₹199
              </h3>
              <ul className="space-y-2 text-green-700">
                <li>• Customer: <strong>FREE delivery</strong></li>
                <li>• Partner: <strong>₹25</strong> (paid by Grocito)</li>
                <li>• Grocito: Pays ₹25 to partner</li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                📦 Orders &lt; ₹199
              </h3>
              <ul className="space-y-2 text-blue-700">
                <li>• Customer: <strong>₹40 delivery fee</strong></li>
                <li>• Partner: <strong>₹30</strong> (75% of fee)</li>
                <li>• Grocito: Keeps ₹10 (25% of fee)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Interactive Calculator */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Interactive Calculator</h2>
          
          {/* Order Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Amount (₹)
            </label>
            <input
              type="number"
              value={orderAmount}
              onChange={(e) => setOrderAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              min="0"
              step="0.01"
            />
          </div>

          {/* Quick Test Buttons */}
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Test Scenarios:</p>
            <div className="flex flex-wrap gap-2">
              {testScenarios.map((scenario) => (
                <button
                  key={scenario.amount}
                  onClick={() => setOrderAmount(scenario.amount)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    orderAmount === scenario.amount
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {scenario.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {deliveryInfo && partnerEarnings && !loading && 
           deliveryInfo.orderAmount !== undefined && partnerEarnings.totalEarnings !== undefined && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Customer View */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-4">
                  👤 Customer View
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Order Amount:</span>
                    <span className="font-semibold">₹{(deliveryInfo.orderAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span className={`font-semibold ${
                      deliveryInfo.isFreeDelivery ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {deliveryInfo.displayText}
                    </span>
                  </div>
                  <div className="border-t border-green-200 pt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold">Total Amount:</span>
                      <span className="font-bold text-green-700">₹{(deliveryInfo.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  {deliveryInfo.savingsText && (
                    <div className="bg-green-100 rounded-lg p-3 mt-3">
                      <p className="text-green-800 font-medium text-sm">
                        🎉 {deliveryInfo.savingsText}
                      </p>
                    </div>
                  )}
                  {deliveryInfo.promotionText && (
                    <div className="bg-yellow-100 rounded-lg p-3 mt-3">
                      <p className="text-yellow-800 font-medium text-sm">
                        💡 {deliveryInfo.promotionText}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Partner View */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-blue-800 mb-4">
                  🚚 Delivery Partner View
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Order Type:</span>
                    <span className={`font-semibold px-2 py-1 rounded text-sm ${
                      partnerEarnings.deliveryType === 'FREE_DELIVERY' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {partnerEarnings.deliveryType === 'FREE_DELIVERY' ? 'Free Delivery' : 'Paid Delivery'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Earnings:</span>
                    <span className="font-semibold">₹{(partnerEarnings.baseEarnings || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonuses:</span>
                    <span className="font-semibold text-green-600">+₹{(partnerEarnings.totalBonuses || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold">Total Earnings:</span>
                      <span className="font-bold text-blue-700">₹{(partnerEarnings.totalEarnings || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-3 mt-3">
                    <div className="text-blue-800 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Customer Paid:</span>
                        <span>₹{(partnerEarnings.customerPaid || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Grocito Paid:</span>
                        <span>₹{(partnerEarnings.grocitoPaid || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Calculating...</p>
            </div>
          )}
        </div>

        {/* Revenue Breakdown */}
        {deliveryInfo && partnerEarnings && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Breakdown</h2>
            
            {/* Policy Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-2">Current Order Analysis:</h3>
              <div className="text-sm text-gray-700">
                {deliveryInfo.isFreeDelivery ? (
                  <>
                    <div>✅ Order ≥₹199: <strong>FREE delivery for customer</strong></div>
                    <div>💰 Partner earns: <strong>₹25</strong> (paid by Grocito)</div>
                    <div>📉 Grocito cost: <strong>₹25</strong> (subsidizes delivery)</div>
                  </>
                ) : (
                  <>
                    <div>💳 Order &lt;₹199: <strong>₹40 delivery fee</strong> charged to customer</div>
                    <div>💰 Partner earns: <strong>₹30</strong> (75% of delivery fee)</div>
                    <div>📈 Grocito keeps: <strong>₹10</strong> (25% of delivery fee)</div>
                  </>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ₹{(partnerEarnings.totalEarnings || 0).toFixed(2)}
                </div>
                <div className="text-green-800 font-medium">Partner Earnings</div>
                <div className="text-sm text-green-600 mt-1">
                  {deliveryInfo.isFreeDelivery ? 'Paid by Grocito' : '75% of delivery fee'}
                </div>
              </div>
              
              <div className={`text-center p-6 rounded-xl border ${
                (partnerEarnings.grocitoRevenue || 0) >= 0 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className={`text-3xl font-bold mb-2 ${
                  (partnerEarnings.grocitoRevenue || 0) >= 0 
                    ? 'text-blue-600' 
                    : 'text-red-600'
                }`}>
                  {(partnerEarnings.grocitoRevenue || 0) >= 0 ? '+' : ''}₹{Math.abs(partnerEarnings.grocitoRevenue || 0).toFixed(2)}
                </div>
                <div className={`font-medium ${
                  (partnerEarnings.grocitoRevenue || 0) >= 0 
                    ? 'text-blue-800' 
                    : 'text-red-800'
                }`}>
                  Grocito {(partnerEarnings.grocitoRevenue || 0) >= 0 ? 'Revenue' : 'Cost'}
                </div>
                <div className={`text-sm mt-1 ${
                  (partnerEarnings.grocitoRevenue || 0) >= 0 
                    ? 'text-blue-600' 
                    : 'text-red-600'
                }`}>
                  {deliveryInfo.isFreeDelivery ? 'Subsidizes free delivery' : '25% of delivery fee'}
                </div>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  ₹{(deliveryInfo.totalAmount || 0).toFixed(2)}
                </div>
                <div className="text-purple-800 font-medium">Customer Pays</div>
                <div className="text-sm text-purple-600 mt-1">
                  ₹{(deliveryInfo.orderAmount || 0).toFixed(2)} order + ₹{(deliveryInfo.deliveryFee || 0).toFixed(2)} delivery
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-3">Money Flow:</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-gray-700 mb-2">Customer Side:</div>
                  <div className="space-y-1 text-gray-600">
                    <div>Order Amount: ₹{(deliveryInfo.orderAmount || 0).toFixed(2)}</div>
                    <div>Delivery Fee: ₹{(deliveryInfo.deliveryFee || 0).toFixed(2)}</div>
                    <div className="font-semibold border-t pt-1">Total Paid: ₹{(deliveryInfo.totalAmount || 0).toFixed(2)}</div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700 mb-2">Business Side:</div>
                  <div className="space-y-1 text-gray-600">
                    <div>Partner Gets: ₹{(partnerEarnings.totalEarnings || 0).toFixed(2)}</div>
                    <div>From Customer: ₹{(partnerEarnings.customerPaid || 0).toFixed(2)}</div>
                    <div>From Grocito: ₹{(partnerEarnings.grocitoPaid || 0).toFixed(2)}</div>
                    <div className={`font-semibold border-t pt-1 ${
                      (partnerEarnings.grocitoRevenue || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Grocito Net: {(partnerEarnings.grocitoRevenue || 0) >= 0 ? '+' : ''}₹{(partnerEarnings.grocitoRevenue || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPolicyDemo;