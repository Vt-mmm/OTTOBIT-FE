/**
 * AI Redux Thunks
 * Async actions for AI operations
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { courseRecommendationService } from "services/ai/courseRecommendation";
import { solutionHintService } from "services/ai/solutionHint";
import { contextBuilder } from "services/ai/contextBuilder";
import type { CourseRecommendationResult, SolutionHint } from "services/ai";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_CHATBOT } from "constants/routesApiKeys";

/**
 * Get course recommendations from AI
 */
export const getCourseRecommendationsThunk = createAsyncThunk<
  CourseRecommendationResult,
  string,
  { rejectValue: string }
>("ai/getCourseRecommendations", async (query, { rejectWithValue }) => {
  try {
    // Build context from current app state
    const context = await contextBuilder.buildCourseRecommendationContext(
      query
    );

    // Get recommendations from AI
    const result = await courseRecommendationService.getRecommendations(
      query,
      context
    );

    return result;
  } catch (error: any) {
    console.error("Get Course Recommendations Error:", error);
    return rejectWithValue(
      error?.message || "Failed to get course recommendations"
    );
  }
});

/**
 * Get solution hint from AI
 */
export const getSolutionHintThunk = createAsyncThunk<
  SolutionHint,
  { challengeId: string; submissionId?: string },
  { rejectValue: string }
>(
  "ai/getSolutionHint",
  async ({ challengeId, submissionId }, { rejectWithValue }) => {
    try {
      // Build context from challenge and submission data
      const context = await contextBuilder.buildSolutionHintContext(
        challengeId,
        submissionId
      );

      // Get hint from AI
      const result = await solutionHintService.generateHint(context);

      return result;
    } catch (error: any) {
      console.error("Get Solution Hint Error:", error);
      return rejectWithValue(error?.message || "Failed to get solution hint");
    }
  }
);

/**
 * Send chat message to ChatBot API
 */
export const sendChatMessageThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("ai/sendChatMessage", async (message, { rejectWithValue }) => {
  try {
    console.log("🤖 Sending to ChatBot API:", { message });

    const response = await axiosClient.post(ROUTES_API_CHATBOT.CHAT, {
      message,
    });

    const responseText = response.data.data?.message || "";
    console.log("✅ ChatBot Response:", responseText);

    return responseText;
  } catch (error: any) {
    console.error("ChatBot Error:", error);
    return rejectWithValue(
      error?.message || "Failed to communicate with ChatBot"
    );
  }
});

