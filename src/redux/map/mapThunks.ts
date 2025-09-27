import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_MAP } from "constants/routesApiKeys";
import {
  MapResult,
  MapsResponse,
  CreateMapRequest,
  UpdateMapRequest,
  GetMapsRequest,
} from "common/@types/map";
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

// Get maps with pagination
export const getMapsThunk = createAsyncThunk<
  MapsResponse,
  GetMapsRequest,
  { rejectValue: string }
>("map/getAll", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<MapsResponse>>(ROUTES_API_MAP.GET_ALL, {
        params: request,
      })
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch maps"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No maps data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(error, "Failed to fetch maps");
    return rejectWithValue(errorMessage);
  }
});

// Get map by ID
export const getMapByIdThunk = createAsyncThunk<
  MapResult,
  string,
  { rejectValue: string }
>("map/getById", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<MapResult>>(ROUTES_API_MAP.GET_BY_ID(id))
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch map"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No map data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(error, "Failed to fetch map");
    return rejectWithValue(errorMessage);
  }
});

// Create map
export const createMapThunk = createAsyncThunk<
  MapResult,
  CreateMapRequest,
  { rejectValue: string }
>("map/create", async (mapData, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<MapResult>>(ROUTES_API_MAP.CREATE, mapData)
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to create map"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No map data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(error, "Failed to create map");
    return rejectWithValue(errorMessage);
  }
});

// Update map
export const updateMapThunk = createAsyncThunk<
  MapResult,
  { id: string; data: UpdateMapRequest },
  { rejectValue: string }
>("map/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.put<ApiResponse<MapResult>>(ROUTES_API_MAP.UPDATE(id), data)
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to update map"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No map data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(error, "Failed to update map");
    return rejectWithValue(errorMessage);
  }
});

// Delete map
export const deleteMapThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("map/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.delete<ApiResponse<string>>(ROUTES_API_MAP.DELETE(id))
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to delete map"
      );
      throw new Error(errorMessage);
    }

    return id;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(error, "Failed to delete map");
    return rejectWithValue(errorMessage);
  }
});

// Restore map
export const restoreMapThunk = createAsyncThunk<
  MapResult,
  string,
  { rejectValue: string }
>("map/restore", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<MapResult>>(ROUTES_API_MAP.RESTORE(id))
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to restore map"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No map data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(error, "Failed to restore map");
    return rejectWithValue(errorMessage);
  }
});
