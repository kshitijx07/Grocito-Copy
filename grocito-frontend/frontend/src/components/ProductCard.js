import React from 'react';
import { 
  ShoppingCartIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  PlusIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const ProductCard = ({ 
  product, 
  cartQuantity, 
  onAddToCart, 
  isAddingToCart 
}) => {
  const getCategoryIcon = (category) => {
    // Using professional Heroicons instead of emojis
    return <TagIcon className="w-3 h-3 sm:w-4 sm:h-4" />;
  };

  const getStockStatus = () => {
    if (product.stock === 0) {
      return {
        icon: <XCircleIcon className="w-3 h-3 sm:w-4 sm:h-4" />,
        text: 'Out of Stock',
        userText: 'Out of Stock',
        debugText: `Out of Stock (${product.stock})`,
        className: 'text-red-700 bg-red-50 border border-red-200'
      };
    } else if (product.stock <= 5) {
      return {
        icon: <ExclamationTriangleIcon className="w-3 h-3 sm:w-4 sm:h-4" />,
        text: 'Limited Stock',
        userText: 'Limited Stock',
        debugText: `Limited Stock (${product.stock} left)`,
        className: 'text-orange-700 bg-orange-50 border border-orange-200'
      };
    } else {
      return {
        icon: <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4" />,
        text: 'In Stock',
        userText: 'In Stock',
        debugText: `In Stock (${product.stock} available)`,
        className: 'text-green-700 bg-green-50 border border-green-200'
      };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <div className="product-card group animate-scale-in">
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-xl mb-3 sm:mb-4">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'}
          alt={product.name}
          className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';
          }}
        />
        
        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-gray-600/70 flex items-center justify-center rounded-xl backdrop-blur-sm">
            <div className="text-center">
              <XCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white mb-2 mx-auto" />
              <span className="text-white font-bold text-xs sm:text-sm">Out of Stock</span>
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-1 shadow-sm border border-gray-200">
            <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center space-x-1">
              {getCategoryIcon(product.category)}
              <span className="hidden sm:inline">{product.category}</span>
            </span>
          </div>
        </div>

        {/* Quality Badge for certain categories */}
        {(['Vegetables', 'Fruits', 'Dairy'].includes(product.category)) && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <div className="bg-green-500 text-white rounded-lg px-2 py-1 shadow-sm">
              <span className="text-xs font-medium flex items-center space-x-1">
                <CheckCircleIcon className="w-3 h-3" />
                <span className="hidden sm:inline">Fresh</span>
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="space-y-3 sm:space-y-4">
        {/* Name and Description */}
        <div>
          <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-lg group-hover:text-green-600 transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
        
        {/* Price and Stock */}
        <div className="flex items-center justify-between gap-2">
          <div className="bg-green-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm">
            <span className="text-lg sm:text-xl font-bold">₹{product.price}</span>
          </div>
          {/* Stock Status - Consistent display like Butter card */}
          <div 
            className={`text-xs sm:text-sm font-medium px-3 py-2 rounded-lg flex items-center justify-center space-x-1 ${stockStatus.className} border relative group cursor-help min-w-20 sm:min-w-24`}
            title={stockStatus.debugText}
          >
            {stockStatus.icon}
            <span className="whitespace-nowrap">{stockStatus.userText}</span>
            
            {/* Debug tooltip - positioned below to avoid hiding */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
              {stockStatus.debugText}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
            </div>
          </div>
        </div>
        
        {/* Add to Cart Section */}
        <div className="pt-2">
          {cartQuantity > 0 ? (
            <div className="flex items-center justify-between gap-2">
              <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 flex items-center space-x-2 flex-1">
                <ShoppingCartIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  <span className="hidden sm:inline">In cart: </span>{cartQuantity}
                </span>
              </div>
              <button
                onClick={() => onAddToCart(product.id)}
                disabled={product.stock === 0 || isAddingToCart}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors duration-200 flex items-center justify-center"
              >
                {isAddingToCart ? (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product.id)}
              disabled={product.stock === 0 || isAddingToCart}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2.5 sm:py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              {isAddingToCart ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
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