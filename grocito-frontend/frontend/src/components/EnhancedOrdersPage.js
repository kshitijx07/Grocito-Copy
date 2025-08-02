import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    TruckIcon, 
    PhoneIcon, 
    ChatBubbleLeftRightIcon, 
    ClockIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { enhancedOrderService } from '../api/enhancedOrderService';
import { orderService } from '../api/orderService';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
import { deliveryFeeService } from '../services/deliveryFeeService';
import Header from './Header';
import DeliveryPartnerCard from './DeliveryPartnerCard';

const EnhancedOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cancelling, setCancelling] = useState({});
    const [user, setUser] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState({});
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Get any state passed from checkout
    const { newOrderId, justPlaced } = location.state || {};

    // Fetch orders function with proper error handling
    const fetchOrders = useCallback(async (userId, showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError('');
            
            console.log('Fetching orders for user:', userId);
            
            // Use refresh method to get latest data from database
            const userOrders = await enhancedOrderService.refreshUserOrders(userId);
            console.log('Orders received from database:', userOrders);

            // Sort orders by date (newest first)
            const sortedOrders = userOrders.sort((a, b) => {
                return new Date(b.orderTime) - new Date(a.orderTime);
            });

            setOrders(sortedOrders);
            
            // Show success message if this was a refresh
            if (showRefreshing && sortedOrders.length > 0) {
                toast.success('Orders refreshed successfully!');
            }
            
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(error.message || 'Failed to load orders');
            
            // Only show toast error if it's not a simple "no orders" case
            if (!error.message?.includes('404')) {
                toast.error(error.message || 'Failed to load orders');
            }
            
            setOrders([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || !currentUser.id) {
            console.log('No valid user found, redirecting to login');
            toast.warning('Please login to view your orders');
            navigate('/login');
            return;
        }
        
        setUser(currentUser);
        fetchOrders(currentUser.id);

        // Show toast if coming from checkout with a new order
        if (justPlaced && newOrderId) {
            toast.success('Order placed successfully! 🎉', {
                position: "bottom-right",
                autoClose: 5000,
            });
            
            // Refresh orders after a short delay to ensure the new order is in the database
            setTimeout(() => {
                fetchOrders(currentUser.id, true);
            }, 2000);
        }
    }, [navigate, newOrderId, justPlaced, fetchOrders]);

    // Set up timer for cancellation window
    useEffect(() => {
        if (orders.length === 0) return;

        // Initialize time remaining for each order
        const initialTimeRemaining = {};
        orders.forEach(order => {
            if (enhancedOrderService.canCancelOrder(order)) {
                initialTimeRemaining[order.id] = enhancedOrderService.getCancellationTimeRemaining(order);
            }
        });
        setTimeRemaining(initialTimeRemaining);

        // Set up interval to update time remaining
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                const updated = { ...prev };
                let hasActiveTimers = false;

                Object.keys(updated).forEach(orderId => {
                    if (updated[orderId] > 0) {
                        updated[orderId] -= 1;
                        hasActiveTimers = true;
                    }
                });

                // If no active timers, clear interval
                if (!hasActiveTimers) {
                    clearInterval(timer);
                }

                return updated;
            });
        }, 1000);

        // Clean up interval
        return () => clearInterval(timer);
    }, [orders]);

    // Auto-refresh orders every 30 seconds to get real-time updates
    useEffect(() => {
        if (!user?.id) return;

        const autoRefreshInterval = setInterval(() => {
            console.log('Auto-refreshing orders...');
            fetchOrders(user.id, false); // Silent refresh
        }, 30000); // 30 seconds

        return () => clearInterval(autoRefreshInterval);
    }, [user?.id, fetchOrders]);

    // Manual refresh function
    const handleRefresh = () => {
        if (user?.id) {
            fetchOrders(user.id, true);
        }
    };

    const cancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        try {
            setCancelling(prev => ({ ...prev, [orderId]: true }));
            console.log('Cancelling order:', orderId);

            await enhancedOrderService.cancelOrder(orderId);

            // Refresh orders from database to get updated status
            await fetchOrders(user.id, false);

            // Remove from time remaining
            setTimeRemaining(prev => {
                const updated = { ...prev };
                delete updated[orderId];
                return updated;
            });

            // CRITICAL FIX: Show success message about items being restored to cart
            toast.success('Order cancelled successfully! Items have been restored to your cart.', {
                position: "bottom-right",
                autoClose: 4000,
            });
        } catch (error) {
            console.error('Cancel order error:', error);
            toast.error(error.message || 'Failed to cancel order');
        } finally {
            setCancelling(prev => ({ ...prev, [orderId]: false }));
        }
    };

    // Format time remaining
    const formatTimeRemaining = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-soft animate-pulse">
                        <span className="text-4xl">📦</span>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        Loading Your Orders...
                    </h2>
                    <p className="text-gray-600">Please wait while we fetch your order history from the database</p>
                    <div className="mt-6 flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="section-header mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-soft">
                                <span className="text-3xl">📦</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Your Orders
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {orders.length} {orders.length === 1 ? 'order' : 'orders'} • Real-time updates from database
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="btn-secondary flex items-center space-x-2"
                                title="Refresh orders from database"
                            >
                                <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                            </button>
                            <button
                                onClick={() => navigate('/products')}
                                className="btn-primary flex items-center space-x-2"
                            >
                                <span>🛍️</span>
                                <span>Continue Shopping</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="card mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
                        <div className="card-body">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                                    <span className="text-white text-xl">⚠️</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-900">Error Loading Orders</h3>
                                    <p className="text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="card">
                        <div className="card-body text-center py-16">
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">📦</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h3>
                            <p className="text-gray-600 text-lg mb-6">
                                You haven't placed any orders yet. Start shopping to see your orders here!
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => navigate('/products')}
                                    className="btn-primary"
                                >
                                    🛍️ Start Shopping
                                </button>
                                <button
                                    onClick={() => navigate('/payment-history')}
                                    className="btn-secondary"
                                >
                                    💳 Payment History
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => {
                            const isNewOrder = newOrderId && order.id === newOrderId;
                            const canCancel = timeRemaining[order.id] > 0;

                            return (
                                <div
                                    key={order.id}
                                    className={`order-card ${isNewOrder ? 'ring-2 ring-green-500' : ''}`}
                                >
                                    {/* Order Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                                                <span className="text-xl">📦</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-3 mb-1">
                                                    <h3 className="font-bold text-xl text-gray-900">Order #{order.id}</h3>
                                                    <span className={`px-3 py-1 rounded-xl text-sm font-semibold ${
                                                        order.status === 'PLACED' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200' :
                                                        order.status === 'PACKED' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200' :
                                                        order.status === 'OUT_FOR_DELIVERY' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200' :
                                                        order.status === 'DELIVERED' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' :
                                                        order.status === 'CANCELLED' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200' :
                                                        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                    {isNewOrder && (
                                                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-xl text-sm font-semibold animate-pulse">
                                                            🎉 New!
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 font-medium">
                                                    Placed on {new Date(order.orderTime).toLocaleString()}
                                                </p>
                                                {/* Cancellation Timer */}
                                                {canCancel && (
                                                    <div className="mt-2">
                                                        <span className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 px-3 py-1 rounded-xl text-sm font-semibold animate-pulse border border-orange-200">
                                                            ⏰ Cancel within: {formatTimeRemaining(timeRemaining[order.id])}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            {canCancel && (
                                                <button
                                                    onClick={() => cancelOrder(order.id)}
                                                    disabled={cancelling[order.id]}
                                                    className="btn-danger flex items-center space-x-2"
                                                >
                                                    {cancelling[order.id] ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            <span>Cancelling...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>❌</span>
                                                            <span>Cancel Order</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            <div className="text-right bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                                <div className="space-y-2">
                                                    {(() => {
                                                        // Calculate subtotal from order items
                                                        const subtotal = order.items?.reduce((total, item) => {
                                                            const itemPrice = item.price || item.product?.price || 0;
                                                            return total + (itemPrice * item.quantity);
                                                        }, 0) || 0;
                                                        
                                                        // FORCE CORRECT DELIVERY FEE CALCULATION - ignore potentially wrong stored values
                                                        // Calculate delivery fee based on subtotal (correct policy)
                                                        const deliveryFee = subtotal >= 199 ? 0 : 40;
                                                        
                                                        // Debug logging
                                                        console.log(`Order #${order.id}: Subtotal=₹${subtotal}, DeliveryFee=₹${deliveryFee}, StoredDeliveryFee=₹${order.deliveryFee}`);
                                                        
                                                        const totalAmount = subtotal + deliveryFee;
                                                        
                                                        return (
                                                            <>
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-green-700">Subtotal:</span>
                                                                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-green-700">Delivery:</span>
                                                                    <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                                                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                                                                    </span>
                                                                </div>
                                                                <div className="border-t border-green-200 pt-2">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-green-700 font-medium">Total:</span>
                                                                        <span className="text-xl font-bold text-green-600">₹{totalAmount.toFixed(2)}</span>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="mb-6">
                                        <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center space-x-2">
                                            <span>🛍️</span>
                                            <span>Order Items ({order.items?.length || 0})</span>
                                        </h4>
                                        <div className="space-y-4">
                                            {order.items && order.items.length > 0 ? order.items.map((item, index) => (
                                                <div key={item.id || `${order.id}-${item.product?.id || index}`} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                                    <img
                                                        src={item.product?.imageUrl || "https://via.placeholder.com/60"}
                                                        alt={item.product?.name || 'Product'}
                                                        className="w-16 h-16 object-cover rounded-xl mr-4 shadow-soft"
                                                        onError={(e) => {
                                                            e.target.src = "https://via.placeholder.com/60";
                                                        }}
                                                    />
                                                    <div className="flex-grow">
                                                        <h5 className="font-bold text-gray-900">{item.product?.name || 'Product'}</h5>
                                                        <p className="text-sm text-gray-600 font-medium">
                                                            Quantity: {item.quantity} × ₹{item.price || item.product?.price || '0.00'}
                                                        </p>
                                                        {item.product?.category && (
                                                            <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-lg">
                                                                {item.product.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-gray-900">
                                                            ₹{((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center py-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                                    <span className="text-4xl mb-2 block">📦</span>
                                                    <p className="text-gray-500 font-medium">No items available for this order</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delivery Partner Information */}
                                    {order.deliveryPartner && (
                                        <div className="mb-6">
                                            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                                                {/* Header */}
                                                <div className="flex items-center justify-between mb-6">
                                                    <h4 className="font-bold text-xl text-gray-900 flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                                            <TruckIcon className="w-5 h-5 text-white" />
                                                        </div>
                                                        <span>Your Delivery Partner</span>
                                                    </h4>
                                                    <span className="px-4 py-2 rounded-xl text-sm font-bold border-2 shadow-sm bg-green-100 text-green-800 border-green-200">
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                </div>

                                                <div className="flex items-start space-x-6">
                                                    {/* Partner Avatar */}
                                                    <div className="relative">
                                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
                                                            <span className="text-white font-bold text-2xl">
                                                                {order.deliveryPartner.fullName?.charAt(0) || 'D'}
                                                            </span>
                                                        </div>
                                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                                                            <CheckIcon className="w-4 h-4 text-white" />
                                                        </div>
                                                    </div>

                                                    {/* Partner Details */}
                                                    <div className="flex-1">
                                                        <div className="mb-4">
                                                            <h5 className="font-bold text-2xl text-gray-900">{order.deliveryPartner.fullName}</h5>
                                                        </div>

                                                        {/* Vehicle & Contact Info */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                            <div className="flex items-center space-x-3 bg-white rounded-xl px-4 py-3 border shadow-sm">
                                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                                                                    <TruckIcon className="w-4 h-4 text-purple-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500 font-medium">Vehicle</p>
                                                                    <p className="text-sm font-bold text-gray-900">
                                                                        {order.deliveryPartner.vehicleType} • {order.deliveryPartner.vehicleNumber}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center space-x-3 bg-white rounded-xl px-4 py-3 border shadow-sm">
                                                                <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                                                                    <PhoneIcon className="w-4 h-4 text-green-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500 font-medium">Contact</p>
                                                                    <p className="text-sm font-bold text-gray-900">{order.deliveryPartner.phoneNumber}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <button
                                                                onClick={() => {
                                                                    const confirmCall = window.confirm(
                                                                        `Call your delivery partner at ${order.deliveryPartner.phoneNumber}?\\n\\nThis will open your phone's dialer.`
                                                                    );
                                                                    if (confirmCall) {
                                                                        window.open(`tel:${order.deliveryPartner.phoneNumber}`, '_self');
                                                                    }
                                                                }}
                                                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                                            >
                                                                <PhoneIcon className="w-4 h-4" />
                                                                <span>Call Now</span>
                                                            </button>
                                                            
                                                            <button
                                                                onClick={() => alert('Chat feature coming soon!')}
                                                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                                            >
                                                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                                                <span>Chat</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Timeline */}
                                                {order.assignedAt && (
                                                    <div className="mt-6 pt-6 border-t border-blue-200">
                                                        <h6 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                                            <ClockIcon className="w-4 h-4" />
                                                            <span>Delivery Timeline</span>
                                                        </h6>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                                                                <div className="flex-1 bg-white rounded-lg px-3 py-2 border shadow-sm">
                                                                    <p className="text-sm font-medium text-gray-900">Partner Assigned</p>
                                                                    <p className="text-xs text-gray-600">{new Date(order.assignedAt).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            {order.pickedUpAt && (
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div>
                                                                    <div className="flex-1 bg-white rounded-lg px-3 py-2 border shadow-sm">
                                                                        <p className="text-sm font-medium text-gray-900">Order Picked Up</p>
                                                                        <p className="text-xs text-gray-600">{new Date(order.pickedUpAt).toLocaleString()}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {order.deliveredAt && (
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-3 h-3 bg-green-600 rounded-full shadow-sm"></div>
                                                                    <div className="flex-1 bg-white rounded-lg px-3 py-2 border shadow-sm">
                                                                        <p className="text-sm font-medium text-gray-900">Order Delivered</p>
                                                                        <p className="text-xs text-gray-600">{new Date(order.deliveredAt).toLocaleString()}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Delivery Address & Payment Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="text-lg">📍</span>
                                                <h5 className="font-bold text-blue-900">Delivery Address</h5>
                                            </div>
                                            <p className="text-blue-800 font-medium">{order.deliveryAddress || 'Not available'}</p>
                                        </div>
                                        
                                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="text-lg">💳</span>
                                                <h5 className="font-bold text-green-900">Payment Method</h5>
                                            </div>
                                            <p className="text-green-800 font-medium">
                                                {order.paymentMethod || 'COD'}
                                                {order.paymentInfo?.paymentId && (
                                                    <span className="block text-sm text-green-600">
                                                        ID: {order.paymentInfo.paymentId}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default EnhancedOrdersPage;