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
      
      // For demo purposes, if no admin user exists, create demo users based on email
      if (!user || !user.role) {
        console.log('AdminAuthService: Creating demo admin user');
        
        // Create different demo admins based on email
        if (email === 'admin@grocito.com') {
          // Super Admin - can access all pincodes
          user = {
            id: 1,
            fullName: 'Super Admin',
            email: email,
            role: 'SUPER_ADMIN',
            address: 'Head Office, Delhi',
            pincode: null, // No pincode restriction
            contactNumber: '9999999999'
          };
        } else if (email === 'admin.south@grocito.com') {
          // South Delhi Admin - only 110001
          user = {
            id: 2,
            fullName: 'South Delhi Admin',
            email: email,
            role: 'ADMIN',
            address: 'South Delhi Warehouse',
            pincode: '110001',
            contactNumber: '9990001100'
          };
        } else if (email === 'admin.north@grocito.com') {
          // North Delhi Admin - only 110002
          user = {
            id: 3,
            fullName: 'North Delhi Admin',
            email: email,
            role: 'ADMIN',
            address: 'North Delhi Warehouse',
            pincode: '110002',
            contactNumber: '9990002200'
          };
        } else if (email === 'admin.east@grocito.com') {
          // East Delhi Admin - only 110003
          user = {
            id: 4,
            fullName: 'East Delhi Admin',
            email: email,
            role: 'ADMIN',
            address: 'East Delhi Warehouse',
            pincode: '110003',
            contactNumber: '9990003300'
          };
        } else if (email === 'admin.pune@grocito.com') {
          // Pune Admin - only 412105
          user = {
            id: 5,
            fullName: 'Pune Admin',
            email: email,
            role: 'ADMIN',
            address: 'Warehouse Pune, Maharashtra',
            pincode: '412105',
            contactNumber: '9990412105'
          };
        } else if (email === 'admin.nagpur@grocito.com') {
          // Nagpur Admin - only 441904
          user = {
            id: 6,
            fullName: 'Nagpur Admin',
            email: email,
            role: 'ADMIN',
            address: 'Warehouse Nagpur, Maharashtra',
            pincode: '441904',
            contactNumber: '9990441904'
          };
        } else {
          // Default admin for other emails - uses 441904 as example
          user = {
            id: 7,
            fullName: 'Demo Admin',
            email: email,
            role: 'ADMIN',
            address: 'Demo Warehouse',
            pincode: '441904', // Your example pincode
            contactNumber: '9999999999'
          };
        }
        token = 'demo-admin-token-' + user.id + '-1234567890';
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
      
      // For demo purposes, if backend is not available, allow demo admin login
      if (email === 'admin@grocito.com' && password === 'admin123') {
        console.log('AdminAuthService: Using demo admin login');
        const demoUser = {
          id: 1,
          fullName: 'Super Admin',
          email: 'admin@grocito.com',
          role: 'SUPER_ADMIN',
          address: 'Head Office, Delhi',
          pincode: null,
          contactNumber: '9999999999'
        };
        const demoToken = 'demo-admin-token-' + demoUser.id + '-1234567890';
        
        localStorage.setItem('admin_token', demoToken);
        localStorage.setItem('admin_user', JSON.stringify(demoUser));
        
        return { token: demoToken, user: demoUser, message: 'Demo login successful' };
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