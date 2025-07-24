import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../api/productService';
import { cartService } from '../api/cartService';
import { authService } from '../api/authService';
import { toast } from 'react-toastify';
import Header from './Header';
import LoadingSpinner from './LoadingSpinner';
import SearchAndFilter from './SearchAndFilter';
import ProductCard from './ProductCard';
import QuickStartGuide from './QuickStartGuide';
import FloatingCartButton from './FloatingCartButton';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const navigate = useNavigate();
  const pincode = localStorage.getItem('pincode');

  const fetchProducts = async (userPincode) => {
    try {
      setLoading(true);
      // Use the provided userPincode parameter instead of the global pincode
      const pincodeToUse = userPincode || pincode;
      console.log(`Fetching products for pincode: ${pincodeToUse}`);
      
      const productsData = await productService.getProductsByPincode(pincodeToUse);
      console.log(`Found ${productsData.length} products for pincode ${pincodeToUse}`);
      
      setProducts(productsData);
      setFilteredProducts(productsData);

      // Extract unique categories
      const uniqueCategories = [...new Set(productsData.map(product => product.category))];
      setCategories(['All', ...uniqueCategories]);
    } catch (error) {
      setError(`Failed to load products for pincode ${userPincode || pincode}`);
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartData = async (userId) => {
    try {
      const cartData = await cartService.getCartItems(userId);
      setCartItems(cartData);
      setCartCount(cartData.reduce((total, item) => total + item.quantity, 0));
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
    console.log('ProductsPage useEffect triggered');
    
    // CRITICAL FIX: Ensure we have a valid user and pincode
    try {
      // Get current user from auth service
      const currentUser = authService.getCurrentUser();
      console.log('Current user:', currentUser);
      
      // Check if user is logged in
      if (!currentUser || !currentUser.id) {
        console.log('No valid user found, redirecting to login');
        toast.warning('Please login to continue', {
          position: "bottom-right",
          autoClose: 3000,
        });
        navigate('/login');
        return;
      }
      
      // Set user state
      setUser(currentUser);
      
      // Get pincode - prioritize user's profile pincode, then localStorage pincode
      const storedPincode = localStorage.getItem('pincode');
      console.log('Stored pincode:', storedPincode);
      
      // Determine which pincode to use
      let pincodeToUse = currentUser.pincode || storedPincode;
      console.log('Pincode to use:', pincodeToUse);
      
      // If no pincode is available, use a default one
      if (!pincodeToUse) {
        pincodeToUse = '110001'; // Default pincode
        console.log('No pincode found, using default:', pincodeToUse);
        localStorage.setItem('pincode', pincodeToUse);
        toast.info(`Using default delivery location: ${pincodeToUse}`, {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
      
      // Update pincode in localStorage if it's different from user's pincode
      if (currentUser.pincode && currentUser.pincode !== storedPincode) {
        localStorage.setItem('pincode', currentUser.pincode);
        console.log('Updated pincode from user profile:', currentUser.pincode);
        toast.info(`Delivery location updated to your address pincode: ${currentUser.pincode}`, {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
      
      // Fetch products and cart data
      console.log('Fetching products and cart data for pincode:', pincodeToUse);
      fetchProducts(pincodeToUse);
      fetchCartData(currentUser.id);
      
      // Show guide for first-time users
      const hasSeenGuide = localStorage.getItem('hasSeenGuide');
      if (!hasSeenGuide) {
        setTimeout(() => setShowGuide(true), 1000); // Delay guide to let page load
      }
    } catch (error) {
      console.error('Error in ProductsPage initialization:', error);
      toast.error('Something went wrong. Please try again.');
      navigate('/login');
    }
  }, [navigate, pincode]);

  // Filter products based on category and search
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  const addToCart = async (productId) => {
    try {
      // Ensure we have a valid user
      if (!user || !user.id) {
        console.error('Cannot add to cart: No valid user found');
        toast.error('Please login to add items to cart');
        navigate('/login');
        return;
      }
      
      console.log(`Adding product ${productId} to cart for user ${user.id}`);
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      
      // Add to cart
      const result = await cartService.addToCart(user.id, productId, 1);
      console.log('Add to cart result:', result);
      
      // Refresh cart data
      await fetchCartData(user.id);
      
      // Show success message
      toast.success('Added to cart!', {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('authentication') || error.message?.includes('token')) {
        toast.error('Your session has expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to add to cart');
      }
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const getCartItemQuantity = (productId) => {
    const cartItem = cartItems.find(item => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleCloseGuide = () => {
    setShowGuide(false);
    localStorage.setItem('hasSeenGuide', 'true');
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  if (loading) {
    return <LoadingSpinner message="Loading products..." />;
  }

  // Get the current pincode being used
  const currentPincode = user?.pincode || pincode;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-green-50">
      <Header user={user} cartCount={cartCount} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-green-700">
              Fresh Groceries Delivered Fast
            </h1>
          </div>
          <div className="text-gray-700 text-lg">
            <p>
              Welcome back, <span className="font-semibold text-green-700">{user?.fullName || user?.email?.split('@')[0] || 'User'}</span>!
            </p>
            <p className="mt-2">
              Choose from <span className="font-semibold text-green-600 bg-yellow-200 px-3 py-1 rounded-full">{products.length}</span> products available in <span className="font-semibold text-green-700">{currentPincode}</span>
            </p>
          </div>
        </div>

        <SearchAndFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          resultsCount={filteredProducts.length}
          totalCount={products.length}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-lg">🔍</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {products.length === 0 ? 'No products available' : 'No products found'}
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
              {products.length === 0
                ? "We're working to stock products in your area. Please check back soon!"
                : searchQuery || selectedCategory !== 'All'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No products match your criteria'
              }
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cartQuantity={getCartItemQuantity(product.id)}
                onAddToCart={addToCart}
                isAddingToCart={addingToCart[product.id]}
              />
            ))}
          </div>
        )}

        {/* Success Message */}
        {products.length > 0 && (
          <div className="mt-12 bg-white border-2 border-green-200 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-700 mb-3">
              🎉 Welcome to Grocito!
            </h3>
            <p className="text-gray-700 mb-6 text-lg">
              You're all set! Browse products, add them to cart, and place your order for quick delivery to <span className="font-semibold bg-yellow-200 px-2 py-1 rounded-full text-green-700">{pincode}</span>.
            </p>
            <button
              onClick={() => setShowGuide(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-green-700 px-8 py-4 rounded-xl font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Need help? View quick tour →
            </button>
          </div>
        )}
      </main>

      {showGuide && <QuickStartGuide onClose={handleCloseGuide} />}
      <FloatingCartButton cartCount={cartCount} />
    </div>
  );
};

export default ProductsPage;