import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_LESSON_PROGRESS } from "constants/routesApiKeys";
import {
  LessonProgressResult,
  LessonProgressResponse,
  GetLessonProgressRequest,
} from "common/@types/lessonProgress";

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

// Local action creators
const setMessageSuccess = (message: string) => ({
  type: "lessonProgress/setMessageSuccess",
  payload: message,
});

const setMessageError = (message: string) => ({
  type: "lessonProgress/setMessageError",
  payload: message,
});

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

// Get my lesson progress
export const getMyLessonProgressThunk = createAsyncThunk<
  LessonProgressResponse,
  GetLessonProgressRequest,
  { rejectValue: string }
>("lessonProgress/getMyProgress", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<LessonProgressResponse>>(
        ROUTES_API_LESSON_PROGRESS.MY_PROGRESS,
        {
          params: request,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch lesson progress");
    }

    if (!response.data.data) {
      throw new Error("No lesson progress data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch lesson progress"
    );
  }
});

// Start lesson
export const startLessonThunk = createAsyncThunk<
  LessonProgressResult,
  string, // lessonId
  { rejectValue: string }
>("lessonProgress/startLesson", async (lessonId, thunkAPI) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<LessonProgressResult>>(
        ROUTES_API_LESSON_PROGRESS.START_LESSON(lessonId)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to start lesson");
    }

    if (!response.data.data) {
      throw new Error("No lesson progress data received");
    }

    // Success toast
    thunkAPI.dispatch(setMessageSuccess("Đã bắt đầu bài học!"));

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    const errorMessage = err.response?.data?.message || "Failed to start lesson";

    // Error toast
    thunkAPI.dispatch(setMessageError(errorMessage));

    return thunkAPI.rejectWithValue(errorMessage);
  }
});
