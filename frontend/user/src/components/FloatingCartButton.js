import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const FloatingCartButton = ({ cartCount = 0, show = true }) => {
  const navigate = useNavigate();

  if (!show || cartCount === 0) return null;

  return (
    <button
      onClick={() => navigate('/enhanced-cart')}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white p-3 sm:p-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 z-50 animate-leaf-float group focus-nature"
      title="View Cart"
    >
      <div className="relative">
        {/* Cart Icon */}
        <ShoppingCartIcon className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform duration-200" />
        
        {/* Cart Count Badge */}
        <span className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs sm:text-sm font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center animate-gentle-glow shadow-lg border-2 border-white">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
        
        {/* Floating Text */}
        <div className="absolute -top-12 -left-8 sm:-left-12 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          View Cart ({cartCount} items)
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </button>
  );
};

export default FloatingCartButton;