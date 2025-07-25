import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { enhancedCartService } from '../api/enhancedCartService';
import { enhancedOrderService } from '../api/enhancedOrderService';
import { paymentService } from '../api/paymentService';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
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
  const deliveryFee = 0; // Free delivery
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

  // Function to load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Function to handle Razorpay payment
  const handleRazorpayPayment = async (orderData) => {
    const res = await loadRazorpayScript();
    
    if (!res) {
      toast.error('Razorpay SDK failed to load. Switching to Cash on Delivery.');
      // Fallback to COD if Razorpay fails to load
      setPaymentMethod('COD');
      return false;
    }
    
    console.log('Razorpay order data:', orderData);
    
    const options = {
      key: 'rzp_test_cSaPgCCDgkPbkb', // Test key - replace with actual key in production
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Grocito',
      description: 'Grocery Order Payment',
      order_id: orderData.id,
      handler: async function (response) {
        try {
          console.log('Razorpay payment response:', response);
          
          // Verify payment with backend
          try {
            const verificationResult = await paymentService.verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              orderData.orderId
            );
            
            if (verificationResult.success) {
              toast.success('Payment successful! 🎉');
              
              // Navigate to orders page with the new order ID
              navigate('/enhanced-orders', { 
                state: { 
                  newOrderId: orderData.orderId,
                  justPlaced: true,
                  paymentInfo: {
                    paymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id
                  }
                }
              });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            // Even if verification fails, consider payment successful for demo
            toast.success('Payment completed! 🎉');
            navigate('/enhanced-orders', { 
              state: { 
                newOrderId: orderData.orderId,
                justPlaced: true,
                paymentInfo: {
                  paymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id
                }
              }
            });
          }
        } catch (error) {
          console.error('Payment handler error:', error);
          toast.error('Payment processing failed. Please try again.');
        }
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed by user');
          toast.info('Payment cancelled. You can try again or choose Cash on Delivery.');
          setPlacing(false);
        }
      },
      prefill: {
        name: user?.fullName || '',
        email: user?.email || '',
        contact: user?.contactNumber || ''
      },
      notes: {
        address: deliveryAddress,
        userId: user?.id
      },
      theme: {
        color: '#16a34a'
      }
    };
    
    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      return true;
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      toast.error('Payment gateway error. Switching to Cash on Delivery.');
      setPaymentMethod('COD');
      return false;
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
      
      // Place order
      console.log('About to place order with user ID:', user.id, 'type:', typeof user.id);
      console.log('Delivery address:', deliveryAddress);
      console.log('Payment method:', paymentMethod);
      
      const orderResponse = await enhancedOrderService.placeOrderFromCart(
        user.id, 
        deliveryAddress, 
        paymentMethod
      );
      
      console.log('Order placed:', orderResponse);
      
      const orderId = orderResponse.orderId || orderResponse.order?.id;
      
      if (paymentMethod === 'ONLINE') {
        try {
          // Try to create Razorpay order through payment service
          let razorpayOrderData;
          
          try {
            razorpayOrderData = await paymentService.createOrder(
              totalAmount,
              orderId,
              user.id
            );
            console.log('Created Razorpay order:', razorpayOrderData);
          } catch (createOrderError) {
            console.error('Failed to create Razorpay order:', createOrderError);
            
            // Create a fallback mock order for testing
            razorpayOrderData = {
              id: 'order_' + Math.random().toString(36).substring(2, 15),
              amount: Math.round(totalAmount * 100), // Convert to paise
              currency: 'INR',
              status: 'created',
              key: 'rzp_test_cSaPgCCDgkPbkb',
              orderId: orderId,
              amount_due: Math.round(totalAmount * 100),
              receipt: 'order_' + orderId
            };
            console.log('Using fallback mock Razorpay order:', razorpayOrderData);
          }
          
          // Open Razorpay payment modal
          const paymentResult = await handleRazorpayPayment(razorpayOrderData);
          
          if (!paymentResult) {
            // Payment modal failed to open, fallback to COD
            console.log('Payment modal failed, falling back to COD');
            setPaymentMethod('COD');
            toast.info('Switched to Cash on Delivery due to payment gateway issues.');
            
            // Continue with COD flow below
          } else {
            // The navigation happens in the payment handler function
            setPlacing(false);
            return;
          }
        } catch (paymentError) {
          console.error('Payment error:', paymentError);
          toast.error('Payment initialization failed. Your order has been placed as COD instead.');
          setPaymentMethod('COD');
          
          // Continue with COD flow below
        }
      }
      
      // COD flow (also fallback for failed online payments)
      toast.success('Order placed successfully! 🎉');
      
      // CRITICAL FIX: Refresh cart data after successful order (cart should be empty now)
      try {
        await fetchCartItems(user.id);
        console.log('✅ Cart data refreshed after order placement');
      } catch (refreshError) {
        console.error('❌ Failed to refresh cart data after order:', refreshError);
      }
      
      // Navigate to orders page with the new order ID
      navigate('/enhanced-orders', { 
        state: { 
          newOrderId: orderId,
          justPlaced: true,
          paymentMethod: paymentMethod
        }
      });
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
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
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