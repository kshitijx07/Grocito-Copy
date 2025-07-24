import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardAPI from '../../services/dashboardAPI';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (partnerId, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getPartnerStats(partnerId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch dashboard stats');
    }
  }
);

export const updateAvailability = createAsyncThunk(
  'dashboard/updateAvailability',
  async ({ partnerId, isAvailable, availabilityStatus }, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.updateAvailability(partnerId, isAvailable, availabilityStatus);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update availability');
    }
  }
);

export const updateLocation = createAsyncThunk(
  'dashboard/updateLocation',
  async ({ partnerId, latitude, longitude }, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.updateLocation(partnerId, latitude, longitude);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update location');
    }
  }
);

// Initial state
const initialState = {
  stats: {
    totalDeliveries: 0,
    successfulDeliveries: 0,
    successRate: 0,
    averageRating: 0,
    totalEarnings: 0,
    activeOrders: 0,
    completedToday: 0,
    availabilityStatus: 'OFFLINE',
    isAvailable: false,
  },
  partner: null,
  loading: false,
  error: null,
  lastUpdated: null,
  locationUpdateLoading: false,
};

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateStatsLocally: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    incrementActiveOrders: (state) => {
      state.stats.activeOrders += 1;
    },
    decrementActiveOrders: (state) => {
      if (state.stats.activeOrders > 0) {
        state.stats.activeOrders -= 1;
      }
    },
    incrementCompletedToday: (state) => {
      state.stats.completedToday += 1;
      state.stats.totalDeliveries += 1;
      state.stats.successfulDeliveries += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Availability
      .addCase(updateAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.partner = action.payload;
        state.stats.availabilityStatus = action.payload.availabilityStatus;
        state.stats.isAvailable = action.payload.isAvailable;
        state.error = null;
      })
      .addCase(updateAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Location
      .addCase(updateLocation.pending, (state) => {
        state.locationUpdateLoading = true;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.locationUpdateLoading = false;
        if (state.partner) {
          state.partner.currentLatitude = action.payload.currentLatitude;
          state.partner.currentLongitude = action.payload.currentLongitude;
        }
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.locationUpdateLoading = false;
        // Don't show location update errors to user as they're not critical
      });
  },
});

export const { 
  clearError, 
  updateStatsLocally, 
  incrementActiveOrders, 
  decrementActiveOrders, 
  incrementCompletedToday 
} = dashboardSlice.actions;

export default dashboardSlice.reducer;