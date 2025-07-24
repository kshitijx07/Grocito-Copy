import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAuth = () => {
      const isAuthenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      const isAdmin = authService.isAdmin();
      
      console.log('AdminRoute - Auth check:', { 
        isAuthenticated, 
        currentUser, 
        isAdmin,
        userRole: currentUser?.role 
      });
      
      if (!isAuthenticated || !currentUser) {
        console.log('Admin not authenticated, redirecting to login');
        toast.warning('Please login with admin credentials to continue', {
          position: "bottom-right",
          autoClose: 3000,
        });
        navigate('/login', { replace: true });
        return;
      }

      if (!isAdmin) {
        console.log('User is not admin, access denied');
        toast.error('Access denied. Admin privileges required.', {
          position: "bottom-right",
          autoClose: 4000,
        });
        authService.logout(); // Clear invalid session
        navigate('/login', { replace: true });
        return;
      }
      
      setIsAuthorized(true);
      setIsChecking(false);
    };

    // Small delay to ensure localStorage is ready
    setTimeout(checkAdminAuth, 100);
  }, [navigate]);

  if (isChecking) {
    return <LoadingSpinner message="Verifying admin access..." />;
  }

  if (!isAuthorized) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};

export default AdminRoute;