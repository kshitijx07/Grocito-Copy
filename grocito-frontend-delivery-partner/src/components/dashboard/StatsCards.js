import React from 'react';

const StatsCards = ({ stats }) => {
  const statsData = [
    {
      title: 'Today\'s Earnings',
      value: `₹${(stats.todayEarnings || 0).toFixed(0)}`,
      subtitle: `${stats.todayDeliveries || 0} deliveries`,
      icon: '💰',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
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
      title: 'Week Earnings',
      value: `₹${(stats.weekEarnings || 0).toFixed(0)}`,
      subtitle: `${stats.weekDeliveries || 0} deliveries`,
      icon: '📊',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Avg per Delivery',
      value: `₹${(stats.avgEarningsPerDelivery || 0).toFixed(0)}`,
      subtitle: `${stats.completedDeliveries || 0} total`,
      icon: '📈',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              )}
            </div>
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
              {stat.icon}
            </div>
          </div>
          
          {/* Additional info for total earnings */}
          {stat.title === 'Today\'s Earnings' && stats.totalEarnings && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Total: ₹{stats.totalEarnings.toFixed(0)}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsCards;