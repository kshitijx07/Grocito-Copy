import React from 'react';

const EnvDebug = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-bold mb-2">🔍 Environment Variables Debug</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>REACT_APP_RAZORPAY_KEY_ID:</strong> 
          <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
            {process.env.REACT_APP_RAZORPAY_KEY_ID || 'UNDEFINED'}
          </span>
        </div>
        <div>
          <strong>REACT_APP_RAZORPAY_KEY_SECRET:</strong> 
          <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
            {process.env.REACT_APP_RAZORPAY_KEY_SECRET ? 'PRESENT' : 'UNDEFINED'}
          </span>
        </div>
        <div>
          <strong>NODE_ENV:</strong> 
          <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
            {process.env.NODE_ENV}
          </span>
        </div>
        <div>
          <strong>All REACT_APP_ variables:</strong>
          <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(
              Object.keys(process.env)
                .filter(key => key.startsWith('REACT_APP_'))
                .reduce((obj, key) => {
                  obj[key] = key.includes('SECRET') ? 'HIDDEN' : process.env[key];
                  return obj;
                }, {}),
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default EnvDebug;