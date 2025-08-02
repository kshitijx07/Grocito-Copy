import React from 'react';
import { earningsService } from '../../services/earningsService';

const StatsCards = ({ stats }) => {
  // Calculate real-time earnings using the earnings service
  const todayDeliveries = stats.todayDeliveries || 0;
  const todayEarnings = stats.todayEarnings || 0;
  const projection = earningsService.getEarningsProjection(todayDeliveries, todayEarnings);
  const currentBonuses = earningsService.getCurrentBonuses();
  
  // Calculate average earnings per delivery based on CORRECT policy
  // ₹25 for free delivery orders (≥₹199), ₹30 for paid delivery orders (<₹199)
  const avgEarningsPerDelivery = todayDeliveries > 0 ? (todayEarnings / todayDeliveries) : 27.5;

  const statsData = [
    {
      title: 'Today\'s Earnings',
      value: earningsService.formatEarnings(todayEarnings),
      subtitle: `${todayDeliveries} deliveries completed`,
      icon: '💰',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      projection: projection.projectedEarnings > todayEarnings ? `Projected: ${earningsService.formatEarnings(projection.projectedEarnings)}` : null
    },
    {
      title: 'Active Orders',
      value: `${stats.activeOrders || 0}/2`,
      subtitle: stats.activeOrders >= 2 ? 'Limit reached' : 'Available slots',
      icon: '🚚',
      color: stats.activeOrders >= 2 ? 'bg-red-500' : 'bg-blue-500',
      bgColor: stats.activeOrders >= 2 ? 'bg-red-50' : 'bg-blue-50',
      textColor: stats.activeOrders >= 2 ? 'text-red-600' : 'text-blue-600'
    },
    {
      title: 'Daily Target',
      value: `${todayDeliveries}/12`,
      subtitle: projection.willMeetDailyTarget ? '₹80 bonus earned!' : `${projection.deliveriesNeededForTarget} more for ₹80 bonus`,
      icon: '🎯',
      color: projection.willMeetDailyTarget ? 'bg-green-500' : 'bg-yellow-500',
      bgColor: projection.willMeetDailyTarget ? 'bg-green-50' : 'bg-yellow-50',
      textColor: projection.willMeetDailyTarget ? 'text-green-600' : 'text-yellow-600'
    },
    {
      title: 'Per Delivery Avg',
      value: earningsService.formatEarnings(avgEarningsPerDelivery),
      subtitle: `${stats.completedDeliveries || todayDeliveries} total completed`,
      icon: '📈',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      bonuses: Object.keys(currentBonuses).length > 0 ? `+${earningsService.formatEarnings(Object.values(currentBonuses).reduce((a, b) => a + b, 0))} bonus` : null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
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
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl shadow-md`}>
              {stat.icon}
            </div>
          </div>
          
          {/* Policy info for earnings card - CORRECT POLICY */}
          {stat.title === 'Today\'s Earnings' && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Orders ≥₹199:</span>
                  <span className="font-medium text-green-600">₹25 each (FREE delivery)</span>
                </div>
                <div className="flex justify-between">
                  <span>Orders &lt;₹199:</span>
                  <span className="font-medium text-blue-600">₹30 each (₹40 fee)</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Active bonuses indicator */}
          {Object.keys(currentBonuses).length > 0 && stat.title === 'Per Delivery Avg' && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-green-600 font-medium">
                Active Bonuses:
                {currentBonuses.peakHour && <span className="ml-1 bg-green-100 px-2 py-1 rounded">Peak +₹5</span>}
                {currentBonuses.weekend && <span className="ml-1 bg-blue-100 px-2 py-1 rounded">Weekend +₹3</span>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsCards;