import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';

const Header = ({ user, cartCount = 0, showCart = true, showOrders = true }) => {
  const navigate = useNavigate();
  const pincode = localStorage.getItem('pincode');

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-white to-yellow-50 shadow-lg border-b-2 border-green-200 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate('/products')}
              className="group flex items-center space-x-3 hover:scale-105 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-3xl font-bold text-green-700">Grocito</span>
            </button>
            {pincode && (
              <div className="bg-yellow-100 px-4 py-2 rounded-full border-2 border-green-200 shadow-md">
                <span className="text-sm font-bold text-green-700">
                  📍 Delivering to: <span className="bg-yellow-200 px-2 py-1 rounded-full">{pincode}</span>
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            {showCart && (
              <button
                onClick={() => navigate('/cart')}
                className="group relative bg-white hover:bg-yellow-50 p-3 rounded-xl border-2 border-green-200 hover:border-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                title="View Cart"
              >
                <svg className="w-6 h-6 text-green-600 group-hover:text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-green-700 text-xs rounded-full h-6 w-6 flex items-center justify-center shadow-lg font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            )}
            
            {showOrders && (
              <button
                onClick={() => navigate('/orders')}
                className="bg-white hover:bg-yellow-50 text-green-600 hover:text-green-700 font-semibold px-6 py-3 rounded-xl border-2 border-green-200 hover:border-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Orders
              </button>
            )}
            
            <div className="flex items-center space-x-4 bg-white rounded-xl px-6 py-3 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <span className="text-green-700 font-medium">
                Hello, <span className="font-bold bg-yellow-100 px-2 py-1 rounded-full">{user?.fullName || user?.email?.split('@')[0] || 'User'}</span>
              </span>
              <div className="w-px h-6 bg-green-200"></div>
              <button
                onClick={handleLogout}
                className="text-green-600 hover:text-green-800 font-bold transition-colors duration-300 hover:scale-105 transform bg-yellow-50 hover:bg-yellow-100 px-3 py-1 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;