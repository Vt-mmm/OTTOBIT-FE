/**
 * Solution Hint AI Service
 * Generates hints for students working on coding challenges
 */

import { aiService } from "./aiService";

export interface SolutionHintContext {
  challenge: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    solutionJson?: any;
  };
  studentCode: string;
  attemptCount: number;
  previousHints?: string[];
}

export interface SolutionHint {
  hint: string;
  hintLevel: "conceptual" | "algorithmic" | "detailed";
  encouragement: string;
}

class SolutionHintService {
  /**
   * Generate AI-powered hint for student's submission
   */
  async generateHint(context: SolutionHintContext): Promise<SolutionHint> {
    try {
      // Debug: Log challenge info
      console.log("🔍 AI Hint - Challenge:", context.challenge.title);
      console.log("🔍 AI Hint - Attempt Count:", context.attemptCount);

      // Send simple user message - backend handles all logic
      const userMessage = `Tôi đang gặp khó khăn với thử thách "${context.challenge.title}". Đây là lần thử thứ ${context.attemptCount}. Bạn có thể cho tôi gợi ý không?`;
      
      console.log("📝 AI Hint - User message:", userMessage);

      // Call AI service - backend Otto prompt will handle hint logic
      const response = await aiService.sendMessage(
        "", // No system prompt - backend handles it
        userMessage, // Send only simple user message
        context,
        "solution-hint"
      );

      // Parse response
      const hintLevel = this.determineHintLevel(context.attemptCount);

      return {
        hint: response.content,
        hintLevel,
        encouragement: this.getEncouragement(context.attemptCount),
      };
    } catch (error) {
      console.error("Solution Hint Error:", error);
      throw error;
    }
  }

  /**
   * Determine hint level based on attempt count
   */
  private determineHintLevel(
    attemptCount: number
  ): "conceptual" | "algorithmic" | "detailed" {
    if (attemptCount <= 2) {
      return "conceptual";
    } else if (attemptCount <= 5) {
      return "algorithmic";
    } else {
      return "detailed";
    }
  }

  /**
   * Get encouragement message based on attempt count
   */
  private getEncouragement(attemptCount: number): string {
    if (attemptCount === 1) {
      return "Bạn đang làm tốt lắm! Hãy thử suy nghĩ về vấn đề một cách có hệ thống.";
    } else if (attemptCount <= 3) {
      return "Đừng nản chí! Mỗi lần thử là một bước tiến gần hơn đến giải pháp.";
    } else if (attemptCount <= 5) {
      return "Bạn đã cố gắng rất nhiều. Hãy xem gợi ý chi tiết hơn nhé!";
    } else {
      return "Tuyệt vời! Bạn đã kiên trì đến tận bây giờ. Đây là hướng dẫn chi tiết để giúp bạn hoàn thành.";
    }
  }
}

export const solutionHintService = new SolutionHintService();
