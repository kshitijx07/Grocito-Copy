import React from 'react';
import { useNavigate } from 'react-router-dom';

const FloatingCartButton = ({ cartCount = 0, show = true }) => {
  const navigate = useNavigate();

  if (!show || cartCount === 0) return null;

  return (
    <button
      onClick={() => navigate('/cart')}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-600 hover:from-blue-600 hover:via-yellow-500 hover:to-blue-700 text-white rounded-full p-5 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-40 animate-bounce border-4 border-white"
      title="View Cart"
    >
      <div className="relative">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
        <span className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-sm font-bold rounded-full h-7 w-7 flex items-center justify-center animate-pulse shadow-lg border-2 border-white">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      </div>
    </button>
  );
};

export default FloatingCartButton;