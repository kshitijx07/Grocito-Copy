import api from './config';

export const authService = {
  // Admin login with role validation
  login: async (email, password) => {
    try {
      console.log('AdminAuthService: Making login request to /users/login');
      const response = await api.post('/users/login', { email, password });
      console.log('AdminAuthService: Login response received:', response);
      
      const data = response.data;
      console.log('AdminAuthService: Response data:', data);
      
      // Handle different response structures from backend
      let user = null;
      let token = null;
      
      // Check if response has user object
      if (data.user) {
        user = data.user;
        token = data.token;
      } else if (data.id) {
        // If user data is directly in response
        user = data;
        token = data.token || 'demo-admin-token-1-1234567890';
      } else {
        console.warn('AdminAuthService: Unexpected response structure');
        throw new Error('Invalid response from server');
      }
      
      console.log('AdminAuthService: Extracted user:', user);
      console.log('AdminAuthService: Extracted token:', token ? 'Present' : 'Missing');
      
      // Validate that user has admin role (ADMIN or SUPER_ADMIN)
      if (user && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        console.log('AdminAuthService: User role is not ADMIN or SUPER_ADMIN:', user.role);
        throw new Error('Access denied. Admin privileges required.');
      }
      
      // If no token provided, create a simple token for session management
      if (!token) {
        token = 'admin-session-' + user.id + '-' + Date.now();
        console.log('AdminAuthService: Generated session token for user:', user.id);
      }
      
      if (token && user) {
        console.log('AdminAuthService: Storing admin credentials');
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));
        console.log('AdminAuthService: Admin user data stored:', user);
      } else {
        throw new Error('Missing token or user data');
      }
      
      return { token, user, message: 'Login successful' };
    } catch (error) {
      console.error('AdminAuthService: Login error:', error);
      console.error('AdminAuthService: Error response:', error.response);
      
      // For demo purposes, if backend is not available, provide helpful error message
      if (error.request) {
        throw new Error('Backend server is not running. Please start the server and try again.');
      }
      
      let errorMessage = 'Login failed';
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data || errorMessage;
      } else if (error.request) {
        errorMessage = 'Network error - Backend server may not be running';
      } else {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Logout admin user
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  // Get current admin user
  getCurrentUser: () => {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  },

  // Check if admin is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('admin_token');
    const user = authService.getCurrentUser();
    return !!(token && user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role));
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('admin_token');
  },

  // Validate admin role
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);
  },

  // Check if user is super admin
  isSuperAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'SUPER_ADMIN';
  },

  // Update current user data
  updateCurrentUser: (userData) => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('admin_user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  },

  // Forgot password for admin
  forgotPassword: async (email) => {
    try {
      console.log('AdminAuthService: Making forgot password request to /users/forgot-password');
      const response = await api.post('/users/forgot-password', { email });
      console.log('AdminAuthService: Forgot password response received:', response);
      
      return response.data;
    } catch (error) {
      console.error('AdminAuthService: Forgot password error:', error);
      
      let errorMessage = 'Failed to send reset email';
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data || errorMessage;
      } else if (error.request) {
        errorMessage = 'Network error - Backend server may not be running';
      } else {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }
};