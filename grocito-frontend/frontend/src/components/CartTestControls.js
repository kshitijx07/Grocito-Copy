import React from 'react';
import { cartService } from '../api/cartService';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';

const CartTestControls = ({ onCartUpdate }) => {
  const user = authService.getCurrentUser();

  if (!user || process.env.NODE_ENV !== 'development') return null;

  const addTestItem = async () => {
    try {
      await cartService.addToCart(user.id, 1, 1); // Add product ID 1 with quantity 1
      toast.success('Test item added! 🛒');
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      toast.error('Failed to add test item: ' + error.message);
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart(user.id);
      toast.success('Cart cleared! 🧹');
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      toast.error('Failed to clear cart: ' + error.message);
    }
  };

  const testCartAPI = async () => {
    try {
      const items = await cartService.getCartItems(user.id);
      console.log('Cart items:', items);
      toast.info(`Cart has ${items.length} items`);
    } catch (error) {
      toast.error('Cart API test failed: ' + error.message);
    }
  };

  return (
    <div className="fixed bottom-20 left-4 bg-white p-3 rounded-lg shadow-lg border z-40">
      <h4 className="font-bold mb-2 text-xs">Cart Test Controls</h4>
      <div className="space-y-1">
        <button
          onClick={addTestItem}
          className="block w-full bg-green-500 text-white px-2 py-1 rounded text-xs"
        >
          Add Test Item
        </button>
        <button
          onClick={clearCart}
          className="block w-full bg-red-500 text-white px-2 py-1 rounded text-xs"
        >
          Clear Cart
        </button>
        <button
          onClick={testCartAPI}
          className="block w-full bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Test Cart API
        </button>
      </div>
    </div>
  );
};

export default CartTestControls;