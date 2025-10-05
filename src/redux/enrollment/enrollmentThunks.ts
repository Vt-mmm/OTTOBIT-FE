import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_ENROLLMENT } from "constants/routesApiKeys";
import {
  EnrollmentResult,
  EnrollmentsResponse,
  CreateEnrollmentRequest,
  GetEnrollmentsRequest,
  GetMyEnrollmentsRequest,
} from "common/@types/enrollment";

// API Response wrapper interface
interface ApiResponse<T> {
  message: string;
  data: T;
  errors?: string[] | null;
  errorCode?: string | null;
  timestamp?: string;
}

interface ErrorResponse {
  message: string;
  errors?: string[];
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
      // Don't retry on 401 (unauthorized) or 404 (not found)
      // 404 means user doesn't have student profile yet - this is expected
      if (
        axiosError.response?.status === 401 ||
        axiosError.response?.status === 404
      ) {
        break;
      }
    }
  }
  throw lastError;
}

// Get my enrollments (current user's enrollments)
export const getMyEnrollmentsThunk = createAsyncThunk<
  EnrollmentsResponse,
  GetMyEnrollmentsRequest,
  { rejectValue: string }
>("enrollment/getMyEnrollments", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<EnrollmentsResponse>>(
        ROUTES_API_ENROLLMENT.MY_ENROLLMENTS,
        {
          params: request,
          // Custom flag to suppress console errors for expected 404
          validateStatus: (status) => {
            // Treat 404 as valid response (user doesn't have student profile)
            return (status >= 200 && status < 300) || status === 404;
          },
        }
      )
    );

    // Handle 404 case (no student profile)
    if (response.status === 404) {
      return {
        items: [],
        page: 1,
        size: request.pageSize || 10,
        total: 0,
        totalPages: 0,
      };
    }

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch enrollments");
    }

    if (!response.data.data) {
      throw new Error("No enrollments data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;

    // Fallback: If 404 still comes here, return empty data
    if (err.response?.status === 404) {
      return {
        items: [],
        page: 1,
        size: request.pageSize || 10,
        total: 0,
        totalPages: 0,
      };
    }

    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch my enrollments"
    );
  }
});

// Get enrollments with pagination (Admin)
export const getEnrollmentsThunk = createAsyncThunk<
  EnrollmentsResponse,
  GetEnrollmentsRequest,
  { rejectValue: string }
>("enrollment/getAll", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<EnrollmentsResponse>>(
        ROUTES_API_ENROLLMENT.GET_ALL,
        {
          params: request,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch enrollments");
    }

    if (!response.data.data) {
      throw new Error("No enrollments data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch enrollments"
    );
  }
});

// Get enrollment by ID
export const getEnrollmentByIdThunk = createAsyncThunk<
  EnrollmentResult,
  string,
  { rejectValue: string }
>("enrollment/getById", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<EnrollmentResult>>(
        ROUTES_API_ENROLLMENT.GET_BY_ID(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch enrollment");
    }

    if (!response.data.data) {
      throw new Error("No enrollment data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch enrollment"
    );
  }
});

// Create enrollment (enroll in course)
export const createEnrollmentThunk = createAsyncThunk<
  EnrollmentResult,
  CreateEnrollmentRequest,
  { rejectValue: string }
>("enrollment/create", async (enrollmentData, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<EnrollmentResult>>(
        ROUTES_API_ENROLLMENT.CREATE,
        enrollmentData
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to create enrollment");
    }

    if (!response.data.data) {
      throw new Error("No enrollment data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;

    // Parse error message from different response formats
    let errorMessage = "Failed to enroll in course";

    if (err.response?.data) {
      const responseData = err.response.data;

      // Handle different error response formats
      if (typeof responseData === "string") {
        errorMessage = responseData;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.errors && Array.isArray(responseData.errors)) {
        errorMessage = responseData.errors[0] || errorMessage;
      }
    } else if (err.message) {
      errorMessage = err.message;
    }

    return rejectWithValue(errorMessage);
  }
});

// Complete enrollment (mark as finished)
export const completeEnrollmentThunk = createAsyncThunk<
  EnrollmentResult,
  string,
  { rejectValue: string }
>("enrollment/complete", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<EnrollmentResult>>(
        ROUTES_API_ENROLLMENT.COMPLETE(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to complete enrollment");
    }

    if (!response.data.data) {
      throw new Error("No enrollment data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to complete enrollment"
    );
  }
});
