import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { usePartnerLocation } from '../../hooks/useLocation';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  UserIcon, 
  CurrencyDollarIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { partner } = useSelector((state) => state.auth);
  const { location, loading } = usePartnerLocation(partner);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: ClipboardDocumentListIcon,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon,
    },
    {
      name: 'Earnings',
      href: '/earnings',
      icon: CurrencyDollarIcon,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-gradient-to-b from-green-600 to-green-700 pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-green-600 font-bold text-xl">G</span>
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold text-white">Grocito</span>
                <p className="text-green-100 text-sm">Delivery Partner</p>
              </div>
            </div>

            {/* Partner Info */}
            <div className="px-4 mb-6">
              <div className="bg-green-500 bg-opacity-30 backdrop-blur-sm rounded-xl p-4 border border-green-400 border-opacity-30">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="text-green-600 font-bold text-lg">
                      {partner?.fullName?.charAt(0) || 'D'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-white">
                      {partner?.fullName || 'Delivery Partner'}
                    </p>
                    <p className="text-xs text-green-100">
                      📍 {loading ? 'Loading location...' : location}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-2">
              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-green-700 shadow-lg'
                        : 'text-green-100 hover:bg-green-500 hover:bg-opacity-30 hover:text-white'
                    }`
                  }
                >
                  <item.icon
                    className="mr-3 h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-3">
              <button
                onClick={handleLogout}
                className="group flex items-center w-full px-4 py-3 text-sm font-medium text-green-100 rounded-xl hover:bg-red-500 hover:bg-opacity-20 hover:text-white transition-all duration-200 border border-green-400 border-opacity-30"
              >
                <ArrowRightOnRectangleIcon
                  className="mr-3 h-5 w-5 flex-shrink-0"
                  aria-hidden="true"
                />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-600 to-green-700 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-green-500 border-opacity-30">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-green-600 font-bold text-xl">G</span>
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold text-white">Grocito</span>
                <p className="text-green-100 text-sm">Delivery Partner</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-green-100 hover:text-white hover:bg-green-500 hover:bg-opacity-30"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Partner Info */}
          <div className="p-4">
            <div className="bg-green-500 bg-opacity-30 backdrop-blur-sm rounded-xl p-4 border border-green-400 border-opacity-30">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-green-600 font-bold text-lg">
                    {partner?.fullName?.charAt(0) || 'D'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-white">
                    {partner?.fullName || 'Delivery Partner'}
                  </p>
                  <p className="text-xs text-green-100">
                    📍 {loading ? 'Loading location...' : location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-green-700 shadow-lg'
                      : 'text-green-100 hover:bg-green-500 hover:bg-opacity-30 hover:text-white'
                  }`
                }
              >
                <item.icon
                  className="mr-3 h-5 w-5 flex-shrink-0"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-green-500 border-opacity-30">
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-4 py-3 text-sm font-medium text-green-100 rounded-xl hover:bg-red-500 hover:bg-opacity-20 hover:text-white transition-all duration-200 border border-green-400 border-opacity-30"
            >
              <ArrowRightOnRectangleIcon
                className="mr-3 h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;