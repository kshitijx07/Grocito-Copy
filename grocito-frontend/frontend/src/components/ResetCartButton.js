import React from 'react';
import { useNavigate } from 'react-router-dom';
import { enhancedCartService } from '../api/enhancedCartService';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';

const ResetCartButton = ({ onReset }) => {
  const navigate = useNavigate();

  const handleResetCart = async () => {
    if (!window.confirm('Are you sure you want to reset your cart? This will remove all items.')) {
      return;
    }
    
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        toast.error('You must be logged in to reset your cart');
        navigate('/login');
        return;
      }

      // Reset the cart
      await enhancedCartService.resetCart(currentUser.id);
      
      toast.success('Cart has been reset');
      
      // Call the onReset callback if provided
      if (onReset && typeof onReset === 'function') {
        onReset();
      } else {
        // Reload the page to reflect the changes
        window.location.reload();
      }
    } catch (error) {
      console.error('Error resetting cart:', error);
      toast.error('Failed to reset cart');
    }
  };

  return (
    <button
      onClick={handleResetCart}
      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
    >
      Reset Cart
    </button>
  );
};

export default ResetCartButton;