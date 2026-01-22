import api from './config';

export const productService = {
  // Get products by pincode
  getProductsByPincode: async (pincode) => {
    try {
      const response = await api.get(`/products/pincode/${pincode}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Failed to fetch products');
    }
  },

  // Check if service is available for pincode (enhanced with location data)
  checkServiceAvailability: async (pincode) => {
    try {
      const response = await api.get(`/products/service-availability/${pincode}`);
      return response.data;
    } catch (error) {
      console.error('Service availability check failed:', error);
      return {
        available: false,
        pincode: pincode,
        message: 'Unable to check service availability. Please try again.'
      };
    }
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    try {
      const response = await api.get(`/products/category/${category}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Failed to fetch products');
    }
  },

  // Search products
  searchProducts: async (keyword, pincode = null) => {
    try {
      const url = pincode 
        ? `/products/search/pincode/${pincode}?keyword=${keyword}`
        : `/products/search?keyword=${keyword}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Search failed');
    }
  },

  // Get all products
  getAllProducts: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Failed to fetch products');
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Product not found');
    }
  }
};