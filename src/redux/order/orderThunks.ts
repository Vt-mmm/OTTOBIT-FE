import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";

// Local action creators
const setMessageSuccess = (message: string) => ({
  type: "order/setMessageSuccess",
  payload: message,
});

const setMessageError = (message: string) => ({
  type: "order/setMessageError",
  payload: message,
});
import { ROUTES_API_ORDER } from "constants/routesApiKeys";
import {
  CreateOrderFromCartRequest,
  GetOrdersRequest,
  GetOrdersForAdminRequest,
  UpdateOrderStatusRequest,
  OrderResult,
  OrdersResponse,
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
  async (request: CreateOrderFromCartRequest, thunkAPI) => {
    try {
      const response = await axiosClient.post<ApiResponse<OrderResult>>(
        ROUTES_API_ORDER.CREATE_FROM_CART,
        request
      );

      // Success toast
      thunkAPI.dispatch(setMessageSuccess("Đặt hàng thành công!"));

      return response.data.data;
    } catch (error) {
      const message = extractApiErrorMessage(
        error as AxiosError,
        "Failed to create order"
      );

      // Error toast
      thunkAPI.dispatch(setMessageError(message));

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get orders with pagination
export const getOrdersThunk = createAsyncThunk(
  "order/getOrders",
  async (params: GetOrdersRequest, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<
        ApiResponse<Paginate<OrderResult>>
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
  async (orderId: string, thunkAPI) => {
    try {
      await axiosClient.put<ApiResponse<void>>(
        ROUTES_API_ORDER.CANCEL(orderId)
      );

      // Success toast
      thunkAPI.dispatch(setMessageSuccess("Đã hủy đơn hàng!"));

      return { orderId };
    } catch (error) {
      const message = extractApiErrorMessage(
        error as AxiosError,
        "Failed to cancel order"
      );

      // Error toast
      thunkAPI.dispatch(setMessageError(message));

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ============== ADMIN ENDPOINTS ==============

// Get orders for admin with pagination
export const getOrdersForAdminThunk = createAsyncThunk(
  "order/getOrdersForAdmin",
  async (params: GetOrdersForAdminRequest, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<ApiResponse<OrdersResponse>>(
        ROUTES_API_ORDER.GET_ORDERS_ADMIN,
        { params }
      );
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

// Get order by ID for admin
export const getOrderByIdForAdminThunk = createAsyncThunk(
  "order/getOrderByIdForAdmin",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<ApiResponse<OrderResult>>(
        ROUTES_API_ORDER.GET_BY_ID_ADMIN(orderId)
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

// Update order status (admin only)
export const updateOrderStatusThunk = createAsyncThunk(
  "order/updateOrderStatus",
  async (
    { orderId, ...data }: UpdateOrderStatusRequest & { orderId: string },
    thunkAPI
  ) => {
    try {
      const response = await axiosClient.put<ApiResponse<OrderResult>>(
        ROUTES_API_ORDER.UPDATE_STATUS(orderId),
        data
      );

      // Success toast
      thunkAPI.dispatch(setMessageSuccess("Đã cập nhật trạng thái đơn hàng!"));

      return response.data.data;
    } catch (error) {
      const message = extractApiErrorMessage(
        error as AxiosError,
        "Failed to update order status"
      );

      // Error toast
      thunkAPI.dispatch(setMessageError(message));

      return thunkAPI.rejectWithValue(message);
    }
  }
);
