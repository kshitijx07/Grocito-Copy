import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmergencyCart from './EmergencyCart';

const EmergencyCartPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Emergency Cart Manager</h1>
            <button
              onClick={() => navigate('/products')}
              className="text-blue-500 hover:text-blue-700"
            >
              Back to Products
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            This is a simplified cart manager that uses direct API calls to update your cart.
            Use this if you're having trouble with the regular cart page.
          </p>
        </div>
        
        <EmergencyCart />
        
        <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
          <h2 className="font-bold mb-2">Instructions</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Use the + and - buttons to change quantities</li>
            <li>Click "Set: X" buttons to directly set a specific quantity</li>
            <li>Click "Remove" to remove an item</li>
            <li>Click "Refresh Cart" if you don't see your changes</li>
            <li>Click "Clear Cart" to remove all items</li>
          </ul>
          
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => navigate('/cart')}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Go to Regular Cart
            </button>
            
            <button
              onClick={() => navigate('/products')}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyCartPage;