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
      // Build system prompt for AI
      const systemPrompt = this.buildSystemPrompt();

      // Pre-analyze courses with difficulty detection
      const coursesWithDifficulty = this.analyzeCourseDifficulty(
        context.availableCourses
      );

      // Build user prompt with context
      const userPrompt = this.buildUserPromptWithDifficulty(
        userQuery,
        context,
        coursesWithDifficulty
      );

      // Call AI service (Gemini)
      const response = await aiService.sendMessage(
        systemPrompt,
        userPrompt,
        context,
        "course-recommendation"
      );

      // Parse AI response and enrich with actual course data
      let recommendations: CourseRecommendation[] = [];
      let explanation = response.content;

      // Try to parse JSON from response
      let parsedResponse: any = null;
      try {
        // Remove markdown code blocks if present
        let cleanText = response.content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        // Try to find JSON object in text
        const jsonMatch = cleanText.match(
          /\{[\s\S]*"recommendations"[\s\S]*\}/
        );
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn("Failed to parse AI response as JSON:", e);
      }

      // Extract recommendations
      let jsonParsedSuccessfully = false;
      if (
        parsedResponse?.recommendations &&
        Array.isArray(parsedResponse.recommendations)
      ) {
        jsonParsedSuccessfully = true; // Mark as successfully parsed

        // Enrich with actual course data from context
        recommendations = parsedResponse.recommendations
          .map((rec: any) => {
            // Find matching course from analyzed courses
            const course = coursesWithDifficulty.find(
              (c) =>
                c.id === rec.courseId ||
                c.title.toLowerCase().includes(rec.courseName?.toLowerCase())
            );

            if (course) {
              return {
                courseId: course.id,
                courseName: course.title,
                matchScore: rec.matchScore || 80,
                reason: rec.reason || "Được AI đề xuất",
                learningPath: rec.learningPath,
                // Add actual course data with analyzedDifficulty
                price: course.price,
                rating: course.rating,
                level: course.analyzedDifficulty, // Use analyzedDifficulty instead
              };
            }
            return null;
          })
          .filter(
            (rec: CourseRecommendation | null): rec is CourseRecommendation =>
              rec !== null
          )
          .slice(0, 5); // Limit to 5 recommendations

        explanation = parsedResponse.explanation || explanation;
      }

      // Fallback ONLY if JSON parsing failed completely
      // Don't fallback if AI intentionally returned empty array (for greetings)
      if (!jsonParsedSuccessfully && recommendations.length === 0) {
        console.log("⚠️ JSON parsing failed, using text extraction fallback");
        recommendations = this.extractRecommendationsFromText(
          response.content,
          coursesWithDifficulty
        );
      } else if (jsonParsedSuccessfully && recommendations.length === 0) {
        console.log(
          "✅ AI intentionally returned empty recommendations (greeting/chat)"
        );
      }

      return {
        recommendations,
        explanation,
      };
    } catch (error) {
      console.error("Course Recommendation Error:", error);
      throw error;
    }
  }

  /**
   * Build system prompt for AI
   */
  private buildSystemPrompt(): string {
    return `You are an intelligent course recommendation assistant for an educational robotics platform called Ottobit.
Your role is to have natural conversations with students and recommend courses ONLY when they ask for it.

CONVERSATION RULES:
1. **Detect User Intent**:
   - Greetings (xin chào, hello, hi) → Greet back warmly, ask how you can help
   - General chat (cảm ơn, tạm biệt) → Respond naturally, NO course recommendations
   - Questions about platform → Answer the question, NO course recommendations
   - Course request keywords: "gợi ý", "recommend", "khóa học nào", "muốn học", "tìm khóa học"
   - Progression keywords: "khó hơn", "khó nhất", "tiếp theo", "nâng cao", "advanced", "harder", "next level"
   
2. **When to Recommend Courses**:
   - ONLY when user explicitly asks for course recommendations
   - ONLY when user mentions learning goals or interests
   - When user asks about harder/next courses → recommend the NEXT level up
   - NEVER recommend courses for simple greetings or thank you messages

CRITICAL RULES - MUST FOLLOW STRICTLY (ONLY when recommending courses):
1. **Level Matching is MANDATORY**:
   - Beginner students (0 completed) → PRIORITIZE "Basic" level courses first!
   - Beginner students → Can also suggest "Medium" as next step after Basic
   - Intermediate students → Recommend "Medium" or "Advanced" courses
   - Advanced students → Recommend "Advanced" courses only
   
2. **Course Difficulty Detection** (How to identify course level):
   - Check 'analyzedDifficulty' field in course data (auto-detected from title/description)
   - Check 'difficultySignals' for hints (keywords, price, tags)
   - Look for keywords in title/description:
     * "Basic", "Beginner", "Introduction", "Fundamental", "Starting" = Beginner level
     * "Medium", "Intermediate", "Expands knowledge" = Intermediate level  
     * "Advanced", "Expert", "Optimization", "Complex" = Advanced level
   - FREE courses (price=0) are often beginner-friendly
   
3. **Course Difficulty Mapping**:
   - "Basic (Beginner level)" = For absolute beginners (first course, HIGHEST PRIORITY for new students)
   - "Medium (Intermediate level)" = For students who completed basic or have some experience
   - "Advanced (Expert level)" = For experienced students who mastered medium level
   
4. **Progressive Learning Path**:
   - ALWAYS recommend beginner-level courses FIRST for students with 0 completed courses
   - Then intermediate-level as second step
   - Finally advanced-level for experienced students
   - NEVER skip beginner courses if student has 0 completed courses
   - NEVER recommend advanced courses to beginners (this is WRONG!)
   - Use 'analyzedDifficulty' to determine course level, NOT just the title

5. **Recommendation Priority for Beginners (0 completed courses)**:
   - HIGHEST PRIORITY: Courses with analyzedDifficulty="Basic (Beginner level)" 
   - SECOND PRIORITY: Courses with analyzedDifficulty="Medium (Intermediate level)"
   - Consider price: FREE courses are great starting points
   - Suggest logical next step in learning journey

IMPORTANT Guidelines:
- **Free courses (type=1) are VALID and IMPORTANT** - Don't ignore them!
- Beginner-level courses are often free and perfect for first-time students
- Focus on 'analyzedDifficulty' field to determine course level
- Don't rely solely on course title - use description keywords and signals
- Focus on course content and learning path, NOT on robot requirements
- All courses can be completed without specific robots
- **CRITICAL: Recommend ONLY 1 course at a time** (not 2 or more)
- Focus on quality over quantity - explain ONE perfect match
- Be honest about course difficulty
- **In follow-up questions**: If user asks about next/harder courses, recommend the NEXT single course in progression
- After recommending, briefly mention what comes after (but don't send card for it yet)

EXAMPLE 1 (CORRECT - recommend ONLY 1 course):
Student: Beginner, 0 completed courses
Available: 
  - "Basic block programming" (analyzedDifficulty: "Basic (Beginner level)", price: 0)
  - "Medium block programming" (analyzedDifficulty: "Medium (Intermediate level)", price: 100000)
→ Recommend: ONLY "Basic block programming" (1 course)
→ Explanation: "Basic là khóa học miễn phí hoàn hảo cho người mới. Sau khi hoàn thành, bạn có thể tiếp tục với Medium."
→ JSON: { recommendations: [{...Basic course only...}], explanation: "..." }

EXAMPLE 2 (CORRECT - superlative request):
User asks: "Khóa khó nhất?"
Available courses with analyzedDifficulty:
  - "Basic block programming" (analyzedDifficulty: "Basic (Beginner level)")
  - "Medium block programming" (analyzedDifficulty: "Medium (Intermediate level)")
  - "Advanced block programming" (analyzedDifficulty: "Advanced (Expert level)")
→ Recommend: ONLY "Advanced block programming" (highest difficulty)
→ Explanation: "Advanced là khóa học khó nhất, nên học sau khi hoàn thành Medium."
→ JSON: { recommendations: [{...Advanced course only...}], explanation: "..." }

EXAMPLE 3 (CORRECT - follow-up question):
Student already saw: Basic
User asks: "Khóa khó hơn thì sao?"
→ Recommend: ONLY "Medium block programming" (1 course)
→ Explanation: "Sau khi hoàn thành Basic, Medium là bước tiếp theo. Cuối cùng là Advanced."
→ JSON: { recommendations: [{...Medium course only...}], explanation: "..." }

EXAMPLE (WRONG - DO NOT DO THIS):
Student: Beginner, 0 completed
→ Recommend: 2 courses (Basic + Medium) ❌ WRONG! Only 1 course!
→ Recommend: Course with analyzedDifficulty="Medium" when Basic exists ❌ WRONG!
→ Recommend: Course with analyzedDifficulty="Advanced" to Beginner ❌ NEVER!

IMPORTANT: Respond in Vietnamese if the user query is in Vietnamese.

Return ONLY valid JSON in this exact format (no additional text):

**For greetings/general chat (NO course recommendation needed):**
{
  "recommendations": [],
  "explanation": "Friendly response in Vietnamese (e.g., 'Xin chào! Tôi có thể giúp bạn tìm khóa học phù hợp. Bạn muốn học về gì?')"
}

**For course recommendation requests (ONLY 1 course):**
{
  "recommendations": [
    {
      "courseId": "actual-course-id-from-context",
      "courseName": "Course Title",
      "matchScore": 95,
      "reason": "Detailed reason in Vietnamese explaining WHY this course matches student's CURRENT level",
      "learningPath": "Clear next steps: what to learn after this course"
    }
    // STOP HERE - Do NOT add more courses!
  ],
  "explanation": "Explanation in Vietnamese. Mention the current course + briefly note what comes next (e.g., 'Sau đó bạn có thể học Medium')"
}

EXAMPLES:
User: "Xin chào" → Return: { recommendations: [], explanation: "Xin chào! Tôi là trợ lý AI của Ottobit. Tôi có thể giúp bạn tìm khóa học lập trình robot phù hợp. Bạn đang muốn học về gì?" }
User: "Cảm ơn" → Return: { recommendations: [], explanation: "Rất vui được hỗ trợ bạn! Chúc bạn học tập hiệu quả!" }
User: "Gợi ý khóa học cho tôi" → Return: { recommendations: [{...ONLY Basic...}], explanation: "Basic là khóa học miễn phí hoàn hảo. Sau đó có thể học Medium." }
User: "Khóa khó nhất?" (SUPERLATIVE) → Return: { recommendations: [{...ONLY Advanced (highest analyzedDifficulty)...}], explanation: "Advanced là khóa nâng cao nhất, nên học sau Medium." }
User: "Khóa khó hơn thì sao?" (follow-up) → Return: { recommendations: [{...ONLY Medium...}], explanation: "Sau Basic, Medium là bước tiếp theo. Cuối cùng là Advanced." }`;
  }

  /**
   * Extract recommendations from plain text response (fallback)
   */
  private extractRecommendationsFromText(
    text: string,
    coursesWithDifficulty: any[]
  ): CourseRecommendation[] {
    const recommendations: CourseRecommendation[] = [];

    // Simple extraction: look for course IDs or titles mentioned
    coursesWithDifficulty.slice(0, 3).forEach((course, index) => {
      if (
        text.toLowerCase().includes(course.title.toLowerCase()) ||
        text.includes(course.id)
      ) {
        recommendations.push({
          courseId: course.id,
          courseName: course.title,
          matchScore: 90 - index * 10,
          reason: `Được đề xuất dựa trên phân tích của AI`,
          price: course.price,
          rating: course.rating,
          level: course.analyzedDifficulty, // Use analyzedDifficulty
        });
      }
    });

    // If no courses found in text, return top 3 available courses
    if (recommendations.length === 0) {
      return coursesWithDifficulty.slice(0, 3).map((course, index) => ({
        courseId: course.id,
        courseName: course.title,
        matchScore: 85 - index * 5,
        reason: "Khóa học phổ biến phù hợp với bạn",
        price: course.price,
        rating: course.rating,
        level: course.analyzedDifficulty, // Use analyzedDifficulty
      }));
    }

    return recommendations;
  }

  /**
   * Analyze course difficulty from title/description and metadata
   */
  private analyzeCourseDifficulty(courses: any[]): any[] {
    return courses.map((c) => {
      const titleLower = c.title.toLowerCase();
      const descLower = c.description.toLowerCase();

      // Analyze difficulty from multiple signals
      let difficulty = "Unknown";
      let signals: string[] = [];

      // Check title and description for keywords
      if (
        titleLower.includes("basic") ||
        titleLower.includes("fundamental") ||
        descLower.includes("basic") ||
        descLower.includes("beginner") ||
        descLower.includes("starting") ||
        descLower.includes("introduction") ||
        descLower.includes("first")
      ) {
        difficulty = "Basic (Beginner level)";
        signals.push("keyword: basic/beginner");
      } else if (
        titleLower.includes("medium") ||
        titleLower.includes("intermediate") ||
        descLower.includes("intermediate") ||
        descLower.includes("expands knowledge") ||
        descLower.includes("builds upon")
      ) {
        difficulty = "Medium (Intermediate level)";
        signals.push("keyword: medium/intermediate");
      } else if (
        titleLower.includes("advanced") ||
        descLower.includes("advanced") ||
        descLower.includes("expert") ||
        descLower.includes("optimization") ||
        descLower.includes("complex")
      ) {
        difficulty = "Advanced (Expert level)";
        signals.push("keyword: advanced/expert");
      }

      // Additional signals from metadata
      if (c.price === 0) {
        signals.push("FREE course (often beginner-friendly)");
      }
      if (c.tags && c.tags.includes("beginner")) {
        difficulty = "Basic (Beginner level)";
        signals.push("tag: beginner");
      }

      return {
        ...c,
        analyzedDifficulty: difficulty,
        difficultySignals: signals.join(", "),
      };
    });
  }

  /**
   * Build user prompt with difficulty-analyzed courses
   */
  private buildUserPromptWithDifficulty(
    query: string,
    context: CourseRecommendationContext,
    coursesWithDifficulty: any[]
  ): string {
    return `
Student Query: ${query}

Student Profile:
- Current Skill Level: ${
      context.student.level || "Beginner"
    } ⚠️ IMPORTANT: Match courses to this level!
- Completed Courses Count: ${context.student.completedCoursesCount}
- Average Score: ${context.student.averageScore || "N/A"}
- Learning Goal: ${context.student.interests?.join(", ") || "Lập trình robot"}

Already Enrolled: ${
      context.enrolledCourseIds.length > 0
        ? context.enrolledCourseIds.join(", ")
        : "None (First time student)"
    }

Available Courses (with difficulty analysis):
${JSON.stringify(coursesWithDifficulty, null, 2)}

TASK: 
1. First, analyze the user's intent from their query
2. If it's a greeting or general chat → Return empty recommendations with friendly response
3. If it's a course recommendation request → Use 'analyzedDifficulty' field to recommend courses:
   
   **For initial course requests (Beginner students with 0 completed):**
   - STEP 1: Look for courses with analyzedDifficulty="Basic (Beginner level)"
   - STEP 2: If found, recommend ONLY 1 course (the Basic one, especially if FREE)
   - STEP 3: In explanation, MENTION the next step (Medium) but DON'T send its card yet
   - STEP 4: Explain full learning path: "Basic → Medium → Advanced"
   - CRITICAL: Return ONLY 1 course in recommendations array, NOT 2 or more
   
   **For progression requests ("khó hơn", "khó nhất", "dễ nhất", "tiếp theo"):**
   - If user asks about harder/next courses → Recommend the NEXT difficulty level
   - "khó hơn" after Basic → Recommend Medium
   - "khó hơn" after Medium → Recommend Advanced  
   - **"khó nhất"** → Find course with analyzedDifficulty="Advanced (Expert level)" 
   - **"dễ nhất"** → Find course with analyzedDifficulty="Basic (Beginner level)"
   - If no exact match, look for keywords: "advanced"/"expert" (hardest) or "basic"/"beginner" (easiest)
   - Explain when they should take it (e.g., "Advanced nên học sau khi hoàn thành Medium")
   
   **For students with completed courses:**
   - If completed beginner-level → recommend intermediate-level
   - If completed intermediate-level → recommend advanced-level
   
   **CRITICAL:**
   - Use 'analyzedDifficulty' to determine course level, NOT the course title
   - Check 'difficultySignals' for additional context
   - In follow-up questions, recommend NEW courses based on progression
   - **SUPERLATIVE OVERRIDE**: When user asks "khó nhất" or "dễ nhất", IGNORE student level
     * "khó nhất" → ALWAYS return course with analyzedDifficulty="Advanced (Expert level)"
     * "dễ nhất" → ALWAYS return course with analyzedDifficulty="Basic (Beginner level)"
     * Even if student is beginner, they're asking for info, so provide it
   - For normal recommendations (not superlatives):
     * NEVER recommend advanced-level courses to absolute beginners!
     * NEVER skip beginner-level courses for students with 0 completed courses!
`;
  }
}

export const courseRecommendationService = new CourseRecommendationService();
