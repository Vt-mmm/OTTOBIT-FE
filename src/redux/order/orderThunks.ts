import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_ORDER } from "constants/routesApiKeys";
import {
  CreateOrderFromCartRequest,
  GetOrdersRequest,
  OrderResult,
  OrderSummaryResult,
} from "common/@types/order";
import { Paginate } from "common/@types";
import { extractApiErrorMessage } from "utils/errorHandler";

// API Response wrapper interface
interface ApiResponse<T> {
  message: string;
  data: T;
  errors?: string[] | null;
  errorCode?: string | null;
  timestamp?: string;
}

// Create order from cart
export const createOrderFromCartThunk = createAsyncThunk(
  "order/createOrderFromCart",
  async (request: CreateOrderFromCartRequest, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<ApiResponse<OrderResult>>(
        ROUTES_API_ORDER.CREATE_FROM_CART,
        request
      );
      return response.data.data;
    } catch (error) {
      const message = extractApiErrorMessage(
        error as AxiosError,
        "Failed to create order"
      );
      return rejectWithValue(message);
    }
  }
);

// Get orders with pagination
export const getOrdersThunk = createAsyncThunk(
  "order/getOrders",
  async (params: GetOrdersRequest, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<
        ApiResponse<Paginate<OrderSummaryResult>>
      >(ROUTES_API_ORDER.GET_ORDERS, { params });
      return response.data.data;
    } catch (error) {
      const message = extractApiErrorMessage(
        error as AxiosError,
        "Failed to fetch orders"
      );
      return rejectWithValue(message);
    }
  }
);

// Get order by ID
export const getOrderByIdThunk = createAsyncThunk(
  "order/getOrderById",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<ApiResponse<OrderResult>>(
        ROUTES_API_ORDER.GET_BY_ID(orderId)
      );
      return response.data.data;
    } catch (error) {
      const message = extractApiErrorMessage(
        error as AxiosError,
        "Failed to fetch order details"
      );
      return rejectWithValue(message);
    }
  }
);

// Cancel order
export const cancelOrderThunk = createAsyncThunk(
  "order/cancelOrder",
  async (orderId: string, { rejectWithValue }) => {
    try {
      await axiosClient.put<ApiResponse<void>>(
        ROUTES_API_ORDER.CANCEL(orderId)
      );
      return { orderId };
    } catch (error) {
      const message = extractApiErrorMessage(
        error as AxiosError,
        "Failed to cancel order"
      );
      return rejectWithValue(message);
    }
  }
);
