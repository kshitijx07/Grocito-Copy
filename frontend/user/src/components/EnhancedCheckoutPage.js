import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { enhancedCartService } from '../api/enhancedCartService';
import { enhancedOrderService } from '../api/enhancedOrderService';
import { razorpayService } from '../api/razorpayService';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
import { deliveryFeeService } from '../services/deliveryFeeService';
import Header from './Header';

const EnhancedCheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [user, setUser] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const navigate = useNavigate();

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const deliveryInfo = deliveryFeeService.getDeliveryFeeDisplaySync(subtotal);
  const deliveryFee = deliveryInfo.deliveryFee;
  const totalAmount = subtotal + deliveryFee;
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    
    // CRITICAL FIX: Don't pre-fill address - let user enter fresh delivery address
    // This ensures users can deliver to different locations than their profile address
    console.log('Checkout initialized - delivery address field is empty for user input');
    
    fetchCartItems(currentUser.id);
  }, [navigate]);

  const fetchCartItems = async (userId) => {
    try {
      setLoading(true);
      console.log('Fetching cart items for user:', userId);
      const items = await enhancedCartService.getCartItems(userId);
      console.log('Cart items received:', items);
      setCartItems(items || []);
      
      if (items.length === 0) {
        toast.info('Your cart is empty');
        navigate('/enhanced-cart');
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle online payment with correct flow
  const handleOnlinePayment = async () => {
    try {
      await razorpayService.initializePayment({
        amount: totalAmount,
        customerName: user?.fullName || user?.email || 'Customer',
        customerEmail: user?.email || 'customer@example.com',
        customerPhone: user?.contactNumber || '9999999999',
        onSuccess: async (paymentResponse) => {
          // Only place order after successful payment
          try {
            const orderResponse = await enhancedOrderService.placeOrderFromCart(
              user.id, 
              deliveryAddress, 
              'ONLINE',
              {
                paymentId: paymentResponse.paymentId,
                razorpayOrderId: paymentResponse.orderId
              }
            );
            
            const orderId = orderResponse.orderId || orderResponse.order?.id;
            
            toast.success('Payment successful! Order placed! 🎉');
            
            // Navigate to orders page
            navigate('/enhanced-orders', { 
              state: { 
                newOrderId: orderId,
                justPlaced: true,
                paymentInfo: {
                  paymentId: paymentResponse.paymentId,
                  razorpayOrderId: paymentResponse.orderId
                }
              }
            });
          } catch (orderError) {
            console.error('Order placement failed after successful payment:', orderError);
            toast.error('Payment successful but order placement failed. Please contact support.');
          }
          setPlacing(false);
        },
        onFailure: (error) => {
          // Do not place order on payment failure
          console.error('Payment failed:', error);
          toast.error('Payment failed: ' + error);
          setPlacing(false);
        }
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment');
      setPlacing(false);
    }
  };

  const placeOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setPlacing(true);

      if (paymentMethod === 'ONLINE') {
        // Handle online payment - order will be placed only after successful payment
        await handleOnlinePayment();
      } else {
        // Handle COD - place order immediately
        const orderResponse = await enhancedOrderService.placeOrderFromCart(
          user.id, 
          deliveryAddress, 
          'COD'
        );
        
        const orderId = orderResponse.orderId || orderResponse.order?.id;
        
        toast.success('Order placed successfully! 🎉');
        
        // Navigate to orders page
        navigate('/enhanced-orders', { 
          state: { 
            newOrderId: orderId,
            justPlaced: true,
            paymentMethod: 'COD'
          }
        });
        setPlacing(false);
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.message || 'Failed to place order');
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 via-yellow-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
          <p className="text-xl font-semibold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent animate-pulse">Loading checkout...</p>
          <p className="text-gray-600 mt-2">Please wait while we prepare your order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-white">
      <Header user={user} showCart={false} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate('/enhanced-cart')}
            className="group flex items-center space-x-3 text-gray-600 hover:text-green-600 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center group-hover:shadow-lg transition-all duration-300 border-2 border-green-200 group-hover:border-yellow-300">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="font-medium text-lg">Back to Cart</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
          <p className="text-gray-600">Complete your order with {totalItems} items</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Delivery Address
              </h2>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your complete delivery address..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows="3"
                required
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Method
              </h2>
              <div className="space-y-3">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'COD' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-bold">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when your order arrives</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'ONLINE' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                  onClick={() => setPaymentMethod('ONLINE')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-bold">Online Payment</p>
                      <p className="text-sm text-gray-600">Pay now with card, UPI, or wallet</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Order Items ({cartItems.length})
              </h2>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.product.id} className="flex items-center border-b pb-4 last:border-b-0 last:pb-0">
                    <img
                      src={item.product.imageUrl || "https://via.placeholder.com/80"}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-md mr-4"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80";
                      }}
                    />
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x ₹{item.product.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className={`font-medium ${deliveryInfo.isFreeDelivery ? 'text-green-600' : 'text-gray-900'}`}>
                    {deliveryInfo.displayText}
                  </span>
                </div>
                {deliveryInfo.promotionText && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                    💡 {deliveryInfo.promotionText}
                  </div>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-xl text-green-700">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={placing || !deliveryAddress.trim() || cartItems.length === 0}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {placing ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Order...
                  </div>
                ) : (
                  'Place Order'
                )}
              </button>

              <div className="mt-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Orders can be cancelled within 2 minutes of placing
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnhancedCheckoutPage;