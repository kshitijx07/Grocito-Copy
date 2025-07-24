import api from './config';

export const productService = {
  // Get all products with pagination and filters
  getAllProducts: async (params = {}) => {
    const { page = 0, size = 10, sortBy = 'name', category, pincode, search } = params;
    let url = `/products?page=${page}&size=${size}&sortBy=${sortBy}`;
    
    if (category) url += `&category=${category}`;
    if (pincode) url += `&pincode=${pincode}`;
    if (search) url += `&search=${search}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get products by pincode (for regional admins)
  getProductsByPincode: async (pincode, params = {}) => {
    const { page = 0, size = 10, sortBy = 'name' } = params;
    const response = await api.get(`/products/pincode/${pincode}?page=${page}&size=${size}&sortBy=${sortBy}`);
    return response.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Update product stock
  updateProductStock: async (id, stock) => {
    const response = await api.patch(`/products/${id}/stock?stock=${stock}`);
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (category, params = {}) => {
    const { page = 0, size = 10, sortBy = 'name' } = params;
    const response = await api.get(`/products/paginated/category/${category}?page=${page}&size=${size}&sortBy=${sortBy}`);
    return response.data;
  },

  // Search products
  searchProducts: async (keyword, pincode = null) => {
    const url = pincode 
      ? `/products/search/pincode/${pincode}?keyword=${keyword}`
      : `/products/search?keyword=${keyword}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get product categories (derived from existing products)
  getCategories: async () => {
    const response = await api.get('/products');
    const products = response.data;
    const categories = [...new Set(products.map(product => product.category))].filter(Boolean);
    return categories;
  },

  // Bulk operations
  bulkUpdateStock: async (updates) => {
    const promises = updates.map(({ id, stock }) => 
      api.patch(`/products/${id}/stock?stock=${stock}`)
    );
    const responses = await Promise.all(promises);
    return responses.map(response => response.data);
  },

  // Get low stock products
  getLowStockProducts: async (threshold = 10) => {
    const response = await api.get('/products');
    const products = response.data;
    return products.filter(product => product.stock <= threshold);
  },

  // Get product analytics (role-based)
  getProductAnalytics: async (pincode = null) => {
    let response;
    if (pincode) {
      // For regional admins - get analytics for specific pincode
      response = await api.get(`/products/pincode/${pincode}`);
    } else {
      // For super admins - get analytics for all products
      response = await api.get('/products');
    }
    
    const products = Array.isArray(response.data) ? response.data : response.data.content || [];
    
    const analytics = {
      totalProducts: products.length,
      totalCategories: [...new Set(products.map(p => p.category))].length,
      lowStockCount: products.filter(p => p.stock <= 10 && p.stock > 0).length,
      outOfStockCount: products.filter(p => p.stock === 0).length,
      averagePrice: products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0,
      categoryDistribution: products.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {}),
      stockDistribution: {
        inStock: products.filter(p => p.stock > 10).length,
        lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
        outOfStock: products.filter(p => p.stock === 0).length
      },
      pincode: pincode || 'All Regions'
    };
    
    return analytics;
  },

  // Get role-based product access info
  getRoleBasedAccess: async () => {
    try {
      // This could be enhanced to get role info from backend
      const response = await api.get('/users/current');
      return response.data;
    } catch (error) {
      // Fallback to local storage
      const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
      return {
        role: user.role,
        pincode: user.pincode,
        isSuperAdmin: user.role === 'SUPER_ADMIN',
        isRegionalAdmin: user.role === 'ADMIN'
      };
    }
  }
};