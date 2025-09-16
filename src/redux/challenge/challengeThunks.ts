import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_CHALLENGE } from "constants/routesApiKeys";
import {
  ChallengeResult,
  ChallengesResponse,
  CreateChallengeRequest,
  UpdateChallengeRequest,
  GetChallengesRequest,
} from "common/@types/challenge";

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

// Get challenges with pagination
export const getChallengesThunk = createAsyncThunk<
  ChallengesResponse,
  GetChallengesRequest,
  { rejectValue: string }
>("challenge/getAll", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<ChallengesResponse>>(
        ROUTES_API_CHALLENGE.GET_ALL,
        {
          params: request,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch challenges");
    }

    if (!response.data.data) {
      throw new Error("No challenges data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch challenges"
    );
  }
});

// Get challenge by ID
export const getChallengeByIdThunk = createAsyncThunk<
  ChallengeResult,
  string,
  { rejectValue: string }
>("challenge/getById", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<ChallengeResult>>(
        ROUTES_API_CHALLENGE.GET_BY_ID(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch challenge");
    }

    if (!response.data.data) {
      throw new Error("No challenge data received");
    }

    // Debug: Log the complete challenge response
    console.log('📊 Challenge API Response Debug:', {
      challengeId: id,
      responseStatus: response.status,
      hasData: !!response.data.data,
      dataKeys: Object.keys(response.data.data || {}),
      hasMapJson: !!(response.data.data as any)?.mapJson,
      mapJsonType: typeof (response.data.data as any)?.mapJson,
      mapJsonLength: (response.data.data as any)?.mapJson?.length || 0,
      mapJsonSample: (response.data.data as any)?.mapJson?.substring(0, 100) || 'N/A',
      fullResponse: response.data
    });

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch challenge"
    );
  }
});

// Get challenges by lesson ID
export const getChallengesByLessonThunk = createAsyncThunk<
  ChallengesResponse,
  { lessonId: string; pageNumber?: number; pageSize?: number },
  { rejectValue: string }
>("challenge/getByLesson", async ({ lessonId, pageNumber = 1, pageSize = 50 }, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<ChallengesResponse>>(
        ROUTES_API_CHALLENGE.GET_ALL,
        {
          params: {
            lessonId,
            pageNumber,
            pageSize,
          },
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch lesson challenges");
    }

    if (!response.data.data) {
      throw new Error("No challenges data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch lesson challenges"
    );
  }
});

// Get challenges by course ID
export const getChallengesByCourseThunk = createAsyncThunk<
  ChallengesResponse,
  { courseId: string; pageNumber?: number; pageSize?: number },
  { rejectValue: string }
>("challenge/getByCourse", async ({ courseId, pageNumber = 1, pageSize = 100 }, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<ChallengesResponse>>(
        ROUTES_API_CHALLENGE.GET_ALL,
        {
          params: {
            courseId,
            pageNumber,
            pageSize,
          },
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch course challenges");
    }

    if (!response.data.data) {
      throw new Error("No challenges data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch course challenges"
    );
  }
});

// Create challenge
export const createChallengeThunk = createAsyncThunk<
  ChallengeResult,
  CreateChallengeRequest,
  { rejectValue: string }
>("challenge/create", async (challengeData, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<ChallengeResult>>(
        ROUTES_API_CHALLENGE.CREATE,
        challengeData
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to create challenge");
    }

    if (!response.data.data) {
      throw new Error("No challenge data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to create challenge"
    );
  }
});

// Update challenge
export const updateChallengeThunk = createAsyncThunk<
  ChallengeResult,
  { id: string; data: UpdateChallengeRequest },
  { rejectValue: string }
>("challenge/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.put<ApiResponse<ChallengeResult>>(
        ROUTES_API_CHALLENGE.UPDATE(id),
        data
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to update challenge");
    }

    if (!response.data.data) {
      throw new Error("No challenge data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to update challenge"
    );
  }
});

// Delete challenge
export const deleteChallengeThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("challenge/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.delete<ApiResponse<string>>(ROUTES_API_CHALLENGE.DELETE(id))
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to delete challenge");
    }

    return id;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete challenge"
    );
  }
});

// Restore challenge
export const restoreChallengeThunk = createAsyncThunk<
  ChallengeResult,
  string,
  { rejectValue: string }
>("challenge/restore", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<ChallengeResult>>(ROUTES_API_CHALLENGE.RESTORE(id))
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to restore challenge");
    }

    if (!response.data.data) {
      throw new Error("No challenge data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to restore challenge"
    );
  }
});