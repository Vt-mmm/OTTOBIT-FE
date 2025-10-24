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
  errorCode?: string;
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
    } catch (error: any) {
      lastError = error;
      
      // Axios error can have response property or flattened structure
      const status = error?.response?.status || error?.status;
      
      // Don't retry on 4xx errors (client error - won't help to retry)
      // Only retry on 5xx errors (server error - might be temporary)
      if (status && status >= 400 && status < 500) {
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
>("enrollment/create", async (enrollmentData, thunkAPI) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<EnrollmentResult>>(
        ROUTES_API_ENROLLMENT.CREATE,
        enrollmentData
      )
    );

    // Check for errors in response
    if (response.data.errors || response.data.errorCode) {
      // Extract error details BEFORE throwing
      const errorCode = response.data.errorCode;
      const errorMessage = response.data.message || "Failed to create enrollment";
      const fullError = errorCode ? `${errorCode}:${errorMessage}` : errorMessage;
      
      return thunkAPI.rejectWithValue(fullError);
    }

    if (!response.data.data) {
      const errorMessage = "No enrollment data received";
      return thunkAPI.rejectWithValue(errorMessage);
    }

    return response.data.data;
  } catch (error: any) {
    // Parse error message from different response formats
    let errorMessage = "Failed to enroll in course";
    let errorCode: string | undefined;

    // Handle both nested (err.response.data) and flattened (err.data) error structures
    const responseData = error?.response?.data || error?.data;

    if (responseData) {
      // Extract error code if present
      if (responseData.errorCode) {
        errorCode = responseData.errorCode;
      }

      // Handle different error response formats
      if (typeof responseData === "string") {
        errorMessage = responseData;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.errors && Array.isArray(responseData.errors)) {
        errorMessage = responseData.errors[0] || errorMessage;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // Build full error string with error code if available
    // Format: "errorCode:message" for Yup resolver to parse
    const fullError = errorCode ? `${errorCode}:${errorMessage}` : errorMessage;

    return thunkAPI.rejectWithValue(fullError);
  }
});

// Complete enrollment (mark as finished)
export const completeEnrollmentThunk = createAsyncThunk<
  EnrollmentResult,
  string,
  { rejectValue: string }
>("enrollment/complete", async (id, thunkAPI) => {
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
    const errorMessage = err.response?.data?.message || "Failed to complete enrollment";
    
    return thunkAPI.rejectWithValue(errorMessage);
  }
});
