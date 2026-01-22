import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
import Header from './Header';
import LoadingSpinner from './LoadingSpinner';

const PaymentHistoryPage = () => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, PAID, PENDING
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPaymentHistory();
  }, [user?.id]); // Only depend on user.id to prevent continuous refresh

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/orders/user/${user.id}/payment-history`);
      
      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data);
      } else {
        throw new Error('Failed to fetch payment history');
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setError('Failed to load payment history');
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredHistory = () => {
    if (filter === 'ALL') return paymentHistory;
    if (filter === 'PAID') return paymentHistory.filter(record => record.paymentStatus === 'PAID');
    if (filter === 'PENDING') return paymentHistory.filter(record => record.paymentStatus === 'PENDING');
    return paymentHistory;
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method, actualMethod) => {
    if (method === 'ONLINE') return '💳';
    if (actualMethod === 'CASH') return '💵';
    if (actualMethod === 'UPI') return '📱';
    if (actualMethod === 'CARD') return '💳';
    return '💰';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredHistory = getFilteredHistory();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
              <p className="text-gray-600 mt-1">Track all your payment transactions</p>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <div className="flex space-x-2">
              {['ALL', 'PAID', 'PENDING'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === filterOption
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>
            <div className="ml-auto text-sm text-gray-500">
              {filteredHistory.length} transactions
            </div>
          </div>
        </div>

        {/* Payment History */}
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💳</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
            <p className="text-gray-600 mb-4">You haven't made any payments yet.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((record) => (
              <div key={record.orderId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">
                        {getPaymentMethodIcon(record.paymentMethod, record.actualPaymentMethod)}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{record.orderId}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {record.paymentDescription}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Order Date:</span>
                        <div className="font-medium">{formatDate(record.orderTime)}</div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Payment Method:</span>
                        <div className="font-medium">
                          {record.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                          {record.actualPaymentMethod && record.actualPaymentMethod !== record.paymentMethod && (
                            <span className="text-gray-600"> ({record.actualPaymentMethod})</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-500">Payment Date:</span>
                        <div className="font-medium">
                          {record.paymentCompletedAt ? formatDate(record.paymentCompletedAt) : 'Pending'}
                        </div>
                      </div>
                    </div>

                    {record.paymentId && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">Transaction ID:</span>
                        <span className="font-mono text-gray-800 ml-2">{record.paymentId}</span>
                      </div>
                    )}

                    {record.paymentNotes && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">Notes:</span>
                        <span className="text-gray-800 ml-2">{record.paymentNotes}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      ₹{record.totalAmount.toFixed(2)}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(record.paymentStatus)}`}>
                      {record.paymentStatus}
                    </span>
                    <div className="mt-2 text-xs text-gray-500">
                      Order: {record.orderStatus}
                    </div>
                  </div>
                </div>

                {/* COD Payment Pending Notice */}
                {record.paymentMethod === 'COD' && record.paymentStatus === 'PENDING' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-yellow-600 mr-2">⏳</span>
                      <span className="text-sm text-yellow-800">
                        Payment will be collected by the delivery partner when your order is delivered.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {paymentHistory.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {paymentHistory.length}
                </div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {paymentHistory.filter(r => r.paymentStatus === 'PAID').length}
                </div>
                <div className="text-sm text-gray-600">Paid Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {paymentHistory.filter(r => r.paymentStatus === 'PENDING').length}
                </div>
                <div className="text-sm text-gray-600">Pending Payments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ₹{paymentHistory.filter(r => r.paymentStatus === 'PAID').reduce((sum, r) => sum + r.totalAmount, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Paid</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PaymentHistoryPage;