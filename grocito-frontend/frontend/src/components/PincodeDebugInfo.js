import React from 'react';
import { authService } from '../api/authService';

const PincodeDebugInfo = () => {
  const user = authService.getCurrentUser();
  const storedPincode = localStorage.getItem('pincode');
  
  return (
    <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-4 text-sm max-w-sm z-50">
      <h4 className="font-bold text-blue-800 mb-2">🔍 Pincode Debug Info</h4>
      <div className="space-y-1 text-blue-700">
        <div><strong>Landing Page Pincode:</strong> {storedPincode || 'None'}</div>
        <div><strong>User Profile Pincode:</strong> {user?.pincode || 'None'}</div>
        <div><strong>Priority Used:</strong> {storedPincode || user?.pincode || 'Default'}</div>
        <div className="text-xs mt-2 text-blue-600">
          ✅ Landing page pincode takes priority
        </div>
      </div>
    </div>
  );
};

export default PincodeDebugInfo;