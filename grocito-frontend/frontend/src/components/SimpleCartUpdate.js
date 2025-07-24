import React, { useState } from 'react';
import { simpleCartService } from '../api/simpleCartService';
import { toast } from 'react-toastify';

const SimpleCartUpdate = ({ item, userId, onCartUpdated }) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [updating, setUpdating] = useState(false);
  
  const handleQuantityChange = async (newQty) => {
    if (newQty < 1 || newQty > 99 || newQty === quantity) return;
    
    setUpdating(true);
    try {
      await simpleCartService.updateCart(userId, item.product.id, newQty);
      setQuantity(newQty);
      toast.success('Updated!', { autoClose: 1000 });
      if (onCartUpdated) onCartUpdated();
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };
  
  const handleRemove = async () => {
    setUpdating(true);
    try {
      await simpleCartService.removeItem(userId, item.product.id);
      toast.success('Item removed!', { autoClose: 1000 });
      if (onCartUpdated) onCartUpdated();
    } catch (error) {
      toast.error('Remove failed');
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <div className="flex items-center space-x-2 border p-2 rounded-lg bg-white">
      <div className="flex-shrink-0">
        <img 
          src={item.product.imageUrl || 'https://via.placeholder.com/50'} 
          alt={item.product.name}
          className="w-12 h-12 object-cover rounded"
          onError={(e) => {e.target.src = 'https://via.placeholder.com/50'}}
        />
      </div>
      
      <div className="flex-grow">
        <p className="font-medium text-sm">{item.product.name}</p>
        <p className="text-gray-500 text-xs">₹{item.product.price}</p>
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={updating || quantity <= 1}
          className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full disabled:opacity-50"
        >
          -
        </button>
        
        <span className="w-6 text-center">{quantity}</span>
        
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={updating}
          className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-600 rounded-full disabled:opacity-50"
        >
          +
        </button>
      </div>
      
      <button
        onClick={handleRemove}
        disabled={updating}
        className="text-red-500 hover:text-red-700 disabled:opacity-50"
      >
        {updating ? '...' : '×'}
      </button>
    </div>
  );
};

export default SimpleCartUpdate;