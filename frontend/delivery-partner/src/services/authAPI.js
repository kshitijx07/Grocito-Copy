import api from './api';

const authAPI = {
  // Register new delivery partner
  register: async (registrationData) => {
    const response = await api.post('/delivery-partner-auth/register', registrationData);
    return response;
  },

  // Login delivery partner
  login: async (emailOrPhone, password) => {
    const response = await api.post('/delivery-partner-auth/login', {
      emailOrPhone,
      password,
    });
    return response;
  },

  // Request password reset
  forgotPassword: async (email) => {
    const response = await api.post('/delivery-partner-auth/forgot-password', {
      email,
    });
    return response;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/delivery-partner-auth/reset-password', {
      token,
      newPassword,
    });
    return response;
  },

  // Get auth record by ID
  getAuthRecord: async (id) => {
    const response = await api.get(`/delivery-partner-auth/${id}`);
    return response;
  },

  // Update auth record
  updateAuthRecord: async (id, updateData) => {
    const response = await api.put(`/delivery-partner-auth/${id}`, updateData);
    return response;
  },

  // Get current partner profile
  getProfile: async () => {
    const response = await api.get('/delivery-partner-auth/profile');
    return response;
  },
};

export default authAPI;