import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_COURSE_ROBOT } from "constants/routesApiKeys";
import {
  CourseRobotResult,
  CourseRobotsResponse,
  CreateCourseRobotRequest,
  UpdateCourseRobotRequest,
  GetCourseRobotsRequest,
} from "common/@types/courseRobot";

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

// Get CourseRobots (with filters)
export const getCourseRobotsThunk = createAsyncThunk<
  CourseRobotsResponse,
  GetCourseRobotsRequest
>("courseRobot/getCourseRobots", async (params, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get(ROUTES_API_COURSE_ROBOT.GET_ALL, { params })
    );
    return response.data.data || response.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch course robots"
    );
  }
});

// ========== ADMIN THUNKS ==========

// Get CourseRobots for Admin (with filters)
export const getCourseRobotsForAdminThunk = createAsyncThunk<
  CourseRobotsResponse,
  GetCourseRobotsRequest
>(
  "courseRobot/getCourseRobotsForAdmin",
  async (params, { rejectWithValue }) => {
    try {
      console.log("🔍 Fetching course robots for Admin with params:", params);
      const response = await callApiWithRetry(() =>
        axiosClient.get(ROUTES_API_COURSE_ROBOT.ADMIN_GET_ALL, { params })
      );
      console.log("✅ Admin CourseRobots fetched successfully:", response.data);
      return response.data.data || response.data;
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.error(
        "❌ Admin fetch failed:",
        err.response?.status,
        err.response?.data
      );
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch course robots for admin"
      );
    }
  }
);

// Get CourseRobot by ID for Admin
export const getCourseRobotByIdForAdminThunk = createAsyncThunk<
  CourseRobotResult,
  string
>("courseRobot/getCourseRobotByIdForAdmin", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get(ROUTES_API_COURSE_ROBOT.ADMIN_GET_BY_ID(id))
    );
    return response.data.data || response.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch course robot for admin"
    );
  }
});

// Get CourseRobots by Course ID
export const getCourseRobotsByCourseThunk = createAsyncThunk<
  CourseRobotResult[],
  string
>(
  "courseRobot/getCourseRobotsByCourse",
  async (courseId, { rejectWithValue }) => {
    try {
      // Try the specific endpoint first
      const response = await callApiWithRetry(() =>
        axiosClient.get(ROUTES_API_COURSE_ROBOT.GET_BY_COURSE(courseId))
      );
      return response.data.data || response.data;
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;

      // If 404, try fallback to GET_ALL with courseId filter
      if (err.response?.status === 404) {
        try {
          const fallbackResponse = await callApiWithRetry(() =>
            axiosClient.get(ROUTES_API_COURSE_ROBOT.GET_ALL, {
              params: { courseId, pageSize: 10 },
            })
          );
          const data = fallbackResponse.data.data || fallbackResponse.data;
          // Handle both array and paginated response
          return Array.isArray(data) ? data : data.items || [];
        } catch (fallbackError) {
          return rejectWithValue(
            "Backend chưa hỗ trợ API này. Vui lòng kiểm tra lại backend."
          );
        }
      }

      return rejectWithValue(
        err.response?.data?.message || "Không thể tải danh sách robots"
      );
    }
  }
);

// Get CourseRobot by ID
export const getCourseRobotByIdThunk = createAsyncThunk<
  CourseRobotResult,
  string
>("courseRobot/getCourseRobotById", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get(ROUTES_API_COURSE_ROBOT.GET_BY_ID(id))
    );
    return response.data.data || response.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch course robot"
    );
  }
});

// Create CourseRobot
export const createCourseRobotThunk = createAsyncThunk<
  CourseRobotResult,
  CreateCourseRobotRequest
>("courseRobot/createCourseRobot", async (data, { rejectWithValue }) => {
  try {
    console.log("📤 Creating CourseRobot with data:", data);
    const response = await axiosClient.post(
      ROUTES_API_COURSE_ROBOT.CREATE,
      data
    );
    console.log("✅ CourseRobot created successfully:", response.data);
    return response.data.data || response.data;
  } catch (error) {
    const err = error as AxiosError<any>;
    console.error("❌ Create CourseRobot failed:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message,
    });

    // Return detailed error message
    const errorMessage =
      err.response?.data?.message ||
      err.response?.data?.errorCode ||
      err.message ||
      "Failed to create course robot";

    return rejectWithValue(errorMessage);
  }
});

// Update CourseRobot
export const updateCourseRobotThunk = createAsyncThunk<
  CourseRobotResult,
  { id: string; data: UpdateCourseRobotRequest }
>(
  "courseRobot/updateCourseRobot",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(
        ROUTES_API_COURSE_ROBOT.UPDATE(id),
        data
      );
      return response.data.data || response.data;
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update course robot"
      );
    }
  }
);

// Delete CourseRobot
export const deleteCourseRobotThunk = createAsyncThunk<string, string>(
  "courseRobot/deleteCourseRobot",
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(ROUTES_API_COURSE_ROBOT.DELETE(id));
      return id;
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete course robot"
      );
    }
  }
);

// Restore CourseRobot
export const restoreCourseRobotThunk = createAsyncThunk<
  CourseRobotResult,
  string
>("courseRobot/restoreCourseRobot", async (id, { rejectWithValue }) => {
  try {
    console.log("🔄 Restoring CourseRobot with id:", id);
    const response = await callApiWithRetry(() =>
      axiosClient.post(ROUTES_API_COURSE_ROBOT.RESTORE(id))
    );
    console.log("✅ CourseRobot restored successfully:", response.data);
    return response.data.data || response.data;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error("❌ Restore CourseRobot failed:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message,
    });
    return rejectWithValue(
      err.response?.data?.message || "Failed to restore course robot"
    );
  }
});
