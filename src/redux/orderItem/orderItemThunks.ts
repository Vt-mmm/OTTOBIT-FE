// OrderItem Redux Thunks
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { OrderItem, GetOrderItemsRequest } from "common/@types/orderItem";
import { ROUTES_API_ORDER_ITEM } from "constants/routesApiKeys";
import { extractApiErrorMessage } from "utils/errorHandler";

// API Response wrapper interface
interface ApiResponse<T> {
  message: string;
  data: T;
  errors?: string[] | null;
  errorCode?: string | null;
  timestamp?: string;
}

// Paginated response interface
interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// Get order items by order ID
export const getOrderItemsThunk = createAsyncThunk(
  "orderItem/getByOrder",
  async (params: GetOrderItemsRequest, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<
        ApiResponse<PaginatedResponse<OrderItem>>
      >(ROUTES_API_ORDER_ITEM.GET_BY_ORDER(params.orderId), {
        params: {
          page: params.pageNumber || 1,
          size: params.pageSize || 100, // Get all items by default
        },
      });
      // Extract items from paginated response
      return response.data.data.items;
    } catch (error) {
      const message = extractApiErrorMessage(
        error as AxiosError,
        "Failed to fetch order items"
      );
      return rejectWithValue(message);
    }
  }
);
