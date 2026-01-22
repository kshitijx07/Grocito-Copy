import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { simpleCartService } from '../api/simpleCartService';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
import SimpleCartUpdate from './SimpleCartUpdate';

const SimpleCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadCart(currentUser.id);
  }, [navigate]);

  const loadCart = async (userId) => {
    setLoading(true);
    try {
      const items = await simpleCartService.getCart(userId);
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCartUpdated = () => {
    if (user) {
      loadCart(user.id);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Your Cart</h2>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Your cart is empty</p>
          <button 
            onClick={() => navigate('/products')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {cartItems.map(item => (
              <SimpleCartUpdate 
                key={item.product.id}
                item={item}
                userId={user.id}
                onCartUpdated={handleCartUpdated}
              />
            ))}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>₹{calculateTotal()}</span>
            </div>
            
            <button
              onClick={() => navigate('/cart')}
              className="w-full mt-4 bg-green-500 text-white py-2 rounded"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SimpleCart;