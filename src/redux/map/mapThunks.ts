import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_MAP } from "constants/routesApiKeys";
import {
  MapsQuery,
  PaginatedMapResult,
  MapsGroupedByTypeResult,
  ApiResponse,
  MapApiCallOptions,
} from "features/phaser/types/map";

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
      const axiosError = error as any;
      if (axiosError.response?.status === 401) {
        break;
      }
    }
  }
  throw lastError;
}

// Thunk để lấy tất cả maps với pagination
export const fetchAllMapsThunk = createAsyncThunk<
  PaginatedMapResult,
  MapsQuery & MapApiCallOptions,
  { rejectValue: string }
>("map/fetchAll", async (query, { rejectWithValue }) => {
  try {
    const { skipCache, timeout, retries, ...queryParams } = query;

    const response = await callApiWithRetry(
      () =>
        axiosClient.get<ApiResponse<PaginatedMapResult>>(
          ROUTES_API_MAP.GET_ALL,
          {
            params: queryParams,
            timeout: timeout || 10000,
          }
        ),
      retries || 2
    );

    // Backend response structure: { message, data, errors, errorCode, timestamp }
    // Check for errors first
    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch maps");
    }

    if (!response.data.data) {
      throw new Error(response.data.message || "No data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch maps";
    return rejectWithValue(errorMessage);
  }
});

// Thunk để lấy lesson maps grouped by type
export const fetchLessonMapsThunk = createAsyncThunk<
  MapsGroupedByTypeResult,
  MapApiCallOptions | undefined,
  { rejectValue: string }
>("map/fetchLessonMaps", async (options, { rejectWithValue }) => {
  try {
    const { skipCache, timeout, retries } = options || {};

    const response = await callApiWithRetry(
      () =>
        axiosClient.get<ApiResponse<MapsGroupedByTypeResult>>(
          ROUTES_API_MAP.GET_LESSON_MAPS,
          {
            params: skipCache ? { skipCache: true } : {},
            timeout: timeout || 10000,
          }
        ),
      retries || 2
    );

    // Backend response structure: { message, data, errors, errorCode, timestamp }
    // Check for errors first
    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch lesson maps");
    }

    if (!response.data.data) {
      throw new Error(response.data.message || "No data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch lesson maps";
    return rejectWithValue(errorMessage);
  }
});

// Thunk để clear lesson maps cache
export const clearLessonMapsCacheThunk = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>("map/clearLessonMapsCache", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.delete<{ message: string }>(
      ROUTES_API_MAP.CLEAR_LESSON_CACHE
    );

    return response.data.message || "Cache cleared successfully";
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to clear cache";
    return rejectWithValue(errorMessage);
  }
});

// Thunk để refresh lesson maps (clear cache và fetch lại)
export const refreshLessonMapsThunk = createAsyncThunk<
  MapsGroupedByTypeResult,
  void,
  { rejectValue: string }
>("map/refreshLessonMaps", async (_, { dispatch, rejectWithValue }) => {
  try {
    // Clear cache first
    await dispatch(clearLessonMapsCacheThunk());

    // Then fetch fresh data
    const result = await dispatch(fetchLessonMapsThunk({ skipCache: true }));

    if (fetchLessonMapsThunk.fulfilled.match(result)) {
      return result.payload;
    } else {
      throw new Error("Failed to refresh lesson maps");
    }
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to refresh lesson maps";
    return rejectWithValue(errorMessage);
  }
});
