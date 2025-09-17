import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_SUBMISSION } from "constants/routesApiKeys";
import {
  SubmissionResult,
  SubmissionsResponse,
  CreateSubmissionRequest,
  UpdateSubmissionRequest,
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
      if (axiosError.response?.status === 401) {
        break;
      }
    }
  }
  throw lastError;
}

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

// Get submissions with pagination (Admin)
export const getSubmissionsThunk = createAsyncThunk<
  SubmissionsResponse,
  GetSubmissionsRequest,
  { rejectValue: string }
>("submission/getAll", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<SubmissionsResponse>>(
        ROUTES_API_SUBMISSION.GET_ALL,
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

// Get submissions by challenge ID
export const getSubmissionsByChallengeThunk = createAsyncThunk<
  SubmissionsResponse,
  { challengeId: string; pageNumber?: number; pageSize?: number },
  { rejectValue: string }
>("submission/getByChallenge", async ({ challengeId, pageNumber, pageSize }, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<SubmissionsResponse>>(
        ROUTES_API_SUBMISSION.BY_CHALLENGE(challengeId),
        {
          params: {
            pageNumber,
            pageSize,
          },
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch challenge submissions");
    }

    if (!response.data.data) {
      throw new Error("No submissions data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch challenge submissions"
    );
  }
});

// Create submission (submit code solution)
export const createSubmissionThunk = createAsyncThunk<
  SubmissionResult,
  CreateSubmissionRequest,
  { rejectValue: string }
>("submission/create", async (submissionData, { rejectWithValue }) => {
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

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to submit solution"
    );
  }
});

// Update submission
export const updateSubmissionThunk = createAsyncThunk<
  SubmissionResult,
  { id: string; data: UpdateSubmissionRequest },
  { rejectValue: string }
>("submission/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.put<ApiResponse<SubmissionResult>>(
        ROUTES_API_SUBMISSION.UPDATE(id),
        data
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to update submission");
    }

    if (!response.data.data) {
      throw new Error("No submission data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to update submission"
    );
  }
});

// Delete submission
export const deleteSubmissionThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("submission/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.delete<ApiResponse<string>>(ROUTES_API_SUBMISSION.DELETE(id))
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to delete submission");
    }

    return id;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete submission"
    );
  }
});