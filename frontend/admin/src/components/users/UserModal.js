import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authService } from '../../api/authService';

const UserModal = ({ user, type, onClose, onRoleUpdate, onUserUpdate, onUserDelete }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    address: '',
    pincode: '',
    contactNumber: ''
  });
  const [loading, setLoading] = useState(false);

  // Get current admin to check permissions
  const currentAdmin = authService.getCurrentUser();
  const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';
  const adminPincode = currentAdmin?.pincode;

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role || '',
        address: user.address || '',
        pincode: user.pincode || '',
        contactNumber: user.contactNumber || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'edit') {
        await onUserUpdate(user.id, formData);
        toast.success('User updated successfully!');
      } else if (type === 'delete') {
        await onUserDelete(user.id, false); // Pass false for regular delete
        toast.success('User deleted successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error in modal action:', error);
      toast.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole) => {
    setLoading(true);
    try {
      await onRoleUpdate(user.id, newRole);
      toast.success(`User role updated to ${newRole.replace('_', ' ')}`);
      onClose();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      USER: 'text-blue-600 bg-blue-100',
      ADMIN: 'text-purple-600 bg-purple-100',
      DELIVERY_PARTNER: 'text-orange-600 bg-orange-100'
    };
    return colors[role] || 'text-gray-600 bg-gray-100';
  };

  const getRoleIcon = (role) => {
    const icons = {
      USER: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      ADMIN: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      DELIVERY_PARTNER: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
    return icons[role] || icons.USER;
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-admin-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-admin-900">
                {type === 'view' && 'User Details'}
                {type === 'edit' && 'Edit User'}
                {type === 'delete' && 'Delete User'}
              </h2>
              <p className="text-sm text-admin-600 mt-1">
                {user?.fullName} ({user?.email})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-admin-400 hover:text-admin-600 p-2 rounded-lg hover:bg-admin-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {type === 'view' && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-admin-700 mb-1">Full Name</label>
                  <p className="text-admin-900 font-medium">{user?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-700 mb-1">Email</label>
                  <p className="text-admin-900">{user?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-700 mb-1">Contact Number</label>
                  <p className="text-admin-900">{user?.contactNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-700 mb-1">Pincode</label>
                  <p className="text-admin-900">{user?.pincode || 'N/A'}</p>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-admin-700 mb-1">Address</label>
                <p className="text-admin-900">{user?.address || 'N/A'}</p>
              </div>

              {/* Role Management */}
              <div>
                <label className="block text-sm font-medium text-admin-700 mb-3">Role Management</label>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(user?.role)}`}>
                    {getRoleIcon(user?.role)}
                    <span className="ml-2">{user?.role?.replace('_', ' ')}</span>
                  </span>
                  {user?.role !== 'ADMIN' && (
                    <div className="flex space-x-2">
                      {['USER', 'ADMIN', 'DELIVERY_PARTNER']
                        .filter(role => role !== user?.role)
                        .filter(role => role !== 'ADMIN' || isSuperAdmin) // Only super admin can assign ADMIN role
                        .map(role => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(role)}
                          disabled={loading}
                          className="px-3 py-1 text-xs font-medium text-admin-600 bg-admin-100 hover:bg-admin-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Change to {role.replace('_', ' ')}
                        </button>
                      ))}
                      {!isSuperAdmin && (
                        <p className="text-xs text-admin-500 self-center">
                          (Admin role restricted to Super Admins)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Date */}
              <div>
                <label className="block text-sm font-medium text-admin-700 mb-1">Registration Date</label>
                <p className="text-admin-900">{formatDate(user?.registeredDate)}</p>
              </div>

              {/* User Stats */}
              <div className="bg-admin-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-admin-700 mb-3">User Statistics</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-admin-900">0</p>
                    <p className="text-xs text-admin-600">Total Orders</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-admin-900">₹0</p>
                    <p className="text-xs text-admin-600">Total Spent</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-admin-900">0</p>
                    <p className="text-xs text-admin-600">Active Orders</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {type === 'edit' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-admin-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-admin-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-admin-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-admin-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-700 mb-2">
                    Pincode
                    {!isSuperAdmin && (
                      <span className="text-xs text-admin-500 ml-2">(Cannot be changed)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    disabled={!isSuperAdmin} // Only super admin can change pincode
                    className={`w-full px-4 py-3 border border-admin-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      !isSuperAdmin ? 'bg-admin-100 cursor-not-allowed' : ''
                    }`}
                  />
                  {!isSuperAdmin && (
                    <p className="text-xs text-admin-500 mt-1">
                      Only Super Admins can change user pincodes
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-700 mb-2">
                  Role
                  {!isSuperAdmin && (
                    <span className="text-xs text-admin-500 ml-2">(Admin role restricted)</span>
                  )}
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-admin-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="USER">User</option>
                  {isSuperAdmin && <option value="ADMIN">Admin</option>}
                  <option value="DELIVERY_PARTNER">Delivery Partner</option>
                </select>
                {!isSuperAdmin && (
                  <p className="text-xs text-admin-500 mt-1">
                    Only Super Admins can assign Admin roles
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-admin-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-admin-600 bg-admin-100 hover:bg-admin-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-admin-300 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    'Update User'
                  )}
                </button>
              </div>
            </form>
          )}

          {type === 'delete' && (
            <div className="space-y-6">
              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Confirm Deletion</h3>
                    <p className="text-sm text-red-700 mt-1">
                      This action cannot be undone. This will permanently delete the user account and all associated data.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-admin-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-admin-700 mb-3">User to be deleted:</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {user?.fullName}</p>
                  <p><span className="font-medium">Email:</span> {user?.email}</p>
                  <p><span className="font-medium">Role:</span> {user?.role?.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-admin-600 bg-admin-100 hover:bg-admin-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-admin-300 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    'Delete User'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserModal;