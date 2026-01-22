import React from 'react';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="min-h-screen bg-admin-50 flex items-center justify-center">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-primary-500 ${sizeClasses[size]} mx-auto mb-4`}></div>
        <p className="text-admin-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;