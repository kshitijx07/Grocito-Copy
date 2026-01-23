import axios from 'axios';

// Support both REACT_APP_API_URL and REACT_APP_API_BASE_URL for compatibility
const API_BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

// Export for use in other files
export { API_BASE_URL };

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('deliveryPartnerToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('deliveryPartnerToken');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Helper function for making API requests
export const apiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: endpoint,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.data = data;
    }

    const response = await api(config);
    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export default api;