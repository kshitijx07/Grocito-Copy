import React, { useState, useEffect } from "react";
import { calculateOrderEarnings, formatCurrency, getCurrentBonusStatus } from "../../utils/earningsCalculator";

const EarningsBreakdown = ({ deliveries = [] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [earningsData, setEarningsData] = useState(null);

  useEffect(() => {
    calculateEarnings();
  }, [deliveries, selectedPeriod]);

  const calculateEarnings = () => {
    if (!deliveries.length) {
      setEarningsData({
        totalEarnings: 0,
        totalDeliveries: 0,
        freeDeliveries: 0,
        paidDeliveries: 0,
        totalBonuses: 0,
        earningsBreakdown: [],
      });
      return;
    }

    let filteredDeliveries = deliveries;
    const today = new Date().toISOString().split("T")[0];

    // Filter deliveries based on selected period
    switch (selectedPeriod) {
      case "today":
        filteredDeliveries = deliveries.filter((d) => {
          const deliveryDate = d.completedAt || d.deliveredAt;
          return deliveryDate && deliveryDate.startsWith(today);
        });
        break;
      case "week":
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekStartISO = weekStart.toISOString().split('T')[0];
        filteredDeliveries = deliveries.filter((d) => {
          const deliveryDate = d.completedAt || d.deliveredAt;
          return deliveryDate && deliveryDate >= weekStartISO;
        });
        break;
      case "month":
        const monthStart = new Date().toISOString().slice(0, 7); // YYYY-MM
        filteredDeliveries = deliveries.filter((d) => {
          const deliveryDate = d.completedAt || d.deliveredAt;
          return deliveryDate && deliveryDate.startsWith(monthStart);
        });
        break;
    }

    // Calculate earnings from real delivery data
    let totalEarnings = 0;
    let totalDeliveries = filteredDeliveries.length;
    let freeDeliveries = 0;
    let paidDeliveries = 0;
    let totalBonuses = 0;
    let totalBaseEarnings = 0;
    let peakHourDeliveries = 0;
    let weekendDeliveries = 0;

    const earningsBreakdown = filteredDeliveries.map(delivery => {
      // Use unified calculator for consistent results
      const earnings = calculateOrderEarnings(delivery);
      
      totalEarnings += earnings.totalEarnings;
      totalBonuses += earnings.totalBonuses || 0;
      totalBaseEarnings += earnings.baseEarnings;
      
      if (earnings.deliveryType === 'FREE_DELIVERY') {
        freeDeliveries++;
      } else {
        paidDeliveries++;
      }

      // Count bonus deliveries
      if (earnings.bonuses.peakHour) {
        peakHourDeliveries++;
      }
      if (earnings.bonuses.weekend) {
        weekendDeliveries++;
      }

      return {
        orderId: delivery.id,
        orderAmount: earnings.orderAmount,
        deliveryType: earnings.deliveryType,
        baseEarnings: earnings.baseEarnings,
        totalBonuses: earnings.totalBonuses,
        totalEarnings: earnings.totalEarnings,
        bonusBreakdown: earnings.bonusBreakdown
      };
    });

    // Check for daily target bonus (12+ deliveries = ₹80 bonus) - ONLY FOR TODAY
    const dailyTargetBonus = (selectedPeriod === 'today' && totalDeliveries >= 12) ? 80 : 0;
    const dailyTargetAchieved = (selectedPeriod === 'today' && totalDeliveries >= 12);
    
    // Add daily target bonus to total earnings
    const finalTotalEarnings = totalEarnings + dailyTargetBonus;

    const calculatedEarnings = {
      date: new Date().toISOString().split('T')[0],
      totalDeliveries,
      freeDeliveries,
      paidDeliveries,
      peakHourDeliveries,
      weekendDeliveries,
      totalEarnings: parseFloat(finalTotalEarnings.toFixed(2)),
      totalBaseEarnings: parseFloat(totalBaseEarnings.toFixed(2)),
      totalBonuses: parseFloat((totalBonuses + dailyTargetBonus).toFixed(2)),
      dailyTargetBonus,
      dailyTargetAchieved,
      deliveriesNeededForTarget: Math.max(0, 12 - totalDeliveries),
      averageEarningsPerDelivery: totalDeliveries > 0 ? parseFloat((finalTotalEarnings / totalDeliveries).toFixed(2)) : 0,
      earningsBreakdown,
      bonusBreakdown: {
        peakHour: 0,
        weekend: 0,
        dailyTarget: dailyTargetBonus
      }
    };

    setEarningsData(calculatedEarnings);
  };

  const periods = [
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
  ];

  if (!earningsData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Earnings Breakdown
          </h3>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {periods.map((period) => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period.key
                    ? "bg-green-500 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(earningsData.totalEarnings)}
            </div>
            <div className="text-sm text-gray-600">Total Earnings</div>
            {earningsData.dailyTargetAchieved && (
              <div className="text-xs text-green-500 mt-1">Target Achieved!</div>
            )}
          </div>

          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {earningsData.totalDeliveries}
            </div>
            <div className="text-sm text-gray-600">Total Deliveries</div>
            {!earningsData.dailyTargetAchieved && earningsData.deliveriesNeededForTarget > 0 && selectedPeriod === 'today' && (
              <div className="text-xs text-blue-500 mt-1">
                {earningsData.deliveriesNeededForTarget} more for ₹80 bonus
              </div>
            )}
          </div>

          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(earningsData.totalBonuses)}
            </div>
            <div className="text-sm text-gray-600">Total Bonuses</div>
            {earningsData.dailyTargetBonus > 0 && selectedPeriod === 'today' && (
              <div className="text-xs text-purple-500 mt-1">Includes ₹80 daily bonus</div>
            )}
          </div>

          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(earningsData.averageEarningsPerDelivery)}
            </div>
            <div className="text-sm text-gray-600">Avg per Delivery</div>
          </div>
        </div>

        {/* Daily Target Progress */}
        {selectedPeriod === 'today' && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-blue-900">Daily Target Progress</h4>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {earningsData.totalDeliveries}/12
                </div>
                <div className="text-sm text-blue-700">Deliveries</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-blue-200 rounded-full h-3 mb-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((earningsData.totalDeliveries / 12) * 100, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-700">
                {earningsData.dailyTargetAchieved 
                  ? 'Daily target achieved! ₹80 bonus earned!' 
                  : `${earningsData.deliveriesNeededForTarget} more deliveries for ₹80 bonus`
                }
              </span>
              <span className="text-blue-600 font-medium">
                {Math.round((earningsData.totalDeliveries / 12) * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Delivery Type & Bonus Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Delivery Types</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Free Delivery Orders (≥₹199)
                </span>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {earningsData.freeDeliveries}
                  </div>
                  <div className="text-xs text-green-500">₹25 each</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Paid Delivery Orders (&lt;₹199)
                </span>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">
                    {earningsData.paidDeliveries}
                  </div>
                  <div className="text-xs text-blue-500">₹30 each</div>
                </div>
              </div>
              {earningsData.peakHourDeliveries > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Peak Hour Deliveries
                  </span>
                  <div className="text-right">
                    <div className="font-semibold text-orange-600">
                      {earningsData.peakHourDeliveries}
                    </div>
                    <div className="text-xs text-orange-500">+₹5 each</div>
                  </div>
                </div>
              )}
              {earningsData.weekendDeliveries > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Weekend Deliveries
                  </span>
                  <div className="text-right">
                    <div className="font-semibold text-purple-600">
                      {earningsData.weekendDeliveries}
                    </div>
                    <div className="text-xs text-purple-500">+₹3 each</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Earnings Breakdown
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Base Earnings</span>
                <span className="font-semibold">
                  {formatCurrency(earningsData.totalBaseEarnings)}
                </span>
              </div>
              
              {earningsData.bonusBreakdown?.peakHour > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-600">Peak Hour Bonus</span>
                  <span className="font-semibold text-orange-600">
                    +{formatCurrency(earningsData.bonusBreakdown.peakHour)}
                  </span>
                </div>
              )}
              
              {earningsData.bonusBreakdown?.weekend > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-600">Weekend Bonus</span>
                  <span className="font-semibold text-purple-600">
                    +{formatCurrency(earningsData.bonusBreakdown.weekend)}
                  </span>
                </div>
              )}
              
              {earningsData.dailyTargetBonus > 0 && selectedPeriod === 'today' && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-600">Daily Target Bonus</span>
                  <span className="font-semibold text-blue-600">
                    +{formatCurrency(earningsData.dailyTargetBonus)}
                  </span>
                </div>
              )}
              
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">Total Earnings</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(earningsData.totalEarnings)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Deliveries */}
        {earningsData.earningsBreakdown &&
          earningsData.earningsBreakdown.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Recent Deliveries
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {earningsData.earningsBreakdown
                  .slice(-10)
                  .reverse()
                  .map((delivery, index) => (
                    <div
                      key={delivery.orderId || index}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            delivery.deliveryType === "FREE_DELIVERY"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                        ></div>
                        <div>
                          <div className="text-sm font-medium">
                            Order #{delivery.orderId || `${index + 1}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {delivery.deliveryType === "FREE_DELIVERY"
                              ? "Free Delivery"
                              : "Paid Delivery"}{" "}
                            • {formatCurrency(delivery.orderAmount)}
                          </div>
                          {delivery.bonusBreakdown && delivery.bonusBreakdown !== 'No bonuses' && (
                            <div className="text-xs text-orange-600 mt-1">
                              Bonus: {delivery.bonusBreakdown}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(delivery.totalEarnings)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Base: ₹{delivery.baseEarnings}
                          {delivery.totalBonuses > 0 && (
                            <span className="text-green-600"> + ₹{delivery.totalBonuses}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        {/* Current Bonus Status */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3">
            Current Bonus Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg ${getCurrentBonusStatus().isPeakHour ? 'bg-orange-100 border border-orange-300' : 'bg-gray-100'}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getCurrentBonusStatus().isPeakHour ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                <span className={`font-medium ${getCurrentBonusStatus().isPeakHour ? 'text-orange-800' : 'text-gray-600'}`}>
                  Peak Hours (7-10 AM, 6-9 PM)
                </span>
              </div>
              <div className={`text-sm mt-1 ${getCurrentBonusStatus().isPeakHour ? 'text-orange-700' : 'text-gray-500'}`}>
                {getCurrentBonusStatus().isPeakHour ? '+₹5 per delivery ACTIVE' : 'Not active now'}
              </div>
            </div>
            
            <div className={`p-3 rounded-lg ${getCurrentBonusStatus().isWeekend ? 'bg-purple-100 border border-purple-300' : 'bg-gray-100'}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getCurrentBonusStatus().isWeekend ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                <span className={`font-medium ${getCurrentBonusStatus().isWeekend ? 'text-purple-800' : 'text-gray-600'}`}>
                  Weekend Bonus (Sat & Sun)
                </span>
              </div>
              <div className={`text-sm mt-1 ${getCurrentBonusStatus().isWeekend ? 'text-purple-700' : 'text-gray-500'}`}>
                {getCurrentBonusStatus().isWeekend ? '+₹3 per delivery ACTIVE' : 'Not active now'}
              </div>
            </div>
          </div>
        </div>

        {/* Policy Information */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            Earnings Policy
          </h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>
              • <strong>Orders ≥₹199:</strong> ₹25 per delivery (FREE delivery for customer, paid by Grocito)
            </div>
            <div>
              • <strong>Orders &lt;₹199:</strong> ₹30 per delivery (Customer pays ₹40 fee, you get 75%)
            </div>
            <div>• <strong>Daily Target:</strong> Complete 12+ deliveries for ₹80 bonus</div>
            <div>• <strong>Peak Hours</strong> (7-10 AM, 6-9 PM): +₹5 per delivery</div>
            <div>• <strong>Weekends:</strong> +₹3 per delivery</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsBreakdown;
