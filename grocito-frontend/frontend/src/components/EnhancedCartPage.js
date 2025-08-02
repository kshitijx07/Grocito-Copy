import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { enhancedCartService } from '../api/enhancedCartService';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
import { deliveryFeeService } from '../services/deliveryFeeService';
import Header from './Header';
import ResetCartButton from './ResetCartButton';

const EnhancedCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    // Check if we need to reset the cart (for testing/debugging)
    const resetCart = new URLSearchParams(window.location.search).get('reset');
    if (resetCart === 'true') {
      enhancedCartService.resetCart(currentUser.id);
      toast.info('Cart has been reset');
    }

    fetchCartItems(currentUser.id);
  }, [navigate]);

  const fetchCartItems = async (userId) => {
    try {
      setLoading(true);
      console.log('Fetching cart items for user:', userId);
      const items = await enhancedCartService.getCartItems(userId);
      console.log('Cart items received:', items);
      setCartItems(items || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
      setCartItems([]);
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
      setUpdating(prev => ({ ...prev, [productId]: true }));
      console.log('Updating cart item:', { userId: user.id, productId, quantity: newQuantity });

      await enhancedCartService.updateCartItem(user.id, productId, newQuantity);

      // Update local state immediately for better UX
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      toast.success('Cart updated!');
    } catch (error) {
      console.error('Update cart error:', error);
      toast.error(error.message || 'Failed to update cart');
      // Refresh cart on error
      fetchCartItems(user.id);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeItem = async (productId) => {
    try {
      setUpdating(prev => ({ ...prev, [productId]: true }));
      console.log('Removing item from cart:', { userId: user.id, productId });

      await enhancedCartService.removeFromCart(user.id, productId);

      // Update local state immediately
      setCartItems(prevItems =>
        prevItems.filter(item => item.product.id !== productId)
      );

      toast.success('Item removed!');
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error(error.message || 'Failed to remove item');
      // Refresh cart on error
      fetchCartItems(user.id);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;

    try {
      console.log('Clearing cart for user:', user.id);
      await enhancedCartService.clearCart(user.id);
      setCartItems([]);
      toast.success('Cart cleared!');
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error(error.message || 'Failed to clear cart');
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const deliveryInfo = deliveryFeeService.getDeliveryFeeDisplaySync(subtotal);
  const deliveryFee = deliveryInfo.deliveryFee;
  const totalAmount = subtotal + deliveryFee;
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-soft animate-pulse">
            <span className="text-4xl">🛒</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Loading Your Cart...
          </h2>
          <p className="text-gray-600">Please wait while we fetch your items</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} showCart={false} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="section-header mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-soft">
                <span className="text-3xl">🛒</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  Your Shopping Cart
                </h1>
                <p className="text-gray-600 mt-1">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} • {totalItems} total quantity
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <ResetCartButton onReset={() => fetchCartItems(user.id)} />
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="btn-danger"
                >
                  Clear Cart
                </button>
              )}
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🛒</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h3>
              <p className="text-gray-600 text-lg mb-6">
                Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
              </p>
              <button
                onClick={() => navigate('/products')}
                className="btn-primary"
              >
                🛍️ Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.product.id} className="cart-item">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={item.product.imageUrl || "https://via.placeholder.com/100"}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-xl"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/100";
                          }}
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-gray-900 text-lg">{item.product.name}</h3>
                        <p className="text-gray-600">{item.product.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-lg font-bold text-green-600">₹{item.product.price}</span>
                          <span className="text-sm text-gray-500">per item</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center bg-gray-100 rounded-xl">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={updating[item.product.id]}
                            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-l-xl transition-colors duration-200"
                          >
                            <span className="text-xl font-bold">−</span>
                          </button>
                          <span className="px-4 py-2 font-bold text-gray-900 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={updating[item.product.id]}
                            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-r-xl transition-colors duration-200"
                          >
                            <span className="text-xl font-bold">+</span>
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          disabled={updating[item.product.id]}
                          className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-200 flex items-center justify-center shadow-soft hover:shadow-soft-lg"
                          title="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-sm text-gray-600">Item total:</span>
                      <span className="text-lg font-bold text-gray-900">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="card h-fit sticky top-8">
              <div className="card-header">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📋</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                    <p className="text-sm text-gray-600">{totalItems} items in cart</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className={`font-semibold flex items-center space-x-1 ${deliveryInfo.isFreeDelivery ? 'text-green-600' : 'text-gray-900'}`}>
                      <span>{deliveryInfo.displayText}</span>
                      <span className="text-lg">🚚</span>
                    </span>
                  </div>
                  {deliveryInfo.promotionText && (
                    <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                      💡 {deliveryInfo.promotionText}
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-green-600">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/enhanced-checkout')}
                  className="w-full btn-primary text-lg py-4"
                >
                  🛒 Proceed to Checkout
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="w-full btn-secondary mt-3"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EnhancedCartPage;