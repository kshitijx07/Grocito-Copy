import React, { useState, useEffect } from 'react';
import { authService } from '../api/authService';

const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        isAuthenticated: authService.isAuthenticated(),
        currentUser: authService.getCurrentUser(),
        token: authService.getToken(),
        pincode: localStorage.getItem('pincode'),
        timestamp: new Date().toLocaleTimeString()
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-4 left-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <h4 className="font-bold mb-2">Debug Info ({debugInfo.timestamp})</h4>
      <div className="space-y-1">
        <div>Auth: {debugInfo.isAuthenticated ? '✅' : '❌'}</div>
        <div>User: {debugInfo.currentUser?.email || 'None'}</div>
        <div>Token: {debugInfo.token ? '✅' : '❌'}</div>
        <div>Pincode: {debugInfo.pincode || 'None'}</div>
      </div>
    </div>
  );
};

export default DebugInfo;