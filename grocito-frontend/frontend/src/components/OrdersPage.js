import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../api/orderService';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
import Header from './Header';
import LoadingSpinner from './LoadingSpinner';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
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
    fetchOrders(currentUser.id);
  }, [navigate]);

  const fetchOrders = async (userId) => {
    try {
      setLoading(true);
      const ordersData = await orderService.getUserOrders(userId);
      setOrders(ordersData);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  if (loading) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-white">
      <Header user={user} showOrders={false} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <span className="font-medium text-lg">Back to Products</span>
          </button>
        </div>
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-yellow-500 to-blue-800 bg-clip-text text-transparent">Your Orders</h1>
          </div>
          <p className="text-gray-700 text-lg">Track your order history and delivery status</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 via-yellow-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg animate-bounce">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-lg">📦</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">Start shopping to see your orders here and track your deliveries</p>
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
          <div className="space-y-8">
            {orders.map((order, index) => (
              <div 
                key={order.id} 
                className="group bg-white rounded-2xl shadow-lg border-2 border-blue-200 hover:border-yellow-300 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <span className="text-white font-bold">#{order.id}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600 bg-yellow-50 px-3 py-1 rounded-full inline-block mt-1 border border-blue-200">
                        📅 {new Date(order.orderDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md ${getStatusColor(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                </div>

                <div className="bg-gradient-to-r from-blue-50 via-yellow-50 to-white rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                      <h4 className="font-bold text-blue-600 mb-3 flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Delivery Address</span>
                      </h4>
                      <p className="text-gray-700">{order.deliveryAddress}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                      <h4 className="font-bold text-blue-600 mb-3 flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span>Payment Method</span>
                      </h4>
                      <p className="text-gray-700">{order.paymentMethod || 'Cash on Delivery'}</p>
                    </div>
                  </div>
                </div>

                {order.orderItems && order.orderItems.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-blue-600 mb-4 flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>Items ({order.orderItems.length})</span>
                    </h4>
                    <div className="bg-white rounded-xl p-4 border border-blue-200 space-y-3">
                      {order.orderItems.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-gray-700 font-medium">
                            {item.product?.name || `Product ${item.productId}`} × {item.quantity}
                          </span>
                          <span className="text-blue-600 font-bold bg-yellow-100 px-2 py-1 rounded-full">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <p className="text-sm text-blue-600 font-medium bg-yellow-100 px-3 py-2 rounded-lg text-center border border-blue-200">
                          +{order.orderItems.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t-2 border-blue-200">
                  <div className="bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg">
                    <span className="text-lg font-bold">Total: ₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50 text-blue-600 hover:text-blue-700 font-bold px-6 py-3 rounded-xl border-2 border-blue-200 hover:border-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;