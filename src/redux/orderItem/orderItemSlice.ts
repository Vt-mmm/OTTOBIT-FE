// OrderItem Redux Slice
import { createSlice } from "@reduxjs/toolkit";
import { OrderItem } from "common/@types/orderItem";
import { getOrderItemsThunk } from "./orderItemThunks";

interface OrderItemState {
  items: OrderItem[] | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderItemState = {
  items: null,
  isLoading: false,
  error: null,
};

const orderItemSlice = createSlice({
  name: "orderItem",
  initialState,
  reducers: {
    clearOrderItems: (state) => {
      state.items = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get order items
      .addCase(getOrderItemsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderItemsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(getOrderItemsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrderItems } = orderItemSlice.actions;
export default orderItemSlice.reducer;
