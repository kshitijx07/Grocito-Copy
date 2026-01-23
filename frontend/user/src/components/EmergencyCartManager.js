import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
import axios from 'axios';

// API base URL from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const EmergencyCartManager = () => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    checkAPIStatus();
    loadCartDirect(currentUser.id);
  }, [navigate]);

  const checkAPIStatus = async () => {
    const endpoints = [
      { name: 'Backend Health', url: `${API_BASE_URL}/api/products` },
      { name: 'Cart API', url: `${API_BASE_URL}/api/cart/1` },
      { name: 'User API', url: `${API_BASE_URL}/api/users` }
    ];

    const status = {};
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint.url, { timeout: 5000 });
        status[endpoint.name] = { status: 'OK', code: response.status };
      } catch (error) {
        status[endpoint.name] = { 
          status: 'ERROR', 
          error: error.message,
          code: error.response?.status || 'NO_RESPONSE'
        };
      }
    }
    setApiStatus(status);
  };

  const loadCartDirect = async (userId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/cart/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 10000
      });
      setCartItems(response.data || []);
      toast.success('Cart loaded successfully!');
    } catch (error) {
      toast.error('Failed to load cart: ' + error.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateItemDirect = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/cart/update`, {
        userId: user.id,
        productId,
        quantity
      }, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        timeout: 10000
      });
      
      toast.success('Item updated successfully!');
      loadCartDirect(user.id);
    } catch (error) {
      toast.error('Update failed: ' + error.message);
    }
  };

  const removeItemDirect = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/cart/remove`, {
        data: { userId: user.id, productId },
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        timeout: 10000
      });
      
      toast.success('Item removed successfully!');
      loadCartDirect(user.id);
    } catch (error) {
      toast.error('Remove failed: ' + error.message);
    }
  };

  const addTestItem = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/cart/add`, {
        userId: user.id,
        productId: 1,
        quantity: 1
      }, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        timeout: 10000
      });
      
      toast.success('Test item added!');
      loadCartDirect(user.id);
    } catch (error) {
      toast.error('Failed to add test item: ' + error.message);
    }
  };

  const clearCartDirect = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/cart/${user.id}/clear`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 10000
      });
      
      toast.success('Cart cleared!');
      loadCartDirect(user.id);
    } catch (error) {
      toast.error('Failed to clear cart: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-red-600">🚨 Emergency Cart Manager</h1>
            <button
              onClick={() => navigate('/cart')}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Back to Cart
            </button>
          </div>

          {/* API Status */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">API Status Check</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(apiStatus).map(([name, status]) => (
                <div key={name} className={`p-3 rounded border ${
                  status.status === 'OK' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="font-medium">{name}</div>
                  <div className={`text-sm ${status.status === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                    {status.status} {status.code && `(${status.code})`}
                  </div>
                  {status.error && <div className="text-xs text-red-500">{status.error}</div>}
                </div>
              ))}
            </div>
            <button
              onClick={checkAPIStatus}
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded text-sm"
            >
              Refresh Status
            </button>
          </div>

          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Current User</h3>
            <p>ID: {user?.id}</p>
            <p>Email: {user?.email}</p>
            <p>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
          </div>

          {/* Cart Actions */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Cart Actions</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => loadCartDirect(user.id)}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Reload Cart'}
              </button>
              <button
                onClick={addTestItem}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Add Test Item
              </button>
              <button
                onClick={clearCartDirect}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Cart Items ({cartItems.length})</h2>
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No items in cart
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.product?.id || Math.random()} className="border rounded p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{item.product?.name || 'Unknown Product'}</h4>
                        <p className="text-sm text-gray-600">
                          Price: ₹{item.product?.price || 0} | Quantity: {item.quantity || 0}
                        </p>
                        <p className="text-xs text-gray-500">Product ID: {item.product?.id}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateItemDirect(item.product.id, (item.quantity || 1) - 1)}
                          className="bg-red-100 text-red-600 w-8 h-8 rounded-full"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateItemDirect(item.product.id, (item.quantity || 1) + 1)}
                          className="bg-green-100 text-green-600 w-8 h-8 rounded-full"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItemDirect(item.product.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Debug Info */}
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({ 
                cartItems: cartItems.length,
                user: user?.id,
                token: !!localStorage.getItem('token'),
                apiStatus
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyCartManager;