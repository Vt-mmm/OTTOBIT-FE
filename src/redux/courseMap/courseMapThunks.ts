import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_COURSE_MAP } from "constants/routesApiKeys";
import {
  CourseMapResult,
  CourseMapsResponse,
  CreateCourseMapRequest,
  UpdateCourseMapRequest,
  GetCourseMapsRequest,
} from "common/@types/courseMap";
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

// Get courseMaps with pagination
export const getCourseMapsThunk = createAsyncThunk<
  CourseMapsResponse,
  GetCourseMapsRequest,
  { rejectValue: string }
>("courseMap/getAll", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<CourseMapsResponse>>(ROUTES_API_COURSE_MAP.GET_ALL, {
        params: request,
      })
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch course maps"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No course maps data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch course maps"
    );
    return rejectWithValue(errorMessage);
  }
});

// Get courseMap by ID
export const getCourseMapByIdThunk = createAsyncThunk<
  CourseMapResult,
  string,
  { rejectValue: string }
>("courseMap/getById", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<CourseMapResult>>(
        ROUTES_API_COURSE_MAP.GET_BY_ID(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch course map"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No course map data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch course map"
    );
    return rejectWithValue(errorMessage);
  }
});

// Create courseMap
export const createCourseMapThunk = createAsyncThunk<
  CourseMapResult,
  CreateCourseMapRequest,
  { rejectValue: string }
>("courseMap/create", async (courseMapData, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<CourseMapResult>>(
        ROUTES_API_COURSE_MAP.CREATE,
        courseMapData
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to create course map"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No course map data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to create course map"
    );
    return rejectWithValue(errorMessage);
  }
});

// Update courseMap
export const updateCourseMapThunk = createAsyncThunk<
  CourseMapResult,
  { id: string; data: UpdateCourseMapRequest },
  { rejectValue: string }
>("courseMap/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.put<ApiResponse<CourseMapResult>>(
        ROUTES_API_COURSE_MAP.UPDATE(id),
        data
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to update course map"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No course map data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to update course map"
    );
    return rejectWithValue(errorMessage);
  }
});

// Delete courseMap
export const deleteCourseMapThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("courseMap/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.delete<ApiResponse<string>>(ROUTES_API_COURSE_MAP.DELETE(id))
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to delete course map"
      );
      throw new Error(errorMessage);
    }

    return id;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to delete course map"
    );
    return rejectWithValue(errorMessage);
  }
});

// Restore courseMap
export const restoreCourseMapThunk = createAsyncThunk<
  CourseMapResult,
  string,
  { rejectValue: string }
>("courseMap/restore", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<CourseMapResult>(ROUTES_API_COURSE_MAP.RESTORE(id))
    );

    // API restore trả về trực tiếp CourseMapResult, không wrap trong ApiResponse
    return response.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to restore course map"
    );
    return rejectWithValue(errorMessage);
  }
});
