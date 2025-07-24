import React from 'react';

const ProductCard = ({ 
  product, 
  cartQuantity, 
  onAddToCart, 
  isAddingToCart 
}) => {
  return (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] border-2 border-green-200 hover:border-yellow-300">
      <div className="aspect-w-1 aspect-h-1 bg-yellow-50 relative overflow-hidden">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300';
          }}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <div className="bg-yellow-200 rounded-full px-3 py-1 shadow-lg border border-green-200">
            <span className="text-xs font-bold text-green-700">{product.category}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-blue-600 transition-colors duration-300">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-600 text-white px-4 py-2 rounded-xl shadow-lg animate-pulse">
            <span className="text-xl font-bold">₹{product.price}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
            product.stock > 0 
              ? product.stock <= 5 
                ? 'text-orange-700 bg-orange-100 border border-orange-300' 
                : 'text-green-700 bg-green-100 border border-green-300'
              : 'text-red-700 bg-red-100 border border-red-300'
          }`}>
            {product.stock > 0 
              ? product.stock <= 5 
                ? `Only ${product.stock} left!` 
                : `${product.stock} in stock`
              : 'Out of stock'
            }
          </span>
          
          {cartQuantity > 0 ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-blue-600 font-bold bg-yellow-100 px-3 py-1 rounded-full border border-blue-200">
                In cart: {cartQuantity}
              </span>
              <button
                onClick={() => onAddToCart(product.id)}
                disabled={product.stock === 0 || isAddingToCart}
                className="bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:via-yellow-500 hover:to-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
              >
                {isAddingToCart ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  '+'
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product.id)}
              disabled={product.stock === 0 || isAddingToCart}
              className="bg-gradient-to-r from-blue-500 via-yellow-400 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:via-yellow-500 hover:to-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {isAddingToCart ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                'Add to Cart'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;