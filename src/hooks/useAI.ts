/**
 * Custom Hook for AI operations
 * Provides easy-to-use interface for AI features in components
 */

import { useState, useCallback } from "react";
import { courseRecommendationService } from "../services/ai/courseRecommendation";
import { solutionHintService } from "../services/ai/solutionHint";
import { contextBuilder } from "../services/ai/contextBuilder";
import type { CourseRecommendationResult, SolutionHint } from "../services/ai";

interface UseAIReturn {
  // Course Recommendation
  getRecommendations: (query: string) => Promise<void>;
  recommendations: CourseRecommendationResult | null;
  recommendationsLoading: boolean;
  recommendationsError: string | null;

  // Solution Hint
  getHint: (challengeId: string, submissionId?: string) => Promise<void>;
  hint: SolutionHint | null;
  hintLoading: boolean;
  hintError: string | null;

  // Reset
  reset: () => void;
}

export const useAI = (): UseAIReturn => {
  // Course Recommendations state
  const [recommendations, setRecommendations] =
    useState<CourseRecommendationResult | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<
    string | null
  >(null);

  // Solution Hint state
  const [hint, setHint] = useState<SolutionHint | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);

  /**
   * Get course recommendations
   */
  const getRecommendations = useCallback(async (query: string) => {
    setRecommendationsLoading(true);
    setRecommendationsError(null);

    try {
      // Build context
      const context = await contextBuilder.buildCourseRecommendationContext(
        query
      );

      // Get recommendations
      const result = await courseRecommendationService.getRecommendations(
        query,
        context
      );

      setRecommendations(result);
    } catch (error: any) {
      console.error("Get Recommendations Error:", error);
      setRecommendationsError(
        error?.message || "Failed to get course recommendations"
      );
    } finally {
      setRecommendationsLoading(false);
    }
  }, []);

  /**
   * Get solution hint
   */
  const getHint = useCallback(
    async (challengeId: string, submissionId?: string) => {
      setHintLoading(true);
      setHintError(null);

      try {
        // Build context
        const context = await contextBuilder.buildSolutionHintContext(
          challengeId,
          submissionId
        );

        // Get hint
        const result = await solutionHintService.generateHint(context);

        setHint(result);
      } catch (error: any) {
        console.error("Get Hint Error:", error);
        setHintError(error?.message || "Failed to get solution hint");
      } finally {
        setHintLoading(false);
      }
    },
    []
  );

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setRecommendations(null);
    setRecommendationsLoading(false);
    setRecommendationsError(null);
    setHint(null);
    setHintLoading(false);
    setHintError(null);
  }, []);

  return {
    getRecommendations,
    recommendations,
    recommendationsLoading,
    recommendationsError,
    getHint,
    hint,
    hintLoading,
    hintError,
    reset,
  };
};
