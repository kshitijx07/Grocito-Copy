import React, { useState } from 'react';
import { toast } from 'react-toastify';

const DeliveryPartnerList = ({ 
  partners, 
  onUpdate, 
  onAvailabilityUpdate, 
  onSearch, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter 
}) => {
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const getStatusColor = (status) => {
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

  // Removed getAvailabilityColor function as availability controls are no longer needed

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      onSearch(term);
    }, 500);
  };

  // Removed handleAvailabilityChange function as availability controls are no longer needed

  const filteredPartners = partners.filter(partner => {
    if (statusFilter === 'all') return true;
    return partner.verificationStatus === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, phone, or vehicle number..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Partners List */}
      {filteredPartners.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Partners Found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No delivery partners have been registered yet.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="divide-y divide-gray-200">
            {filteredPartners.map((partner) => (
              <div key={partner.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {partner.fullName?.charAt(0) || 'D'}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {partner.fullName || 'Unknown Partner'}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(partner.verificationStatus)}`}>
                            {partner.verificationStatus || 'PENDING'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <p><span className="font-medium">Email:</span> {partner.email || 'N/A'}</p>
                            <p><span className="font-medium">Phone:</span> {partner.phoneNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Pincode:</span> {partner.pincode || partner.assignedPincode || 'N/A'}</p>
                            <p><span className="font-medium">Vehicle:</span> {partner.vehicleType || 'N/A'} - {partner.vehicleNumber || 'N/A'}</p>
                            <p><span className="font-medium">License:</span> {partner.licenseNumber || 'N/A'}</p>
                          </div>
                          <div>
                            {partner.verificationStatus === 'VERIFIED' ? (
                              <>
                                <p><span className="font-medium">Successful Deliveries:</span> {partner.successfulDeliveries || 0}</p>
                                <p><span className="font-medium">Total Earnings:</span> ₹{(partner.totalEarnings || 0).toFixed(0)}</p>
                              </>
                            ) : (
                              <>
                                <p><span className="font-medium">Status:</span> {partner.verificationStatus === 'PENDING' ? 'Pending Verification' : 'Verification Rejected'}</p>
                                <p><span className="font-medium">Deliveries:</span> Not Available</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Action Buttons */}
                    <button
                      onClick={() => {
                        setSelectedPartner(partner);
                        setShowEditModal(true);
                      }}
                      className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Joined: {partner.createdAt ? new Date(partner.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                    {partner.verificationStatus === 'VERIFIED' && (
                      <span>
                        Monthly Earnings: ₹{(partner.monthlyEarnings || 0).toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPartner && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Partner: {selectedPartner.fullName}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Status
                  </label>
                  <select
                    value={selectedPartner.verificationStatus}
                    onChange={(e) => setSelectedPartner({
                      ...selectedPartner,
                      verificationStatus: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={selectedPartner.accountStatus}
                    onChange={(e) => setSelectedPartner({
                      ...selectedPartner,
                      accountStatus: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="DEACTIVATED">Deactivated</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPartner(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await onUpdate(selectedPartner.id, {
                      verificationStatus: selectedPartner.verificationStatus,
                      accountStatus: selectedPartner.accountStatus
                    });
                    setShowEditModal(false);
                    setSelectedPartner(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartnerList;