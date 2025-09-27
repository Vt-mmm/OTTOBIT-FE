import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_COURSE } from "constants/routesApiKeys";
import {
  CourseResult,
  CoursesResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  GetCoursesRequest,
} from "common/@types/course";
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

// Get courses with pagination (for users)
export const getCoursesThunk = createAsyncThunk<
  CoursesResponse,
  GetCoursesRequest,
  { rejectValue: string }
>("course/getAll", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<CoursesResponse>>(ROUTES_API_COURSE.GET_ALL, {
        params: request,
      })
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch courses"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No courses data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch courses"
    );
    return rejectWithValue(errorMessage);
  }
});

// Get courses with pagination (for admin)
export const getCoursesForAdminThunk = createAsyncThunk<
  CoursesResponse,
  GetCoursesRequest,
  { rejectValue: string }
>("course/getAllForAdmin", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<CoursesResponse>>(
        ROUTES_API_COURSE.GET_ALL_FOR_ADMIN,
        {
          params: request,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch courses"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No courses data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch courses"
    );
    return rejectWithValue(errorMessage);
  }
});

// Get course by ID (for users)
export const getCourseByIdThunk = createAsyncThunk<
  CourseResult,
  string,
  { rejectValue: string }
>("course/getById", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<CourseResult>>(
        ROUTES_API_COURSE.GET_BY_ID(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch course"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No course data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch course"
    );
    return rejectWithValue(errorMessage);
  }
});

// Get course by ID (for admin)
export const getCourseByIdForAdminThunk = createAsyncThunk<
  CourseResult,
  string,
  { rejectValue: string }
>("course/getByIdForAdmin", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<CourseResult>>(
        ROUTES_API_COURSE.GET_BY_ID_FOR_ADMIN(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch course"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No course data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch course"
    );
    return rejectWithValue(errorMessage);
  }
});

// Create course
export const createCourseThunk = createAsyncThunk<
  CourseResult,
  CreateCourseRequest,
  { rejectValue: string }
>("course/create", async (courseData, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<CourseResult>>(
        ROUTES_API_COURSE.CREATE,
        courseData
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to create course"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No course data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to create course"
    );
    return rejectWithValue(errorMessage);
  }
});

// Update course
export const updateCourseThunk = createAsyncThunk<
  CourseResult,
  { id: string; data: UpdateCourseRequest },
  { rejectValue: string }
>("course/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.put<ApiResponse<CourseResult>>(
        ROUTES_API_COURSE.UPDATE(id),
        data
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to update course"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No course data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to update course"
    );
    return rejectWithValue(errorMessage);
  }
});

// Delete course
export const deleteCourseThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("course/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.delete<ApiResponse<string>>(ROUTES_API_COURSE.DELETE(id))
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to delete course"
      );
      throw new Error(errorMessage);
    }

    return id;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to delete course"
    );
    return rejectWithValue(errorMessage);
  }
});

// Restore course
export const restoreCourseThunk = createAsyncThunk<
  CourseResult,
  string,
  { rejectValue: string }
>("course/restore", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<CourseResult>(ROUTES_API_COURSE.RESTORE(id))
    );

    // API restore trả về trực tiếp CourseResult, không wrap trong ApiResponse
    return response.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to restore course"
    );
    return rejectWithValue(errorMessage);
  }
});
