import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, partner } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (partner && partner.verificationStatus !== 'VERIFIED') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {partner.verificationStatus === 'PENDING' ? 'Verification Pending' : 'Application Rejected'}
            </h2>
            <p className="text-gray-600">
              {partner.verificationStatus === 'PENDING' 
                ? 'Your delivery partner application is under review. You will receive an email once it\'s approved.'
                : 'Your delivery partner application has been rejected. Please contact support for more information.'
              }
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Application Details</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Name:</span> {partner.fullName}</p>
                <p><span className="font-medium">Email:</span> {partner.email}</p>
                <p><span className="font-medium">Phone:</span> {partner.phoneNumber}</p>
                <p><span className="font-medium">Pincode:</span> {partner.pincode}</p>
                <p><span className="font-medium">Vehicle:</span> {partner.vehicleType} - {partner.vehicleNumber}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                    partner.verificationStatus === 'PENDING' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {partner.verificationStatus}
                  </span>
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                localStorage.removeItem('deliveryPartnerToken');
                window.location.href = '/auth/login';
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;