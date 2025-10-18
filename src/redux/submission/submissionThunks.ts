import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";

// Local action creators
const setMessageSuccess = (message: string) => ({
  type: "submission/setMessageSuccess",
  payload: message,
});

const setMessageError = (message: string) => ({
  type: "submission/setMessageError",
  payload: message,
});
import { ROUTES_API_SUBMISSION } from "constants/routesApiKeys";
import {
  SubmissionResult,
  SubmissionsResponse,
  CreateSubmissionRequest,
  GetSubmissionsRequest,
  GetMySubmissionsRequest,
} from "common/@types/submission";

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

// Get best submissions per challenge (only highest star for each challenge)
export const getBestSubmissionsThunk = createAsyncThunk<
  SubmissionResult[],
  { lessonId?: string },
  { rejectValue: string }
>("submission/getBestSubmissions", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<SubmissionResult[]>>(
        ROUTES_API_SUBMISSION.BEST,
        {
          params: request.lessonId ? { lessonId: request.lessonId } : undefined,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch best submissions");
    }

    if (!response.data.data) {
      throw new Error("No best submissions data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch best submissions"
    );
  }
});

// Get my submissions (current user's submissions)
export const getMySubmissionsThunk = createAsyncThunk<
  SubmissionsResponse,
  GetMySubmissionsRequest,
  { rejectValue: string }
>("submission/getMySubmissions", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<SubmissionsResponse>>(
        ROUTES_API_SUBMISSION.MY_SUBMISSIONS,
        {
          params: request,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch submissions");
    }

    if (!response.data.data) {
      throw new Error("No submissions data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch my submissions"
    );
  }
});

// Get submission by ID
export const getSubmissionByIdThunk = createAsyncThunk<
  SubmissionResult,
  string,
  { rejectValue: string }
>("submission/getById", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<SubmissionResult>>(
        ROUTES_API_SUBMISSION.GET_BY_ID(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch submission");
    }

    if (!response.data.data) {
      throw new Error("No submission data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch submission"
    );
  }
});

// Get submission by ID for Admin
export const getSubmissionByIdForAdminThunk = createAsyncThunk<
  SubmissionResult,
  string,
  { rejectValue: string }
>("submission/getByIdForAdmin", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<SubmissionResult>>(
        ROUTES_API_SUBMISSION.ADMIN_GET_BY_ID(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch submission");
    }

    if (!response.data.data) {
      throw new Error("No submission data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch submission"
    );
  }
});

// Create submission (submit code solution)
export const createSubmissionThunk = createAsyncThunk<
  SubmissionResult,
  CreateSubmissionRequest,
  { rejectValue: string }
>("submission/create", async (submissionData, thunkAPI) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<SubmissionResult>>(
        ROUTES_API_SUBMISSION.CREATE,
        submissionData
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to create submission");
    }

    if (!response.data.data) {
      throw new Error("No submission data received");
    }

    // Success toast
    thunkAPI.dispatch(setMessageSuccess("Đã nộp bài thành công!"));

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    const errorMessage = err.response?.data?.message || "Failed to submit solution";

    // Error toast
    thunkAPI.dispatch(setMessageError(errorMessage));

    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Get submissions for Admin (paginated with filters)
export const getSubmissionsForAdminThunk = createAsyncThunk<
  SubmissionsResponse,
  GetSubmissionsRequest,
  { rejectValue: string }
>("submission/getForAdmin", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<SubmissionsResponse>>(
        ROUTES_API_SUBMISSION.ADMIN_GET_ALL,
        {
          params: request,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch submissions");
    }

    if (!response.data.data) {
      throw new Error("No submissions data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch submissions"
    );
  }
});
