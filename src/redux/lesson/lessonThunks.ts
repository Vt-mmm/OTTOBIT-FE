import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_LESSON } from "constants/routesApiKeys";
import {
  LessonResult,
  LessonsResponse,
  CreateLessonRequest,
  UpdateLessonRequest,
  GetLessonsRequest,
} from "common/@types/lesson";

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

// Get lessons with pagination
export const getLessonsThunk = createAsyncThunk<
  LessonsResponse,
  GetLessonsRequest,
  { rejectValue: string }
>("lesson/getAll", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<LessonsResponse>>(
        ROUTES_API_LESSON.GET_ALL,
        {
          params: request,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch lessons");
    }

    if (!response.data.data) {
      throw new Error("No lessons data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch lessons"
    );
  }
});

// Get lesson by ID
export const getLessonByIdThunk = createAsyncThunk<
  LessonResult,
  string,
  { rejectValue: string }
>("lesson/getById", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<LessonResult>>(
        ROUTES_API_LESSON.GET_BY_ID(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch lesson");
    }

    if (!response.data.data) {
      throw new Error("No lesson data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch lesson"
    );
  }
});

// Get lessons by course ID
export const getLessonsByCourseThunk = createAsyncThunk<
  LessonsResponse,
  { courseId: string; pageNumber?: number; pageSize?: number },
  { rejectValue: string }
>("lesson/getByCourse", async ({ courseId, pageNumber = 1, pageSize = 50 }, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<LessonsResponse>>(
        ROUTES_API_LESSON.GET_ALL,
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
      throw new Error(response.data.message || "Failed to fetch course lessons");
    }

    if (!response.data.data) {
      throw new Error("No lessons data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch course lessons"
    );
  }
});

// Create lesson
export const createLessonThunk = createAsyncThunk<
  LessonResult,
  CreateLessonRequest,
  { rejectValue: string }
>("lesson/create", async (lessonData, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<LessonResult>>(
        ROUTES_API_LESSON.CREATE,
        lessonData
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to create lesson");
    }

    if (!response.data.data) {
      throw new Error("No lesson data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to create lesson"
    );
  }
});

// Update lesson
export const updateLessonThunk = createAsyncThunk<
  LessonResult,
  { id: string; data: UpdateLessonRequest },
  { rejectValue: string }
>("lesson/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.put<ApiResponse<LessonResult>>(
        ROUTES_API_LESSON.UPDATE(id),
        data
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to update lesson");
    }

    if (!response.data.data) {
      throw new Error("No lesson data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to update lesson"
    );
  }
});

// Delete lesson
export const deleteLessonThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("lesson/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.delete<ApiResponse<string>>(ROUTES_API_LESSON.DELETE(id))
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to delete lesson");
    }

    return id;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete lesson"
    );
  }
});

// Restore lesson
export const restoreLessonThunk = createAsyncThunk<
  LessonResult,
  string,
  { rejectValue: string }
>("lesson/restore", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<LessonResult>>(ROUTES_API_LESSON.RESTORE(id))
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to restore lesson");
    }

    if (!response.data.data) {
      throw new Error("No lesson data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to restore lesson"
    );
  }
});