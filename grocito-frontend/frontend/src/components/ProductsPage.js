import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../api/productService';
import { enhancedCartService } from '../api/enhancedCartService';
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
      const cartData = await enhancedCartService.getCartItems(userId);
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

      // Get pincode - PRIORITIZE localStorage pincode (from landing page) over user's profile pincode
      const storedPincode = localStorage.getItem('pincode');
      console.log('Stored pincode from landing page:', storedPincode);
      console.log('User profile pincode:', currentUser.pincode);

      // Determine which pincode to use - LANDING PAGE PINCODE TAKES PRIORITY
      let pincodeToUse = storedPincode || currentUser.pincode;
      console.log('Pincode to use (landing page priority):', pincodeToUse);

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

      // Show info about which pincode is being used
      if (storedPincode && currentUser.pincode && storedPincode !== currentUser.pincode) {
        console.log(`Using delivery pincode ${storedPincode} instead of profile pincode ${currentUser.pincode}`);
        toast.info(`Showing products for delivery to: ${storedPincode} (as selected on homepage)`, {
          position: "bottom-right",
          autoClose: 4000,
        });
      } else if (storedPincode) {
        console.log(`Using delivery pincode from landing page: ${storedPincode}`);
        toast.success(`Delivering to: ${storedPincode}`, {
          position: "bottom-right",
          autoClose: 2000,
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

      // Find the product data
      const productData = products.find(p => p.id === productId);
      if (!productData) {
        throw new Error('Product not found');
      }

      // Add to cart with complete product data
      const result = await enhancedCartService.addToCart(user.id, productId, 1, productData);
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-soft animate-pulse">
            <span className="text-4xl">🛒</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Loading Fresh Groceries...
          </h2>
          <p className="text-gray-600">Please wait while we prepare the best products for you</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Get the current pincode being used - prioritize localStorage (landing page) over user profile
  const storedPincode = localStorage.getItem('pincode');
  const currentPincode = storedPincode || user?.pincode || pincode;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} cartCount={cartCount} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="section-header mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-soft">
                <span className="text-3xl">🛍️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Fresh Groceries Delivered Fast
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, <span className="font-semibold text-green-700">{user?.fullName || user?.email?.split('@')[0] || 'User'}</span>! 👋
                </p>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4 border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{products.length}</div>
                  <div className="text-sm text-green-700 font-medium">Products Available</div>
                  <div className="text-xs text-gray-600 mt-1">in {currentPincode}</div>
                </div>
              </div>
            </div>
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
          <div className="card">
            <div className="card-body text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">
                  {products.length === 0 ? '📦' : '🔍'}
                </span>
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
                  className="btn-primary"
                >
                  Clear filters
                </button>
              )}
            </div>
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
          <div className="card mt-12">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
                Welcome to Grocito!
              </h3>
              <p className="text-gray-700 mb-6 text-lg">
                You're all set! Browse products, add them to cart, and place your order for quick delivery to{' '}
                <span className="font-semibold bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 rounded-xl text-green-700 border border-green-200">
                  {currentPincode}
                </span>
              </p>
              <button
                onClick={() => setShowGuide(true)}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white px-8 py-4 rounded-xl font-bold transform hover:scale-105 transition-all duration-300 shadow-soft hover:shadow-soft-lg"
              >
                Need help? View quick tour →
              </button>
            </div>
          </div>
        )}
      </main>

      {showGuide && <QuickStartGuide onClose={handleCloseGuide} />}
      <FloatingCartButton cartCount={cartCount} />
    </div>
  );
};

export default ProductsPage;