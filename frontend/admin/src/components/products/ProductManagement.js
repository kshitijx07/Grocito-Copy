import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { productService } from '../../api/productService';
import { authService } from '../../api/authService';
import ProductTable from './ProductTable';
import ProductModal from './ProductModal';
import ProductFilters from './ProductFilters';
import ProductStats from './ProductStats';
import LoadingSpinner from '../common/LoadingSpinner';
import AdminHeader from '../common/AdminHeader';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stats, setStats] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminInfo, setAdminInfo] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    stockStatus: 'all', // all, inStock, lowStock, outOfStock
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Get current user info on component mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setAdminInfo({
        role: user.role,
        pincode: user.pincode,
        name: user.fullName,
        isSuperAdmin: user.role === 'SUPER_ADMIN',
        isRegionalAdmin: user.role === 'ADMIN'
      });
    }
  }, []);

  // Load products and stats when adminInfo is available
  useEffect(() => {
    if (adminInfo.role) {
      loadProducts();
      loadStats();
    }
  }, [adminInfo]);

  // Apply filters when products or filters change
  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let data;
      
      // Role-based product loading
      if (adminInfo.isSuperAdmin) {
        // Super Admin can see all products from all pincodes
        data = await productService.getAllProducts();
      } else if (adminInfo.isRegionalAdmin && adminInfo.pincode) {
        // Regional Admin can only see products from their assigned pincode
        data = await productService.getProductsByPincode(adminInfo.pincode);
      } else {
        // Fallback - load all products but will be filtered later
        data = await productService.getAllProducts();
      }
      
      let productList = Array.isArray(data) ? data : data.content || [];
      
      // Additional client-side filtering for regional admins as a safety measure
      if (adminInfo.isRegionalAdmin && adminInfo.pincode) {
        productList = productList.filter(product => product.pincode === adminInfo.pincode);
      }
      
      setProducts(productList);
    } catch (error) {
      console.error('Error loading products:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Insufficient permissions.');
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to load products. Please check your connection.');
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Pass pincode for regional admins, null for super admins
      const pincode = adminInfo.isRegionalAdmin ? adminInfo.pincode : null;
      const analytics = await productService.getProductAnalytics(pincode);
      setStats(analytics);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Stock status filter
    switch (filters.stockStatus) {
      case 'inStock':
        filtered = filtered.filter(product => product.stock > 10);
        break;
      case 'lowStock':
        filtered = filtered.filter(product => product.stock > 0 && product.stock <= 10);
        break;
      case 'outOfStock':
        filtered = filtered.filter(product => product.stock === 0);
        break;
      default:
        break;
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productService.deleteProduct(productId);
      toast.success('Product deleted successfully');
      loadProducts();
      loadStats();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, productData);
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(productData);
        toast.success('Product created successfully');
      }
      setShowModal(false);
      loadProducts();
      loadStats();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      await productService.updateProductStock(productId, newStock);
      toast.success('Stock updated successfully');
      loadProducts();
      loadStats();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        title="Product Management" 
        subtitle={adminInfo.isSuperAdmin 
          ? "Manage inventory across all regions" 
          : adminInfo.isRegionalAdmin 
            ? `Managing inventory for pincode: ${adminInfo.pincode}` 
            : "Manage your grocery inventory"
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Product Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleAddProduct}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Product</span>
          </button>
        </div>
        {/* Stats */}
        {stats && <ProductStats stats={stats} />}

        {/* Filters */}
        <ProductFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={stats?.categoryDistribution ? Object.keys(stats.categoryDistribution) : []}
        />

        {/* Products Table */}
        <ProductTable
          products={filteredProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onStockUpdate={handleStockUpdate}
          adminInfo={adminInfo}
        />

        {/* Product Modal */}
        {showModal && (
          <ProductModal
            product={selectedProduct}
            onSave={handleSaveProduct}
            onClose={() => setShowModal(false)}
            adminInfo={adminInfo}
          />
        )}
      </div>
    </div>
  );
};

export default ProductManagement;