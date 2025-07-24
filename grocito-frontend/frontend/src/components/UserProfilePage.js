import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
import api from '../api/config';

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    pincode: '',
    contactNumber: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordEditMode, setPasswordEditMode] = useState(false);
  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const currentUser = authService.getCurrentUser();
        
        if (!currentUser) {
          toast.error('You must be logged in to view your profile');
          navigate('/login');
          return;
        }
        
        console.log('Current user from localStorage:', currentUser);
        
        // Fetch the latest user data from the server
        console.log('Fetching user data from API for ID:', currentUser.id);
        const response = await api.get(`/users/${currentUser.id}`);
        console.log('API Response:', response);
        
        const userData = response.data;
        console.log('User data from API:', userData);
        
        // Update local storage with the latest user data
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setFormData({
          fullName: userData.fullName || '',
          address: userData.address || '',
          pincode: userData.pincode || '',
          contactNumber: userData.contactNumber || ''
        });
        
        // Log the data that will be displayed
        console.log('User data set for display:', {
          fullName: userData.fullName,
          email: userData.email,
          contactNumber: userData.contactNumber,
          pincode: userData.pincode,
          address: userData.address,
          role: userData.role,
          registeredDate: userData.registeredDate
        });
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        console.error('Error details:', error.response || error.message);
        
        // Fallback to local storage data if API call fails
        const localUser = authService.getCurrentUser();
        if (localUser) {
          console.log('Falling back to localStorage user data:', localUser);
          setUser(localUser);
          setFormData({
            fullName: localUser.fullName || '',
            address: localUser.address || '',
            pincode: localUser.pincode || '',
            contactNumber: localUser.contactNumber || ''
          });
          toast.warning('Using locally stored profile data');
        } else {
          setError('Failed to load profile data');
          toast.error('Failed to load profile data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        toast.error('You must be logged in to update your profile');
        navigate('/login');
        return;
      }
      
      const response = await api.put(`/users/${currentUser.id}/profile`, formData);
      const updatedUser = response.data;
      
      // Update local storage with the updated user data
      const storedUser = authService.getCurrentUser();
      const mergedUser = { ...storedUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(mergedUser));
      
      setUser(mergedUser);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        toast.error('You must be logged in to change your password');
        navigate('/login');
        return;
      }
      
      await api.put(`/users/${currentUser.id}/password`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordEditMode(false);
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-green-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">My Profile</h1>
              <Link to="/dashboard" className="text-white hover:text-green-100">
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            ) : (
              <>
                {/* Profile Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="text-green-500 hover:text-green-600 font-medium"
                    >
                      {editMode ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {editMode ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Number
                        </label>
                        <input
                          type="tel"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          maxLength="10"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          maxLength="6"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                          <p className="text-gray-800">{user?.fullName || 'Not provided'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                          <p className="text-gray-800">{user?.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                          <p className="text-gray-800">{user?.contactNumber || 'Not provided'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Pincode</h3>
                          <p className="text-gray-800">{user?.pincode || 'Not provided'}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Address</h3>
                        <p className="text-gray-800">{user?.address || 'Not provided'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                        <p className="text-gray-800">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user?.role || 'USER'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Registered On</h3>
                        <p className="text-gray-800">
                          {user?.registeredDate ? new Date(user.registeredDate).toLocaleDateString() : 'Not available'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Password Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Password</h2>
                    <button
                      onClick={() => setPasswordEditMode(!passwordEditMode)}
                      className="text-green-500 hover:text-green-600 font-medium"
                    >
                      {passwordEditMode ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>

                  {passwordEditMode ? (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="oldPassword"
                          value={passwordData.oldPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                        >
                          {loading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-gray-600">
                      For security reasons, your password is hidden. Click "Change Password" to update it.
                    </p>
                  )}
                </div>

                {/* Order History and Payments Section */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">My Account</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Orders Card */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                      <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="text-md font-semibold text-gray-800">My Orders</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">View and track all your orders</p>
                      <Link 
                        to="/enhanced-orders" 
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-medium inline-block w-full text-center"
                      >
                        View Orders
                      </Link>
                    </div>
                    
                    {/* Payments Card */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                      <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <h3 className="text-md font-semibold text-gray-800">Payment History</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">View all your payment transactions</p>
                      <Link 
                        to="/payment-history" 
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-medium inline-block w-full text-center"
                      >
                        View Payments
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;