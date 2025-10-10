/**
 * Context Builder for AI Services
 * Fetches and aggregates data from Redux store/APIs to build context for AI
 */

import { ottobit as store } from "store/config";
import type { CourseRecommendationContext } from "./courseRecommendation";
import type { SolutionHintContext } from "./solutionHint";
import { getCoursesThunk } from "store/course/courseThunks";
import { getMyEnrollmentsThunk } from "store/enrollment/enrollmentThunks";
// import { getActivationCodesThunk } from "store/activationCode/activationCodeThunks"; // Not used - admin-only endpoint

class ContextBuilder {
  /**
   * Build context for course recommendation
   */
  async buildCourseRecommendationContext(
    _userQuery: string
  ): Promise<CourseRecommendationContext> {
    // Fetch required data if not in store
    await this.ensureCoursesData();
    await this.ensureEnrollmentsData();
    // Don't fetch activation codes - admin-only API endpoint
    // await this.ensureActivationCodesData();

    const state = store.getState();

    // Get courses from course slice
    const coursesData = state.course?.courses?.data;
    const courses = coursesData?.items || [];

    console.log("🔍 DEBUG - Total courses from BE:", courses.length);
    if (courses.length > 0) {
      console.log("🔍 DEBUG - First course sample:", {
        title: courses[0].title,
        type: courses[0].type,
        isDeleted: courses[0].isDeleted,
        price: courses[0].price,
      });
    }

    // Get enrollments
    const enrollmentsData = state.enrollment?.myEnrollments?.data;
    const enrollments = enrollmentsData?.items || [];
    const enrolledCourseIds = enrollments.map((e: any) => e.courseId);

    console.log("🔍 DEBUG - Enrolled course IDs:", enrolledCourseIds);

    // Get activated robots from activation codes (if available in Redux)
    // Note: Activation codes API is admin-only, so this will be empty for regular users
    const activationCodesData = state.activationCode?.activationCodes?.data;
    const activationCodes = activationCodesData?.items || [];
    const ownedRobots = activationCodes
      .filter((code: any) => code.status === "Used" && code.robotId)
      .map((code: any) => ({
        id: code.robotId,
        name: code.robotName || "Unknown",
        type: code.robotType || "Unknown",
      }));

    console.log("🤖 Owned robots from activation codes:", ownedRobots.length);

    // Filter available courses (not enrolled, all types including Free)
    // Note: type is number (1=Free, 2=Premium)
    // Note: status field is NOT returned by BE API, so don't check it
    const availableCourses = courses
      .filter((c: any) => {
        const isNotDeleted = !c.isDeleted;
        const isNotEnrolled = !enrolledCourseIds.includes(c.id);
        // Allow both Free (type=1) and Premium (type=2) courses
        const isValidType = c.type === 1 || c.type === 2;

        // For debugging: log each course filter result
        if (courses.length <= 5) {
          console.log(`🔍 Course "${c.title}":`, {
            isNotDeleted,
            isNotEnrolled,
            isValidType,
            type: c.type,
            price: c.price,
            willInclude: isNotDeleted && isNotEnrolled && isValidType,
          });
        }

        // Check: not deleted, not enrolled, and valid type (Free or Premium)
        return isNotDeleted && isNotEnrolled && isValidType;
      })
      .map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description || "",
        // Don't use c.difficultyLevel - BE doesn't have this field
        // AI will auto-detect difficulty from title/description
        price: c.price || 0,
        rating: c.averageRating || 0,
        tags: c.tags || [],
        requiredRobots: c.requiredRobots || [],
      }));

    // Log warning if no courses available
    console.log(
      `📊 Available courses for AI: ${availableCourses.length}/${courses.length}`
    );

    if (availableCourses.length === 0 && courses.length > 0) {
      console.warn(
        "⚠️ No courses available for AI recommendations.",
        "\n📋 Courses from BE:",
        courses.length,
        "\n🔍 After filtering: 0",
        "\n💡 Possible reasons:",
        "\n  - All courses are enrolled already",
        "\n  - All courses have invalid type (not type=1 or type=2)",
        "\n  - All courses are deleted (isDeleted=true)"
      );
    } else if (courses.length === 0) {
      console.warn(
        "⚠️ No courses data from BE!",
        "\n💡 Check:",
        "\n  1. BE database có courses chưa?",
        "\n  2. API /courses có response.data.items không?"
      );
    }

    // Calculate student metrics
    const completedCourses = enrollments.filter(
      (e: any) => e.status === "Completed"
    );
    const averageScore =
      completedCourses.length > 0
        ? completedCourses.reduce(
            (sum: number, e: any) => sum + (e.finalScore || 0),
            0
          ) / completedCourses.length
        : 0;

    return {
      student: {
        level: "Beginner", // Default level since user profile may not have this field
        interests: [],
        completedCoursesCount: completedCourses.length,
        averageScore: Math.round(averageScore),
      },
      ownedRobots,
      availableCourses,
      enrolledCourseIds,
    };
  }

  /**
   * Build context for solution hint
   */
  async buildSolutionHintContext(
    challengeId: string,
    submissionId?: string
  ): Promise<SolutionHintContext> {
    const state = store.getState();

    // Get challenge data
    const challengeData = state.challenge?.currentChallenge?.data;
    const challengesData = state.challenge?.challenges?.data;
    const challenges = challengesData?.items || [];

    const currentChallenge =
      challengeData?.id === challengeId
        ? challengeData
        : challenges.find((c: any) => c.id === challengeId);

    // Get submissions for this challenge
    const mySubmissionsData = state.submission?.mySubmissions?.data;
    const allSubmissions = mySubmissionsData?.items || [];
    const challengeSubmissions = allSubmissions
      .filter((s: any) => s.challengeId === challengeId)
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    // Get current submission or latest
    const currentSubmission = submissionId
      ? allSubmissions.find((s: any) => s.id === submissionId)
      : challengeSubmissions[0];

    // Count previous hints given (from localStorage or state)
    const previousHints: string[] = [];
    const storedHints = localStorage.getItem(`hints_${challengeId}`);
    if (storedHints) {
      try {
        previousHints.push(...JSON.parse(storedHints));
      } catch {
        // Ignore parse errors
      }
    }

    // Parse codeJson to extract workspace and code details
    let parsedCode: any = {};
    if (currentSubmission?.codeJson) {
      try {
        parsedCode = JSON.parse(currentSubmission.codeJson);
      } catch {
        // Failed to parse, use empty object
      }
    }

    // Parse solutionJson if available (for AI to understand expected solution)
    // NOTE: BE returns solutionJson as JSON string, may need double parsing
    let parsedSolution: any = null;
    if (currentChallenge?.solutionJson) {
      try {
        // First parse
        let firstParse = currentChallenge.solutionJson;
        if (typeof firstParse === "string") {
          firstParse = JSON.parse(firstParse);
        }
        
        // If still string, parse again (BE returns stringified JSON)
        if (typeof firstParse === "string") {
          parsedSolution = JSON.parse(firstParse);
        } else {
          parsedSolution = firstParse;
        }
        
        console.log("📝 Solution JSON parsed:", parsedSolution);
      } catch (error) {
        console.warn("⚠️ Could not parse challenge solutionJson:", error);
        console.warn("Raw solutionJson:", currentChallenge.solutionJson);
      }
    } else {
      console.warn("⚠️ Challenge has no solutionJson field");
    }

    return {
      challenge: {
        id: challengeId,
        title: currentChallenge?.title || "",
        description: currentChallenge?.description || "",
        objectives: "", // Challenge model doesn't have objectives field
        difficulty: currentChallenge?.difficulty
          ? this.mapDifficultyToLevel(currentChallenge.difficulty)
          : "Medium",
        solutionJson: parsedSolution, // Add solution for AI reference
      },
      submission: {
        id: currentSubmission?.id || "",
        blocklyWorkspace: parsedCode.workspace || parsedCode,
        generatedCode: parsedCode.generatedCode || parsedCode.code || "",
        testResults: parsedCode.testResults || [],
        errorMessage: parsedCode.error || parsedCode.errorMessage || "",
        status: currentSubmission ? "Submitted" : "Unknown",
      },
      attemptCount: challengeSubmissions.length,
      previousHints,
    };
  }

  /**
   * Save hint to localStorage for tracking
   */
  saveHint(challengeId: string, hint: string) {
    const key = `hints_${challengeId}`;
    const existing = localStorage.getItem(key);
    const hints = existing ? JSON.parse(existing) : [];
    hints.push(hint);
    localStorage.setItem(key, JSON.stringify(hints));
  }

  /**
   * Clear hints for a challenge
   */
  clearHints(challengeId: string) {
    localStorage.removeItem(`hints_${challengeId}`);
  }

  /**
   * Map difficulty number (1-5) to level string
   */
  private mapDifficultyToLevel(difficulty: number): string {
    if (difficulty <= 1) return "Very Easy";
    if (difficulty <= 2) return "Easy";
    if (difficulty <= 3) return "Medium";
    if (difficulty <= 4) return "Hard";
    return "Very Hard";
  }

  /**
   * Ensure courses data is loaded from BE
   */
  private async ensureCoursesData() {
    const state = store.getState();
    const coursesData = state.course?.courses?.data;

    // If no data or empty, fetch from BE
    if (!coursesData || !coursesData.items || coursesData.items.length === 0) {
      console.log("📚 Fetching courses from BE...");
      try {
        await store.dispatch(
          getCoursesThunk({
            pageSize: 50, // Match user pages - only pageSize
          }) as any
        );
      } catch (error: any) {
        console.warn("⚠️ Could not fetch courses from BE:", error);
        console.warn(
          "AI will work with limited data. User might need to login."
        );
        // Don't throw - let AI work with empty data
      }
    }
  }

  /**
   * Ensure enrollments data is loaded from BE
   */
  private async ensureEnrollmentsData() {
    const state = store.getState();
    const enrollmentsData = state.enrollment?.myEnrollments?.data;

    // If no data, fetch from BE
    if (!enrollmentsData) {
      console.log("📖 Fetching enrollments from BE...");
      try {
        await store.dispatch(
          getMyEnrollmentsThunk({
            pageSize: 100, // Only pageSize
          }) as any
        );
      } catch (error) {
        // User might not be logged in or have no enrollments
        console.warn("⚠️ Could not fetch enrollments from BE:", error);
        console.warn("💡 User might not be logged in or lacks permissions.");
      }
    }
  }

  /**
   * Ensure activation codes data is loaded from BE
   * NOTE: This is commented out because activation codes API is admin-only.
   * Regular users cannot access this endpoint (403 FORBIDDEN).
   * Robot ownership is not required for course recommendations.
   */
  // private async ensureActivationCodesData() {
  //   const state = store.getState();
  //   const activationCodesData = state.activationCode?.activationCodes?.data;

  //   // If no data, fetch from BE
  //   if (!activationCodesData) {
  //     console.log("🤖 Fetching activation codes from BE...");
  //     try {
  //       await store.dispatch(
  //         getActivationCodesThunk({
  //           pageSize: 50, // Only pageSize
  //         }) as any
  //       );
  //     } catch (error) {
  //       // User might not have any codes
  //       console.warn("⚠️ Could not fetch activation codes from BE:", error);
  //       console.warn("💡 User might not be logged in or has no robot codes.");
  //     }
  //   }
  // }
}

export const contextBuilder = new ContextBuilder();
