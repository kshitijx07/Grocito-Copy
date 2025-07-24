import React, { useState, useEffect } from 'react';
import { userService } from '../../api/userService';
import { authService } from '../../api/authService';
import { locationService } from '../../services/locationService';
import { toast } from 'react-toastify';
import UserTable from './UserTable';
import UserFilters from './UserFilters';
import UserStats from './UserStats';
import UserModal from './UserModal';
import LocationDetector from '../common/LocationDetector';
import AdminHeader from '../common/AdminHeader';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [adminPincode, setAdminPincode] = useState('');
  const [warehouseInfo, setWarehouseInfo] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    pincode: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'edit', 'delete'
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [showLocationDetector, setShowLocationDetector] = useState(false);

  // Fetch users data
  const fetchUsers = async (page = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers(page, pagination.limit, currentFilters);
      setUsers(response.users || []);
      setStats(response.stats || {});
      setAdminPincode(response.adminPincode || '');
      setPagination({
        ...pagination,
        currentPage: response.currentPage || page,
        totalPages: response.totalPages || 1,
        totalUsers: response.totalUsers || 0
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users data');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    // Get current admin user info
    const currentAdmin = authService.getCurrentUser();
    if (!currentAdmin) {
      console.error('No admin user found');
      return;
    }

    const isSuperAdmin = currentAdmin.role === 'SUPER_ADMIN';
    setAdminPincode(currentAdmin.pincode || null);
    
    // Set warehouse info based on pincode
    const warehouseNames = {
      '110001': 'South Delhi Warehouse',
      '110002': 'North Delhi Warehouse', 
      '110003': 'East Delhi Warehouse',
      '110004': 'West Delhi Warehouse',
      '110005': 'Central Delhi Warehouse',
      '412105': 'Pune Warehouse, Maharashtra',
      '441904': 'Bhandara Warehouse, Maharashtra'
    };
    
    if (isSuperAdmin) {
      setWarehouseInfo({
        name: 'All Warehouses',
        pincode: null,
        role: 'SUPER_ADMIN'
      });
    } else {
      // Regular admin - must have pincode
      if (!currentAdmin.pincode) {
        console.error('Regular admin without pincode detected');
        toast.error('No warehouse assigned. Please contact super admin.');
        return;
      }
      
      const warehouseInfo = {
        name: warehouseNames[currentAdmin.pincode] || `Warehouse (${currentAdmin.pincode})`,
        pincode: currentAdmin.pincode,
        role: currentAdmin.role
      };
      setWarehouseInfo(warehouseInfo);
      
      // FORCE pincode filter for regular admins - they cannot change this
      setFilters(prev => ({
        ...prev,
        pincode: currentAdmin.pincode
      }));
    }
    
    fetchUsers();
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    // Get current admin to enforce pincode restrictions
    const currentAdmin = authService.getCurrentUser();
    const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';
    
    // STRICT ENFORCEMENT: Regular admins cannot change pincode filter
    if (!isSuperAdmin && currentAdmin?.pincode) {
      newFilters = {
        ...newFilters,
        pincode: currentAdmin.pincode // Force admin's pincode
      };
    }
    
    setFilters(newFilters);
    fetchUsers(1, newFilters);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchUsers(page);
  };

  // Handle user actions
  const handleUserAction = (action, user) => {
    setSelectedUser(user);
    setModalType(action);
    setShowModal(true);
  };

  // Handle role update
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      toast.success('User role updated successfully! 🎉');
      fetchUsers(pagination.currentPage);
      setShowModal(false);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(error.message || 'Failed to update user role');
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (userId, isActive) => {
    try {
      await userService.toggleUserStatus(userId, isActive);
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully! 🎉`);
      fetchUsers(pagination.currentPage);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  // Handle user update
  const handleUserUpdate = async (userId, userData) => {
    try {
      await userService.updateUser(userId, userData);
      toast.success('User details updated successfully! 🎉');
      fetchUsers(pagination.currentPage);
      setShowModal(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user details');
    }
  };

  // Handle user delete
  const handleUserDelete = async (userId, forceDelete = false) => {
    try {
      await userService.deleteUser(userId, forceDelete);
      toast.success('User deleted successfully! 🗑️');
      fetchUsers(pagination.currentPage);
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      
      // Check if it's the "user has orders" error
      if (error.message.startsWith('USER_HAS_ORDERS:')) {
        const [, fullMessage, orderCount] = error.message.split(':');
        const currentAdmin = authService.getCurrentUser();
        const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';
        
        if (isSuperAdmin) {
          // Show confirmation dialog for force deletion
          const confirmForceDelete = window.confirm(
            `⚠️ WARNING: Force Delete User\n\n` +
            `This user has ${orderCount} active order${orderCount === '1' ? '' : 's'}. ` +
            `Force deleting will permanently remove:\n` +
            `• User account\n` +
            `• All order history (${orderCount} order${orderCount === '1' ? '' : 's'})\n` +
            `• Shopping cart data\n\n` +
            `This action cannot be undone and may affect business records.\n\n` +
            `Are you sure you want to proceed with force deletion?`
          );
          
          if (confirmForceDelete) {
            // Retry with force delete
            handleUserDelete(userId, true);
            return;
          }
        } else {
          // Show the user-friendly error message from backend
          toast.error(fullMessage, {
            autoClose: 8000, // Show longer for important message
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } else {
        toast.error(error.message || 'Failed to delete user');
      }
    }
  };

  // Handle location detection
  const handleLocationDetected = (locationData) => {
    setDetectedLocation(locationData);
    
    // Auto-update pincode filter if super admin
    const currentAdmin = authService.getCurrentUser();
    const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';
    
    if (isSuperAdmin) {
      const newFilters = {
        ...filters,
        pincode: locationData.pincode
      };
      setFilters(newFilters);
      fetchUsers(1, newFilters);
      
      toast.success(
        `Filtering users by detected location: ${locationData.pincode}`,
        { autoClose: 3000 }
      );
    }
  };

  // Handle location detection error
  const handleLocationError = (error) => {
    console.error('Location detection error:', error);
    setDetectedLocation(null);
  };

  // Toggle location detector visibility
  const toggleLocationDetector = () => {
    setShowLocationDetector(!showLocationDetector);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        title="User Management" 
        subtitle={warehouseInfo.name ? (
          warehouseInfo.role === 'SUPER_ADMIN' ? 
            'Managing all warehouses and users' : 
            `Managing warehouse: ${warehouseInfo.name}${warehouseInfo.pincode ? ` • Pincode: ${warehouseInfo.pincode}` : ''}`
        ) : 'Loading warehouse information...'}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 mb-6">
          {/* Location Detector Toggle - Only for Super Admin */}
          {warehouseInfo.role === 'SUPER_ADMIN' && (
            <button
              onClick={toggleLocationDetector}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{showLocationDetector ? 'Hide' : 'Detect'} Location</span>
            </button>
          )}
          
          <button
            onClick={() => fetchUsers(pagination.currentPage)}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
        {/* Stats Cards */}
        <UserStats stats={stats} loading={loading} />

        {/* Location Detector - Only for Super Admin */}
        {warehouseInfo.role === 'SUPER_ADMIN' && showLocationDetector && (
          <div className="bg-white rounded-lg shadow-sm border border-admin-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-admin-900">Location Detection</h3>
              <p className="text-sm text-admin-600">
                Detect your current location to filter users by nearby pincode
              </p>
            </div>
            <LocationDetector
              onLocationDetected={handleLocationDetected}
              onError={handleLocationError}
              className="w-full"
            />
            {detectedLocation && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Current Filter Applied</h4>
                    <p className="text-sm text-blue-700">
                      Showing users from pincode: <strong>{detectedLocation.pincode}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, pincode: '' }));
                      fetchUsers(1, { ...filters, pincode: '' });
                      setDetectedLocation(null);
                      toast.info('Location filter cleared');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <UserFilters 
          filters={filters} 
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        {/* Users Table */}
        <UserTable
          users={users}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onUserAction={handleUserAction}
          onStatusToggle={handleStatusToggle}
        />
      </div>

      {/* User Modal */}
      {showModal && (
        <UserModal
          user={selectedUser}
          type={modalType}
          onClose={() => setShowModal(false)}
          onRoleUpdate={handleRoleUpdate}
          onUserUpdate={handleUserUpdate}
          onUserDelete={handleUserDelete}
        />
      )}
    </div>
  );
};

export default UserManagement;