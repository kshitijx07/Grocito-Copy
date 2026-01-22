import React from 'react';

const OrderStats = ({ stats, adminInfo }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'PLACED': 'bg-blue-100 text-blue-800',
      'PACKED': 'bg-yellow-100 text-yellow-800',
      'OUT_FOR_DELIVERY': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const mainStatCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-900',
      change: stats.weekOrders ? `+${stats.weekOrders} this week` : null
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue || 0),
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      bgColor: 'bg-green-100',
      textColor: 'text-green-900',
      change: stats.weekRevenue ? `+${formatCurrency(stats.weekRevenue)} this week` : null
    },
    {
      title: 'Average Order Value',
      value: formatCurrency(stats.averageOrderValue || 0),
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-900'
    },
    {
      title: 'Today\'s Orders',
      value: stats.todayOrders || 0,
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-900',
      change: stats.todayRevenue ? formatCurrency(stats.todayRevenue) : null
    }
  ];

  return (
    <div className="mb-8">
      {/* Region Info */}
      {adminInfo && (
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {adminInfo.isSuperAdmin ? 'Global Dashboard' : 'Regional Dashboard'}
              </h3>
              <p className="text-sm text-gray-600">
                {adminInfo.isSuperAdmin 
                  ? 'Viewing orders from all regions' 
                  : `Viewing orders for pincode: ${adminInfo.pincode}`
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{adminInfo.name}</p>
              <p className="text-xs text-gray-500">{adminInfo.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {mainStatCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                {stat.change && (
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
          <div className="space-y-3">
            {Object.entries(stats.statusDistribution || {})
              .sort(([,a], [,b]) => b - a)
              .map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / stats.totalOrders) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Time-based Metrics */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Time-based Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Today</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{stats.todayOrders || 0}</p>
                <p className="text-xs text-gray-500">{formatCurrency(stats.todayRevenue || 0)}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">This Week</p>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{stats.weekOrders || 0}</p>
                <p className="text-xs text-gray-500">{formatCurrency(stats.weekRevenue || 0)}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">This Month</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{stats.monthOrders || 0}</p>
                <p className="text-xs text-gray-500">{formatCurrency(stats.monthRevenue || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Trends (Last 7 Days)</h3>
          <div className="space-y-3">
            {(stats.dailyTrends || []).map((day, index) => {
              const maxOrders = Math.max(...(stats.dailyTrends || []).map(d => d.orders));
              const percentage = maxOrders > 0 ? (day.orders / maxOrders) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-600 w-12">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2 ml-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{day.orders}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(day.revenue)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStats;