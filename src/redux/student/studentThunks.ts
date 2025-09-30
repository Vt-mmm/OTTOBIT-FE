import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_STUDENT } from "constants/routesApiKeys";
import {
  StudentResult,
  StudentsResponse,
  CreateStudentRequest,
  UpdateStudentRequest,
  GetStudentsRequest,
} from "common/@types/student";

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
      const status = axiosError.response?.status;
      if (status === 401 || status === 404) {
        break;
      }
    }
  }
  throw lastError;
}

// Get current user's student profile - OPTIMIZED: No retry, fast fail
export const getStudentByUserThunk = createAsyncThunk<
  StudentResult,
  void,
  { rejectValue: string }
>("student/getByUser", async (_, { rejectWithValue }) => {
  try {
    // Direct call without retry - fast fail for 404
    const response = await axiosClient.get<ApiResponse<StudentResult>>(
      ROUTES_API_STUDENT.GET_BY_USER,
      {
        timeout: 3000, // 3s timeout
      }
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch student profile");
    }

    if (!response.data.data) {
      throw new Error("No student data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    if (err.response?.status === 404) {
      return rejectWithValue("NO_STUDENT_PROFILE");
    }
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch student profile"
    );
  }
});

// Get students with pagination (Admin only)
export const getStudentsThunk = createAsyncThunk<
  StudentsResponse,
  GetStudentsRequest,
  { rejectValue: string }
>("student/getAll", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<StudentsResponse>>(
        ROUTES_API_STUDENT.GET_ALL,
        {
          params: request,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch students");
    }

    if (!response.data.data) {
      throw new Error("No students data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch students"
    );
  }
});

// Create student profile
export const createStudentThunk = createAsyncThunk<
  StudentResult,
  CreateStudentRequest,
  { rejectValue: string }
>("student/create", async (studentData, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<StudentResult>>(
        ROUTES_API_STUDENT.CREATE,
        studentData
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to create student");
    }

    if (!response.data.data) {
      throw new Error("No student data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to create student"
    );
  }
});

// Update student profile
export const updateStudentThunk = createAsyncThunk<
  StudentResult,
  { id: string; data: UpdateStudentRequest },
  { rejectValue: string }
>("student/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.put<ApiResponse<StudentResult>>(
        ROUTES_API_STUDENT.UPDATE(id),
        data
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to update student");
    }

    if (!response.data.data) {
      throw new Error("No student data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to update student"
    );
  }
});