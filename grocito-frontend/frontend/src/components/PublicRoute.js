import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';

const PublicRoute = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            const isAuthenticated = authService.isAuthenticated();
            const currentUser = authService.getCurrentUser();

            console.log('PublicRoute - Auth check:', { isAuthenticated, currentUser });

            // Only redirect if user is actually authenticated with valid data
            if (isAuthenticated && currentUser && currentUser.email) {
                console.log('User already authenticated, redirecting...');
                const storedPincode = localStorage.getItem('pincode');

                toast.info('You are already logged in!', {
                    position: "bottom-right",
                    autoClose: 2000,
                });

                setTimeout(() => {
                    if (storedPincode) {
                        navigate('/products', { replace: true });
                    } else {
                        navigate('/', { replace: true });
                    }
                }, 1000);
            }
        };

        // Small delay to ensure localStorage is ready
        setTimeout(checkAuth, 100);
    }, [navigate]);

    return children;
};

export default PublicRoute;