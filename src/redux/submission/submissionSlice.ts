import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SubmissionResult, SubmissionsResponse } from "common/@types/submission";
import {
  getMySubmissionsThunk,
  getSubmissionsThunk,
  getSubmissionByIdThunk,
  getSubmissionsByChallengeThunk,
  createSubmissionThunk,
  updateSubmissionThunk,
  deleteSubmissionThunk,
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
  submissions: {
    data: SubmissionsResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // Challenge submissions (submissions for a specific challenge)
  challengeSubmissions: {
    data: SubmissionsResponse | null;
    isLoading: boolean;
    error: string | null;
    challengeId: string | null;
  };
  // Current submission
  currentSubmission: {
    data: SubmissionResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Operations state
  operations: {
    isSubmitting: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    submitError: string | null;
    updateError: string | null;
    deleteError: string | null;
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
  submissions: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  challengeSubmissions: {
    data: null,
    isLoading: false,
    error: null,
    challengeId: null,
  },
  currentSubmission: {
    data: null,
    isLoading: false,
    error: null,
  },
  operations: {
    isSubmitting: false,
    isUpdating: false,
    isDeleting: false,
    submitError: null,
    updateError: null,
    deleteError: null,
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

    // Clear submissions
    clearSubmissions: (state) => {
      state.submissions.data = null;
      state.submissions.error = null;
      state.submissions.lastQuery = null;
    },

    // Clear challenge submissions
    clearChallengeSubmissions: (state) => {
      state.challengeSubmissions.data = null;
      state.challengeSubmissions.error = null;
      state.challengeSubmissions.challengeId = null;
    },

    // Clear current submission
    clearCurrentSubmission: (state) => {
      state.currentSubmission.data = null;
      state.currentSubmission.error = null;
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

    // Load draft for specific challenge
    loadDraft: (
      state,
      action: PayloadAction<string>
    ) => {
      const challengeId = action.payload;
      if (state.draft.challengeId !== challengeId) {
        // If challengeId doesn't match, clear the current draft
        state.draft.challengeId = null;
        state.draft.codeJson = null;
        state.draft.lastSaved = null;
      }
      // The draft state is already in the correct state for the challengeId
    },

    // Clear all errors
    clearSubmissionErrors: (state) => {
      state.mySubmissions.error = null;
      state.submissions.error = null;
      state.challengeSubmissions.error = null;
      state.currentSubmission.error = null;
      state.operations.submitError = null;
      state.operations.updateError = null;
      state.operations.deleteError = null;
    },

    // Update submission star rating (optimistic update)
    updateSubmissionStar: (
      state,
      action: PayloadAction<{ id: string; star: number }>
    ) => {
      const { id, star } = action.payload;

      // Update in current submission
      if (state.currentSubmission.data?.id === id) {
        state.currentSubmission.data.star = star;
      }

      // Update in my submissions
      if (state.mySubmissions.data?.data) {
        const submission = state.mySubmissions.data.data.find(s => s.id === id);
        if (submission) {
          submission.star = star;
        }
      }

      // Update in all submissions
      if (state.submissions.data?.data) {
        const submission = state.submissions.data.data.find(s => s.id === id);
        if (submission) {
          submission.star = star;
        }
      }

      // Update in challenge submissions
      if (state.challengeSubmissions.data?.data) {
        const submission = state.challengeSubmissions.data.data.find(s => s.id === id);
        if (submission) {
          submission.star = star;
        }
      }
    },

    // Reset entire state
    resetSubmissionState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.mySubmissions.error = action.payload || "Failed to fetch my submissions";
      })

      // Get submissions (admin)
      .addCase(getSubmissionsThunk.pending, (state, action) => {
        state.submissions.isLoading = true;
        state.submissions.error = null;
        state.submissions.lastQuery = action.meta.arg;
      })
      .addCase(getSubmissionsThunk.fulfilled, (state, action) => {
        state.submissions.isLoading = false;
        state.submissions.error = null;
        state.submissions.data = action.payload;
      })
      .addCase(getSubmissionsThunk.rejected, (state, action) => {
        state.submissions.isLoading = false;
        state.submissions.error = action.payload || "Failed to fetch submissions";
      })

      // Get submission by ID
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
        state.currentSubmission.error = action.payload || "Failed to fetch submission";
      })

      // Get submissions by challenge
      .addCase(getSubmissionsByChallengeThunk.pending, (state, action) => {
        state.challengeSubmissions.isLoading = true;
        state.challengeSubmissions.error = null;
        state.challengeSubmissions.challengeId = action.meta.arg.challengeId;
      })
      .addCase(getSubmissionsByChallengeThunk.fulfilled, (state, action) => {
        state.challengeSubmissions.isLoading = false;
        state.challengeSubmissions.error = null;
        state.challengeSubmissions.data = action.payload;
      })
      .addCase(getSubmissionsByChallengeThunk.rejected, (state, action) => {
        state.challengeSubmissions.isLoading = false;
        state.challengeSubmissions.error = action.payload || "Failed to fetch challenge submissions";
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
        if (state.mySubmissions.data?.data) {
          state.mySubmissions.data.data.unshift(action.payload);
          state.mySubmissions.data.totalCount += 1;
        }

        // Add to challenge submissions if same challenge
        if (state.challengeSubmissions.challengeId === action.payload.challengeId && state.challengeSubmissions.data?.data) {
          state.challengeSubmissions.data.data.unshift(action.payload);
          state.challengeSubmissions.data.totalCount += 1;
        }
      })
      .addCase(createSubmissionThunk.rejected, (state, action) => {
        state.operations.isSubmitting = false;
        state.operations.submitError = action.payload || "Failed to submit solution";
      })

      // Update submission
      .addCase(updateSubmissionThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.operations.updateError = null;
      })
      .addCase(updateSubmissionThunk.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = null;

        // Update current submission if same ID
        if (state.currentSubmission.data?.id === action.payload.id) {
          state.currentSubmission.data = action.payload;
        }

        // Update in my submissions
        if (state.mySubmissions.data?.data) {
          const index = state.mySubmissions.data.data.findIndex(
            (submission) => submission.id === action.payload.id
          );
          if (index !== -1) {
            state.mySubmissions.data.data[index] = action.payload;
          }
        }

        // Update in all submissions
        if (state.submissions.data?.data) {
          const index = state.submissions.data.data.findIndex(
            (submission) => submission.id === action.payload.id
          );
          if (index !== -1) {
            state.submissions.data.data[index] = action.payload;
          }
        }

        // Update in challenge submissions
        if (state.challengeSubmissions.data?.data) {
          const index = state.challengeSubmissions.data.data.findIndex(
            (submission) => submission.id === action.payload.id
          );
          if (index !== -1) {
            state.challengeSubmissions.data.data[index] = action.payload;
          }
        }
      })
      .addCase(updateSubmissionThunk.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = action.payload || "Failed to update submission";
      })

      // Delete submission
      .addCase(deleteSubmissionThunk.pending, (state) => {
        state.operations.isDeleting = true;
        state.operations.deleteError = null;
      })
      .addCase(deleteSubmissionThunk.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = null;

        const submissionId = action.payload;

        // Clear current submission if same ID
        if (state.currentSubmission.data?.id === submissionId) {
          state.currentSubmission.data = null;
        }

        // Remove from my submissions
        if (state.mySubmissions.data?.data) {
          const index = state.mySubmissions.data.data.findIndex(
            (submission) => submission.id === submissionId
          );
          if (index !== -1) {
            state.mySubmissions.data.data.splice(index, 1);
            state.mySubmissions.data.totalCount -= 1;
          }
        }

        // Remove from all submissions
        if (state.submissions.data?.data) {
          const index = state.submissions.data.data.findIndex(
            (submission) => submission.id === submissionId
          );
          if (index !== -1) {
            state.submissions.data.data.splice(index, 1);
            state.submissions.data.totalCount -= 1;
          }
        }

        // Remove from challenge submissions
        if (state.challengeSubmissions.data?.data) {
          const index = state.challengeSubmissions.data.data.findIndex(
            (submission) => submission.id === submissionId
          );
          if (index !== -1) {
            state.challengeSubmissions.data.data.splice(index, 1);
            state.challengeSubmissions.data.totalCount -= 1;
          }
        }
      })
      .addCase(deleteSubmissionThunk.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = action.payload || "Failed to delete submission";
      });
  },
});

export const {
  clearMySubmissions,
  clearSubmissions,
  clearChallengeSubmissions,
  clearCurrentSubmission,
  setCurrentSubmission,
  saveDraft,
  clearDraft,
  loadDraft,
  clearSubmissionErrors,
  updateSubmissionStar,
  resetSubmissionState,
} = submissionSlice.actions;

// Export thunks
export {
  getMySubmissionsThunk as getMySubmissions,
  getSubmissionsThunk as getSubmissions,
  getSubmissionByIdThunk as getSubmissionById,
  getSubmissionsByChallengeThunk as getSubmissionsByChallenge,
  createSubmissionThunk as createSubmission,
  updateSubmissionThunk as updateSubmission,
  deleteSubmissionThunk as deleteSubmission,
};

const submissionReducer = submissionSlice.reducer;
export default submissionReducer;