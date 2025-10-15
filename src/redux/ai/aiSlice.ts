/**
 * AI Redux Slice
 * Manages AI state in Redux store
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CourseRecommendationResult, SolutionHint } from "services/ai";

interface AIState {
  // Course Recommendations
  recommendations: CourseRecommendationResult | null;
  recommendationsLoading: boolean;
  recommendationsError: string | null;

  // Solution Hints
  hints: SolutionHint[];
  currentHint: SolutionHint | null;
  hintLoading: boolean;
  hintError: string | null;

  // Conversation history (optional, for chat-like experience)
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
}

const initialState: AIState = {
  recommendations: null,
  recommendationsLoading: false,
  recommendationsError: null,

  hints: [],
  currentHint: null,
  hintLoading: false,
  hintError: null,

  conversationHistory: [],
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    // Course Recommendations
    setRecommendations: (
      state,
      action: PayloadAction<CourseRecommendationResult>
    ) => {
      state.recommendations = action.payload;
    },
    setRecommendationsLoading: (state, action: PayloadAction<boolean>) => {
      state.recommendationsLoading = action.payload;
    },
    setRecommendationsError: (state, action: PayloadAction<string | null>) => {
      state.recommendationsError = action.payload;
    },
    clearRecommendations: (state) => {
      state.recommendations = null;
      state.recommendationsError = null;
    },

    // Solution Hints
    setCurrentHint: (state, action: PayloadAction<SolutionHint>) => {
      state.currentHint = action.payload;
      state.hints.push(action.payload);
    },
    setHintLoading: (state, action: PayloadAction<boolean>) => {
      state.hintLoading = action.payload;
    },
    setHintError: (state, action: PayloadAction<string | null>) => {
      state.hintError = action.payload;
    },
    clearHints: (state) => {
      state.hints = [];
      state.currentHint = null;
      state.hintError = null;
    },

    // Conversation History
    addToConversation: (
      state,
      action: PayloadAction<{
        role: "user" | "assistant";
        content: string;
      }>
    ) => {
      state.conversationHistory.push({
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearConversation: (state) => {
      state.conversationHistory = [];
    },

    // Reset all
    resetAIState: () => initialState,
  },
});

export const {
  setRecommendations,
  setRecommendationsLoading,
  setRecommendationsError,
  clearRecommendations,
  setCurrentHint,
  setHintLoading,
  setHintError,
  clearHints,
  addToConversation,
  clearConversation,
  resetAIState,
} = aiSlice.actions;

export default aiSlice.reducer;


