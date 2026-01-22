import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleDashboardRedirect = () => {
      console.log('Dashboard component mounted');
      
      const isAuthenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      const storedPincode = localStorage.getItem('pincode');

      console.log('Dashboard - Auth check:', { isAuthenticated, currentUser, storedPincode });

      if (!isAuthenticated || !currentUser) {
        console.log('Not authenticated, redirecting to login');
        toast.warning('Please login to continue', {
          position: "bottom-right",
          autoClose: 3000,
        });
        setTimeout(() => navigate('/login', { replace: true }), 500);
        return;
      }

      if (!storedPincode) {
        console.log('No pincode, redirecting to landing page');
        toast.info('Please select your delivery location', {
          position: "bottom-right",
          autoClose: 3000,
        });
        setTimeout(() => navigate('/', { replace: true }), 500);
        return;
      }

      console.log('All checks passed, redirecting to products');
      toast.success(`Welcome back, ${currentUser.fullName || currentUser.email}! 🎉`, {
        position: "bottom-right",
        autoClose: 2000,
      });
      
      setTimeout(() => {
        try {
          console.log('Dashboard: Navigating to products...');
          navigate('/products', { replace: true });
        } catch (navError) {
          console.error('Dashboard navigation failed:', navError);
          window.location.href = '/products';
        }
      }, 1000);
    };

    // Small delay to ensure component is fully mounted
    setTimeout(handleDashboardRedirect, 100);
  }, [navigate]);

  return <LoadingSpinner message="Loading dashboard..." />;
};

export default Dashboard;