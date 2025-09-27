import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import {
  ROUTES_API_LESSON,
  ROUTES_API_LESSON_PROGRESS,
} from "constants/routesApiKeys";
import { extractApiErrorMessage } from "utils/errorHandler";
import {
  LessonResult,
  LessonsResponse,
  LessonsPreviewResponse,
  CreateLessonRequest,
  UpdateLessonRequest,
  GetLessonsRequest,
  GetLessonsPreviewRequest,
  LessonProgressResponse,
  GetLessonProgressRequest,
  StartLessonRequest,
  LessonProgressResult,
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
      axiosClient.get<ApiResponse<LessonsResponse>>(ROUTES_API_LESSON.GET_ALL, {
        params: request,
      })
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
>(
  "lesson/getByCourse",
  async ({ courseId, pageNumber = 1, pageSize = 50 }, { rejectWithValue }) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.get<ApiResponse<LessonsResponse>>(
          ROUTES_API_LESSON.BY_COURSE(courseId),
          {
            params: {
              pageNumber,
              pageSize,
            },
          }
        )
      );

      if (response.data.errors || response.data.errorCode) {
        throw new Error(
          response.data.message || "Failed to fetch course lessons"
        );
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
  }
);

// Get lessons preview (for non-enrolled users)
export const getLessonsPreviewThunk = createAsyncThunk<
  LessonsPreviewResponse,
  GetLessonsPreviewRequest,
  { rejectValue: string }
>("lesson/getPreview", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<LessonsPreviewResponse>>(
        ROUTES_API_LESSON.PREVIEW,
        {
          params: request,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(
        response.data.message || "Failed to fetch lesson preview"
      );
    }

    if (!response.data.data) {
      throw new Error("No lesson preview data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch lesson preview"
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
      axiosClient.post<LessonResult>(ROUTES_API_LESSON.RESTORE(id))
    );

    // API restore trả về trực tiếp LessonResult, không wrap trong ApiResponse
    return response.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to restore lesson"
    );
    return rejectWithValue(errorMessage);
  }
});

// Get lesson progress (user progress)
export const getLessonProgressThunk = createAsyncThunk<
  LessonProgressResponse,
  GetLessonProgressRequest,
  { rejectValue: string }
>("lesson/getLessonProgress", async (request, { rejectWithValue }) => {
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
      throw new Error(
        response.data.message || "Failed to fetch lesson progress"
      );
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
  StartLessonRequest,
  { rejectValue: string }
>("lesson/startLesson", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<LessonProgressResult>>(
        ROUTES_API_LESSON_PROGRESS.START_LESSON(request.lessonId)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to start lesson");
    }

    if (!response.data.data) {
      throw new Error("No lesson progress data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to start lesson"
    );
  }
});
