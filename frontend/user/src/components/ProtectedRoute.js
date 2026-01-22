import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = React.useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      
      console.log('ProtectedRoute - Auth check:', { isAuthenticated, currentUser });
      
      if (!isAuthenticated || !currentUser) {
        console.log('User not authenticated, redirecting to login');
        toast.warning('Please login to continue', {
          position: "bottom-right",
          autoClose: 3000,
        });
        navigate('/login', { replace: true });
        return;
      }

      // STRICT ROLE ENFORCEMENT: Check if user has the correct role for customer app
      if (currentUser.role && currentUser.role !== 'USER') {
        console.log('User is not a customer, access denied to customer app');
        let redirectMessage = '';
        let redirectUrl = '';
        
        if (currentUser.role === 'ADMIN') {
          redirectMessage = 'Admin users should use the Admin Portal';
          redirectUrl = 'http://localhost:3001'; // Admin portal URL
        } else if (currentUser.role === 'DELIVERY_PARTNER') {
          redirectMessage = 'Delivery partners should use the Delivery App';
          redirectUrl = 'http://localhost:3002'; // Future delivery app URL
        } else {
          redirectMessage = 'Access denied. This portal is for customers only.';
        }
        
        toast.error(redirectMessage, {
          position: "bottom-right",
          autoClose: 5000,
        });
        
        // Clear customer session and redirect to appropriate portal
        authService.logout();
        
        if (redirectUrl) {
          toast.info(`Redirecting to ${redirectUrl.replace('http://localhost:', 'port ')}...`, {
            position: "bottom-right",
            autoClose: 2000,
          });
          
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 2000);
        } else {
          navigate('/login', { replace: true });
        }
        return;
      }
      
      setIsChecking(false);
    };

    // Small delay to ensure localStorage is ready
    setTimeout(checkAuth, 100);
  }, [navigate]);

  if (isChecking) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  return children;
};

export default ProtectedRoute;