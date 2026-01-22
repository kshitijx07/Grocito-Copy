import React from 'react';

const OrderFilters = ({ filters, onFilterChange, adminInfo }) => {
  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'orderTime',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.dateFrom || filters.dateTo;

  const orderStatuses = [
    { value: 'PLACED', label: 'Placed', color: 'text-blue-600' },
    { value: 'PACKED', label: 'Packed', color: 'text-yellow-600' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'text-purple-600' },
    { value: 'DELIVERED', label: 'Delivered', color: 'text-green-600' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'text-red-600' }
  ];

  // Get today's date for date input max values
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search orders by ID, customer, address..."
              value={filters.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="min-w-48">
          <select
            value={filters.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            {orderStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="min-w-40">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleInputChange('dateFrom', e.target.value)}
            max={today}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="From Date"
          />
        </div>

        {/* Date To */}
        <div className="min-w-40">
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleInputChange('dateTo', e.target.value)}
            max={today}
            min={filters.dateFrom || undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="To Date"
          />
        </div>

        {/* Sort By */}
        <div className="min-w-40">
          <select
            value={filters.sortBy}
            onChange={(e) => handleInputChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="orderTime">Sort by Date</option>
            <option value="totalAmount">Sort by Amount</option>
            <option value="status">Sort by Status</option>
            <option value="pincode">Sort by Pincode</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="min-w-32">
          <select
            value={filters.sortOrder}
            onChange={(e) => handleInputChange('sortOrder', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{filters.search}"
              <button
                onClick={() => handleInputChange('search', '')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Status: {orderStatuses.find(s => s.value === filters.status)?.label}
              <button
                onClick={() => handleInputChange('status', '')}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.dateFrom && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              From: {new Date(filters.dateFrom).toLocaleDateString()}
              <button
                onClick={() => handleInputChange('dateFrom', '')}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.dateTo && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              To: {new Date(filters.dateTo).toLocaleDateString()}
              <button
                onClick={() => handleInputChange('dateTo', '')}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Quick Filter Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleInputChange('dateFrom', new Date().toISOString().split('T')[0])}
          className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            handleInputChange('dateFrom', weekAgo.toISOString().split('T')[0]);
          }}
          className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          Last 7 Days
        </button>
        <button
          onClick={() => {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            handleInputChange('dateFrom', monthAgo.toISOString().split('T')[0]);
          }}
          className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          Last 30 Days
        </button>
        
        {/* Status Quick Filters */}
        {orderStatuses.slice(0, 3).map(status => (
          <button
            key={status.value}
            onClick={() => handleInputChange('status', status.value)}
            className={`px-3 py-1 text-xs font-medium hover:bg-gray-200 rounded-full transition-colors ${
              filters.status === status.value 
                ? 'bg-gray-200 text-gray-800' 
                : 'text-gray-600 hover:text-gray-800 bg-gray-100'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Region Info for Regional Admins */}
      {adminInfo?.isRegionalAdmin && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-blue-800">
              Showing orders for your region: <strong>{adminInfo.pincode}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderFilters;