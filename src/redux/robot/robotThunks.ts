import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_ROBOT } from "constants/routesApiKeys";
import {
  setMessageSuccess,
  setMessageError,
} from "./robotSlice";
import {
  RobotResult,
  RobotsResponse,
  CreateRobotRequest,
  UpdateRobotRequest,
  GetRobotsRequest,
} from "common/@types/robot";
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

// Get robots with pagination
export const getRobotsThunk = createAsyncThunk<
  RobotsResponse,
  GetRobotsRequest,
  { rejectValue: string }
>("robot/getAll", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<RobotsResponse>>(ROUTES_API_ROBOT.GET_ALL, {
        params: request,
      })
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch robots"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No robots data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch robots"
    );
    return rejectWithValue(errorMessage);
  }
});

// Get robot by ID
export const getRobotByIdThunk = createAsyncThunk<
  RobotResult,
  string,
  { rejectValue: string }
>("robot/getById", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<RobotResult>>(
        ROUTES_API_ROBOT.GET_BY_ID(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch robot"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No robot data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch robot"
    );
    return rejectWithValue(errorMessage);
  }
});

// Create robot
export const createRobotThunk = createAsyncThunk<
  RobotResult,
  CreateRobotRequest,
  { rejectValue: string }
>("robot/create", async (robotData, { rejectWithValue, dispatch }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<RobotResult>>(
        ROUTES_API_ROBOT.CREATE,
        robotData
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to create robot"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No robot data received");
    }

    dispatch(setMessageSuccess("Robot created successfully"));
    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to create robot"
    );
    dispatch(setMessageError(errorMessage));
    return rejectWithValue(errorMessage);
  }
});

// Update robot
export const updateRobotThunk = createAsyncThunk<
  RobotResult,
  { id: string; data: UpdateRobotRequest },
  { rejectValue: string }
>("robot/update", async ({ id, data }, { rejectWithValue, dispatch }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.put<ApiResponse<RobotResult>>(
        ROUTES_API_ROBOT.UPDATE(id),
        data
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to update robot"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No robot data received");
    }

    dispatch(setMessageSuccess("Robot updated successfully"));
    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to update robot"
    );
    dispatch(setMessageError(errorMessage));
    return rejectWithValue(errorMessage);
  }
});

// Delete robot
export const deleteRobotThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("robot/delete", async (id, { rejectWithValue, dispatch }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.delete<ApiResponse<string>>(ROUTES_API_ROBOT.DELETE(id))
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to delete robot"
      );
      throw new Error(errorMessage);
    }

    dispatch(setMessageSuccess("Robot deleted successfully"));
    return id;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to delete robot"
    );
    dispatch(setMessageError(errorMessage));
    return rejectWithValue(errorMessage);
  }
});

