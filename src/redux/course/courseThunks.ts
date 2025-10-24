import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_COURSE } from "constants/routesApiKeys";
import {
  CourseResult,
  CoursesResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  GetCoursesRequest,
} from "common/@types/course";
import { extractApiErrorMessage } from "utils/errorHandler";
import { setMessageSuccess, setMessageError } from "store/course/courseSlice";

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
      // Don't retry on 401 (unauthorized) or 404 (not found)
      if (
        axiosError.response?.status === 401 ||
        axiosError.response?.status === 404
      ) {
        break;
      }
    }
  }
  throw lastError;
}

// Get courses with pagination (for users)
export const getCoursesThunk = createAsyncThunk<
  CoursesResponse,
  GetCoursesRequest,
  { rejectValue: string }
>("course/getAll", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<CoursesResponse>>(ROUTES_API_COURSE.GET_ALL, {
        params: request,
      })
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch courses"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No courses data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch courses"
    );
    return rejectWithValue(errorMessage);
  }
});

// Get courses with pagination (for admin)
export const getCoursesForAdminThunk = createAsyncThunk<
  CoursesResponse,
  GetCoursesRequest,
  { rejectValue: string }
>("course/getAllForAdmin", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<CoursesResponse>>(
        ROUTES_API_COURSE.GET_ALL_FOR_ADMIN,
        {
          params: request,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch courses"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No courses data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch courses"
    );
    return rejectWithValue(errorMessage);
  }
});

// Get course by ID (for users)
export const getCourseByIdThunk = createAsyncThunk<
  CourseResult,
  string,
  { rejectValue: string }
>("course/getById", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<CourseResult>>(
        ROUTES_API_COURSE.GET_BY_ID(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch course"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No course data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch course"
    );
    return rejectWithValue(errorMessage);
  }
});

// Get course by ID (for admin)
export const getCourseByIdForAdminThunk = createAsyncThunk<
  CourseResult,
  string,
  { rejectValue: string }
>("course/getByIdForAdmin", async (id, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<CourseResult>>(
        ROUTES_API_COURSE.GET_BY_ID_FOR_ADMIN(id)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch course"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No course data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch course"
    );
    return rejectWithValue(errorMessage);
  }
});

// Create course
export const createCourseThunk = createAsyncThunk<
  CourseResult,
  CreateCourseRequest,
  { rejectValue: string }
>("course/create", async (courseData, { rejectWithValue, dispatch }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<CourseResult>>(
        ROUTES_API_COURSE.CREATE,
        courseData
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Không thể tạo khóa học"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No course data received");
    }

    dispatch(setMessageSuccess("Tạo khóa học thành công"));
    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Không thể tạo khóa học"
    );
    dispatch(setMessageError(errorMessage));
    return rejectWithValue(errorMessage);
  }
});

// Update course
export const updateCourseThunk = createAsyncThunk<
  CourseResult,
  { id: string; data: UpdateCourseRequest },
  { rejectValue: string }
>("course/update", async ({ id, data }, { rejectWithValue, dispatch }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.put<ApiResponse<CourseResult>>(
        ROUTES_API_COURSE.UPDATE(id),
        data
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Không thể cập nhật khóa học"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No course data received");
    }

    dispatch(setMessageSuccess("Cập nhật khóa học thành công"));
    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Không thể cập nhật khóa học"
    );
    dispatch(setMessageError(errorMessage));
    return rejectWithValue(errorMessage);
  }
});

// Delete course
export const deleteCourseThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("course/delete", async (id, { rejectWithValue, dispatch }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.delete<ApiResponse<string>>(ROUTES_API_COURSE.DELETE(id))
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Không thể xóa khóa học"
      );
      throw new Error(errorMessage);
    }

    dispatch(setMessageSuccess("Xóa khóa học thành công"));
    return id;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Không thể xóa khóa học"
    );
    dispatch(setMessageError(errorMessage));
    return rejectWithValue(errorMessage);
  }
});

// Restore course
export const restoreCourseThunk = createAsyncThunk<
  CourseResult,
  string,
  { rejectValue: string }
>("course/restore", async (id, { rejectWithValue, dispatch }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<CourseResult>(ROUTES_API_COURSE.RESTORE(id))
    );

    dispatch(setMessageSuccess("Khôi phục khóa học thành công"));
    // API restore trả về trực tiếp CourseResult, không wrap trong ApiResponse
    return response.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Không thể khôi phục khóa học"
    );
    dispatch(setMessageError(errorMessage));
    return rejectWithValue(errorMessage);
  }
});
