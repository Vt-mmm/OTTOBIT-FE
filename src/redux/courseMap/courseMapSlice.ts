import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CourseMapResult, CourseMapsResponse } from "common/@types/courseMap";
import {
  getCourseMapsThunk,
  getCourseMapByIdThunk,
  createCourseMapThunk,
  updateCourseMapThunk,
  deleteCourseMapThunk,
  restoreCourseMapThunk,
} from "./courseMapThunks";

interface CourseMapState {
  // CourseMaps list
  courseMaps: {
    data: CourseMapsResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // Current courseMap
  currentCourseMap: {
    data: CourseMapResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Maps by course (for specific course view)
  mapsByCourse: {
    [courseId: string]: {
      data: CourseMapResult[] | null;
      isLoading: boolean;
      error: string | null;
    };
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
    createSuccess: boolean;
    updateSuccess: boolean;
    deleteSuccess: boolean;
    restoreSuccess: boolean;
  };
}

const initialState: CourseMapState = {
  courseMaps: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  currentCourseMap: {
    data: null,
    isLoading: false,
    error: null,
  },
  mapsByCourse: {},
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isRestoring: false,
    createError: null,
    updateError: null,
    deleteError: null,
    restoreError: null,
    createSuccess: false,
    updateSuccess: false,
    deleteSuccess: false,
    restoreSuccess: false,
  },
};

const courseMapSlice = createSlice({
  name: "courseMap",
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.courseMaps.error = null;
      state.currentCourseMap.error = null;
      state.operations.createError = null;
      state.operations.updateError = null;
      state.operations.deleteError = null;
      state.operations.restoreError = null;
    },
    // Clear success flags
    clearSuccessFlags: (state) => {
      state.operations.createSuccess = false;
      state.operations.updateSuccess = false;
      state.operations.deleteSuccess = false;
      state.operations.restoreSuccess = false;
    },
    // Clear current courseMap
    clearCurrentCourseMap: (state) => {
      state.currentCourseMap.data = null;
      state.currentCourseMap.error = null;
    },
    // Set current courseMap
    setCurrentCourseMap: (state, action: PayloadAction<CourseMapResult>) => {
      state.currentCourseMap.data = action.payload;
      state.currentCourseMap.error = null;
    },
    // Clear maps for specific course
    clearMapsByCourse: (state, action: PayloadAction<string>) => {
      delete state.mapsByCourse[action.payload];
    },
  },
  extraReducers: (builder) => {
    // Get CourseMaps
    builder
      .addCase(getCourseMapsThunk.pending, (state, action) => {
        state.courseMaps.isLoading = true;
        state.courseMaps.error = null;
        state.courseMaps.lastQuery = action.meta.arg;
        
        // Also update mapsByCourse if filtering by courseId
        const courseId = action.meta.arg.courseId;
        if (courseId) {
          if (!state.mapsByCourse[courseId]) {
            state.mapsByCourse[courseId] = { data: null, isLoading: false, error: null };
          }
          state.mapsByCourse[courseId].isLoading = true;
          state.mapsByCourse[courseId].error = null;
        }
      })
      .addCase(getCourseMapsThunk.fulfilled, (state, action) => {
        state.courseMaps.isLoading = false;
        state.courseMaps.data = action.payload;
        state.courseMaps.error = null;
        
        // Also update mapsByCourse if filtering by courseId
        const courseId = action.meta.arg.courseId;
        if (courseId && state.mapsByCourse[courseId]) {
          state.mapsByCourse[courseId].isLoading = false;
          state.mapsByCourse[courseId].data = action.payload.items;
          state.mapsByCourse[courseId].error = null;
        }
      })
      .addCase(getCourseMapsThunk.rejected, (state, action) => {
        state.courseMaps.isLoading = false;
        state.courseMaps.error = action.payload as string;
        
        // Also update mapsByCourse if filtering by courseId
        const courseId = action.meta.arg.courseId;
        if (courseId && state.mapsByCourse[courseId]) {
          state.mapsByCourse[courseId].isLoading = false;
          state.mapsByCourse[courseId].error = action.payload as string;
        }
      });

    // Get CourseMap By ID
    builder
      .addCase(getCourseMapByIdThunk.pending, (state) => {
        state.currentCourseMap.isLoading = true;
        state.currentCourseMap.error = null;
      })
      .addCase(getCourseMapByIdThunk.fulfilled, (state, action) => {
        state.currentCourseMap.isLoading = false;
        state.currentCourseMap.data = action.payload;
        state.currentCourseMap.error = null;
      })
      .addCase(getCourseMapByIdThunk.rejected, (state, action) => {
        state.currentCourseMap.isLoading = false;
        state.currentCourseMap.error = action.payload as string;
      });

    // Create CourseMap
    builder
      .addCase(createCourseMapThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.operations.createError = null;
        state.operations.createSuccess = false;
      })
      .addCase(createCourseMapThunk.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createSuccess = true;
        state.operations.createError = null;
        
        // Add new courseMap to the list if list exists
        if (state.courseMaps.data?.items) {
          state.courseMaps.data.items.unshift(action.payload);
          state.courseMaps.data.total += 1;
        }
        
        // Add to mapsByCourse if relevant
        const courseId = action.payload.courseId;
        if (state.mapsByCourse[courseId]?.data) {
          state.mapsByCourse[courseId].data!.unshift(action.payload);
        }
      })
      .addCase(createCourseMapThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = action.payload as string;
        state.operations.createSuccess = false;
      });

    // Update CourseMap
    builder
      .addCase(updateCourseMapThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.operations.updateError = null;
        state.operations.updateSuccess = false;
      })
      .addCase(updateCourseMapThunk.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateSuccess = true;
        state.operations.updateError = null;
        
        // Update current courseMap if it matches
        if (state.currentCourseMap.data?.id === action.payload.id) {
          state.currentCourseMap.data = action.payload;
        }
        
        // Update courseMap in the list if list exists
        if (state.courseMaps.data?.items) {
          const index = state.courseMaps.data.items.findIndex(
            (courseMap) => courseMap.id === action.payload.id
          );
          if (index !== -1) {
            state.courseMaps.data.items[index] = action.payload;
          }
        }
        
        // Update in mapsByCourse if relevant
        const courseId = action.payload.courseId;
        if (state.mapsByCourse[courseId]?.data) {
          const index = state.mapsByCourse[courseId].data!.findIndex(
            (courseMap) => courseMap.id === action.payload.id
          );
          if (index !== -1) {
            state.mapsByCourse[courseId].data![index] = action.payload;
          }
        }
      })
      .addCase(updateCourseMapThunk.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = action.payload as string;
        state.operations.updateSuccess = false;
      });

    // Delete CourseMap
    builder
      .addCase(deleteCourseMapThunk.pending, (state) => {
        state.operations.isDeleting = true;
        state.operations.deleteError = null;
        state.operations.deleteSuccess = false;
      })
      .addCase(deleteCourseMapThunk.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteSuccess = true;
        state.operations.deleteError = null;
        
        // Mark as deleted in the list instead of removing (soft delete)
        if (state.courseMaps.data?.items) {
          const index = state.courseMaps.data.items.findIndex(
            (courseMap) => courseMap.id === action.payload
          );
          if (index !== -1) {
            state.courseMaps.data.items[index].isDeleted = true;
          }
        }
        
        // Mark as deleted in mapsByCourse
        Object.values(state.mapsByCourse).forEach((courseData) => {
          if (courseData.data) {
            const index = courseData.data.findIndex(
              (courseMap) => courseMap.id === action.payload
            );
            if (index !== -1) {
              courseData.data[index].isDeleted = true;
            }
          }
        });
        
        // Mark current courseMap as deleted if it matches
        if (state.currentCourseMap.data?.id === action.payload) {
          state.currentCourseMap.data.isDeleted = true;
        }
      })
      .addCase(deleteCourseMapThunk.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = action.payload as string;
        state.operations.deleteSuccess = false;
      });

    // Restore CourseMap
    builder
      .addCase(restoreCourseMapThunk.pending, (state) => {
        state.operations.isRestoring = true;
        state.operations.restoreError = null;
        state.operations.restoreSuccess = false;
      })
      .addCase(restoreCourseMapThunk.fulfilled, (state, action) => {
        state.operations.isRestoring = false;
        state.operations.restoreSuccess = true;
        state.operations.restoreError = null;
        
        // Update current courseMap if it matches
        if (state.currentCourseMap.data?.id === action.payload.id) {
          state.currentCourseMap.data = action.payload;
        }
        
        // Update courseMap in the list if list exists
        if (state.courseMaps.data?.items) {
          const index = state.courseMaps.data.items.findIndex(
            (courseMap) => courseMap.id === action.payload.id
          );
          if (index !== -1) {
            state.courseMaps.data.items[index] = action.payload;
          }
        }
        
        // Update in mapsByCourse if relevant
        const courseId = action.payload.courseId;
        if (state.mapsByCourse[courseId]?.data) {
          const index = state.mapsByCourse[courseId].data!.findIndex(
            (courseMap) => courseMap.id === action.payload.id
          );
          if (index !== -1) {
            state.mapsByCourse[courseId].data![index] = action.payload;
          }
        }
      })
      .addCase(restoreCourseMapThunk.rejected, (state, action) => {
        state.operations.isRestoring = false;
        state.operations.restoreError = action.payload as string;
        state.operations.restoreSuccess = false;
      });
  },
});

export const {
  clearErrors,
  clearSuccessFlags,
  clearCurrentCourseMap,
  setCurrentCourseMap,
  clearMapsByCourse,
} = courseMapSlice.actions;

export default courseMapSlice.reducer;
