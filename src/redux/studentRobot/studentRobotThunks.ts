import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_STUDENT_ROBOT, ROUTES_API_ACTIVATION_CODE } from "constants/routesApiKeys";
import {
  StudentRobotResult,
  UpdateStudentRobotSettingsRequest,
} from "common/@types/studentRobot";
import {
  ActivateRobotRequest,
  ActivateRobotResponse,
} from "common/@types/activationCode";

interface ErrorResponse {
  message: string;
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

// Get My Robots (User's activated robots)
export const getMyRobotsThunk = createAsyncThunk<StudentRobotResult[]>(
  "studentRobot/getMyRobots",
  async (_, { rejectWithValue }) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.get(ROUTES_API_STUDENT_ROBOT.MY_ROBOTS)
      );
      return response.data.data || response.data;
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch my robots"
      );
    }
  }
);

// Activate Robot with Activation Code
export const activateRobotThunk = createAsyncThunk<
  ActivateRobotResponse,
  ActivateRobotRequest
>("studentRobot/activateRobot", async (data, { rejectWithValue }) => {
  try {
    console.log("🔑 Activating robot with code:", { code: data.activationCode?.substring(0, 4) + "..." });
    // ✅ Use correct endpoint: /api/v1/activation-codes/redeem
    const response = await axiosClient.post(
      ROUTES_API_ACTIVATION_CODE.REDEEM,
      { code: data.activationCode }
    );
    console.log("✅ Robot activated successfully");
    return response.data.data || response.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Activation failed:", err.response?.data);
    return rejectWithValue(
      err.response?.data?.message || "Failed to activate robot"
    );
  }
});

// Update Student Robot Settings (custom name, color, etc.)
export const updateStudentRobotSettingsThunk = createAsyncThunk<
  StudentRobotResult,
  { id: string; data: UpdateStudentRobotSettingsRequest }
>(
  "studentRobot/updateSettings",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(
        ROUTES_API_STUDENT_ROBOT.UPDATE_SETTINGS(id),
        data
      );
      return response.data.data || response.data;
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update robot settings"
      );
    }
  }
);

// Get Student Robot By ID
export const getStudentRobotByIdThunk = createAsyncThunk<
  StudentRobotResult,
  string
>("studentRobot/getById", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get(ROUTES_API_STUDENT_ROBOT.GET_BY_ID(id))
    );
    return response.data.data || response.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch student robot"
    );
  }
});