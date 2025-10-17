import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";

// Local action creators
const setMessageSuccess = (message: string) => ({
  type: "payment/setMessageSuccess",
  payload: message,
});

const setMessageError = (message: string) => ({
  type: "payment/setMessageError",
  payload: message,
});
import { ROUTES_API_PAYMENT, ROUTES_API_PAYOS } from "constants/routesApiKeys";
import {
  InitiatePaymentRequest,
  GetPaymentHistoryRequest,
  CancelPaymentRequest,
  PaymentLinkResult,
  PaymentHistoryResult,
  PaymentTransactionResult,
} from "common/@types/payment";
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

// Get payment history
export const getPaymentHistoryThunk = createAsyncThunk(
  "payment/getPaymentHistory",
  async (params: GetPaymentHistoryRequest, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<
        ApiResponse<Paginate<PaymentHistoryResult>>
      >(ROUTES_API_PAYMENT.GET_HISTORY, { params });
      return response.data.data;
    } catch (error) {
      const message = extractApiErrorMessage(
        error as AxiosError,
        "Failed to fetch payment history"
      );
      return rejectWithValue(message);
    }
  }
);

// Get payment by order ID
export const getPaymentByOrderIdThunk = createAsyncThunk(
  "payment/getPaymentByOrderId",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<
        ApiResponse<PaymentTransactionResult>
      >(ROUTES_API_PAYMENT.GET_BY_ORDER_ID(orderId));
      return response.data.data;
    } catch (error) {
      const message = extractApiErrorMessage(
        error as AxiosError,
        "Failed to fetch payment details"
      );
      return rejectWithValue(message);
    }
  }
);

// Initiate payment
export const initiatePaymentThunk = createAsyncThunk(
  "payment/initiatePayment",
  async (request: InitiatePaymentRequest, thunkAPI) => {
    try {
      const response = await axiosClient.post<ApiResponse<PaymentLinkResult>>(
        ROUTES_API_PAYOS.INITIATE,
        request
      );

      // Success toast
      thunkAPI.dispatch(setMessageSuccess("Đã khởi tạo thanh toán!"));

      return response.data.data;
    } catch (error) {
      const message = extractApiErrorMessage(
        error as AxiosError,
        "Failed to initiate payment"
      );

      // Error toast
      thunkAPI.dispatch(setMessageError(message));

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Cancel payment
export const cancelPaymentThunk = createAsyncThunk(
  "payment/cancelPayment",
  async (
    { orderId, request }: { orderId: string; request: CancelPaymentRequest },
    thunkAPI
  ) => {
    try {
      await axiosClient.post<ApiResponse<void>>(
        ROUTES_API_PAYMENT.CANCEL_PAYMENT(orderId),
        request
      );

      // Success toast
      thunkAPI.dispatch(setMessageSuccess("Đã hủy thanh toán!"));

      return { orderId };
    } catch (error) {
      const message = extractApiErrorMessage(
        error as AxiosError,
        "Failed to cancel payment"
      );

      // Error toast
      thunkAPI.dispatch(setMessageError(message));

      return thunkAPI.rejectWithValue(message);
    }
  }
);
