/**
 * AI Services - Export all AI-related services
 */

export { aiService } from "./aiService";
export { courseRecommendationService } from "./courseRecommendation";
export { solutionHintService } from "./solutionHint";
export { contextBuilder } from "./contextBuilder";

export type {
  CourseRecommendationContext,
  CourseRecommendation,
  CourseRecommendationResult,
} from "./courseRecommendation";
export type { SolutionHintContext, SolutionHint } from "./solutionHint";


