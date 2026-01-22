import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { directCartService } from '../api/directCartService';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';

const SimpleWorkingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
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
      const items = await directCartService.getCartItems(userId);
      setCartItems(items);
      console.log('Cart loaded:', items);
    } catch (error) {
      console.error('Failed to load cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    try {
      await directCartService.updateCartItem(user.id, productId, newQuantity);
      toast.success('Cart updated!');
      loadCart(user.id); // Reload cart after update
    } catch (error) {
      console.error('Failed to update cart:', error);
      toast.error('Failed to update cart');
    }
  };

  const removeItem = async (productId) => {
    try {
      await directCartService.removeFromCart(user.id, productId);
      toast.success('Item removed!');
      loadCart(user.id); // Reload cart after removal
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    }
  };

  const addTestItem = async () => {
    try {
      await directCartService.addToCart(user.id, 1, 1);
      toast.success('Test item added!');
      loadCart(user.id);
    } catch (error) {
      console.error('Failed to add test item:', error);
      toast.error('Failed to add test item');
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Clear entire cart?')) return;
    
    try {
      await directCartService.clearCart(user.id);
      toast.success('Cart cleared!');
      loadCart(user.id);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * (item.quantity || 0);
    }, 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Simple Working Cart</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-blue-500 hover:text-blue-700"
          >
            ← Back to Products
          </button>
        </div>

        {/* Cart Actions */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => loadCart(user.id)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            Refresh Cart
          </button>
          <button
            onClick={addTestItem}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
          >
            Add Test Item
          </button>
          <button
            onClick={clearCart}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Clear Cart
          </button>
        </div>

        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item, index) => (
              <div key={item.product?.id || index} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product?.name || 'Unknown Product'}</h4>
                    <p className="text-sm text-gray-600">
                      ₹{item.product?.price || 0} each
                    </p>
                    <p className="text-xs text-gray-500">
                      Product ID: {item.product?.id} | Quantity: {item.quantity}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center"
                    >
                      +
                    </button>
                    
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 text-right">
                  <span className="font-bold">
                    Total: ₹{((item.product?.price || 0) * (item.quantity || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Cart Total */}
            <div className="border-t pt-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Cart Total:</span>
                <span className="text-xl font-bold text-green-600">₹{calculateTotal()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-6 p-3 bg-gray-100 rounded text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>User ID: {user?.id}</p>
          <p>Cart Items: {cartItems.length}</p>
          <p>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleWorkingCart;