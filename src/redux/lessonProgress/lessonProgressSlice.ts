import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_LESSON_PROGRESS } from "constants/routesApiKeys";
import {
  LessonProgressResult,
  LessonProgressResponse,
  GetLessonProgressRequest,
} from "common/@types/lessonProgress";

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

// Get my lesson progress
export const getMyLessonProgressThunk = createAsyncThunk<
  LessonProgressResponse,
  GetLessonProgressRequest,
  { rejectValue: string }
>("lessonProgress/getMyProgress", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<LessonProgressResponse>>(
        ROUTES_API_LESSON_PROGRESS.MY_PROGRESS,
        {
          params: request,
        }
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to fetch lesson progress");
    }

    if (!response.data.data) {
      throw new Error("No lesson progress data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch lesson progress"
    );
  }
});

// Start lesson
export const startLessonThunk = createAsyncThunk<
  LessonProgressResult,
  string, // lessonId
  { rejectValue: string }
>("lessonProgress/startLesson", async (lessonId, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<LessonProgressResult>>(
        ROUTES_API_LESSON_PROGRESS.START_LESSON(lessonId)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      throw new Error(response.data.message || "Failed to start lesson");
    }

    if (!response.data.data) {
      throw new Error("No lesson progress data received");
    }

    return response.data.data;
  } catch (error: any) {
    const err = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to start lesson"
    );
  }
});

interface LessonProgressState {
  // My lesson progress
  myLessonProgress: {
    data: LessonProgressResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // Operations
  operations: {
    isStarting: boolean;
    startError: string | null;
  };
}

const initialState: LessonProgressState = {
  myLessonProgress: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  operations: {
    isStarting: false,
    startError: null,
  },
};

const lessonProgressSlice = createSlice({
  name: "lessonProgress",
  initialState,
  reducers: {
    // Clear lesson progress
    clearMyLessonProgress: (state) => {
      state.myLessonProgress.data = null;
      state.myLessonProgress.error = null;
      state.myLessonProgress.lastQuery = null;
    },

    // Clear errors
    clearLessonProgressErrors: (state) => {
      state.myLessonProgress.error = null;
      state.operations.startError = null;
    },

    // Reset state
    resetLessonProgressState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get my lesson progress
      .addCase(getMyLessonProgressThunk.pending, (state, action) => {
        state.myLessonProgress.isLoading = true;
        state.myLessonProgress.error = null;
        state.myLessonProgress.lastQuery = action.meta.arg;
      })
      .addCase(getMyLessonProgressThunk.fulfilled, (state, action) => {
        state.myLessonProgress.isLoading = false;
        state.myLessonProgress.error = null;
        state.myLessonProgress.data = action.payload;
      })
      .addCase(getMyLessonProgressThunk.rejected, (state, action) => {
        state.myLessonProgress.isLoading = false;
        state.myLessonProgress.error = action.payload || "Failed to fetch lesson progress";
      })

      // Start lesson
      .addCase(startLessonThunk.pending, (state) => {
        state.operations.isStarting = true;
        state.operations.startError = null;
      })
      .addCase(startLessonThunk.fulfilled, (state, action) => {
        state.operations.isStarting = false;
        state.operations.startError = null;
        // Add/update in progress list if exists
        if (state.myLessonProgress.data?.items) {
          const existingIndex = state.myLessonProgress.data.items.findIndex(
            (item) => item.lessonId === action.payload.lessonId
          );
          if (existingIndex !== -1) {
            state.myLessonProgress.data.items[existingIndex] = action.payload;
          } else {
            state.myLessonProgress.data.items.push(action.payload);
            state.myLessonProgress.data.total += 1;
          }
        }
      })
      .addCase(startLessonThunk.rejected, (state, action) => {
        state.operations.isStarting = false;
        state.operations.startError = action.payload || "Failed to start lesson";
      });
  },
});

export const {
  clearMyLessonProgress,
  clearLessonProgressErrors,
  resetLessonProgressState,
} = lessonProgressSlice.actions;

// Export thunks
export {
  getMyLessonProgressThunk as getMyLessonProgress,
  startLessonThunk as startLesson,
};

const lessonProgressReducer = lessonProgressSlice.reducer;
export default lessonProgressReducer;