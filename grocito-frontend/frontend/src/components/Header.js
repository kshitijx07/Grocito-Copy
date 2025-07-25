import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  MapPinIcon, 
  UserIcon,
  CreditCardIcon,
  ArchiveBoxIcon 
} from '@heroicons/react/24/outline';
import { authService } from '../api/authService';

const Header = ({ user, cartCount = 0, showCart = true, showOrders = true }) => {
  const navigate = useNavigate();
  const pincode = localStorage.getItem('pincode');

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-white via-green-50 to-blue-50 shadow-soft border-b border-green-100 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate('/products')}
              className="group flex items-center space-x-3 hover:scale-105 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-soft-lg transition-all duration-300">
                <ShoppingBagIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Grocito
                </h1>
                <p className="text-xs text-gray-500 font-medium">Fresh Groceries</p>
              </div>
            </button>
            {pincode && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200 shadow-soft">
                <span className="text-sm font-semibold text-green-700 flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4 text-green-600" />
                  <span>Delivering to: <span className="bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 rounded-xl font-bold">{pincode}</span></span>
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => navigate('/products')}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 flex items-center space-x-2"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                <span>Shop</span>
              </button>
              {showOrders && (
                <button
                  onClick={() => navigate('/enhanced-orders')}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <ArchiveBoxIcon className="w-4 h-4" />
                  <span>Orders</span>
                </button>
              )}
              <button
                onClick={() => navigate('/payment-history')}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 flex items-center space-x-2"
              >
                <CreditCardIcon className="w-4 h-4" />
                <span>Payments</span>
              </button>
            </nav>

            {showCart && (
              <button
                onClick={() => navigate('/enhanced-cart')}
                className="group relative bg-gradient-to-r from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 p-3 rounded-2xl border border-orange-200 transition-all duration-300 transform hover:scale-105 shadow-soft hover:shadow-soft-lg"
                title="View Cart"
              >
                <svg className="w-6 h-6 text-orange-600 group-hover:text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center shadow-soft font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            )}
            
            <div className="flex items-center space-x-3 bg-white rounded-2xl px-6 py-3 border border-gray-200 shadow-soft hover:shadow-soft-lg transition-all duration-300">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">
                  Hi, <span className="font-bold text-gray-900">{user?.fullName || user?.email?.split('@')[0] || 'User'}</span>
                </span>
              </div>
              <div className="w-px h-6 bg-gray-200"></div>
              <button
                onClick={() => navigate('/profile')}
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 hover:bg-blue-50 px-3 py-1 rounded-lg"
              >
                Profile
              </button>
              <div className="w-px h-6 bg-gray-200"></div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 font-medium transition-colors duration-200 hover:bg-red-50 px-3 py-1 rounded-lg"
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