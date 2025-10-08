import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_ACTIVATION_CODE } from "constants/routesApiKeys";
import {
  ValidateActivationCodeRequest,
  ValidateActivationCodeResponse,
  CreateActivationCodeBatchRequest,
  CreateActivationCodeBatchResponse,
  ActivationCodesResponse,
  ActivationCodeResult,
  CodeStatus,
  RedeemActivationCodeRequest,
  RedeemActivationCodeResponse,
} from "common/@types/activationCode";

interface ErrorResponse {
  message: string;
}

// Helper function for API calls with retry logic
async function callApiWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
      return await apiCall();
    } catch (error) {
      lastError = error;
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        break;
      }
    }
  }
  throw lastError;
}

// Validate Activation Code (User)
export const validateActivationCodeThunk = createAsyncThunk<
  ValidateActivationCodeResponse,
  ValidateActivationCodeRequest
>("activationCode/validate", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post(
      ROUTES_API_ACTIVATION_CODE.VALIDATE,
      data
    );
    return response.data.data || response.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to validate activation code"
    );
  }
});

// Get All Activation Codes (Admin)
export const getActivationCodesThunk = createAsyncThunk<
  ActivationCodesResponse,
  any
>("activationCode/getAll", async (params, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get(ROUTES_API_ACTIVATION_CODE.ADMIN_GET_ALL, { params })
    );
    return response.data.data || response.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch activation codes"
    );
  }
});

// Create Activation Code Batch (Admin)
export const createActivationCodeBatchThunk = createAsyncThunk<
  CreateActivationCodeBatchResponse,
  CreateActivationCodeBatchRequest
>("activationCode/createBatch", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post(
      ROUTES_API_ACTIVATION_CODE.ADMIN_CREATE_BATCH,
      data
    );
    return response.data.data || response.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to create activation codes"
    );
  }
});

// Update Activation Code Status (Admin)
export const updateActivationCodeStatusThunk = createAsyncThunk<
  ActivationCodeResult,
  { id: string; status: CodeStatus }
>(
  "activationCode/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(
        ROUTES_API_ACTIVATION_CODE.ADMIN_UPDATE_STATUS(id),
        { status }
      );
      return response.data.data || response.data;
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update activation code status"
      );
    }
  }
);

// Export Activation Codes CSV (Admin)
export const exportActivationCodesCsvThunk = createAsyncThunk<void, string>(
  "activationCode/exportCsv",
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(
        ROUTES_API_ACTIVATION_CODE.ADMIN_EXPORT_CSV,
        {
          params: { batchId },
          responseType: "blob", // Important for file download
        }
      );

      // Create blob and download file
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `activation-codes-${batchId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to export activation codes"
      );
    }
  }
);

// Delete Activation Code (Admin)
export const deleteActivationCodeThunk = createAsyncThunk<string, string>(
  "activationCode/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(ROUTES_API_ACTIVATION_CODE.ADMIN_DELETE(id));
      return id;
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete activation code"
      );
    }
  }
);

// Get My Activation Codes (User)
export const getMyActivationCodesThunk = createAsyncThunk<
  ActivationCodesResponse,
  any
>("activationCode/getMyCodes", async (params, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get(ROUTES_API_ACTIVATION_CODE.MY_CODES, { params })
    );
    return response.data.data || response.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch my activation codes"
    );
  }
});

// Redeem Activation Code (User)
export const redeemActivationCodeThunk = createAsyncThunk<
  RedeemActivationCodeResponse,
  RedeemActivationCodeRequest
>("activationCode/redeem", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post(
      ROUTES_API_ACTIVATION_CODE.REDEEM,
      data
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to redeem activation code"
    );
  }
});
