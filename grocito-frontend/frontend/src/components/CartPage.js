import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../api/cartService';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
import Header from './Header';

const CartPage = () => {
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
    fetchCartItems(currentUser.id);
  }, [navigate]);

  const fetchCartItems = async (userId) => {
    try {
      setLoading(true);
      console.log('Fetching cart items for user:', userId);
      const items = await cartService.getCartItems(userId);
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

      await cartService.updateCartItem(user.id, productId, newQuantity);

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
      toast.error('Failed to update cart');
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

      await cartService.removeFromCart(user.id, productId);

      // Update local state immediately
      setCartItems(prevItems =>
        prevItems.filter(item => item.product.id !== productId)
      );

      toast.success('Item removed!');
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('Failed to remove item');
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
      await cartService.clearCart(user.id);
      setCartItems([]);
      toast.success('Cart cleared!');
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Failed to clear cart');
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const deliveryFee = 0; // Free delivery
  const totalAmount = subtotal + deliveryFee;
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
          <p className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-pulse">Loading your cart...</p>
          <p className="text-gray-600 mt-2">Please wait while we fetch your items</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-white">
      <Header user={user} showCart={false} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate('/products')}
            className="group flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center group-hover:shadow-lg transition-all duration-300 border-2 border-blue-200 group-hover:border-yellow-300">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="font-medium text-lg">Continue Shopping</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-yellow-500 to-blue-800 bg-clip-text text-transparent">
              Your Cart
            </h1>
          </div>
          <p className="text-gray-700 text-lg">
            {cartItems.length > 0 ? `${totalItems} items ready for checkout` : 'Ready to add some delicious items?'}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 via-yellow-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg animate-bounce">
                <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-lg">😋</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Looks like you haven't added any delicious items yet. Let's fix that!
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:via-yellow-500 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Start Shopping</span>
              </span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 via-yellow-50 to-white px-8 py-6 border-b border-blue-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Cart Items ({cartItems.length})
                      </h2>
                    </div>
                    <button
                      onClick={clearCart}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-4 py-2 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.product.id}
                      className="group relative bg-gradient-to-r from-white to-blue-50 rounded-2xl p-6 border-2 border-blue-100 hover:border-yellow-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center space-x-6">
                        {/* Product Image */}
                        <div className="relative">
                          <img
                            src={item.product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-300"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100';
                            }}
                          />
                          {updating[item.product.id] && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 rounded-2xl flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2 bg-yellow-100 px-3 py-1 rounded-full inline-block border border-blue-200">
                            {item.product.category}
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className="text-2xl font-bold text-blue-600">₹{item.product.price}</p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-4 bg-blue-50 rounded-2xl p-3 border border-blue-200">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={updating[item.product.id] || item.quantity <= 1}
                            className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white flex items-center justify-center hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 shadow-lg"
                          >
                            {updating[item.product.id] ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                              </svg>
                            )}
                          </button>

                          <div className="bg-white rounded-xl px-6 py-3 shadow-inner min-w-[80px] text-center border border-blue-200">
                            <span className="text-2xl font-bold text-gray-900">{item.quantity}</span>
                          </div>

                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={updating[item.product.id]}
                            className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 shadow-lg"
                          >
                            {updating[item.product.id] ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {/* Item Total & Remove */}
                        <div className="text-right min-w-[120px]">
                          <div className="bg-gradient-to-r from-blue-50 to-yellow-50 rounded-xl p-4 mb-3 border border-blue-200">
                            <p className="text-sm text-blue-600 font-medium mb-1">Total</p>
                            <p className="text-2xl font-bold text-blue-700">
                              ₹{(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            disabled={updating[item.product.id]}
                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-4 py-2 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 mx-auto shadow-md hover:shadow-lg"
                          >
                            {updating[item.product.id] ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Removing...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Remove</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 overflow-hidden sticky top-6">
                <div className="bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-600 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">Order Summary</h2>
                  </div>
                </div>

                <div className="p-6">
                  {/* Price Breakdown */}
                  <div className="space-y-4 mb-8">
                    <div className="bg-gradient-to-r from-blue-50 to-yellow-50 rounded-xl p-4 space-y-3 border border-blue-200">
                      <div className="flex justify-between items-center text-gray-700">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span>Subtotal ({totalItems} items)</span>
                        </span>
                        <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-700">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Delivery Fee</span>
                        </span>
                        <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">FREE</span>
                      </div>
                      <div className="border-t border-blue-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-gray-900">Total</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">₹{totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Savings Badge */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4">
                      <div className="flex items-center space-x-2 text-orange-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="font-semibold text-sm">You saved ₹40 on delivery!</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="mb-6">
                    <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Delivery Address</span>
                    </label>
                    <textarea
                      placeholder="Enter your complete delivery address..."
                      className="w-full p-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-blue-400 transition-all duration-300 resize-none"
                      rows="3"
                    />
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:via-yellow-500 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <span>Proceed to Checkout</span>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </button>

                  {/* Delivery Info */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-yellow-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-center space-x-2 text-blue-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="font-semibold">Fast delivery in 30-45 minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;