import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { fetchDashboardStats } from '../../store/slices/dashboardSlice';
import { calculateDailyEarnings, formatCurrency } from '../../utils/earningsCalculator';
import ordersAPI from '../../services/ordersAPI';

const Header = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { partner } = useSelector((state) => state.auth);
  const { stats } = useSelector((state) => state.dashboard);
  const [realTimeEarnings, setRealTimeEarnings] = useState(0);

  // Fetch real-time earnings data
  const loadRealTimeEarnings = async () => {
    try {
      const [activeOrders, completedOrders] = await Promise.all([
        ordersAPI.getMyOrders().catch(() => []),
        ordersAPI.getCompletedOrders().catch(() => [])
      ]);
      
      const allOrders = [...activeOrders, ...completedOrders];
      const deliveredOrders = allOrders.filter(order => order.status === 'DELIVERED');
      
      const dailyEarnings = calculateDailyEarnings(deliveredOrders);
      setRealTimeEarnings(dailyEarnings.totalEarnings);
    } catch (error) {
      console.error('Error loading real-time earnings:', error);
    }
  };

  // Fetch stats and real-time earnings when component mounts
  useEffect(() => {
    if (partner?.id) {
      dispatch(fetchDashboardStats(partner.id));
      loadRealTimeEarnings();
      
      // Update earnings every 30 seconds
      const interval = setInterval(loadRealTimeEarnings, 30000);
      return () => clearInterval(interval);
    }
  }, [dispatch, partner?.id]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Menu button and greeting */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 mr-4"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Good {getGreeting()}, {partner?.fullName?.split(' ')[0] || 'Partner'}!
            </h1>
            <p className="text-sm text-gray-500">
              Ready to deliver? Your dashboard awaits.
            </p>
          </div>
        </div>

        {/* Right side - Stats and notifications */}
        <div className="flex items-center space-x-4">
          {/* Today's Earnings - Real-time */}
          <div className="hidden sm:flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            <span className="text-green-600 mr-1">₹</span>
            {realTimeEarnings?.toFixed(0) || '0'} Today
          </div>

          {/* Active Orders Badge */}
          {stats?.activeOrders > 0 && (
            <div className="hidden sm:flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              {stats.activeOrders} Active Order{stats.activeOrders !== 1 ? 's' : ''}
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <BellIcon className="h-6 w-6" />
            {stats?.activeOrders > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            )}
          </button>

          {/* Partner Avatar - Clickable */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              title="Go to Profile"
            >
              <span className="text-white font-semibold text-sm">
                {partner?.fullName?.charAt(0) || 'D'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Helper function to get greeting based on time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

export default Header;