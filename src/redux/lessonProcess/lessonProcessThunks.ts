import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_LESSON_PROCESS } from "constants/routesApiKeys";
import type { LessonProcessApiCallOptions } from "common/@types";

// Helper function for API calls with retry logic (same pattern as mapThunks)
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
      // Don't retry on 401 Unauthorized
      if (axiosError.response?.status === 401) {
        break;
      }
    }
  }
  throw lastError;
}

/**
 * Interface for backend API response structure
 */
interface ApiResponse<T> {
  message: string;
  data: T;
  errors?: string[] | null;
  errorCode?: string | null;
  timestamp?: string;
}

// ===== GET COMPLETED MAPS THUNK =====
/**
 * Thunk để lấy danh sách map IDs đã hoàn thành
 * Maps với BE endpoint: GET /api/v1/lesson-processes/completed
 */
export const fetchCompletedMapsThunk = createAsyncThunk<
  string[], // Return array of map IDs
  LessonProcessApiCallOptions | undefined,
  { rejectValue: string }
>("lessonProcess/fetchCompleted", async (options, { rejectWithValue }) => {
  try {
    const { skipCache, timeout } = options || {};

    const response = await callApiWithRetry(
      () =>
        axiosClient.get<ApiResponse<string[]>>(
          ROUTES_API_LESSON_PROCESS.GET_COMPLETED,
          {
            params: skipCache ? { skipCache: true } : {},
            timeout: timeout || 10000,
          }
        ),
      2 // Max retries
    );

    // Backend response structure: { message, data, errors, errorCode, timestamp }
    // Data is array of Guid strings (converted from C# Guid)
    
    // Check for errors first
    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch completed maps");
    }

    // Validate data exists
    if (!Array.isArray(response.data.data)) {
      throw new Error("Invalid response format: expected array of map IDs");
    }

    return response.data.data;
  } catch (error: any) {
    // Handle different error types
    if (error.response?.status === 401) {
      return rejectWithValue("Authentication required. Please login again.");
    }
    
    if (error.response?.status === 403) {
      return rejectWithValue("Access denied. Insufficient permissions.");
    }
    
    if (error.response?.status >= 500) {
      return rejectWithValue("Server error. Please try again later.");
    }

    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch completed maps";
    
    return rejectWithValue(errorMessage);
  }
});

// ===== MARK MAP COMPLETED THUNK =====
/**
 * Thunk để đánh dấu map là completed
 * Maps với BE endpoint: POST /api/v1/lesson-processes/complete
 */
export const markMapCompletedThunk = createAsyncThunk<
  { mapId: string; message: string }, // Return success with mapId and message
  string, // Input: mapId
  { rejectValue: string }
>("lessonProcess/markCompleted", async (mapId, { rejectWithValue }) => {
  try {
    // Validate input
    if (!mapId || typeof mapId !== "string") {
      throw new Error("Map ID is required and must be a string");
    }

    // Backend expects [FromBody] Guid mapId - send as JSON string (quoted)
    // C# Guid can parse from quoted string: "123e4567-e89b-12d3-a456-426614174000"
    
    const response = await callApiWithRetry(
      () =>
        axiosClient.post<ApiResponse<null>>(
          ROUTES_API_LESSON_PROCESS.MARK_COMPLETE,
          `"${mapId}"`, // Send as quoted string for Guid parsing
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        ),
      1 // Less retries for POST operations
    );

    // Backend returns Result.Ok("Marked as completed") or Result.Ok("Already completed")
    // Check for errors first
    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to mark map as completed");
    }

    return {
      mapId,
      message: response.data.message || "Map marked as completed",
    };
  } catch (error: any) {
    // Handle different error types
    if (error.response?.status === 401) {
      return rejectWithValue("Authentication required. Please login again.");
    }
    
    if (error.response?.status === 403) {
      return rejectWithValue("Access denied. Insufficient permissions.");
    }
    
    if (error.response?.status === 404) {
      return rejectWithValue("Map not found or user not found.");
    }
    
    if (error.response?.status >= 500) {
      return rejectWithValue("Server error. Please try again later.");
    }

    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to mark map as completed";
    
    return rejectWithValue(errorMessage);
  }
});

// ===== REFRESH COMPLETED MAPS THUNK =====
/**
 * Thunk để refresh completed maps (force fetch mới)
 */
export const refreshCompletedMapsThunk = createAsyncThunk<
  string[],
  void,
  { rejectValue: string }
>("lessonProcess/refreshCompleted", async (_, { dispatch, rejectWithValue }) => {
  try {
    // Force refresh với skipCache = true
    const result = await dispatch(
      fetchCompletedMapsThunk({ skipCache: true, timeout: 15000 })
    );

    if (fetchCompletedMapsThunk.fulfilled.match(result)) {
      return result.payload;
    } else {
      throw new Error("Failed to refresh completed maps");
    }
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to refresh completed maps";
    return rejectWithValue(errorMessage);
  }
});

// ===== BULK OPERATIONS THUNK =====
/**
 * Thunk để mark multiple maps as completed (if needed in future)
 */
export const markMultipleMapsCompletedThunk = createAsyncThunk<
  { completedMapIds: string[]; message: string },
  string[], // Array of map IDs
  { rejectValue: string }
>("lessonProcess/markMultipleCompleted", async (mapIds, { dispatch, rejectWithValue }) => {
  try {
    if (!Array.isArray(mapIds) || mapIds.length === 0) {
      throw new Error("Map IDs array is required and must not be empty");
    }

    const results: string[] = [];
    const errors: string[] = [];

    // Mark each map sequentially to avoid overloading the server
    for (const mapId of mapIds) {
      try {
        const result = await dispatch(markMapCompletedThunk(mapId));
        if (markMapCompletedThunk.fulfilled.match(result)) {
          results.push(mapId);
        } else {
          errors.push(`Failed to mark ${mapId}: ${result.payload}`);
        }
      } catch (error) {
        errors.push(`Failed to mark ${mapId}: ${error}`);
      }
    }

    // Silently handle partial failures - errors are included in return message

    return {
      completedMapIds: results,
      message: `Successfully marked ${results.length} maps as completed${
        errors.length > 0 ? ` (${errors.length} failed)` : ""
      }`,
    };
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to mark multiple maps as completed";
    return rejectWithValue(errorMessage);
  }
});