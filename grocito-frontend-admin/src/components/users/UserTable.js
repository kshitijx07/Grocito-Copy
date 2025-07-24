import React from 'react';

const UserTable = ({ users, loading, pagination, onPageChange, onUserAction, onStatusToggle }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format last login time in a user-friendly way
  const getLastLogin = (user) => {
    if (!user.lastLogin) return 'Never';
    
    const date = new Date(user.lastLogin);
    const now = new Date();
    
    // Check for invalid date
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    return `${Math.floor(diffInMonths / 12)}y ago`;
  };

  const getRoleBadge = (role) => {
    const badges = {
      USER: 'bg-blue-100 text-blue-800',
      ADMIN: 'bg-purple-100 text-purple-800',
      DELIVERY_PARTNER: 'bg-orange-100 text-orange-800'
    };
    return badges[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (user) => {
    // Check if user has logged in within the last 3 months
    const lastLogin = new Date(user.lastLogin || user.registeredDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const isActive = lastLogin > threeMonthsAgo;
    
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-admin-200">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-admin-200 rounded mb-4"></div>
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex space-x-4 mb-4">
                <div className="w-10 h-10 bg-admin-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-admin-200 rounded"></div>
                  <div className="h-3 bg-admin-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-admin-200">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-admin-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-admin-900">
            Users ({pagination.totalUsers})
          </h3>
          <div className="text-sm text-admin-600">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} of{' '}
            {pagination.totalUsers} users
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-admin-200">
          <thead className="bg-admin-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-admin-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-admin-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-admin-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-admin-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-admin-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-admin-500 uppercase tracking-wider">
                Registered
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-admin-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-admin-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-admin-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-admin-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-admin-700">
                          {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-admin-900">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-admin-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                    {user.role?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user)}`}>
                      {getStatusBadge(user).includes('green') ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => {
                        // Determine if user is active based on last login
                        const lastLogin = new Date(user.lastLogin || user.registeredDate);
                        const threeMonthsAgo = new Date();
                        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                        const isActive = lastLogin > threeMonthsAgo;
                        
                        // Toggle the opposite status
                        onStatusToggle(user.id, !isActive);
                      }}
                      className="ml-2 text-admin-400 hover:text-admin-600"
                      title={`${getStatusBadge(user).includes('green') ? 'Deactivate' : 'Activate'} user`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-900">
                  <div>
                    <div className="font-medium">{user.pincode}</div>
                    <div className="text-admin-500 text-xs">{user.contactNumber}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-500">
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {user.lastLoginFormatted || getLastLogin(user)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-500">
                  {user.registeredDateFormatted || formatDate(user.registeredDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onUserAction('view', user)}
                      className="text-admin-600 hover:text-admin-900 p-1 rounded"
                      title="View user details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onUserAction('edit', user)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="Edit user"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {user.role !== 'ADMIN' && (
                      <button
                        onClick={() => onUserAction('delete', user)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete user"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-admin-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-admin-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 text-sm border border-admin-300 rounded-md hover:bg-admin-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(pagination.totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      page === pagination.currentPage
                        ? 'bg-admin-600 text-white border-admin-600'
                        : 'border-admin-300 hover:bg-admin-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 text-sm border border-admin-300 rounded-md hover:bg-admin-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {users.length === 0 && !loading && (
        <div className="px-6 py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-admin-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-admin-900">No users found</h3>
          <p className="mt-1 text-sm text-admin-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserTable;