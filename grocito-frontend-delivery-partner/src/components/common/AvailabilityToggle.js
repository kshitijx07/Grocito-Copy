import React from 'react';

const AvailabilityToggle = ({ isAvailable = false, onToggle, loading = false }) => {
  const handleToggle = () => {
    if (!loading && typeof onToggle === 'function') {
      onToggle(!isAvailable);
    } else if (typeof onToggle !== 'function') {
      console.error('AvailabilityToggle: onToggle prop is not a function');
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-gray-600'}`}>
          {isAvailable ? 'ONLINE' : 'OFFLINE'}
        </span>
        
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isAvailable ? 'bg-green-600' : 'bg-gray-200'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isAvailable ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      )}
      
      <div className="text-right">
        <p className="text-sm text-gray-600">
          {isAvailable ? 'Available for orders' : 'Not accepting orders'}
        </p>
        <p className="text-xs text-gray-500">
          {isAvailable ? 'Toggle to go offline' : 'Toggle to go online'}
        </p>
      </div>
    </div>
  );
};

export default AvailabilityToggle;