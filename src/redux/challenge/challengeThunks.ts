import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import {
  ROUTES_API_CHALLENGE,
  ROUTES_API_CHALLENGE_PROCESS,
} from "constants/routesApiKeys";
import {
  ChallengeResult,
  ChallengesResponse,
  CreateChallengeRequest,
  UpdateChallengeRequest,
  GetChallengesRequest,
  ChallengeProcessesResponse,
  GetChallengeProcessesRequest,
} from "common/@types/challenge";
import { extractApiErrorMessage } from "utils/errorHandler";

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

// Get challenges with pagination (admin only)
export const getChallengesThunk = createAsyncThunk<
  ChallengesResponse,
  GetChallengesRequest,
  { rejectValue: string }
>("challenge/getAll", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<ChallengesResponse>>(
        ROUTES_API_CHALLENGE.ADMIN_GET_ALL,
        {
          params: request,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch challenges"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No challenges data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch challenges"
    );
    return rejectWithValue(errorMessage);
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
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch challenge"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No challenge data received");
    }

    // Debug: Log the complete challenge response
    console.log("📊 Challenge API Response Debug:", {
      challengeId: id,
      responseStatus: response.status,
      hasData: !!response.data.data,
      dataKeys: Object.keys(response.data.data || {}),
      hasMapJson: !!(response.data.data as any)?.mapJson,
      mapJsonType: typeof (response.data.data as any)?.mapJson,
      mapJsonLength: (response.data.data as any)?.mapJson?.length || 0,
      mapJsonSample:
        (response.data.data as any)?.mapJson?.substring(0, 100) || "N/A",
      fullResponse: response.data,
    });

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch challenge"
    );
    return rejectWithValue(errorMessage);
  }
});

// Get challenges by lesson ID (for enrolled users)
export const getChallengesByLessonThunk = createAsyncThunk<
  ChallengesResponse,
  { lessonId: string; pageNumber?: number; pageSize?: number },
  { rejectValue: string }
>(
  "challenge/getByLesson",
  async ({ lessonId, pageNumber = 1, pageSize = 50 }, { rejectWithValue }) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.get<ApiResponse<ChallengesResponse>>(
          ROUTES_API_CHALLENGE.BY_LESSON(lessonId),
          {
            params: {
              pageNumber,
              pageSize,
            },
          }
        )
      );

      if (response.data.errors || response.data.errorCode) {
        const errorMessage = extractApiErrorMessage(
          { response: { data: response.data } },
          "Failed to fetch lesson challenges"
        );
        throw new Error(errorMessage);
      }

      if (!response.data.data) {
        throw new Error("No challenges data received");
      }

      return response.data.data;
    } catch (error: any) {
      const errorMessage = extractApiErrorMessage(
        error,
        "Failed to fetch lesson challenges"
      );
      return rejectWithValue(errorMessage);
    }
  }
);

// Get challenges by course ID (admin only)
export const getChallengesByCourseThunk = createAsyncThunk<
  ChallengesResponse,
  { courseId: string; pageNumber?: number; pageSize?: number },
  { rejectValue: string }
>(
  "challenge/getByCourse",
  async ({ courseId, pageNumber = 1, pageSize = 100 }, { rejectWithValue }) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.get<ApiResponse<ChallengesResponse>>(
          ROUTES_API_CHALLENGE.ADMIN_GET_ALL,
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
        const errorMessage = extractApiErrorMessage(
          { response: { data: response.data } },
          "Failed to fetch course challenges"
        );
        throw new Error(errorMessage);
      }

      if (!response.data.data) {
        throw new Error("No challenges data received");
      }

      return response.data.data;
    } catch (error: any) {
      const errorMessage = extractApiErrorMessage(
        error,
        "Failed to fetch course challenges"
      );
      return rejectWithValue(errorMessage);
    }
  }
);

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
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to create challenge"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No challenge data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to create challenge"
    );
    return rejectWithValue(errorMessage);
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
        ROUTES_API_CHALLENGE.ADMIN_UPDATE(id),
        data
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to update challenge"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No challenge data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to update challenge"
    );
    return rejectWithValue(errorMessage);
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
      axiosClient.delete<ApiResponse<string>>(
        ROUTES_API_CHALLENGE.ADMIN_DELETE(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to delete challenge"
      );
      throw new Error(errorMessage);
    }

    return id;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to delete challenge"
    );
    return rejectWithValue(errorMessage);
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
      axiosClient.post<ApiResponse<ChallengeResult>>(
        ROUTES_API_CHALLENGE.ADMIN_RESTORE(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to restore challenge"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No challenge data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to restore challenge"
    );
    return rejectWithValue(errorMessage);
  }
});

// Get challenge processes (user progress)
export const getChallengeProcessesThunk = createAsyncThunk<
  ChallengeProcessesResponse,
  GetChallengeProcessesRequest,
  { rejectValue: string }
>("challenge/getChallengeProcesses", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<ChallengeProcessesResponse>>(
        ROUTES_API_CHALLENGE_PROCESS.MY_CHALLENGES,
        {
          params: request,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch challenge processes"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No challenge process data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch challenge processes"
    );
    return rejectWithValue(errorMessage);
  }
});
