/**
 * Course Recommendation AI Service
 * Handles AI-powered course recommendations for students
 */

import { aiService } from "./aiService";

export interface CourseRecommendationContext {
  student: {
    level?: string;
    interests?: string[];
    completedCoursesCount: number;
    averageScore?: number;
  };
  ownedRobots: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  availableCourses: Array<{
    id: string;
    title: string;
    description: string;
    level?: string;
    price: number;
    rating?: number;
    tags?: string[];
  }>;
  enrolledCourseIds: string[];
}

export interface CourseRecommendation {
  courseId: string;
  courseName: string;
  matchScore: number;
  reason: string;
  learningPath?: string;
  // Additional course data for display
  price?: number;
  rating?: number;
  level?: string;
}

export interface CourseRecommendationResult {
  recommendations: CourseRecommendation[];
  explanation: string;
}

class CourseRecommendationService {
  /**
   * Get AI course recommendations based on user query and context
   */
  async getRecommendations(
    userQuery: string,
    context: CourseRecommendationContext
  ): Promise<CourseRecommendationResult> {
    try {
      // Send only user query - backend handles all logic
      const response = await aiService.sendMessage(
        "", // No system prompt - backend handles it
        userQuery, // Send only user message
        context,
        "course-recommendation"
      );

      // Backend Otto returns simple text response
      // For now, return empty recommendations with Otto's response
      return {
        recommendations: [],
        explanation: response.content,
      };
    } catch (error) {
      console.error("Course Recommendation Error:", error);
      throw error;
    }
  }
}

export const courseRecommendationService = new CourseRecommendationService();
