import React from "react";
import { earningsService } from "../../services/earningsService";

const StatsCards = ({ stats }) => {
  // Calculate real-time earnings using the earnings service
  const todayDeliveries = stats.todayDeliveries || 0;
  const todayEarnings = stats.todayEarnings || 0;
  const projection = earningsService.getEarningsProjection(
    todayDeliveries,
    todayEarnings
  );
  const currentBonuses = earningsService.getCurrentBonuses();

  // Calculate average earnings per delivery based on CORRECT policy
  // ₹25 for free delivery orders (≥₹199), ₹30 for paid delivery orders (<₹199)
  const avgEarningsPerDelivery =
    todayDeliveries > 0 ? todayEarnings / todayDeliveries : 27.5;

  const statsData = [
    {
      title: "Today's Earnings",
      value: earningsService.formatEarnings(todayEarnings),
      subtitle: `${todayDeliveries} deliveries completed`,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      projection:
        projection.projectedEarnings > todayEarnings
          ? `Projected: ${earningsService.formatEarnings(
              projection.projectedEarnings
            )}`
          : null,
    },
    {
      title: "Active Orders",
      value: `${stats.activeOrders || 0}/2`,
      subtitle: stats.activeOrders >= 2 ? "Limit reached" : "Available slots",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12a3 3 0 11-6 0 3 3 0 016 0zM21 12a3 3 0 11-6 0 3 3 0 016 0zM12 12h.01M12 12h.01M12 12h.01"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 21l4-7 4 7M3 7l6 6 6-6"
          />
        </svg>
      ),
      color: stats.activeOrders >= 2 ? "bg-red-500" : "bg-blue-500",
      bgColor: stats.activeOrders >= 2 ? "bg-red-50" : "bg-blue-50",
      textColor: stats.activeOrders >= 2 ? "text-red-600" : "text-blue-600",
    },
    {
      title: "Daily Target",
      value: `${todayDeliveries}/12`,
      subtitle: projection.willMeetDailyTarget
        ? "₹80 bonus earned!"
        : `${projection.deliveriesNeededForTarget} more for ₹80 bonus`,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      color: projection.willMeetDailyTarget ? "bg-green-500" : "bg-yellow-500",
      bgColor: projection.willMeetDailyTarget ? "bg-green-50" : "bg-yellow-50",
      textColor: projection.willMeetDailyTarget
        ? "text-green-600"
        : "text-yellow-600",
    },
    {
      title: "Per Delivery Avg",
      value: earningsService.formatEarnings(avgEarningsPerDelivery),
      subtitle: `${
        stats.completedDeliveries || todayDeliveries
      } total completed`,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      bonuses:
        Object.keys(currentBonuses).length > 0
          ? `+${earningsService.formatEarnings(
              Object.values(currentBonuses).reduce((a, b) => a + b, 0)
            )} bonus`
          : null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              )}

              {/* Show projection for earnings */}
              {stat.projection && (
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  {stat.projection}
                </p>
              )}

              {/* Show current bonuses */}
              {stat.bonuses && (
                <p className="text-xs text-green-600 mt-1 font-medium">
                  {stat.bonuses}
                </p>
              )}
            </div>
            <div
              className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white shadow-md`}
            >
              {stat.icon}
            </div>
          </div>

          {/* Policy info for earnings card - CORRECT POLICY */}
          {stat.title === "Today's Earnings" && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Orders ≥₹199:</span>
                  <span className="font-medium text-green-600">
                    ₹25 each (FREE delivery)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Orders &lt;₹199:</span>
                  <span className="font-medium text-blue-600">
                    ₹30 each (₹40 fee)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Active bonuses indicator */}
          {Object.keys(currentBonuses).length > 0 &&
            stat.title === "Per Delivery Avg" && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-green-600 font-medium">
                  Active Bonuses:
                  {currentBonuses.peakHour && (
                    <span className="ml-1 bg-green-100 px-2 py-1 rounded">
                      Peak +₹5
                    </span>
                  )}
                  {currentBonuses.weekend && (
                    <span className="ml-1 bg-blue-100 px-2 py-1 rounded">
                      Weekend +₹3
                    </span>
                  )}
                </div>
              </div>
            )}
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
