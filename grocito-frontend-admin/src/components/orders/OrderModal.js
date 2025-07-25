import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  ArchiveBoxIcon, 
  TruckIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { orderService } from '../../api/orderService';

const OrderModal = ({ order, onClose, onUpdateStatus, adminInfo }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [order.id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const details = await orderService.getOrderSummary(order.id);
      setOrderDetails(details);
    } catch (error) {
      console.error('Error loading order details:', error);
      // Fallback to basic order data
      setOrderDetails(order);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'PLACED': 'bg-blue-100 text-blue-800 border-blue-200',
      'PACKED': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'OUT_FOR_DELIVERY': 'bg-purple-100 text-purple-800 border-purple-200',
      'DELIVERED': 'bg-green-100 text-green-800 border-green-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'PLACED': 'PACKED',
      'PACKED': 'OUT_FOR_DELIVERY',
      'OUT_FOR_DELIVERY': 'DELIVERED'
    };
    return statusFlow[currentStatus];
  };

  const canUpdateStatus = () => {
    if (adminInfo?.isSuperAdmin) return true;
    if (adminInfo?.isRegionalAdmin && order.pincode === adminInfo.pincode) return true;
    return false;
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await onUpdateStatus(order.id, newStatus);
      // Reload order details to get updated status
      await loadOrderDetails();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'PLACED', label: 'Order Placed', icon: <DocumentTextIcon className="w-5 h-5" /> },
      { key: 'PACKED', label: 'Packed', icon: <ArchiveBoxIcon className="w-5 h-5" /> },
      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: <TruckIcon className="w-5 h-5" /> },
      { key: 'DELIVERED', label: 'Delivered', icon: <CheckCircleIcon className="w-5 h-5" /> }
    ];

    const currentStatus = orderDetails?.status || order.status;
    const statusIndex = steps.findIndex(step => step.key === currentStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= statusIndex,
      current: step.key === currentStatus
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-600">Order #{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading order details...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Order Status and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(orderDetails?.status || order.status)}`}>
                  {(orderDetails?.status || order.status).replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-600">
                  {formatDateTime(orderDetails?.orderTime || order.orderTime)}
                </span>
              </div>
              
              {/* Status Update Actions */}
              {canUpdateStatus() && (
                <div className="flex items-center space-x-2">
                  {getNextStatus(orderDetails?.status || order.status) && (
                    <button
                      onClick={() => handleStatusUpdate(getNextStatus(orderDetails?.status || order.status))}
                      disabled={updating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {updating && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      <span>Mark as {getNextStatus(orderDetails?.status || order.status).replace('_', ' ')}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Order Progress */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Order Progress</h3>
              <div className="flex items-center justify-between">
                {getStatusSteps().map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      step.completed 
                        ? step.current 
                          ? 'bg-green-600 text-white' 
                          : 'bg-green-100 text-green-600'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {step.icon}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${
                      step.completed ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                    {index < getStatusSteps().length - 1 && (
                      <div className={`absolute w-full h-0.5 top-5 left-1/2 transform -translate-y-1/2 ${
                        step.completed ? 'bg-green-600' : 'bg-gray-200'
                      }`} style={{ zIndex: -1 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Customer and Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Name:</span>
                    <p className="text-sm font-medium text-gray-900">{order.user?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Email:</span>
                    <p className="text-sm text-gray-900">{order.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Phone:</span>
                    <p className="text-sm text-gray-900">{order.user?.contactNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Delivery Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Address:</span>
                    <p className="text-sm text-gray-900">{orderDetails?.deliveryAddress || order.deliveryAddress}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Pincode:</span>
                    <p className="text-sm font-medium text-gray-900">{orderDetails?.pincode || order.pincode}</p>
                  </div>
                </div>
              </div>
            </div>     
       {/* Order Items */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(orderDetails?.items || order.items || []).map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {item.product?.imageUrl && (
                              <img
                                className="h-10 w-10 rounded-lg object-cover mr-3"
                                src={item.product.imageUrl}
                                alt={item.productName || item.product?.name}
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/40x40?text=No+Image';
                                }}
                              />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.productName || item.product?.name || 'Unknown Product'}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {item.productId || item.product?.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.subtotal || (item.price * item.quantity))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items Total:</span>
                  <span className="text-gray-900">{formatCurrency(orderDetails?.totalAmount || order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="text-gray-900">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-gray-900">Total Amount:</span>
                    <span className="text-gray-900">{formatCurrency(orderDetails?.totalAmount || order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Permission Info for Regional Admins */}
            {adminInfo?.isRegionalAdmin && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-blue-800">
                    {order.pincode === adminInfo.pincode 
                      ? `You have full access to manage this order from your region (${adminInfo.pincode})`
                      : `This order is from a different region (${order.pincode}). You can view but cannot modify it.`
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;