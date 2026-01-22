import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ordersAPI from '../../services/ordersAPI';

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ partnerId, status }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getPartnerOrders(partnerId, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch orders');
    }
  }
);

export const acceptOrder = createAsyncThunk(
  'orders/acceptOrder',
  async ({ assignmentId, partnerId }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.acceptOrder(assignmentId, partnerId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to accept order');
    }
  }
);

export const rejectOrder = createAsyncThunk(
  'orders/rejectOrder',
  async ({ assignmentId, partnerId, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.rejectOrder(assignmentId, partnerId, rejectionReason);
      return { assignmentId, response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reject order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ assignmentId, partnerId, status }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.updateOrderStatus(assignmentId, partnerId, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update order status');
    }
  }
);

// Initial state
const initialState = {
  orders: [],
  activeOrders: [],
  completedOrders: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Orders slice
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNewOrder: (state, action) => {
      // Add new order to the beginning of the list
      state.orders.unshift(action.payload);
      if (action.payload.status === 'ASSIGNED') {
        state.activeOrders.unshift(action.payload);
      }
    },
    removeOrder: (state, action) => {
      const assignmentId = action.payload;
      state.orders = state.orders.filter(order => order.id !== assignmentId);
      state.activeOrders = state.activeOrders.filter(order => order.id !== assignmentId);
    },
    updateOrderInList: (state, action) => {
      const updatedOrder = action.payload;
      
      // Update in main orders list
      const orderIndex = state.orders.findIndex(order => order.id === updatedOrder.id);
      if (orderIndex !== -1) {
        state.orders[orderIndex] = updatedOrder;
      }
      
      // Update in active orders list
      const activeIndex = state.activeOrders.findIndex(order => order.id === updatedOrder.id);
      if (activeIndex !== -1) {
        if (['ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(updatedOrder.status)) {
          state.activeOrders[activeIndex] = updatedOrder;
        } else {
          state.activeOrders.splice(activeIndex, 1);
        }
      } else if (['ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(updatedOrder.status)) {
        state.activeOrders.push(updatedOrder);
      }
      
      // Update in completed orders list
      if (updatedOrder.status === 'DELIVERED') {
        const completedIndex = state.completedOrders.findIndex(order => order.id === updatedOrder.id);
        if (completedIndex === -1) {
          state.completedOrders.unshift(updatedOrder);
        } else {
          state.completedOrders[completedIndex] = updatedOrder;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        
        // Separate orders by status
        state.activeOrders = action.payload.filter(order => 
          ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(order.status)
        );
        state.completedOrders = action.payload.filter(order => 
          order.status === 'DELIVERED'
        );
        
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Accept Order
      .addCase(acceptOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload;
        
        // Update the order in the list
        const orderIndex = state.orders.findIndex(order => order.id === updatedOrder.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
        
        // Move to active orders if not already there
        const activeIndex = state.activeOrders.findIndex(order => order.id === updatedOrder.id);
        if (activeIndex !== -1) {
          state.activeOrders[activeIndex] = updatedOrder;
        } else {
          state.activeOrders.push(updatedOrder);
        }
        
        state.error = null;
      })
      .addCase(acceptOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reject Order
      .addCase(rejectOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectOrder.fulfilled, (state, action) => {
        state.loading = false;
        const { assignmentId } = action.payload;
        
        // Remove from orders list
        state.orders = state.orders.filter(order => order.id !== assignmentId);
        state.activeOrders = state.activeOrders.filter(order => order.id !== assignmentId);
        
        state.error = null;
      })
      .addCase(rejectOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload;
        
        // Update in main orders list
        const orderIndex = state.orders.findIndex(order => order.id === updatedOrder.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
        
        // Handle active orders list
        const activeIndex = state.activeOrders.findIndex(order => order.id === updatedOrder.id);
        if (updatedOrder.status === 'DELIVERED') {
          // Move to completed orders
          if (activeIndex !== -1) {
            state.activeOrders.splice(activeIndex, 1);
          }
          state.completedOrders.unshift(updatedOrder);
        } else if (activeIndex !== -1) {
          state.activeOrders[activeIndex] = updatedOrder;
        }
        
        state.error = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  addNewOrder, 
  removeOrder, 
  updateOrderInList 
} = ordersSlice.actions;

export default ordersSlice.reducer;