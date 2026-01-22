import React, { useState } from 'react';

const VerificationRequests = ({ requests, onVerificationUpdate }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const handleApprove = async (request) => {
    await onVerificationUpdate(request.id, 'VERIFIED');
  };

  const handleReject = async (request) => {
    setSelectedRequest(request);
    setShowRejectionModal(true);
  };

  const confirmReject = async () => {
    if (selectedRequest) {
      await onVerificationUpdate(selectedRequest.id, 'REJECTED');
      setShowRejectionModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
        <p className="text-gray-600">
          All delivery partner applications have been processed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Verification Required
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              {requests.length} delivery partner{requests.length !== 1 ? 's' : ''} waiting for verification. 
              Please review their applications and approve or reject them.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="divide-y divide-gray-200">
          {requests.map((request) => (
            <div key={request.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {request.fullName?.charAt(0) || 'D'}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.fullName || 'Unknown Applicant'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Applied on {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Personal Information</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Email:</span> {request.email || 'N/A'}</p>
                        <p><span className="font-medium">Phone:</span> {request.phoneNumber || 'N/A'}</p>
                        <p><span className="font-medium">Service Area:</span> {request.pincode || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Vehicle Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Vehicle Information</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Type:</span> {request.vehicleType || 'N/A'}</p>
                        <p><span className="font-medium">Number:</span> {request.vehicleNumber || 'N/A'}</p>
                        <p><span className="font-medium">License:</span> {request.licenseNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailsModal(true);
                    }}
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    View Details
                  </button>
                  
                  <button
                    onClick={() => handleApprove(request)}
                    className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  
                  <button
                    onClick={() => handleReject(request)}
                    className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Application Details: {selectedRequest.fullName}
                </h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Personal Information</h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                      <p><span className="font-medium">Full Name:</span> {selectedRequest.fullName}</p>
                      <p><span className="font-medium">Email:</span> {selectedRequest.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedRequest.phoneNumber}</p>
                      <p><span className="font-medium">Service Pincode:</span> {selectedRequest.pincode}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Application Status</h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                      <p><span className="font-medium">Status:</span> 
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          {selectedRequest.verificationStatus}
                        </span>
                      </p>
                      <p><span className="font-medium">Applied:</span> {formatDate(selectedRequest.createdAt)}</p>
                      <p><span className="font-medium">Last Updated:</span> {formatDate(selectedRequest.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Vehicle Information</h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                      <p><span className="font-medium">Vehicle Type:</span> {selectedRequest.vehicleType}</p>
                      <p><span className="font-medium">Vehicle Number:</span> {selectedRequest.vehicleNumber}</p>
                      <p><span className="font-medium">License Number:</span> {selectedRequest.licenseNumber}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Account Information</h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                      <p><span className="font-medium">Account Active:</span> {selectedRequest.isActive ? 'Yes' : 'No'}</p>
                      <p><span className="font-medium">Last Login:</span> {selectedRequest.lastLogin ? formatDate(selectedRequest.lastLogin) : 'Never'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedRequest);
                    setShowDetailsModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedRequest);
                    setShowDetailsModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reject Application
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to reject the application from {selectedRequest?.fullName}?
                This action will notify the applicant via email.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Provide a reason for rejection..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationRequests;