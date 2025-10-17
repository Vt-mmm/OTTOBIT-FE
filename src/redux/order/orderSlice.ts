import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { OrderResult } from "common/@types/order";
import { Paginate } from "common/@types";
import {
  createOrderFromCartThunk,
  getOrdersThunk,
  getOrderByIdThunk,
  cancelOrderThunk,
  getOrdersForAdminThunk,
  getOrderByIdForAdminThunk,
  updateOrderStatusThunk,
} from "./orderThunks";

interface OrderState {
  // Orders list (paginated)
  orders: {
    data: Paginate<OrderResult> | null;
    isLoading: boolean;
    error: string | null;
  };
  // Current order details
  currentOrder: {
    data: OrderResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Last created order (used for checkout flow)
  lastCreatedOrder: {
    data: OrderResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Admin orders list (separate from user orders)
  adminOrders: {
    data: Paginate<OrderResult> | null;
    isLoading: boolean;
    error: string | null;
  };
  // Operations state
  operations: {
    isCreating: boolean;
    isCancelling: boolean;
    isUpdatingStatus: boolean;
    createError: string | null;
    cancelError: string | null;
    updateStatusError: string | null;
    updateStatusSuccess: boolean;
  };
}

const initialState: OrderState = {
  orders: {
    data: null,
    isLoading: false,
    error: null,
  },
  currentOrder: {
    data: null,
    isLoading: false,
    error: null,
  },
  lastCreatedOrder: {
    data: null,
    isLoading: false,
    error: null,
  },
  adminOrders: {
    data: null,
    isLoading: false,
    error: null,
  },
  operations: {
    isCreating: false,
    isCancelling: false,
    isUpdatingStatus: false,
    createError: null,
    cancelError: null,
    updateStatusError: null,
    updateStatusSuccess: false,
  },
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    // Clear last created order
    clearLastCreatedOrder: (state) => {
      state.lastCreatedOrder.data = null;
      state.lastCreatedOrder.error = null;
    },
    // Clear current order
    clearCurrentOrder: (state) => {
      state.currentOrder.data = null;
      state.currentOrder.error = null;
    },
    // Clear errors
    clearOrderErrors: (state) => {
      state.orders.error = null;
      state.currentOrder.error = null;
      state.lastCreatedOrder.error = null;
      state.adminOrders.error = null;
      state.operations.createError = null;
      state.operations.cancelError = null;
      state.operations.updateStatusError = null;
    },
    // Clear update status success flag
    clearUpdateStatusSuccess: (state) => {
      state.operations.updateStatusSuccess = false;
    },

    // Toast actions
    setMessageSuccess: (_state, action: PayloadAction<string>) => {
      toast.success(action.payload);
    },
    setMessageError: (_state, action: PayloadAction<string>) => {
      toast.error(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Create order from cart
    builder
      .addCase(createOrderFromCartThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.operations.createError = null;
        state.lastCreatedOrder.isLoading = true;
        state.lastCreatedOrder.error = null;
      })
      .addCase(
        createOrderFromCartThunk.fulfilled,
        (state, action: PayloadAction<OrderResult>) => {
          state.operations.isCreating = false;
          state.lastCreatedOrder.isLoading = false;
          state.lastCreatedOrder.data = action.payload;
        }
      )
      .addCase(createOrderFromCartThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = action.payload as string;
        state.lastCreatedOrder.isLoading = false;
        state.lastCreatedOrder.error = action.payload as string;
      });

    // Get orders
    builder
      .addCase(getOrdersThunk.pending, (state) => {
        state.orders.isLoading = true;
        state.orders.error = null;
      })
      .addCase(
        getOrdersThunk.fulfilled,
        (state, action: PayloadAction<Paginate<OrderResult>>) => {
          state.orders.isLoading = false;
          state.orders.data = action.payload;
        }
      )
      .addCase(getOrdersThunk.rejected, (state, action) => {
        state.orders.isLoading = false;
        state.orders.error = action.payload as string;
      });

    // Get order by ID
    builder
      .addCase(getOrderByIdThunk.pending, (state) => {
        state.currentOrder.isLoading = true;
        state.currentOrder.error = null;
      })
      .addCase(
        getOrderByIdThunk.fulfilled,
        (state, action: PayloadAction<OrderResult>) => {
          state.currentOrder.isLoading = false;
          state.currentOrder.data = action.payload;
        }
      )
      .addCase(getOrderByIdThunk.rejected, (state, action) => {
        state.currentOrder.isLoading = false;
        state.currentOrder.error = action.payload as string;
      });

    // Cancel order
    builder
      .addCase(cancelOrderThunk.pending, (state) => {
        state.operations.isCancelling = true;
        state.operations.cancelError = null;
      })
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        state.operations.isCancelling = false;
        // Update order status in lists if present
        if (state.orders.data) {
          state.orders.data.items = state.orders.data.items.map((order) =>
            order.id === action.payload.orderId
              ? { ...order, status: 3 } // Cancelled status
              : order
          );
        }
        // Clear current order if it's the cancelled one
        if (state.currentOrder.data?.id === action.payload.orderId) {
          state.currentOrder.data = null;
        }
      })
      .addCase(cancelOrderThunk.rejected, (state, action) => {
        state.operations.isCancelling = false;
        state.operations.cancelError = action.payload as string;
      });

    // ============== ADMIN THUNKS ==============

    // Get orders for admin
    builder
      .addCase(getOrdersForAdminThunk.pending, (state) => {
        state.adminOrders.isLoading = true;
        state.adminOrders.error = null;
      })
      .addCase(
        getOrdersForAdminThunk.fulfilled,
        (state, action: PayloadAction<Paginate<OrderResult>>) => {
          state.adminOrders.isLoading = false;
          state.adminOrders.data = action.payload;
        }
      )
      .addCase(getOrdersForAdminThunk.rejected, (state, action) => {
        state.adminOrders.isLoading = false;
        state.adminOrders.error = action.payload as string;
      });

    // Get order by ID for admin (reuse currentOrder state)
    builder
      .addCase(getOrderByIdForAdminThunk.pending, (state) => {
        state.currentOrder.isLoading = true;
        state.currentOrder.error = null;
      })
      .addCase(
        getOrderByIdForAdminThunk.fulfilled,
        (state, action: PayloadAction<OrderResult>) => {
          state.currentOrder.isLoading = false;
          state.currentOrder.data = action.payload;
        }
      )
      .addCase(getOrderByIdForAdminThunk.rejected, (state, action) => {
        state.currentOrder.isLoading = false;
        state.currentOrder.error = action.payload as string;
      });

    // Update order status
    builder
      .addCase(updateOrderStatusThunk.pending, (state) => {
        state.operations.isUpdatingStatus = true;
        state.operations.updateStatusError = null;
        state.operations.updateStatusSuccess = false;
      })
      .addCase(
        updateOrderStatusThunk.fulfilled,
        (state, action: PayloadAction<OrderResult>) => {
          state.operations.isUpdatingStatus = false;
          state.operations.updateStatusSuccess = true;
          // Update in admin orders list
          if (state.adminOrders.data) {
            state.adminOrders.data.items = state.adminOrders.data.items.map(
              (order) =>
                order.id === action.payload.id ? action.payload : order
            );
          }
          // Update current order if it's the same
          if (state.currentOrder.data?.id === action.payload.id) {
            state.currentOrder.data = action.payload;
          }
        }
      )
      .addCase(updateOrderStatusThunk.rejected, (state, action) => {
        state.operations.isUpdatingStatus = false;
        state.operations.updateStatusError = action.payload as string;
      });
  },
});

export const {
  clearLastCreatedOrder,
  clearCurrentOrder,
  clearOrderErrors,
  clearUpdateStatusSuccess,
  setMessageSuccess,
  setMessageError,
} = orderSlice.actions;

export default orderSlice.reducer;
