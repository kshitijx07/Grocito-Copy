import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`API Success [${response.config.method.toUpperCase()}] ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // Log failed responses for debugging
    console.error(`API Error [${error.config?.method?.toUpperCase()}] ${error.config?.url}:`, 
                 error.response?.status || 'No response', 
                 error.response?.data || error.message);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('Authentication error detected, clearing session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Don't redirect if we're already on the login page
      if (!window.location.pathname.includes('/login')) {
        console.log('Redirecting to login page due to auth error');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };