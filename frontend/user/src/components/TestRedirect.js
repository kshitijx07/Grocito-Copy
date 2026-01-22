import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const TestRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('TestRedirect component mounted');
    
    toast.info('TestRedirect page loaded - redirecting in 3 seconds...', {
      position: "bottom-right",
      autoClose: 3000,
    });

    setTimeout(() => {
      console.log('TestRedirect: Attempting navigation to products...');
      try {
        navigate('/products', { replace: true });
      } catch (error) {
        console.error('TestRedirect navigation failed:', error);
        window.location.href = '/products';
      }
    }, 3000);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Test Redirect Page</h1>
        <p className="text-gray-600 mb-4">This page will redirect to products in 3 seconds...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default TestRedirect;