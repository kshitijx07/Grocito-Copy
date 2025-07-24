import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  TruckIcon,
  IdentificationIcon,
  CheckBadgeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { fetchDashboardStats } from '../../store/slices/dashboardSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { partner } = useSelector((state) => state.auth);
  const { stats } = useSelector((state) => state.dashboard);
  
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch stats when component mounts
  useEffect(() => {
    if (partner?.id) {
      dispatch(fetchDashboardStats(partner.id));
    }
  }, [dispatch, partner?.id]);

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityStatusColor = (status) => {
    switch (status) {
      case 'ONLINE':
        return 'bg-green-100 text-green-800';
      case 'BUSY':
        return 'bg-yellow-100 text-yellow-800';
      case 'OFFLINE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">
                  {partner?.fullName?.charAt(0) || 'D'}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {partner?.fullName || 'Delivery Partner'}
              </h2>
              <p className="text-gray-600 mt-1">
                Delivery Partner
              </p>
              
              {/* Status Badges */}
              <div className="flex justify-center space-x-2 mt-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getVerificationStatusColor(partner?.verificationStatus)}`}>
                  {partner?.verificationStatus || 'PENDING'}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${stats?.activeOrders > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                  {stats?.activeOrders > 0 ? 'busy' : 'available'}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.completedDeliveries || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Deliveries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(stats?.averageRating || 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Full Name</div>
                    <div className="text-sm text-gray-600">{partner?.fullName || 'Not provided'}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Email</div>
                    <div className="text-sm text-gray-600">{partner?.email || 'Not provided'}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Phone Number</div>
                    <div className="text-sm text-gray-600">{partner?.phoneNumber || 'Not provided'}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Service Pincode</div>
                    <div className="text-sm text-gray-600">{partner?.pincode || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <TruckIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Vehicle Type</div>
                    <div className="text-sm text-gray-600">{partner?.vehicleType || 'Not provided'}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <IdentificationIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Vehicle Number</div>
                    <div className="text-sm text-gray-600">{partner?.vehicleNumber || 'Not provided'}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CheckBadgeIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">License Number</div>
                    <div className="text-sm text-gray-600">{partner?.licenseNumber || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Verification Status</span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getVerificationStatusColor(partner?.verificationStatus)}`}>
                    {partner?.verificationStatus || 'PENDING'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Current Status</span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${stats?.activeOrders > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {stats?.activeOrders > 0 ? 'Busy' : 'Available'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Account Created</span>
                  <span className="text-sm text-gray-600">
                    {partner?.createdAt ? new Date(partner.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Last Login</span>
                  <span className="text-sm text-gray-600">
                    {partner?.lastLogin ? new Date(partner.lastLogin).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowProfileModal(true)}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="font-medium text-gray-900">Update Profile Information</div>
                <div className="text-sm text-gray-600">Change your personal details</div>
              </button>
              
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="font-medium text-gray-900">Change Password</div>
                <div className="text-sm text-gray-600">Update your account password</div>
              </button>
              
              <button 
                onClick={() => setShowVehicleModal(true)}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="font-medium text-gray-900">Update Vehicle Information</div>
                <div className="text-sm text-gray-600">Change vehicle details</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Update Profile Information</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Profile update functionality will be available soon.</p>
              <p className="text-sm text-gray-500">Contact support if you need to update your information.</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Password change functionality will be available soon.</p>
              <p className="text-sm text-gray-500">For security reasons, please contact support to change your password.</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Update Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Update Vehicle Information</h3>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Vehicle information update will be available soon.</p>
              <p className="text-sm text-gray-500">Contact support if you need to update your vehicle details.</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowVehicleModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;