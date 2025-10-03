import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_CERTIFICATE_TEMPLATE } from "constants/routesApiKeys";
import {
  CertificateTemplateResult,
  CertificateTemplatesResponse,
  GetCertificateTemplatesRequest,
  CreateCertificateTemplateRequest,
  UpdateCertificateTemplateRequest,
} from "common/@types/certificateTemplate";
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

// Get certificate templates (Admin)
export const getCertificateTemplatesThunk = createAsyncThunk<
  CertificateTemplatesResponse,
  GetCertificateTemplatesRequest,
  { rejectValue: string }
>(
  "certificateTemplate/getCertificateTemplates",
  async (params, { rejectWithValue }) => {
    try {
      return await callApiWithRetry(async () => {
        const response = await axiosClient.get<
          ApiResponse<CertificateTemplatesResponse>
        >(ROUTES_API_CERTIFICATE_TEMPLATE.GET_ALL, { params });
        return response.data.data;
      });
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error));
    }
  }
);

// Get certificate template by ID (Admin/User)
export const getCertificateTemplateByIdThunk = createAsyncThunk<
  CertificateTemplateResult,
  string,
  { rejectValue: string }
>(
  "certificateTemplate/getCertificateTemplateById",
  async (id, { rejectWithValue }) => {
    try {
      return await callApiWithRetry(async () => {
        const response = await axiosClient.get<
          ApiResponse<CertificateTemplateResult>
        >(ROUTES_API_CERTIFICATE_TEMPLATE.GET_BY_ID(id));
        return response.data.data;
      });
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error));
    }
  }
);

// Create certificate template (Admin)
export const createCertificateTemplateThunk = createAsyncThunk<
  CertificateTemplateResult,
  CreateCertificateTemplateRequest,
  { rejectValue: string }
>(
  "certificateTemplate/createCertificateTemplate",
  async (data, { rejectWithValue }) => {
    try {
      return await callApiWithRetry(async () => {
        const response = await axiosClient.post<
          ApiResponse<CertificateTemplateResult>
        >(ROUTES_API_CERTIFICATE_TEMPLATE.CREATE, data);
        return response.data.data;
      });
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error));
    }
  }
);

// Update certificate template (Admin)
export const updateCertificateTemplateThunk = createAsyncThunk<
  CertificateTemplateResult,
  { id: string; data: UpdateCertificateTemplateRequest },
  { rejectValue: string }
>(
  "certificateTemplate/updateCertificateTemplate",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await callApiWithRetry(async () => {
        const response = await axiosClient.put<
          ApiResponse<CertificateTemplateResult>
        >(ROUTES_API_CERTIFICATE_TEMPLATE.UPDATE(id), data);
        return response.data.data;
      });
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error));
    }
  }
);

// Delete certificate template (Admin)
export const deleteCertificateTemplateThunk = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>(
  "certificateTemplate/deleteCertificateTemplate",
  async (id, { rejectWithValue }) => {
    try {
      return await callApiWithRetry(async () => {
        await axiosClient.delete(ROUTES_API_CERTIFICATE_TEMPLATE.DELETE(id));
      });
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error));
    }
  }
);
