import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CourseResult, CoursesResponse } from "common/@types/course";
import {
  getCoursesThunk,
  getCourseByIdThunk,
  createCourseThunk,
  updateCourseThunk,
  deleteCourseThunk,
  restoreCourseThunk,
} from "./courseThunks";

interface CourseState {
  // Courses list
  courses: {
    data: CoursesResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // Current course
  currentCourse: {
    data: CourseResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Operations state
  operations: {
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    isRestoring: boolean;
    createError: string | null;
    updateError: string | null;
    deleteError: string | null;
    restoreError: string | null;
  };
}

const initialState: CourseState = {
  courses: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  currentCourse: {
    data: null,
    isLoading: false,
    error: null,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isRestoring: false,
    createError: null,
    updateError: null,
    deleteError: null,
    restoreError: null,
  },
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    // Clear courses list
    clearCourses: (state) => {
      state.courses.data = null;
      state.courses.error = null;
      state.courses.lastQuery = null;
    },

    // Clear current course
    clearCurrentCourse: (state) => {
      state.currentCourse.data = null;
      state.currentCourse.error = null;
    },

    // Set current course
    setCurrentCourse: (state, action: PayloadAction<CourseResult>) => {
      state.currentCourse.data = action.payload;
      state.currentCourse.error = null;
    },

    // Clear all errors
    clearCourseErrors: (state) => {
      state.courses.error = null;
      state.currentCourse.error = null;
      state.operations.createError = null;
      state.operations.updateError = null;
      state.operations.deleteError = null;
      state.operations.restoreError = null;
    },

    // Reset entire state
    resetCourseState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get courses
      .addCase(getCoursesThunk.pending, (state, action) => {
        state.courses.isLoading = true;
        state.courses.error = null;
        state.courses.lastQuery = action.meta.arg;
      })
      .addCase(getCoursesThunk.fulfilled, (state, action) => {
        state.courses.isLoading = false;
        state.courses.error = null;
        state.courses.data = action.payload;
      })
      .addCase(getCoursesThunk.rejected, (state, action) => {
        state.courses.isLoading = false;
        state.courses.error = action.payload || "Failed to fetch courses";
      })

      // Get course by ID
      .addCase(getCourseByIdThunk.pending, (state) => {
        state.currentCourse.isLoading = true;
        state.currentCourse.error = null;
      })
      .addCase(getCourseByIdThunk.fulfilled, (state, action) => {
        state.currentCourse.isLoading = false;
        state.currentCourse.error = null;
        state.currentCourse.data = action.payload;
      })
      .addCase(getCourseByIdThunk.rejected, (state, action) => {
        state.currentCourse.isLoading = false;
        state.currentCourse.error = action.payload || "Failed to fetch course";
      })

      // Create course
      .addCase(createCourseThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.operations.createError = null;
      })
      .addCase(createCourseThunk.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = null;
        // Add to courses list if exists
        if (state.courses.data?.data) {
          state.courses.data.data.unshift(action.payload);
          state.courses.data.totalCount += 1;
        }
      })
      .addCase(createCourseThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = action.payload || "Failed to create course";
      })

      // Update course
      .addCase(updateCourseThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.operations.updateError = null;
      })
      .addCase(updateCourseThunk.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = null;
        // Update current course if same ID
        if (state.currentCourse.data?.id === action.payload.id) {
          state.currentCourse.data = action.payload;
        }
        // Update in courses list if exists
        if (state.courses.data?.data) {
          const index = state.courses.data.data.findIndex(
            (course) => course.id === action.payload.id
          );
          if (index !== -1) {
            state.courses.data.data[index] = action.payload;
          }
        }
      })
      .addCase(updateCourseThunk.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = action.payload || "Failed to update course";
      })

      // Delete course
      .addCase(deleteCourseThunk.pending, (state) => {
        state.operations.isDeleting = true;
        state.operations.deleteError = null;
      })
      .addCase(deleteCourseThunk.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = null;
        // Remove from courses list if exists
        if (state.courses.data?.data) {
          const index = state.courses.data.data.findIndex(
            (course) => course.id === action.payload
          );
          if (index !== -1) {
            state.courses.data.data.splice(index, 1);
            state.courses.data.totalCount -= 1;
          }
        }
        // Clear current course if same ID
        if (state.currentCourse.data?.id === action.payload) {
          state.currentCourse.data = null;
        }
      })
      .addCase(deleteCourseThunk.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = action.payload || "Failed to delete course";
      })

      // Restore course
      .addCase(restoreCourseThunk.pending, (state) => {
        state.operations.isRestoring = true;
        state.operations.restoreError = null;
      })
      .addCase(restoreCourseThunk.fulfilled, (state, action) => {
        state.operations.isRestoring = false;
        state.operations.restoreError = null;
        // Add back to courses list if exists
        if (state.courses.data?.data) {
          state.courses.data.data.unshift(action.payload);
          state.courses.data.totalCount += 1;
        }
      })
      .addCase(restoreCourseThunk.rejected, (state, action) => {
        state.operations.isRestoring = false;
        state.operations.restoreError = action.payload || "Failed to restore course";
      });
  },
});

export const {
  clearCourses,
  clearCurrentCourse,
  setCurrentCourse,
  clearCourseErrors,
  resetCourseState,
} = courseSlice.actions;

// Export thunks
export {
  getCoursesThunk as getCourses,
  getCourseByIdThunk as getCourseById,
  createCourseThunk as createCourse,
  updateCourseThunk as updateCourse,
  deleteCourseThunk as deleteCourse,
  restoreCourseThunk as restoreCourse,
};

const courseReducer = courseSlice.reducer;
export default courseReducer;