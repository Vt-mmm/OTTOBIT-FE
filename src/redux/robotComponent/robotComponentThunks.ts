import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_ROBOT_COMPONENT } from "constants/routesApiKeys";
import type {
  RobotComponent,
  RobotComponentsResponse,
  GetRobotComponentsRequest,
  CreateRobotComponentRequest,
  UpdateRobotComponentRequest,
} from "common/@types/robotComponent";

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

// Get all robot components (Public/User - returns non-deleted only)
export const getRobotComponentsThunk = createAsyncThunk<
  RobotComponentsResponse,
  GetRobotComponentsRequest | undefined
>("robotComponent/getRobotComponents", async (params, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get(ROUTES_API_ROBOT_COMPONENT.GET_ALL, {
        params,
      })
    );
    return response.data.data || response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to get robot components"
    );
  }
});

// Get all robot components for admin (Admin - can include deleted)
export const getRobotComponentsForAdminThunk = createAsyncThunk<
  RobotComponentsResponse,
  GetRobotComponentsRequest | undefined
>(
  "robotComponent/getRobotComponentsForAdmin",
  async (params, { rejectWithValue }) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.get(ROUTES_API_ROBOT_COMPONENT.ADMIN_GET_ALL, {
          params,
        })
      );
      return response.data.data || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to get robot components for admin"
      );
    }
  }
);

// Get single robot component by ID (Public/User)
export const getRobotComponentByIdThunk = createAsyncThunk<
  RobotComponent,
  string
>("robotComponent/getRobotComponentById", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get(ROUTES_API_ROBOT_COMPONENT.GET_BY_ID(id))
    );
    return response.data.data || response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to get robot component"
    );
  }
});

// Get single robot component by ID for admin (Admin)
export const getRobotComponentByIdForAdminThunk = createAsyncThunk<
  RobotComponent,
  string
>(
  "robotComponent/getRobotComponentByIdForAdmin",
  async (id, { rejectWithValue }) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.get(ROUTES_API_ROBOT_COMPONENT.ADMIN_GET_BY_ID(id))
      );
      return response.data.data || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to get robot component for admin"
      );
    }
  }
);

// Create new robot component (Admin only)
export const createRobotComponentThunk = createAsyncThunk<
  RobotComponent,
  CreateRobotComponentRequest
>("robotComponent/createRobotComponent", async (data, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post(ROUTES_API_ROBOT_COMPONENT.CREATE, data)
    );
    return response.data.data || response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create robot component"
    );
  }
});

// Update robot component (Admin only)
export const updateRobotComponentThunk = createAsyncThunk<
  RobotComponent,
  UpdateRobotComponentRequest
>("robotComponent/updateRobotComponent", async (data, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.put(ROUTES_API_ROBOT_COMPONENT.UPDATE(data.id), data)
    );
    return response.data.data || response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update robot component"
    );
  }
});

// Delete robot component (soft delete - Admin only)
export const deleteRobotComponentThunk = createAsyncThunk<string, string>(
  "robotComponent/deleteRobotComponent",
  async (id, { rejectWithValue }) => {
    try {
      await callApiWithRetry(() =>
        axiosClient.delete(ROUTES_API_ROBOT_COMPONENT.DELETE(id))
      );
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete robot component"
      );
    }
  }
);

// Restore deleted robot component (Admin only)
export const restoreRobotComponentThunk = createAsyncThunk<
  RobotComponent,
  string
>("robotComponent/restoreRobotComponent", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post(ROUTES_API_ROBOT_COMPONENT.RESTORE(id))
    );
    return response.data.data || response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to restore robot component"
    );
  }
});
