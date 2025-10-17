import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";

// Local action creators to avoid circular dependency
const setMessageSuccess = (message: string) => ({
  type: "courseRating/setMessageSuccess",
  payload: message,
});

const setMessageError = (message: string) => ({
  type: "courseRating/setMessageError",
  payload: message,
});
import { ROUTES_API_COURSE_RATING } from "constants/routesApiKeys";
import {
  CourseRatingResult,
  CourseRatingsResponse,
  CreateCourseRatingRequest,
  UpdateCourseRatingRequest,
} from "common/models/CourseRating";

// API Response interface
interface ApiResponse<T = any> {
  message: string;
  data: T;
  errors: any[] | null;
  errorCode: string | null;
  timestamp: string;
}

// Error response interface
interface ErrorResponse {
  message: string;
  errors?: string[];
  errorCode?: string;
}

// Helper function for API calls with retry logic
// Only retry on network errors or 5xx server errors, NOT on 4xx client errors
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
      
      // Don't retry on 4xx client errors (validation, auth, etc) - fail fast
      if (status && status >= 400 && status < 500) {
        break;
      }
      
      // Don't retry if no response (network might be down permanently)
      if (!axiosError.response && attempt >= 1) {
        break;
      }
    }
  }
  throw lastError;
}

// Create course rating
export const createCourseRating = createAsyncThunk<
  CourseRatingResult,
  { courseId: string; data: CreateCourseRatingRequest },
  { rejectValue: string }
>("courseRating/create", async ({ courseId, data }, thunkAPI) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<CourseRatingResult>>(
        ROUTES_API_COURSE_RATING.CREATE(courseId),
        data
      )
    );

    if (!response.data || !response.data.data) {
      return thunkAPI.rejectWithValue("Động nhận được dữ liệu sau khi tạo đánh giá");
    }

    // Dispatch success toast
    thunkAPI.dispatch(setMessageSuccess("Đánh giá của bạn đã được gửi thành công!"));

    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ApiResponse<any>>;
    
    // Log để debug
    console.log('Create Rating Error - Full:', err);
    console.log('Create Rating Error - Response:', err.response);
    console.log('Create Rating Error - Data (direct):', (err as any).data);
    
    // AxiosError can have data at err.response.data OR directly at err.data (when unwrapped)
    const responseData = err.response?.data || (err as any).data;
    
    console.log('Extracted Response Data:', responseData);
    console.log('Message:', responseData?.message);
    
    // Try multiple paths to get error message
    const errorMessage =
      responseData?.message ||  // Standard API response: { message: "..." }
      (responseData as any)?.data?.message || // Nested: { data: { message: "..." } }
      (responseData as any)?.errors?.[0] || // Array of errors
      (typeof responseData === 'string' ? responseData : null) || // Plain string response
      err.message || // Axios error message
      "Tạo đánh giá thất bại. Vui lòng thử lại!";
      
    console.log('Final Error Message:', errorMessage);
    
    // Dispatch error toast
    thunkAPI.dispatch(setMessageError(errorMessage));
    
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Update course rating
export const updateCourseRating = createAsyncThunk<
  CourseRatingResult,
  { courseId: string; data: UpdateCourseRatingRequest },
  { rejectValue: string }
>("courseRating/update", async ({ courseId, data }, thunkAPI) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.put<ApiResponse<CourseRatingResult>>(
        ROUTES_API_COURSE_RATING.UPDATE(courseId),
        data
      )
    );

    if (!response.data || !response.data.data) {
      return thunkAPI.rejectWithValue("Động nhận được dữ liệu sau khi cập nhật đánh giá");
    }

    // Dispatch success toast
    thunkAPI.dispatch(setMessageSuccess("Đánh giá của bạn đã được cập nhật!"));

    return response.data.data;
  } catch (error) {
    const err = error as AxiosError<ApiResponse<any>>;
    
    // AxiosError can have data at err.response.data OR directly at err.data (when unwrapped)
    const responseData = err.response?.data || (err as any).data;
    
    console.log('Update Rating Error - Response Data:', responseData);
    
    const errorMessage =
      responseData?.message ||
      (responseData as any)?.data?.message ||
      (responseData as any)?.errors?.[0] ||
      (typeof responseData === 'string' ? responseData : null) ||
      err.message ||
      "Cập nhật đánh giá thất bại. Vui lòng thử lại!";
      
    console.log('Update Final Error Message:', errorMessage);
    
    // Dispatch error toast
    thunkAPI.dispatch(setMessageError(errorMessage));
    
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Delete course rating
export const deleteCourseRating = createAsyncThunk<
  string, // Return rating ID
  string, // courseId
  { rejectValue: string }
>("courseRating/delete", async (courseId, thunkAPI) => {
  try {
    await callApiWithRetry(() =>
      axiosClient.delete<ApiResponse>(
        ROUTES_API_COURSE_RATING.DELETE(courseId)
      )
    );

    // Dispatch success toast
    thunkAPI.dispatch(setMessageSuccess("Đã xóa đánh giá của bạn!"));
    
    // Return the rating ID to remove from state
    const state = thunkAPI.getState() as any;
    return state.courseRating.myRating?.id || "";
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Xóa đánh giá thất bại. Vui lòng thử lại!";
    
    // Dispatch error toast
    thunkAPI.dispatch(setMessageError(errorMessage));
    
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Get my course rating
export const getMyCourseRating = createAsyncThunk<
  CourseRatingResult | null,
  string, // courseId
  { rejectValue: string }
>("courseRating/getMine", async (courseId, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<CourseRatingResult | null>>(
        ROUTES_API_COURSE_RATING.GET_MINE(courseId)
      )
    );

    // Backend returns null if no rating found
    return response.data.data || null;
  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    // 401 means not authenticated - this is expected for public users
    if (err.response?.status === 401) {
      return null;
    }
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Lấy đánh giá thất bại";
    return rejectWithValue(errorMessage);
  }
});

// Get course ratings (paginated, public) - BE chỉ hỗ trợ page và size
export const getCourseRatings = createAsyncThunk<
  CourseRatingsResponse,
  { 
    courseId: string; 
    page?: number; 
    size?: number;
  },
  { rejectValue: string }
>(
  "courseRating/getByCourse",
  async ({ courseId, page = 1, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.get<ApiResponse<CourseRatingsResponse>>(
          ROUTES_API_COURSE_RATING.GET_BY_COURSE(courseId, page, size)
        )
      );

      if (!response.data || !response.data.data) {
        return rejectWithValue("Không nhận được danh sách đánh giá");
      }

      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Lấy danh sách đánh giá thất bại";
      return rejectWithValue(errorMessage);
    }
  }
);
