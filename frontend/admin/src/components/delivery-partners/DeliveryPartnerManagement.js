import React, { useState, useEffect } from 'react';
import AdminHeader from '../common/AdminHeader';
import { deliveryPartnerService } from '../../api/deliveryPartnerService';
import { toast } from 'react-toastify';
import DeliveryPartnerList from './DeliveryPartnerList';
import VerificationRequests from './VerificationRequests';
import DeliveryPartnerStats from './DeliveryPartnerStats';

const DeliveryPartnerManagement = () => {
  const [activeTab, setActiveTab] = useState('partners');
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [authRecords, setAuthRecords] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [authData, pendingData, analyticsData] = await Promise.all([
        deliveryPartnerService.getAllAuthRecords(),
        deliveryPartnerService.getPendingVerificationRequests(),
        deliveryPartnerService.getAnalytics()
      ]);

      // Use auth records as the main delivery partner data
      setDeliveryPartners(authData);
      setAuthRecords(authData);
      setPendingRequests(pendingData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading delivery partner data:', error);
      toast.error('Failed to load delivery partner data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationUpdate = async (authId, status) => {
    try {
      await deliveryPartnerService.updateVerificationStatus(authId, status);
      toast.success(`Partner ${status.toLowerCase()} successfully`);
      
      // Reload data to reflect changes
      loadData();
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast.error('Failed to update verification status');
    }
  };

  const handlePartnerUpdate = async (partnerId, updateData) => {
    try {
      await deliveryPartnerService.updateDeliveryPartner(partnerId, updateData);
      toast.success('Partner updated successfully');
      
      // Reload data to reflect changes
      loadData();
    } catch (error) {
      console.error('Error updating partner:', error);
      toast.error('Failed to update partner');
    }
  };

  const handleAvailabilityUpdate = async (partnerId, isAvailable, availabilityStatus) => {
    try {
      await deliveryPartnerService.updatePartnerAvailability(partnerId, isAvailable, availabilityStatus);
      toast.success('Partner availability updated');
      
      // Reload data to reflect changes
      loadData();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const handleSearch = async (term) => {
    if (!term.trim()) {
      loadData();
      return;
    }

    try {
      const results = await deliveryPartnerService.searchAuthRecords(term);
      setDeliveryPartners(results);
    } catch (error) {
      console.error('Error searching partners:', error);
      toast.error('Failed to search partners');
    }
  };

  const tabs = [
    {
      id: 'partners',
      name: 'All Partners',
      count: deliveryPartners.length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'verification',
      name: 'Verification Requests',
      count: pendingRequests.length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'analytics',
      name: 'Analytics',
      count: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader 
          title="Delivery Partner Management" 
          subtitle="Manage delivery partners, verification requests, and analytics"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        title="Delivery Partner Management" 
        subtitle="Manage delivery partners, verification requests, and analytics"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                  {tab.count !== null && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'partners' && (
              <DeliveryPartnerList
                partners={deliveryPartners}
                onUpdate={handlePartnerUpdate}
                onAvailabilityUpdate={handleAvailabilityUpdate}
                onSearch={handleSearch}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
            )}

            {activeTab === 'verification' && (
              <VerificationRequests
                requests={pendingRequests}
                onVerificationUpdate={handleVerificationUpdate}
              />
            )}

            {activeTab === 'analytics' && (
              <DeliveryPartnerStats
                analytics={analytics}
                partners={deliveryPartners}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartnerManagement;