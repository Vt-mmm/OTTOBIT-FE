import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  SubmissionResult,
  SubmissionsResponse,
} from "common/@types/submission";
import {
  getBestSubmissionsThunk,
  getMySubmissionsThunk,
  getSubmissionByIdThunk,
  createSubmissionThunk,
  getSubmissionsForAdminThunk,
  getSubmissionByIdForAdminThunk,
} from "./submissionThunks";

interface SubmissionState {
  // My submissions (current user)
  mySubmissions: {
    data: SubmissionsResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // All submissions (admin view)
  adminSubmissions: {
    data: SubmissionsResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // Current submission (user)
  currentSubmission: {
    data: SubmissionResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Admin submission detail
  adminSubmission: {
    data: SubmissionResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Operations state
  operations: {
    isSubmitting: boolean;
    submitError: string | null;
  };
  // Draft submission (for auto-save)
  draft: {
    challengeId: string | null;
    codeJson: string | null;
    lastSaved: number | null;
  };
}

const initialState: SubmissionState = {
  mySubmissions: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  adminSubmissions: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  currentSubmission: {
    data: null,
    isLoading: false,
    error: null,
  },
  adminSubmission: {
    data: null,
    isLoading: false,
    error: null,
  },
  operations: {
    isSubmitting: false,
    submitError: null,
  },
  draft: {
    challengeId: null,
    codeJson: null,
    lastSaved: null,
  },
};

const submissionSlice = createSlice({
  name: "submission",
  initialState,
  reducers: {
    // Clear my submissions
    clearMySubmissions: (state) => {
      state.mySubmissions.data = null;
      state.mySubmissions.error = null;
      state.mySubmissions.lastQuery = null;
    },

    // Clear admin submissions
    clearAdminSubmissions: (state) => {
      state.adminSubmissions.data = null;
      state.adminSubmissions.error = null;
      state.adminSubmissions.lastQuery = null;
    },

    // Clear current submission
    clearCurrentSubmission: (state) => {
      state.currentSubmission.data = null;
      state.currentSubmission.error = null;
    },

    // Clear admin submission detail
    clearAdminSubmission: (state) => {
      state.adminSubmission.data = null;
      state.adminSubmission.error = null;
    },

    // Set current submission
    setCurrentSubmission: (state, action: PayloadAction<SubmissionResult>) => {
      state.currentSubmission.data = action.payload;
      state.currentSubmission.error = null;
    },

    // Save draft submission (auto-save functionality)
    saveDraft: (
      state,
      action: PayloadAction<{ challengeId: string; codeJson: string }>
    ) => {
      state.draft.challengeId = action.payload.challengeId;
      state.draft.codeJson = action.payload.codeJson;
      state.draft.lastSaved = Date.now();
    },

    // Clear draft
    clearDraft: (state) => {
      state.draft.challengeId = null;
      state.draft.codeJson = null;
      state.draft.lastSaved = null;
    },

    // Clear all errors
    clearSubmissionErrors: (state) => {
      state.mySubmissions.error = null;
      state.adminSubmissions.error = null;
      state.currentSubmission.error = null;
      state.adminSubmission.error = null;
      state.operations.submitError = null;
    },

    // Reset entire state
    resetSubmissionState: () => {
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
      // Get best submissions (highest star per challenge)
      .addCase(getBestSubmissionsThunk.pending, (state, action) => {
        state.mySubmissions.isLoading = true;
        state.mySubmissions.error = null;
        state.mySubmissions.lastQuery = action.meta.arg;
      })
      .addCase(getBestSubmissionsThunk.fulfilled, (state, action) => {
        state.mySubmissions.isLoading = false;
        state.mySubmissions.error = null;
        // Convert array to SubmissionsResponse format for compatibility
        state.mySubmissions.data = {
          items: action.payload,
          page: 1,
          size: action.payload.length,
          total: action.payload.length,
          totalPages: 1,
        };
      })
      .addCase(getBestSubmissionsThunk.rejected, (state, action) => {
        state.mySubmissions.isLoading = false;
        state.mySubmissions.error =
          action.payload || "Failed to fetch best submissions";
      })

      // Get my submissions
      .addCase(getMySubmissionsThunk.pending, (state, action) => {
        state.mySubmissions.isLoading = true;
        state.mySubmissions.error = null;
        state.mySubmissions.lastQuery = action.meta.arg;
      })
      .addCase(getMySubmissionsThunk.fulfilled, (state, action) => {
        state.mySubmissions.isLoading = false;
        state.mySubmissions.error = null;
        state.mySubmissions.data = action.payload;
      })
      .addCase(getMySubmissionsThunk.rejected, (state, action) => {
        state.mySubmissions.isLoading = false;
        state.mySubmissions.error =
          action.payload || "Failed to fetch my submissions";
      })

      // Get submission by ID (User)
      .addCase(getSubmissionByIdThunk.pending, (state) => {
        state.currentSubmission.isLoading = true;
        state.currentSubmission.error = null;
      })
      .addCase(getSubmissionByIdThunk.fulfilled, (state, action) => {
        state.currentSubmission.isLoading = false;
        state.currentSubmission.error = null;
        state.currentSubmission.data = action.payload;
      })
      .addCase(getSubmissionByIdThunk.rejected, (state, action) => {
        state.currentSubmission.isLoading = false;
        state.currentSubmission.error =
          action.payload || "Failed to fetch submission";
      })

      // Create submission (submit code)
      .addCase(createSubmissionThunk.pending, (state) => {
        state.operations.isSubmitting = true;
        state.operations.submitError = null;
      })
      .addCase(createSubmissionThunk.fulfilled, (state, action) => {
        state.operations.isSubmitting = false;
        state.operations.submitError = null;

        // Clear draft for this challenge
        if (state.draft.challengeId === action.payload.challengeId) {
          state.draft.challengeId = null;
          state.draft.codeJson = null;
          state.draft.lastSaved = null;
        }

        // Add to my submissions if exists
        if (state.mySubmissions.data?.items) {
          state.mySubmissions.data.items.unshift(action.payload);
          state.mySubmissions.data.total += 1;
        }
      })
      .addCase(createSubmissionThunk.rejected, (state, action) => {
        state.operations.isSubmitting = false;
        state.operations.submitError =
          action.payload || "Failed to submit solution";
      })

      // Get submissions for Admin (paginated with filters)
      .addCase(getSubmissionsForAdminThunk.pending, (state, action) => {
        state.adminSubmissions.isLoading = true;
        state.adminSubmissions.error = null;
        state.adminSubmissions.lastQuery = action.meta.arg;
      })
      .addCase(getSubmissionsForAdminThunk.fulfilled, (state, action) => {
        state.adminSubmissions.isLoading = false;
        state.adminSubmissions.error = null;
        state.adminSubmissions.data = action.payload;
      })
      .addCase(getSubmissionsForAdminThunk.rejected, (state, action) => {
        state.adminSubmissions.isLoading = false;
        state.adminSubmissions.error =
          action.payload || "Failed to fetch submissions";
      })

      // Get submission by ID for Admin
      .addCase(getSubmissionByIdForAdminThunk.pending, (state) => {
        state.adminSubmission.isLoading = true;
        state.adminSubmission.error = null;
      })
      .addCase(getSubmissionByIdForAdminThunk.fulfilled, (state, action) => {
        state.adminSubmission.isLoading = false;
        state.adminSubmission.error = null;
        state.adminSubmission.data = action.payload;
      })
      .addCase(getSubmissionByIdForAdminThunk.rejected, (state, action) => {
        state.adminSubmission.isLoading = false;
        state.adminSubmission.error =
          action.payload || "Failed to fetch submission";
      });
  },
});

export const {
  clearMySubmissions,
  clearAdminSubmissions,
  clearCurrentSubmission,
  clearAdminSubmission,
  setCurrentSubmission,
  saveDraft,
  clearDraft,
  clearSubmissionErrors,
  resetSubmissionState,
  setMessageSuccess,
  setMessageError,
} = submissionSlice.actions;

const submissionReducer = submissionSlice.reducer;
export default submissionReducer;
