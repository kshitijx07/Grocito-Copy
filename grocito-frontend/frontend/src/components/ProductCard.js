import React from 'react';
import { 
  ShoppingCartIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  FaceSmileIcon,
  TagIcon 
} from '@heroicons/react/24/outline';

const ProductCard = ({ 
  product, 
  cartQuantity, 
  onAddToCart, 
  isAddingToCart 
}) => {
  const getCategoryIcon = (category) => {
    // Return TagIcon for all categories for consistency
    return <TagIcon className="w-4 h-4" />;
  };

  return (
    <div className="product-card group">
      <div className="relative overflow-hidden rounded-xl mb-4">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300';
          }}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-gray-600 bg-opacity-90 flex items-center justify-center rounded-xl">
            <div className="text-center">
              <XCircleIcon className="w-8 h-8 text-white mb-2 mx-auto" />
              <span className="text-white font-bold text-sm">Out of Stock</span>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl px-3 py-1 shadow-soft border border-gray-200">
            <span className="text-sm font-bold text-gray-700 flex items-center space-x-1">
              {getCategoryIcon(product.category)}
              <span>{product.category}</span>
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-green-600 transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl shadow-soft">
            <span className="text-xl font-bold">₹{product.price}</span>
          </div>
          <span className={`text-sm font-semibold px-3 py-2 rounded-xl flex items-center space-x-1 ${
            product.stock > 0 
              ? product.stock <= 5 
                ? 'text-orange-700 bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200' 
                : 'text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200'
              : 'text-red-700 bg-gradient-to-r from-red-100 to-pink-100 border border-red-200'
          }`}>
            {product.stock > 0 
              ? product.stock <= 5 
                ? (
                  <>
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span>Only {product.stock} left!</span>
                  </>
                )
                : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>{product.stock} in stock</span>
                  </>
                )
              : (
                <>
                  <XCircleIcon className="w-4 h-4" />
                  <span>Out of stock</span>
                </>
              )
            }
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          {cartQuantity > 0 ? (
            <div className="flex items-center space-x-3 flex-1">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-xl border border-blue-200 flex items-center space-x-2">
                <ShoppingCartIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">In cart: {cartQuantity}</span>
              </div>
              <button
                onClick={() => onAddToCart(product.id)}
                disabled={product.stock === 0 || isAddingToCart}
                className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-bold transition-all duration-200 transform hover:scale-110 shadow-soft hover:shadow-soft-lg flex items-center justify-center"
              >
                {isAddingToCart ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-xl">+</span>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product.id)}
              disabled={product.stock === 0 || isAddingToCart}
              className="w-full btn-primary disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAddingToCart ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="w-5 h-5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;