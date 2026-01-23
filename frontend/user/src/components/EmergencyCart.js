import React, { useState, useEffect } from 'react';

// API base URL from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Emergency Cart Component - Completely standalone with direct fetch calls
const EmergencyCart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState('');

  // Get user info on load
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      const tokenStr = localStorage.getItem('token');
      
      if (userStr && tokenStr) {
        const user = JSON.parse(userStr);
        setUserId(user.id);
        setToken(tokenStr);
        fetchCart(user.id, tokenStr);
      } else {
        setError('User not logged in');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to get user info');
      setLoading(false);
    }
  }, []);

  // Direct fetch cart items
  const fetchCart = async (uid, authToken) => {
    setLoading(true);
    setMessage('Fetching cart...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/${uid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setItems(data);
      setMessage(`Cart loaded with ${data.length} items`);
    } catch (err) {
      setError(`Failed to fetch cart: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Direct update cart item
  const updateItem = async (productId, quantity) => {
    if (!userId || !token) {
      setError('User not logged in');
      return;
    }
    
    setMessage(`Updating product ${productId} to quantity ${quantity}...`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          productId: productId,
          quantity: quantity
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      setMessage(`Updated product ${productId} to quantity ${quantity}`);
      fetchCart(userId, token);
    } catch (err) {
      setError(`Failed to update cart: ${err.message}`);
    }
  };

  // Direct remove item
  const removeItem = async (productId) => {
    if (!userId || !token) {
      setError('User not logged in');
      return;
    }
    
    setMessage(`Removing product ${productId}...`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/remove`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          productId: productId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      setMessage(`Removed product ${productId}`);
      fetchCart(userId, token);
    } catch (err) {
      setError(`Failed to remove item: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-4 border rounded bg-gray-100">
        <p>Loading cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded bg-red-100">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => fetchCart(userId, token)}
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded bg-white">
      <h3 className="font-bold text-lg mb-2">Emergency Cart Manager</h3>
      
      {message && (
        <div className="mb-3 p-2 bg-blue-100 text-blue-800 rounded text-sm">
          {message}
        </div>
      )}
      
      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          <p className="mb-2 text-sm">Total items: {items.length}</p>
          
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.product.id} className="border p-3 rounded">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{item.product.name}</span>
                  <span>₹{item.product.price}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => updateItem(item.product.id, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 bg-red-100 text-red-700 rounded-full"
                    >
                      -
                    </button>
                    
                    <span className="w-8 text-center">{item.quantity}</span>
                    
                    <button 
                      onClick={() => updateItem(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 bg-green-100 text-green-700 rounded-full"
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeItem(item.product.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="mt-2 grid grid-cols-5 gap-1">
                  {[1, 2, 3, 5, 10].map(qty => (
                    <button 
                      key={qty}
                      onClick={() => updateItem(item.product.id, qty)}
                      className="bg-gray-100 hover:bg-gray-200 text-xs py-1 rounded"
                    >
                      Set: {qty}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-between">
            <button 
              onClick={() => fetchCart(userId, token)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Refresh Cart
            </button>
            
            <button 
              onClick={() => {
                if (window.confirm('Clear entire cart?')) {
                  fetch(`${API_BASE_URL}/api/cart/${userId}/clear`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  })
                  .then(response => {
                    if (!response.ok) throw new Error('Failed to clear cart');
                    return response.json();
                  })
                  .then(() => {
                    setMessage('Cart cleared');
                    fetchCart(userId, token);
                  })
                  .catch(err => setError(`Failed to clear cart: ${err.message}`));
                }
              }}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyCart;