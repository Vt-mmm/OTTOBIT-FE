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
      axiosClient.get<ApiResponse<MapsResponse>>(
        ROUTES_API_MAP.GET_ALL,
        {
          params: request,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch maps");
    }

    if (!response.data.data) {
      throw new Error("No maps data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch maps"
    );
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
      axiosClient.get<ApiResponse<MapResult>>(
        ROUTES_API_MAP.GET_BY_ID(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch map");
    }

    if (!response.data.data) {
      throw new Error("No map data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch map"
    );
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
      axiosClient.post<ApiResponse<MapResult>>(
        ROUTES_API_MAP.CREATE,
        mapData
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to create map");
    }

    if (!response.data.data) {
      throw new Error("No map data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to create map"
    );
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
      axiosClient.put<ApiResponse<MapResult>>(
        ROUTES_API_MAP.UPDATE(id),
        data
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to update map");
    }

    if (!response.data.data) {
      throw new Error("No map data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to update map"
    );
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
      throw new Error(response.data.message || "Failed to delete map");
    }

    return id;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete map"
    );
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
      throw new Error(response.data.message || "Failed to restore map");
    }

    if (!response.data.data) {
      throw new Error("No map data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to restore map"
    );
  }
});