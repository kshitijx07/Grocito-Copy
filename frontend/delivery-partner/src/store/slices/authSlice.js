import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAPI from '../../services/authAPI';

// Async thunks
export const loginPartner = createAsyncThunk(
  'auth/loginPartner',
  async ({ emailOrPhone, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(emailOrPhone, password);
      
      // Store token in localStorage
      localStorage.setItem('deliveryPartnerToken', response.token);
      
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const registerPartner = createAsyncThunk(
  'auth/registerPartner',
  async (registrationData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(registrationData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send reset email');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(token, newPassword);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Password reset failed');
    }
  }
);

// Restore partner data from token
export const restorePartnerFromToken = createAsyncThunk(
  'auth/restorePartnerFromToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('deliveryPartnerToken');
      if (!token) {
        throw new Error('No token found');
      }
      
      // Try to get partner data from localStorage first
      const storedPartner = localStorage.getItem('deliveryPartnerData');
      if (storedPartner) {
        return { partner: JSON.parse(storedPartner), token };
      }
      
      // If no stored data, fetch from API
      const response = await authAPI.getProfile();
      
      // Store partner data in localStorage
      localStorage.setItem('deliveryPartnerData', JSON.stringify(response.partner));
      
      return { partner: response.partner, token };
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem('deliveryPartnerToken');
      localStorage.removeItem('deliveryPartnerData');
      return rejectWithValue('Session expired');
    }
  }
);

// Helper function to get stored partner data
const getStoredPartner = () => {
  try {
    const storedPartner = localStorage.getItem('deliveryPartnerData');
    return storedPartner ? JSON.parse(storedPartner) : null;
  } catch (error) {
    console.error('Error parsing stored partner data:', error);
    localStorage.removeItem('deliveryPartnerData');
    return null;
  }
};

// Initial state
const initialState = {
  partner: getStoredPartner(),
  token: localStorage.getItem('deliveryPartnerToken'),
  isAuthenticated: !!localStorage.getItem('deliveryPartnerToken'),
  loading: false,
  error: null,
  registrationSuccess: false,
  passwordResetSuccess: false,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('deliveryPartnerToken');
      localStorage.removeItem('deliveryPartnerData');
      state.partner = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
    clearPasswordResetSuccess: (state) => {
      state.passwordResetSuccess = false;
    },
    updatePartnerProfile: (state, action) => {
      if (state.partner) {
        state.partner = { ...state.partner, ...action.payload };
        // Update localStorage with new partner data
        localStorage.setItem('deliveryPartnerData', JSON.stringify(state.partner));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginPartner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginPartner.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.partner = action.payload.partner;
        state.error = null;
        
        // Store partner data in localStorage
        localStorage.setItem('deliveryPartnerData', JSON.stringify(action.payload.partner));
      })
      .addCase(loginPartner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
        state.partner = null;
      })
      
      // Register
      .addCase(registerPartner.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerPartner.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationSuccess = true;
        state.error = null;
      })
      .addCase(registerPartner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registrationSuccess = false;
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.passwordResetSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordResetSuccess = true;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.passwordResetSuccess = false;
      })
      
      // Restore Partner from Token
      .addCase(restorePartnerFromToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restorePartnerFromToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.partner = action.payload.partner;
        state.error = null;
      })
      .addCase(restorePartnerFromToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.partner = null;
        state.error = action.payload;
      });
  },
});

export const { 
  logout, 
  clearError, 
  clearRegistrationSuccess, 
  clearPasswordResetSuccess,
  updatePartnerProfile 
} = authSlice.actions;

export default authSlice.reducer;