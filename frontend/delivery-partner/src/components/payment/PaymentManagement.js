import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CheckCircleIcon, CurrencyDollarIcon, CreditCardIcon, DevicePhoneMobileIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { getRazorpayKey, isTestMode, validateRazorpayConfig } from '../../config/razorpayConfig';
import { API_BASE_URL } from '../../services/api';

const PaymentManagement = ({ order, onPaymentUpdate, onDeliveryBlock }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProcessingDigitalPayment, setIsProcessingDigitalPayment] = useState(false);

  // Check if this order needs payment collection
  const needsPaymentCollection = order && 
    order.paymentMethod === 'COD' && 
    order.paymentStatus === 'PENDING' &&
    order.status === 'OUT_FOR_DELIVERY';

  // Check if payment is already completed
  const isPaymentCompleted = order && order.paymentStatus === 'PAID';

  // Validate Razorpay configuration on component mount
  useEffect(() => {
    if (needsPaymentCollection) {
      const isConfigValid = validateRazorpayConfig();
      if (!isConfigValid) {
        console.error('❌ Razorpay configuration is invalid. Please check your .env file.');
      }
    }
  }, [needsPaymentCollection]);

  // Load Razorpay script with better error handling
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        console.log('✅ Razorpay already loaded');
        resolve(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        console.log('📦 Razorpay script already exists, waiting for load...');
        existingScript.onload = () => {
          console.log('✅ Existing Razorpay script loaded');
          resolve(true);
        };
        existingScript.onerror = () => {
          console.error('❌ Existing Razorpay script failed to load');
          resolve(false);
        };
        return;
      }

      console.log('📦 Loading new Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Razorpay script loaded successfully');
        resolve(true);
      };
      
      script.onerror = (error) => {
        console.error('❌ Razorpay script failed to load:', error);
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  };

  const handleCashPayment = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${order.id}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          actualPaymentMethod: 'CASH',
          paymentId: '',
          paymentNotes: paymentNotes || 'Cash payment collected at delivery'
        })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        console.log('✅ Cash payment status updated successfully:', updatedOrder);
        
        toast.success('💵 Cash payment collected successfully!', {
          position: "top-center",
          autoClose: 3000,
        });
        
        // Reset form state immediately
        setPaymentMethod('');
        setPaymentNotes('');
        
        // Call parent update callback
        if (onPaymentUpdate) {
          onPaymentUpdate(updatedOrder);
        }
        
        // Force refresh after a short delay to ensure UI updates
        setTimeout(() => {
          console.log('🔄 Refreshing page to update order status...');
          window.location.reload();
        }, 2000);
        
      } else {
        const errorText = await response.text();
        toast.error(`Failed to update payment: ${errorText}`);
      }
    } catch (error) {
      console.error('Payment update error:', error);
      toast.error('Failed to update payment status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Removed handleDigitalPayment function - using direct click handler instead to maintain user interaction context

  // Don't show if payment is already completed
  if (isPaymentCompleted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
        <div className="flex items-center">
          <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-green-800">Payment Completed</h3>
            <p className="text-sm text-green-600">
              Paid via {order.actualPaymentMethod} • ₹{order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't show if payment collection is not needed
  if (!needsPaymentCollection) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
      <div className="flex items-center mb-3">
        <CurrencyDollarIcon className="h-6 w-6 text-yellow-600 mr-3" />
        <h3 className="text-lg font-semibold text-yellow-800">
          Collect Payment - ₹{order.totalAmount.toFixed(2)}
        </h3>
      </div>
      
      <div className="space-y-4">
        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How will the customer pay?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('CASH')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'CASH'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <CurrencyDollarIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <span className="text-sm font-medium">Cash Payment</span>
                <p className="text-xs text-gray-600 mt-1">Customer pays in cash</p>
              </div>
            </button>
            
            <button
              onClick={() => setPaymentMethod('DIGITAL')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'DIGITAL'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <DevicePhoneMobileIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <span className="text-sm font-medium">Digital Payment</span>
                <p className="text-xs text-gray-600 mt-1">UPI, Card, Net Banking</p>
              </div>
            </button>
          </div>
        </div>

        {/* Payment Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder="Any additional notes about the payment..."
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        {paymentMethod === 'CASH' && (
          <button
            onClick={handleCashPayment}
            disabled={isUpdating}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Confirming Cash Payment...
              </div>
            ) : (
              `Confirm Cash Payment - ₹${order.totalAmount.toFixed(2)}`
            )}
          </button>
        )}

        {paymentMethod === 'DIGITAL' && (
          <button
            onClick={() => {
              // CRITICAL FIX: Direct Razorpay call in click handler to maintain user interaction context
              console.log('🔥 DIRECT RAZORPAY CALL - User clicked digital payment');
              
              const razorpayKey = getRazorpayKey();
              const amountInPaise = Math.round(order.totalAmount * 100);
              
              // Validate Razorpay configuration first
              try {
                if (!validateRazorpayConfig()) {
                  toast.error('❌ Payment gateway not configured. Please contact support.');
                  return;
                }
              } catch (error) {
                toast.error('❌ Payment configuration error: ' + error.message);
                return;
              }
              
              // Check if Razorpay is already loaded
              if (window.Razorpay) {
                console.log('✅ Razorpay already available, opening directly');
                
                const options = {
                  key: razorpayKey,
                  amount: amountInPaise,
                  currency: 'INR',
                  name: 'Grocito',
                  description: `COD Payment for Order #${order.id}`,
                  order_id: `order_${order.id}_${Date.now()}`,
                  handler: async function (response) {
                    console.log('✅ Payment successful:', response);
                    
                    try {
                      console.log('💾 Updating payment status in database...');
                      const updateResponse = await fetch(`${API_BASE_URL}/api/orders/${order.id}/payment`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                          actualPaymentMethod: 'UPI',
                          paymentId: response.razorpay_payment_id || 'razorpay_' + Date.now(),
                          paymentNotes: paymentNotes || `Digital payment via Razorpay - Payment ID: ${response.razorpay_payment_id}`
                        })
                      });

                      if (updateResponse.ok) {
                        const updatedOrder = await updateResponse.json();
                        console.log('✅ Payment status updated successfully:', updatedOrder);
                        
                        toast.success('🎉 Digital payment collected successfully!', {
                          position: "top-center",
                          autoClose: 3000,
                        });
                        
                        setPaymentMethod('');
                        setPaymentNotes('');
                        
                        if (onPaymentUpdate) onPaymentUpdate(updatedOrder);
                        
                        setTimeout(() => {
                          console.log('🔄 Refreshing page to update order status...');
                          window.location.reload();
                        }, 2000);
                      } else {
                        throw new Error('Payment update failed');
                      }
                    } catch (error) {
                      console.error('❌ Payment update error:', error);
                      toast.error('Payment successful but failed to update status. Please refresh the page.');
                    }
                  },
                  modal: {
                    ondismiss: function() {
                      console.log('❌ Payment dismissed by user');
                      toast.info('Payment cancelled by customer');
                    }
                  },
                  prefill: {
                    name: order.user?.fullName || 'Customer',
                    email: order.user?.email || '',
                    contact: order.user?.contactNumber || ''
                  },
                  theme: { color: '#3B82F6' }
                };
                
                try {
                  const rzp = new window.Razorpay(options);
                  
                  // Add failure event listener
                  rzp.on('payment.failed', function (response) {
                    console.log('❌ Payment failed:', response);
                    toast.error('Payment failed: ' + (response.error?.description || 'Unknown error'));
                  });
                  
                  rzp.open();
                  console.log('🚀 Razorpay opened directly!');
                } catch (error) {
                  console.error('❌ Direct Razorpay error:', error);
                  toast.error('Failed to open payment gateway');
                }
              } else {
                // Load script first, then open immediately
                console.log('📦 Loading Razorpay script and opening...');
                
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => {
                  console.log('✅ Script loaded, opening Razorpay immediately...');
                  
                  const options = {
                    key: razorpayKey,
                    amount: amountInPaise,
                    currency: 'INR',
                    name: 'Grocito',
                    description: `COD Payment for Order #${order.id}`,
                    handler: async function (response) {
                      console.log('✅ Payment successful:', response);
                      
                      try {
                        const updateResponse = await fetch(`${API_BASE_URL}/api/orders/${order.id}/payment`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                          body: new URLSearchParams({
                            actualPaymentMethod: 'UPI',
                            paymentId: response.razorpay_payment_id || 'razorpay_' + Date.now(),
                            paymentNotes: paymentNotes || `Digital payment via Razorpay`
                          })
                        });

                        if (updateResponse.ok) {
                          const updatedOrder = await updateResponse.json();
                          toast.success('🎉 Digital payment collected successfully!');
                          
                          setPaymentMethod('');
                          setPaymentNotes('');
                          
                          if (onPaymentUpdate) onPaymentUpdate(updatedOrder);
                          
                          setTimeout(() => {
                            window.location.reload();
                          }, 2000);
                        }
                      } catch (error) {
                        toast.error('Payment successful but failed to update status');
                      }
                    },
                    modal: {
                      ondismiss: function() {
                        toast.info('Payment cancelled');
                      }
                    },
                    prefill: {
                      name: order.user?.fullName || 'Customer',
                      email: order.user?.email || '',
                      contact: order.user?.contactNumber || ''
                    },
                    theme: { color: '#3B82F6' }
                  };
                  
                  try {
                    const rzp = new window.Razorpay(options);
                    
                    rzp.on('payment.failed', function (response) {
                      console.log('❌ Payment failed:', response);
                      toast.error('Payment failed: ' + (response.error?.description || 'Unknown error'));
                    });
                    
                    rzp.open();
                    console.log('🚀 Razorpay opened after script load!');
                  } catch (error) {
                    console.error('❌ Razorpay error after script load:', error);
                    toast.error('Failed to open payment gateway');
                  }
                };
                
                script.onerror = () => {
                  console.error('❌ Failed to load Razorpay script');
                  toast.error('Failed to load payment gateway');
                };
                
                document.head.appendChild(script);
              }
            }}
            disabled={isProcessingDigitalPayment}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessingDigitalPayment ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Opening Payment Gateway...
              </div>
            ) : (
              `Collect Digital Payment - ₹${order.totalAmount.toFixed(2)}`
            )}
          </button>
        )}

        {/* Warning for delivery */}
        {paymentMethod && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-sm text-orange-800">
                {paymentMethod === 'CASH' 
                  ? 'Make sure to collect the exact amount before marking as delivered.'
                  : 'Customer must complete digital payment before you can mark the order as delivered.'
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;