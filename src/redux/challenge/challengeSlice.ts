import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChallengeResult, ChallengesResponse } from "common/@types/challenge";
import {
  getChallengesThunk,
  getChallengeByIdThunk,
  getChallengesByLessonThunk,
  createChallengeThunk,
  updateChallengeThunk,
  deleteChallengeThunk,
  restoreChallengeThunk,
} from "./challengeThunks";

interface ChallengeState {
  challenges: {
    data: ChallengesResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  lessonChallenges: {
    data: ChallengesResponse | null;
    isLoading: boolean;
    error: string | null;
    lessonId: string | null;
  };
  currentChallenge: {
    data: ChallengeResult | null;
    isLoading: boolean;
    error: string | null;
  };
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
  solving: {
    isActive: boolean;
    timeStarted: number | null;
    timeElapsed: number;
    attemptCount: number;
  };
}

const initialState: ChallengeState = {
  challenges: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  lessonChallenges: {
    data: null,
    isLoading: false,
    error: null,
    lessonId: null,
  },
  currentChallenge: {
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
  solving: {
    isActive: false,
    timeStarted: null,
    timeElapsed: 0,
    attemptCount: 0,
  },
};

const challengeSlice = createSlice({
  name: "challenge",
  initialState,
  reducers: {
    clearChallenges: (state) => {
      state.challenges.data = null;
      state.challenges.error = null;
      state.challenges.lastQuery = null;
    },

    setCurrentChallenge: (state, action: PayloadAction<ChallengeResult>) => {
      state.currentChallenge.data = action.payload;
      state.currentChallenge.error = null;
    },

    startSolving: (state, action: PayloadAction<ChallengeResult>) => {
      state.currentChallenge.data = action.payload;
      state.solving.isActive = true;
      state.solving.timeStarted = Date.now();
      state.solving.timeElapsed = 0;
      state.solving.attemptCount = 0;
    },

    stopSolving: (state) => {
      state.solving.isActive = false;
      state.solving.timeStarted = null;
    },

    incrementAttempt: (state) => {
      state.solving.attemptCount += 1;
    },

    clearChallengeErrors: (state) => {
      state.challenges.error = null;
      state.lessonChallenges.error = null;
      state.currentChallenge.error = null;
      state.operations.createError = null;
      state.operations.updateError = null;
      state.operations.deleteError = null;
      state.operations.restoreError = null;
    },

    resetChallengeState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChallengesThunk.pending, (state, action) => {
        state.challenges.isLoading = true;
        state.challenges.error = null;
        state.challenges.lastQuery = action.meta.arg;
      })
      .addCase(getChallengesThunk.fulfilled, (state, action) => {
        state.challenges.isLoading = false;
        state.challenges.error = null;
        state.challenges.data = action.payload;
      })
      .addCase(getChallengesThunk.rejected, (state, action) => {
        state.challenges.isLoading = false;
        state.challenges.error = action.payload || "Failed to fetch challenges";
      })

      .addCase(getChallengeByIdThunk.pending, (state) => {
        state.currentChallenge.isLoading = true;
        state.currentChallenge.error = null;
      })
      .addCase(getChallengeByIdThunk.fulfilled, (state, action) => {
        state.currentChallenge.isLoading = false;
        state.currentChallenge.error = null;
        state.currentChallenge.data = action.payload;
      })
      .addCase(getChallengeByIdThunk.rejected, (state, action) => {
        state.currentChallenge.isLoading = false;
        state.currentChallenge.error = action.payload || "Failed to fetch challenge";
      })

      .addCase(getChallengesByLessonThunk.pending, (state, action) => {
        state.lessonChallenges.isLoading = true;
        state.lessonChallenges.error = null;
        state.lessonChallenges.lessonId = action.meta.arg.lessonId;
      })
      .addCase(getChallengesByLessonThunk.fulfilled, (state, action) => {
        state.lessonChallenges.isLoading = false;
        state.lessonChallenges.error = null;
        state.lessonChallenges.data = action.payload;
      })
      .addCase(getChallengesByLessonThunk.rejected, (state, action) => {
        state.lessonChallenges.isLoading = false;
        state.lessonChallenges.error = action.payload || "Failed to fetch lesson challenges";
      })

      .addCase(createChallengeThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.operations.createError = null;
      })
      .addCase(createChallengeThunk.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = null;
        
        if (state.challenges.data?.items) {
          state.challenges.data.items.unshift(action.payload);
          state.challenges.data.total += 1;
        }
      })
      .addCase(createChallengeThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = action.payload || "Failed to create challenge";
      })

      .addCase(updateChallengeThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.operations.updateError = null;
      })
      .addCase(updateChallengeThunk.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = null;

        if (state.currentChallenge.data?.id === action.payload.id) {
          state.currentChallenge.data = action.payload;
        }

        if (state.challenges.data?.items) {
          const index = state.challenges.data.items.findIndex(
            (challenge) => challenge.id === action.payload.id
          );
          if (index !== -1) {
            state.challenges.data.items[index] = action.payload;
          }
        }
      })
      .addCase(updateChallengeThunk.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = action.payload || "Failed to update challenge";
      })

      .addCase(deleteChallengeThunk.pending, (state) => {
        state.operations.isDeleting = true;
        state.operations.deleteError = null;
      })
      .addCase(deleteChallengeThunk.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = null;

        const challengeId = action.payload;

        if (state.currentChallenge.data?.id === challengeId) {
          state.currentChallenge.data = null;
          state.solving = initialState.solving;
        }

        if (state.challenges.data?.items) {
          const index = state.challenges.data.items.findIndex(
            (challenge) => challenge.id === challengeId
          );
          if (index !== -1) {
            state.challenges.data.items.splice(index, 1);
            state.challenges.data.total -= 1;
          }
        }
      })
      .addCase(deleteChallengeThunk.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = action.payload || "Failed to delete challenge";
      })

      .addCase(restoreChallengeThunk.pending, (state) => {
        state.operations.isRestoring = true;
        state.operations.restoreError = null;
      })
      .addCase(restoreChallengeThunk.fulfilled, (state, action) => {
        state.operations.isRestoring = false;
        state.operations.restoreError = null;
        
        if (state.challenges.data?.items) {
          state.challenges.data.items.unshift(action.payload);
          state.challenges.data.total += 1;
        }
      })
      .addCase(restoreChallengeThunk.rejected, (state, action) => {
        state.operations.isRestoring = false;
        state.operations.restoreError = action.payload || "Failed to restore challenge";
      });
  },
});

export const {
  clearChallenges,
  setCurrentChallenge,
  startSolving,
  stopSolving,
  incrementAttempt,
  clearChallengeErrors,
  resetChallengeState,
} = challengeSlice.actions;

export {
  getChallengesThunk as getChallenges,
  getChallengeByIdThunk as getChallengeById,
  getChallengesByLessonThunk as getChallengesByLesson,
  createChallengeThunk as createChallenge,
  updateChallengeThunk as updateChallenge,
  deleteChallengeThunk as deleteChallenge,
  restoreChallengeThunk as restoreChallenge,
};

const challengeReducer = challengeSlice.reducer;
export default challengeReducer;