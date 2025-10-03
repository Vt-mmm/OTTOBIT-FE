import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_CERTIFICATE } from "constants/routesApiKeys";
import {
  CertificateResult,
  CertificatesResponse,
  GetCertificatesRequest,
  RevokeCertificateRequest,
} from "common/@types/certificate";
import { extractApiErrorMessage } from "utils/errorHandler";

// API Response wrapper interface
interface ApiResponse<T> {
  message: string;
  data: T;
  errors?: string[] | null;
  errorCode?: string | null;
  timestamp?: string;
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

// Get certificates (Admin)
export const getCertificatesThunk = createAsyncThunk<
  CertificatesResponse,
  GetCertificatesRequest,
  { rejectValue: string }
>("certificate/getCertificates", async (params, { rejectWithValue }) => {
  try {
    return await callApiWithRetry(async () => {
      const response = await axiosClient.get<ApiResponse<CertificatesResponse>>(
        ROUTES_API_CERTIFICATE.GET_ALL,
        { params }
      );
      return response.data.data;
    });
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

// Get my certificates (User)
export const getMyCertificatesThunk = createAsyncThunk<
  CertificatesResponse,
  GetCertificatesRequest,
  { rejectValue: string }
>("certificate/getMyCertificates", async (params, { rejectWithValue }) => {
  try {
    return await callApiWithRetry(async () => {
      const response = await axiosClient.get<ApiResponse<CertificatesResponse>>(
        ROUTES_API_CERTIFICATE.MY_CERTIFICATES,
        { params }
      );
      return response.data.data;
    });
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

// Get certificate by ID (Admin)
export const getCertificateByIdThunk = createAsyncThunk<
  CertificateResult,
  string,
  { rejectValue: string }
>("certificate/getCertificateById", async (id, { rejectWithValue }) => {
  try {
    return await callApiWithRetry(async () => {
      const response = await axiosClient.get<ApiResponse<CertificateResult>>(
        ROUTES_API_CERTIFICATE.GET_BY_ID(id)
      );
      return response.data.data;
    });
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

// Revoke certificate (Admin)
export const revokeCertificateThunk = createAsyncThunk<
  CertificateResult,
  { id: string; data: RevokeCertificateRequest },
  { rejectValue: string }
>(
  "certificate/revokeCertificate",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await callApiWithRetry(async () => {
        const response = await axiosClient.post<ApiResponse<CertificateResult>>(
          ROUTES_API_CERTIFICATE.REVOKE(id),
          data
        );
        return response.data.data;
      });
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error));
    }
  }
);

// Delete certificate (Admin)
export const deleteCertificateThunk = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>("certificate/deleteCertificate", async (id, { rejectWithValue }) => {
  try {
    return await callApiWithRetry(async () => {
      await axiosClient.delete(ROUTES_API_CERTIFICATE.DELETE(id));
    });
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});
