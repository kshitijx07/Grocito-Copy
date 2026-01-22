import React from 'react';
import { useSelector } from 'react-redux';
import { CurrencyDollarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

const EarningsChart = () => {
  const { stats } = useSelector((state) => state.dashboard);
  const { orders } = useSelector((state) => state.orders);

  // Calculate earnings data for the last 7 days
  const getEarningsData = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayOrders = orders.filter(order => {
        if (!order.deliveryTime) return false;
        const orderDate = new Date(order.deliveryTime);
        return orderDate.toDateString() === date.toDateString();
      });
      
      const dayEarnings = dayOrders.reduce((sum, order) => {
        return sum + (parseFloat(order.totalEarnings) || 0);
      }, 0);
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        earnings: dayEarnings,
        orders: dayOrders.length
      });
    }
    
    return last7Days;
  };

  const earningsData = getEarningsData();
  const maxEarnings = Math.max(...earningsData.map(d => d.earnings), 100);
  const totalWeekEarnings = earningsData.reduce((sum, d) => sum + d.earnings, 0);
  const avgDailyEarnings = totalWeekEarnings / 7;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Weekly Earnings</h3>
          <p className="text-sm text-gray-600">Last 7 days performance</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">₹{totalWeekEarnings.toFixed(0)}</div>
          <div className="text-sm text-gray-600">This week</div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <div className="flex items-end justify-between h-32 space-x-2">
          {earningsData.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t-md relative" style={{ height: '100px' }}>
                <div
                  className="bg-blue-500 rounded-t-md transition-all duration-300 hover:bg-blue-600"
                  style={{
                    height: `${(day.earnings / maxEarnings) * 100}%`,
                    minHeight: day.earnings > 0 ? '4px' : '0px'
                  }}
                  title={`₹${day.earnings.toFixed(0)} from ${day.orders} orders`}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-2">{day.date}</div>
              <div className="text-xs font-medium text-gray-900">₹{day.earnings.toFixed(0)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <div className="text-lg font-semibold text-gray-900">
                ₹{avgDailyEarnings.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Avg. Daily</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <div className="text-lg font-semibold text-gray-900">
                ₹{Math.max(...earningsData.map(d => d.earnings)).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Best Day</div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <div className="text-lg font-semibold text-gray-900">
                ₹{(stats.totalEarnings || 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">All Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">This Week's Breakdown</h4>
        <div className="space-y-2">
          {earningsData.filter(day => day.earnings > 0).map((day, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{day.date}</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">{day.orders} orders</span>
                <span className="font-medium text-gray-900">₹{day.earnings.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarningsChart;