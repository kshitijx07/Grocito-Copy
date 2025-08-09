import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  MapPinIcon, 
  UserIcon,
  CreditCardIcon,
  ArchiveBoxIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { authService } from '../api/authService';
import LocationDisplay from './LocationDisplay';
import LocationChangeModal from './LocationChangeModal';

const Header = ({ user, cartCount = 0, showCart = true, showOrders = true, onLocationChange }) => {
  const navigate = useNavigate();
  const pincode = localStorage.getItem('pincode');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  // Truncate long names
  const getDisplayName = (user) => {
    if (!user) return 'User';
    const name = user.fullName || user.email?.split('@')[0] || 'User';
    return name.length > 12 ? `${name.substring(0, 12)}...` : name;
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-green-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/products')}
              className="group flex items-center space-x-2 hover:scale-105 transition-all duration-200"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                <ShoppingBagIcon className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Grocito
                </h1>
              </div>
            </button>

            {/* Compact Location Display */}
            {pincode && (
              <div className="hidden md:flex items-center bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 group relative">
                <MapPinIcon className="w-4 h-4 text-green-600 mr-1.5" />
                <div className="text-xs">
                  <span className="text-green-700 font-medium">To: </span>
                  <span 
                    className="text-green-800 font-semibold cursor-help"
                    title={`Pincode: ${pincode}`}
                  >
                    {localStorage.getItem('areaName') || localStorage.getItem('city') || pincode}
                  </span>
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="ml-2 text-green-600 hover:text-green-800 underline"
                  >
                    Change
                  </button>
                </div>
                
                {/* Hover tooltip showing pincode - positioned below */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                  Pincode: {pincode}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Navigation Links */}
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => navigate('/products')}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 flex items-center space-x-1.5"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                <span>Shop</span>
              </button>
              {showOrders && (
                <button
                  onClick={() => navigate('/enhanced-orders')}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center space-x-1.5"
                >
                  <ArchiveBoxIcon className="w-4 h-4" />
                  <span>Orders</span>
                </button>
              )}
              <button
                onClick={() => navigate('/payment-history')}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 flex items-center space-x-1.5"
              >
                <CreditCardIcon className="w-4 h-4" />
                <span>Payments</span>
              </button>
            </nav>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200 border border-gray-200"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                  {getDisplayName(user)}
                </span>
                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.fullName || user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Cart Button */}
            {showCart && (
              <button
                onClick={() => navigate('/enhanced-cart')}
                className="relative bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 p-2.5 rounded-lg border border-orange-200 transition-all duration-200 transform hover:scale-105"
                title="View Cart"
              >
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Cart */}
            {showCart && (
              <button
                onClick={() => navigate('/enhanced-cart')}
                className="relative bg-gradient-to-r from-orange-100 to-amber-100 p-2 rounded-lg border border-orange-200"
              >
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            )}
            
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              {showMobileMenu ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-white">
            {/* Mobile Location */}
            {pincode && (
              <div className="flex items-center justify-between px-4 py-2 bg-green-50 rounded-lg mb-4 mx-2">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Delivering to: <strong title={`Pincode: ${pincode}`}>
                      {localStorage.getItem('areaName') || localStorage.getItem('city') || pincode}
                    </strong>
                  </span>
                </div>
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="text-xs text-green-600 hover:text-green-800 underline"
                >
                  Change
                </button>
              </div>
            )}

            {/* Mobile Navigation */}
            <nav className="space-y-1 px-2">
              <button
                onClick={() => {
                  navigate('/products');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span>Shop Products</span>
              </button>
              {showOrders && (
                <button
                  onClick={() => {
                    navigate('/enhanced-orders');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <ArchiveBoxIcon className="w-5 h-5" />
                  <span>My Orders</span>
                </button>
              )}
              <button
                onClick={() => {
                  navigate('/payment-history');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
              >
                <CreditCardIcon className="w-5 h-5" />
                <span>Payment History</span>
              </button>
              <button
                onClick={() => {
                  navigate('/profile');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <UserIcon className="w-5 h-5" />
                <span>Profile Settings</span>
              </button>
            </nav>

            {/* Mobile User Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 px-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                      {user?.fullName || user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-32">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}

      {/* Location Change Modal */}
      <LocationChangeModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationChange={(newLocation) => {
          // Refresh the page or call parent callback
          if (onLocationChange) {
            onLocationChange(newLocation);
          } else {
            // Refresh the page to update products
            window.location.reload();
          }
        }}
      />
    </header>
  );
};

export default Header;