import React from 'react';
import { useNavigate } from 'react-router-dom';

const FloatingCartButton = ({ cartCount = 0, show = true }) => {
  const navigate = useNavigate();

  if (!show || cartCount === 0) return null;

  return (
    <button
      onClick={() => navigate('/enhanced-cart')}
      className="floating-cart p-6 z-40 animate-bounce"
      title="View Cart"
    >
      <div className="relative">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-soft">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </div>
        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center animate-pulse shadow-soft border-2 border-white">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      </div>
    </button>
  );
};

export default FloatingCartButton;