import React from 'react';
import { authService } from '../../api/authService';

const UserFilters = ({ filters, onFilterChange, loading }) => {
  // Get current admin to check permissions
  const currentAdmin = authService.getCurrentUser();
  const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';
  const adminPincode = currentAdmin?.pincode;
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      role: '',
      status: '',
      pincode: ''
    };
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-admin-200 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-admin-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            disabled={loading}
            className="text-sm text-admin-500 hover:text-admin-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Filter */}
        <div>
          <label className="block text-sm font-medium text-admin-700 mb-2">
            Search Users
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-admin-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name or email..."
              disabled={loading}
              className="w-full pl-10 pr-4 py-2 border border-admin-300 rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent disabled:bg-admin-50"
            />
          </div>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-admin-700 mb-2">
            Role
          </label>
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-admin-300 rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent disabled:bg-admin-50"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="DELIVERY_PARTNER">Delivery Partner</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-admin-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-admin-300 rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent disabled:bg-admin-50"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Registration Period Filter */}
        <div>
          <label className="block text-sm font-medium text-admin-700 mb-2">
            Registration Period
          </label>
          <select
            value={filters.registrationPeriod || ''}
            onChange={(e) => handleFilterChange('registrationPeriod', e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-admin-300 rounded-lg focus:ring-2 focus:ring-admin-500 focus:border-transparent disabled:bg-admin-50"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="year">This Year</option>
          </select>
        </div>
        
        {/* Pincode Filter - Only for Super Admin */}
        {isSuperAdmin ? (
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-admin-700 mb-2">
              Pincode (All Warehouses)
            </label>
            <div className="flex flex-wrap gap-2">
              {['110001', '110002', '110003', '110004', '110005'].map(pincode => (
                <button
                  key={pincode}
                  onClick={() => handleFilterChange('pincode', filters.pincode === pincode ? '' : pincode)}
                  className={`px-3 py-1.5 text-sm rounded-md border ${
                    filters.pincode === pincode 
                      ? 'bg-admin-600 text-white border-admin-600' 
                      : 'bg-admin-50 text-admin-700 border-admin-200 hover:bg-admin-100'
                  }`}
                >
                  {pincode}
                </button>
              ))}
              {filters.pincode && !['110001', '110002', '110003', '110004', '110005'].includes(filters.pincode) && (
                <button
                  onClick={() => handleFilterChange('pincode', '')}
                  className="bg-admin-600 text-white px-3 py-1.5 text-sm rounded-md border border-admin-600"
                >
                  {filters.pincode} ✕
                </button>
              )}
              <div className="relative ml-2">
                <input
                  type="text"
                  value={filters.pincodeInput || ''}
                  onChange={(e) => handleFilterChange('pincodeInput', e.target.value)}
                  placeholder="Other pincode..."
                  className="w-32 px-3 py-1.5 text-sm border border-admin-300 rounded-md"
                />
                <button
                  onClick={() => {
                    if (filters.pincodeInput) {
                      handleFilterChange('pincode', filters.pincodeInput);
                      handleFilterChange('pincodeInput', '');
                    }
                  }}
                  disabled={!filters.pincodeInput}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-admin-500 hover:text-admin-700 disabled:text-admin-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Warehouse Admin - Show assigned pincode only */
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-admin-700 mb-2">
              Assigned Warehouse
            </label>
            <div className="flex items-center space-x-2">
              <div className="px-4 py-2 bg-admin-100 text-admin-800 rounded-lg border border-admin-200">
                <span className="font-medium">Pincode: {adminPincode || 'Not Assigned'}</span>
                <span className="text-admin-600 ml-2">• Your warehouse area</span>
              </div>
              <div className="text-sm text-admin-500">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Access restricted to your pincode only
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-admin-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-admin-600 font-medium">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-admin-100 text-admin-800">
                Search: {filters.search}
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-admin-400 hover:bg-admin-200 hover:text-admin-500"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.role && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-admin-100 text-admin-800">
                Role: {filters.role}
                <button
                  onClick={() => handleFilterChange('role', '')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-admin-400 hover:bg-admin-200 hover:text-admin-500"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-admin-100 text-admin-800">
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-admin-400 hover:bg-admin-200 hover:text-admin-500"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.pincode && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-admin-100 text-admin-800">
                Pincode: {filters.pincode}
                <button
                  onClick={() => handleFilterChange('pincode', '')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-admin-400 hover:bg-admin-200 hover:text-admin-500"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFilters;