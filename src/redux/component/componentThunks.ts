import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_COMPONENT } from "constants/routesApiKeys";
import {
  ComponentResult,
  ComponentsResponse,
  CreateComponentRequest,
  UpdateComponentRequest,
  GetComponentsRequest,
} from "common/@types/component";
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

// Get components with pagination
export const getComponentsThunk = createAsyncThunk<
  ComponentsResponse,
  GetComponentsRequest,
  { rejectValue: string }
>("component/getAll", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<ComponentsResponse>>(ROUTES_API_COMPONENT.GET_ALL, {
        params: request,
      })
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch components"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No components data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch components"
    );
    return rejectWithValue(errorMessage);
  }
});

// Get component by ID
export const getComponentByIdThunk = createAsyncThunk<
  ComponentResult,
  string,
  { rejectValue: string }
>("component/getById", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<ComponentResult>>(
        ROUTES_API_COMPONENT.GET_BY_ID(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch component"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No component data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch component"
    );
    return rejectWithValue(errorMessage);
  }
});

// Create component
export const createComponentThunk = createAsyncThunk<
  ComponentResult,
  CreateComponentRequest,
  { rejectValue: string }
>("component/create", async (componentData, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<ComponentResult>>(
        ROUTES_API_COMPONENT.CREATE,
        componentData
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to create component"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No component data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to create component"
    );
    return rejectWithValue(errorMessage);
  }
});

// Update component
export const updateComponentThunk = createAsyncThunk<
  ComponentResult,
  { id: string; data: UpdateComponentRequest },
  { rejectValue: string }
>("component/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.put<ApiResponse<ComponentResult>>(
        ROUTES_API_COMPONENT.UPDATE(id),
        data
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to update component"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No component data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to update component"
    );
    return rejectWithValue(errorMessage);
  }
});

// Delete component
export const deleteComponentThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("component/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.delete<ApiResponse<string>>(ROUTES_API_COMPONENT.DELETE(id))
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to delete component"
      );
      throw new Error(errorMessage);
    }

    return id;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to delete component"
    );
    return rejectWithValue(errorMessage);
  }
});
