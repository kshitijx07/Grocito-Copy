import React, { useState, useEffect } from 'react';
import { authService } from '../../api/authService';
import api from '../../api/config';
import { toast } from 'react-toastify';
import AdminHeader from '../common/AdminHeader';

const ProfileManagement = () => {
  const currentUser = authService.getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    contactNumber: currentUser?.contactNumber || '',
    role: currentUser?.role || '',
    pincode: currentUser?.pincode || '',
    address: currentUser?.address || '',
    registeredDate: currentUser?.registeredDate || ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileErrors, setProfileErrors] = useState({});

  useEffect(() => {
    // Load additional profile data if needed
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      console.log('Loading admin profile data...');
      
      // Get current user email from localStorage
      const currentUserEmail = currentUser?.email;
      if (!currentUserEmail) {
        throw new Error('No user email found. Please login again.');
      }
      
      console.log('Loading profile for email:', currentUserEmail);
      
      const response = await api.get(`/users/admin/profile?email=${encodeURIComponent(currentUserEmail)}`);
      console.log('Profile data response:', response.data);
      
      const userData = response.data;
      setProfileData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        contactNumber: userData.contactNumber || '',
        role: userData.role || '',
        pincode: userData.pincode || '',
        address: userData.address || '',
        registeredDate: userData.registeredDate || ''
      });
      
      // Update localStorage with fresh data from database
      authService.updateCurrentUser(userData);
      
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error(`Failed to load profile data: ${error.response?.data || error.message}`);
      
      // Fallback to localStorage data
      const userData = authService.getCurrentUser();
      if (userData) {
        setProfileData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          contactNumber: userData.contactNumber || '',
          role: userData.role || '',
          pincode: userData.pincode || '',
          address: userData.address || '',
          registeredDate: userData.registeredDate || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (profileData.contactNumber && profileData.contactNumber.trim() && 
        !/^\+?[\d\s-()]{10,}$/.test(profileData.contactNumber.trim())) {
      errors.contactNumber = 'Phone number is invalid';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    try {
      setLoading(true);
      console.log('Updating admin profile:', profileData);
      
      // Get current user email
      const currentUserEmail = currentUser?.email;
      if (!currentUserEmail) {
        throw new Error('No user email found. Please login again.');
      }
      
      // Only send editable fields
      const updateData = {
        fullName: profileData.fullName.trim(),
        contactNumber: profileData.contactNumber?.trim() || '',
        address: profileData.address?.trim() || ''
      };
      
      console.log('Sending update data:', updateData);
      
      const response = await api.put(`/users/admin/profile?email=${encodeURIComponent(currentUserEmail)}`, updateData);
      console.log('Profile update response:', response.data);
      
      // Update localStorage with fresh data from database
      authService.updateCurrentUser(response.data);
      
      // Update local state with the response data
      setProfileData(prev => ({
        ...prev,
        fullName: response.data.fullName || prev.fullName,
        contactNumber: response.data.contactNumber || prev.contactNumber,
        address: response.data.address || prev.address
      }));
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data || error.message;
      toast.error(`Failed to update profile: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setLoading(true);
      console.log('Changing admin password...');
      
      // Get current user email
      const currentUserEmail = currentUser?.email;
      if (!currentUserEmail) {
        throw new Error('No user email found. Please login again.');
      }
      
      const passwordChangeData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };
      
      console.log('Sending password change request for email:', currentUserEmail);
      
      const response = await api.put(`/users/admin/change-password?email=${encodeURIComponent(currentUserEmail)}`, passwordChangeData);
      console.log('Password change response:', response.data);
      
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear any password errors
      setPasswordErrors({});
      
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data || error.message;
      toast.error(`Failed to change password: ${errorMessage}`);
      
      // Set specific error if it's about current password
      if (errorMessage.includes('Current password is incorrect') || errorMessage.includes('Incorrect')) {
        setPasswordErrors({ currentPassword: 'Current password is incorrect' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: 'user' },
    { id: 'password', name: 'Change Password', icon: 'lock' }
  ];

  const getTabIcon = (iconType) => {
    switch (iconType) {
      case 'user':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'lock':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        title="Profile Management" 
        subtitle="Manage your account details and security settings"
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {profileData.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profileData.fullName}</h2>
              <p className="text-gray-600">{profileData.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profileData.role === 'SUPER_ADMIN' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {profileData.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Regional Admin'}
                </span>
                {profileData.pincode && profileData.role !== 'SUPER_ADMIN' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Pincode: {profileData.pincode}
                  </span>
                )}
                {profileData.role === 'SUPER_ADMIN' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    All Pincodes Access
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {getTabIcon(tab.icon)}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        profileErrors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {profileErrors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      disabled
                      title="Email cannot be changed for security reasons"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={profileData.contactNumber}
                      onChange={handleProfileChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        profileErrors.contactNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your contact number"
                    />
                    {profileErrors.contactNumber && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.contactNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={profileData.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Regional Admin'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      disabled
                      title="Role cannot be changed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={profileData.pincode || 'All Pincodes (Super Admin)'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      disabled
                      title="Pincode assignment cannot be changed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Pincode assignment is managed by Super Admin</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Date
                    </label>
                    <input
                      type="text"
                      name="registeredDate"
                      value={profileData.registeredDate ? new Date(profileData.registeredDate).toLocaleDateString() : 'N/A'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="Enter your complete address"
                    />
                  </div>

                  <div className="flex justify-center pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 min-w-[140px]"
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Password Form */}
                  <div className="space-y-6">
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password *
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter current password"
                        />
                        {passwordErrors.currentPassword && (
                          <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password *
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter new password"
                        />
                        {passwordErrors.newPassword && (
                          <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password *
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Confirm new password"
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Changing Password...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Password Requirements */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-blue-900 mb-3">Password Requirements</h3>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm text-gray-700">At least 6 characters long</span>
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm text-gray-700">Include both letters and numbers</span>
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm text-gray-700">Use a unique password not used elsewhere</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-amber-900 mb-2">Security Tips</h3>
                          <div className="space-y-2">
                            <p className="text-sm text-amber-800">• Avoid using personal information</p>
                            <p className="text-sm text-amber-800">• Don't reuse passwords from other accounts</p>
                            <p className="text-sm text-amber-800">• Consider using a password manager</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileManagement;