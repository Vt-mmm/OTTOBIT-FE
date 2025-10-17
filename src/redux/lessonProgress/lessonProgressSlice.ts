import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { LessonProgressResponse } from "common/@types/lessonProgress";
import {
  getMyLessonProgressThunk,
  startLessonThunk,
} from "./lessonProgressThunks";

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

    // Toast actions
    setMessageSuccess: (_state, action: PayloadAction<string>) => {
      toast.success(action.payload);
    },
    setMessageError: (_state, action: PayloadAction<string>) => {
      toast.error(action.payload);
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
  setMessageSuccess,
  setMessageError,
} = lessonProgressSlice.actions;

// Export thunks for convenience
export { getMyLessonProgressThunk as getMyLessonProgress, startLessonThunk as startLesson };

export default lessonProgressSlice.reducer;
