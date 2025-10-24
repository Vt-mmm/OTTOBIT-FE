import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EnrollmentResult, EnrollmentsResponse } from "common/@types/enrollment";
import {
  getMyEnrollmentsThunk,
  getEnrollmentsThunk,
  getEnrollmentByIdThunk,
  createEnrollmentThunk,
  completeEnrollmentThunk,
} from "./enrollmentThunks";

interface EnrollmentState {
  // My enrollments (current user)
  myEnrollments: {
    data: EnrollmentsResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // All enrollments (admin view)
  enrollments: {
    data: EnrollmentsResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // Current enrollment
  currentEnrollment: {
    data: EnrollmentResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Operations state
  operations: {
    isEnrolling: boolean;
    isCompleting: boolean;
    enrollError: string | null;
    completeError: string | null;
    // Yup-compatible error field for form validation
    enrollmentFieldErrors: {
      enrollmentError?: string;
    };
  };
}

const initialState: EnrollmentState = {
  myEnrollments: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  enrollments: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  currentEnrollment: {
    data: null,
    isLoading: false,
    error: null,
  },
  operations: {
    isEnrolling: false,
    isCompleting: false,
    enrollError: null,
    completeError: null,
    enrollmentFieldErrors: {},
  },
};

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState,
  reducers: {
    
    // Clear my enrollments
    clearMyEnrollments: (state) => {
      state.myEnrollments.data = null;
      state.myEnrollments.error = null;
      state.myEnrollments.lastQuery = null;
    },

    // Clear enrollments
    clearEnrollments: (state) => {
      state.enrollments.data = null;
      state.enrollments.error = null;
      state.enrollments.lastQuery = null;
    },

    // Clear current enrollment
    clearCurrentEnrollment: (state) => {
      state.currentEnrollment.data = null;
      state.currentEnrollment.error = null;
    },

    // Set current enrollment
    setCurrentEnrollment: (state, action: PayloadAction<EnrollmentResult>) => {
      state.currentEnrollment.data = action.payload;
      state.currentEnrollment.error = null;
    },

    // Clear all errors
    clearEnrollmentErrors: (state) => {
      state.myEnrollments.error = null;
      state.enrollments.error = null;
      state.currentEnrollment.error = null;
      state.operations.enrollError = null;
      state.operations.completeError = null;
      state.operations.enrollmentFieldErrors = {};
    },

    // Set enrollment field error (Yup-compatible)
    setEnrollmentFieldError: (
      state,
      action: PayloadAction<{ field: string; message: string }>
    ) => {
      state.operations.enrollmentFieldErrors[action.payload.field as keyof typeof state.operations.enrollmentFieldErrors] = action.payload.message;
    },

    // Clear enrollment field error
    clearEnrollmentFieldError: (state, action: PayloadAction<string>) => {
      delete state.operations.enrollmentFieldErrors[action.payload as keyof typeof state.operations.enrollmentFieldErrors];
    },

    // Update enrollment progress (optimistic update)
    updateEnrollmentProgress: (
      state,
      action: PayloadAction<{ id: string; progress: number }>
    ) => {
      const { id, progress } = action.payload;
      
      // Update in current enrollment
      if (state.currentEnrollment.data?.id === id) {
        state.currentEnrollment.data.progress = progress;
      }

      // Update in my enrollments
      if (state.myEnrollments.data?.items) {
        const enrollment = state.myEnrollments.data.items.find(e => e.id === id);
        if (enrollment) {
          enrollment.progress = progress;
        }
      }

      // Update in all enrollments
      if (state.enrollments.data?.items) {
        const enrollment = state.enrollments.data.items.find(e => e.id === id);
        if (enrollment) {
          enrollment.progress = progress;
        }
      }
    },

    // Reset entire state
    resetEnrollmentState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get my enrollments
      .addCase(getMyEnrollmentsThunk.pending, (state, action) => {
        state.myEnrollments.isLoading = true;
        state.myEnrollments.error = null;
        state.myEnrollments.lastQuery = action.meta.arg;
      })
      .addCase(getMyEnrollmentsThunk.fulfilled, (state, action) => {
        state.myEnrollments.isLoading = false;
        state.myEnrollments.error = null;
        state.myEnrollments.data = action.payload;
      })
      .addCase(getMyEnrollmentsThunk.rejected, (state, action) => {
        state.myEnrollments.isLoading = false;
        state.myEnrollments.error = action.payload || "Failed to fetch my enrollments";
      })

      // Get enrollments (admin)
      .addCase(getEnrollmentsThunk.pending, (state, action) => {
        state.enrollments.isLoading = true;
        state.enrollments.error = null;
        state.enrollments.lastQuery = action.meta.arg;
      })
      .addCase(getEnrollmentsThunk.fulfilled, (state, action) => {
        state.enrollments.isLoading = false;
        state.enrollments.error = null;
        state.enrollments.data = action.payload;
      })
      .addCase(getEnrollmentsThunk.rejected, (state, action) => {
        state.enrollments.isLoading = false;
        state.enrollments.error = action.payload || "Failed to fetch enrollments";
      })

      // Get enrollment by ID
      .addCase(getEnrollmentByIdThunk.pending, (state) => {
        state.currentEnrollment.isLoading = true;
        state.currentEnrollment.error = null;
      })
      .addCase(getEnrollmentByIdThunk.fulfilled, (state, action) => {
        state.currentEnrollment.isLoading = false;
        state.currentEnrollment.error = null;
        state.currentEnrollment.data = action.payload;
      })
      .addCase(getEnrollmentByIdThunk.rejected, (state, action) => {
        state.currentEnrollment.isLoading = false;
        state.currentEnrollment.error = action.payload || "Failed to fetch enrollment";
      })

      // Create enrollment (enroll in course)
      .addCase(createEnrollmentThunk.pending, (state) => {
        state.operations.isEnrolling = true;
        state.operations.enrollError = null;
      })
      .addCase(createEnrollmentThunk.fulfilled, (state, action) => {
        state.operations.isEnrolling = false;
        state.operations.enrollError = null;
        // Add to my enrollments if exists
        if (state.myEnrollments.data?.items) {
          state.myEnrollments.data.items.unshift(action.payload);
          state.myEnrollments.data.total += 1;
        }
      })
      .addCase(createEnrollmentThunk.rejected, (state, action) => {
        state.operations.isEnrolling = false;
        state.operations.enrollError = action.payload || "Failed to enroll in course";
      })

      // Complete enrollment
      .addCase(completeEnrollmentThunk.pending, (state) => {
        state.operations.isCompleting = true;
        state.operations.completeError = null;
      })
      .addCase(completeEnrollmentThunk.fulfilled, (state, action) => {
        state.operations.isCompleting = false;
        state.operations.completeError = null;
        
        // Update current enrollment if same ID
        if (state.currentEnrollment.data?.id === action.payload.id) {
          state.currentEnrollment.data = action.payload;
        }

        // Update in my enrollments
        if (state.myEnrollments.data?.items) {
          const index = state.myEnrollments.data.items.findIndex(
            (enrollment) => enrollment.id === action.payload.id
          );
          if (index !== -1) {
            state.myEnrollments.data.items[index] = action.payload;
          }
        }

        // Update in enrollments list
        if (state.enrollments.data?.items) {
          const index = state.enrollments.data.items.findIndex(
            (enrollment) => enrollment.id === action.payload.id
          );
          if (index !== -1) {
            state.enrollments.data.items[index] = action.payload;
          }
        }
      })
      .addCase(completeEnrollmentThunk.rejected, (state, action) => {
        state.operations.isCompleting = false;
        state.operations.completeError = action.payload || "Failed to complete enrollment";
      });
  },
});

export const {
  clearMyEnrollments,
  clearEnrollments,
  clearCurrentEnrollment,
  setCurrentEnrollment,
  clearEnrollmentErrors,
  setEnrollmentFieldError,
  clearEnrollmentFieldError,
  updateEnrollmentProgress,
  resetEnrollmentState,
} = enrollmentSlice.actions;

// Export thunks
export {
  getMyEnrollmentsThunk as getMyEnrollments,
  getEnrollmentsThunk as getEnrollments,
  getEnrollmentByIdThunk as getEnrollmentById,
  createEnrollmentThunk as createEnrollment,
  completeEnrollmentThunk as completeEnrollment,
};

const enrollmentReducer = enrollmentSlice.reducer;
export default enrollmentReducer;