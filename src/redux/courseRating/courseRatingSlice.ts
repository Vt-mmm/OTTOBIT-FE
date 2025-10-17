import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  CourseRatingResult,
  CourseRatingsResponse,
} from "common/models/CourseRating";
import {
  createCourseRating,
  updateCourseRating,
  deleteCourseRating,
  getMyCourseRating,
  getCourseRatings,
} from "./courseRatingThunks";

interface CourseRatingState {
  // Current user's rating for a course
  myRating: CourseRatingResult | null;
  
  // All ratings for a course (paginated)
  ratings: CourseRatingResult[];
  
  // Pagination info
  page: number;
  size: number;
  total: number;
  totalPages: number;
  
  // Loading states
  isLoadingMyRating: boolean;
  isLoadingRatings: boolean;
  isSubmitting: boolean;
  
  // Error states
  error: string | null;
  submitError: string | null;
}

const initialState: CourseRatingState = {
  myRating: null,
  ratings: [],
  page: 1,
  size: 10,
  total: 0,
  totalPages: 0,
  isLoadingMyRating: false,
  isLoadingRatings: false,
  isSubmitting: false,
  error: null,
  submitError: null,
};

const courseRatingSlice = createSlice({
  name: "courseRating",
  initialState,
  reducers: {
    setMessageSuccess: (_state, action: PayloadAction<string>) => {
      toast.success(action.payload);
    },
    setMessageError: (_state, action: PayloadAction<string>) => {
      toast.error(action.payload);
    },
    clearError: (state) => {
      state.error = null;
      state.submitError = null;
    },
    clearMyRating: (state) => {
      state.myRating = null;
    },
    clearRatings: (state) => {
      state.ratings = [];
      state.page = 1;
      state.total = 0;
      state.totalPages = 0;
    },
    resetCourseRatingState: () => initialState,
  },
  extraReducers: (builder) => {
    // Create rating
    builder.addCase(createCourseRating.pending, (state) => {
      state.isSubmitting = true;
      state.submitError = null;
    });
    builder.addCase(
      createCourseRating.fulfilled,
      (state, action: PayloadAction<CourseRatingResult>) => {
        state.isSubmitting = false;
        state.myRating = action.payload;
        // Add to ratings list if not already present
        if (!state.ratings.find((r) => r.id === action.payload.id)) {
          state.ratings.unshift(action.payload);
          state.total += 1;
        }
      }
    );
    builder.addCase(createCourseRating.rejected, (state, action) => {
      state.isSubmitting = false;
      state.submitError = action.payload as string;
    });

    // Update rating
    builder.addCase(updateCourseRating.pending, (state) => {
      state.isSubmitting = true;
      state.submitError = null;
    });
    builder.addCase(
      updateCourseRating.fulfilled,
      (state, action: PayloadAction<CourseRatingResult>) => {
        state.isSubmitting = false;
        state.myRating = action.payload;
        // Update in ratings list
        const index = state.ratings.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.ratings[index] = action.payload;
        }
      }
    );
    builder.addCase(updateCourseRating.rejected, (state, action) => {
      state.isSubmitting = false;
      state.submitError = action.payload as string;
    });

    // Delete rating
    builder.addCase(deleteCourseRating.pending, (state) => {
      state.isSubmitting = true;
      state.submitError = null;
    });
    builder.addCase(deleteCourseRating.fulfilled, (state, action) => {
      state.isSubmitting = false;
      state.myRating = null;
      // Remove from ratings list
      state.ratings = state.ratings.filter((r) => r.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    });
    builder.addCase(deleteCourseRating.rejected, (state, action) => {
      state.isSubmitting = false;
      state.submitError = action.payload as string;
    });

    // Get my rating
    builder.addCase(getMyCourseRating.pending, (state) => {
      state.isLoadingMyRating = true;
      state.error = null;
    });
    builder.addCase(
      getMyCourseRating.fulfilled,
      (state, action: PayloadAction<CourseRatingResult | null>) => {
        state.isLoadingMyRating = false;
        state.myRating = action.payload;
      }
    );
    builder.addCase(getMyCourseRating.rejected, (state, action) => {
      state.isLoadingMyRating = false;
      state.error = action.payload as string;
    });

    // Get course ratings (paginated)
    builder.addCase(getCourseRatings.pending, (state) => {
      state.isLoadingRatings = true;
      state.error = null;
    });
    builder.addCase(
      getCourseRatings.fulfilled,
      (state, action: PayloadAction<CourseRatingsResponse>) => {
        state.isLoadingRatings = false;
        state.ratings = action.payload.items;
        state.page = action.payload.page;
        state.size = action.payload.size;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      }
    );
    builder.addCase(getCourseRatings.rejected, (state, action) => {
      state.isLoadingRatings = false;
      state.error = action.payload as string;
    });
  },
});

export const { 
  setMessageSuccess, 
  setMessageError, 
  clearError, 
  clearMyRating, 
  clearRatings,
  resetCourseRatingState,
} = courseRatingSlice.actions;

export default courseRatingSlice.reducer;
