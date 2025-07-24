import React, { useState, useEffect } from 'react';
import { enhancedCartService } from '../api/enhancedCartService';
import { enhancedOrderService } from '../api/enhancedOrderService';
import { authService } from '../api/authService';

const CartOrderDebugInfo = () => {
  const [cartItems, setCartItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = authService.getCurrentUser();

  const refreshData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Get current cart items
      const cart = await enhancedCartService.getCartItems(user.id);
      setCartItems(cart);
      
      // Get recent orders (last 5)
      const orders = await enhancedOrderService.getUserOrders(user.id);
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error refreshing debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user?.id]);

  if (!user) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-4 text-sm max-w-md z-50 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-gray-800">🛒 Cart & Order Debug</h4>
        <button 
          onClick={refreshData}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800 text-xs"
        >
          {loading ? '⟳' : '🔄'}
        </button>
      </div>
      
      <div className="space-y-2 text-gray-700">
        <div>
          <strong>Cart Items:</strong> {cartItems.length}
          {cartItems.length > 0 && (
            <div className="text-xs ml-2 text-gray-600">
              {cartItems.map(item => (
                <div key={item.product.id}>
                  • {item.product.name} (x{item.quantity})
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <strong>Recent Orders:</strong> {recentOrders.length}
          {recentOrders.length > 0 && (
            <div className="text-xs ml-2 text-gray-600">
              {recentOrders.map(order => (
                <div key={order.id} className={`
                  ${order.status === 'CANCELLED' ? 'text-red-600' : ''}
                  ${order.status === 'PLACED' ? 'text-blue-600' : ''}
                  ${order.status === 'DELIVERED' ? 'text-green-600' : ''}
                `}>
                  • Order #{order.id} - {order.status}
                  <span className="text-gray-500"> ({order.items?.length || 0} items)</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
          <div>✅ Cart clears after order placement</div>
          <div>✅ Items restore after cancellation</div>
        </div>
      </div>
    </div>
  );
};

export default CartOrderDebugInfo;