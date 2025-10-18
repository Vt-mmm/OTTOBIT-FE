import { ChallengeResult } from "common/@types/challenge";
import { SubmissionResult } from "common/@types/submission";

/**
 * Helper: Get best submission for a specific challenge
 * @param challengeId - The challenge ID
 * @param submissions - Array of all submissions
 * @returns The best submission (highest star) or null
 */
function getBestSubmission(
  challengeId: string,
  submissions: SubmissionResult[] = []
): SubmissionResult | null {
  const challengeSubmissions = submissions.filter(
    (s) => s.challengeId === challengeId
  );

  if (challengeSubmissions.length === 0) return null;

  // Find submission with highest star
  return challengeSubmissions.reduce((best, current) =>
    current.star > best.star ? current : best
  );
}

/**
 * Check if a challenge is accessible based on sequential completion logic
 * @param challenge - The challenge to check
 * @param submissions - Array of all submissions
 * @returns boolean - true if challenge is accessible, false otherwise
 */
export function isChallengeAccessible(
  challenge: ChallengeResult,
  challenges: ChallengeResult[] = [],
  submissions: SubmissionResult[] = []
): boolean {
  // 1) If BE provides explicit prerequisite challenges, prefer that rule
  const prereqs = (challenge as any)?.prerequisiteChallenges as string[] | undefined;
  if (Array.isArray(prereqs) && prereqs.length > 0) {
    const completedSet = new Set(
      submissions
        .filter((s) => s.star > 0 && (s as any).isCompleted !== false)
        .map((s) => s.challengeId)
    );
    return prereqs.every((id) => completedSet.has(id));
  }

  // 2) Fallback: sequential gating by order (previous order must be completed)
  const order = (challenge as any)?.order;
  
  if (order <= 1) {
    return true;
  }

  const previousOrder = order - 1;
  const prev = (challenges || []).find((c: any) => c.order === previousOrder);

  // If we cannot find the previous challenge (data incomplete), do not block access
  if (!prev) {
    return true;
  }

  const prevSubmissions = submissions.filter((s) => s.challengeId === prev.id);
  const bestStarForPrev = prevSubmissions.reduce(
    (max, s) => (s.star > max ? s.star : max),
    0
  );

  // 🐛 ENHANCED DEBUG: Log detailed unlock info for specific locked challenges
  if (process.env.NODE_ENV === 'development' && bestStarForPrev === 0) {
    console.warn(`🔒 [Challenge ${order}] LOCKED:`, {
      current: { id: challenge.id, title: challenge.title, order },
      requires: { id: prev.id, title: prev.title, order: previousOrder },
      prevSubmissions: prevSubmissions.length > 0 
        ? prevSubmissions.map(s => ({ submissionId: s.id, star: s.star, createdAt: s.createdAt }))
        : '⚠️ NO SUBMISSIONS FOUND',
      bestStar: bestStarForPrev,
      totalSubmissionsInContext: submissions.length,
      allChallengeIds: challenges.map(c => ({ id: c.id, title: c.title, order: (c as any).order }))
    });
  }

  return bestStarForPrev > 0;
}

/**
 * Get challenge progress info (completion status, stars earned)
 * @param challengeId - The challenge ID to check
 * @param submissions - Array of all submissions
 * @returns object with completion info
 */
export function getChallengeProgress(
  challengeId: string,
  submissions: SubmissionResult[] = []
) {
  const bestSubmission = getBestSubmission(challengeId, submissions);

  return {
    isCompleted: bestSubmission !== null && bestSubmission.star > 0,
    stars: bestSubmission?.star || 0,
    completedAt: bestSubmission?.createdAt,
    bestSubmissionId: bestSubmission?.id,
  };
}

/**
 * Calculate overall lesson progress
 * @param challenges - All challenges in the lesson
 * @param submissions - Array of all submissions
 * @returns progress statistics
 */
export function getLessonProgress(
  challenges: ChallengeResult[] = [],
  submissions: SubmissionResult[] = []
) {
  const totalChallenges = challenges.length;

  // Count challenges with at least one submission
  const completedChallenges = challenges.filter((challenge) => {
    const progress = getChallengeProgress(challenge.id, submissions);
    return progress.isCompleted;
  }).length;

  // Calculate total stars from best submissions
  const totalStars = challenges.reduce((sum, challenge) => {
    const progress = getChallengeProgress(challenge.id, submissions);
    return sum + progress.stars;
  }, 0);

  const maxPossibleStars = totalChallenges * 5; // Max 5 stars per challenge

  return {
    totalChallenges,
    completedChallenges,
    totalStars,
    maxPossibleStars,
    progressPercentage:
      totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0,
    starPercentage:
      maxPossibleStars > 0 ? (totalStars / maxPossibleStars) * 100 : 0,
  };
}

/**
 * Get the next accessible challenge in a lesson
 * @param challenges - All challenges in the lesson (sorted by order)
 * @param submissions - Array of all submissions
 * @returns the next challenge that user can access, or null if all completed
 */
export function getNextAccessibleChallenge(
  challenges: ChallengeResult[] = [],
  submissions: SubmissionResult[] = []
): ChallengeResult | null {
  // Sort challenges by order to ensure correct sequence
  const sortedChallenges = [...challenges].sort((a, b) => a.order - b.order);

  for (const challenge of sortedChallenges) {
    const progress = getChallengeProgress(challenge.id, submissions);

    // If challenge is not completed and is accessible, return it
    if (
      !progress.isCompleted &&
      isChallengeAccessible(challenge, challenges, submissions)
    ) {
      return challenge;
    }
  }

  // All challenges are completed or none are accessible
  return null;
}

/**
 * Check if user has completed all challenges in a lesson
 * @param challenges - All challenges in the lesson
 * @param submissions - Array of all submissions
 * @returns boolean - true if all challenges are completed
 */
export function isLessonCompleted(
  challenges: ChallengeResult[] = [],
  submissions: SubmissionResult[] = []
): boolean {
  if (challenges.length === 0) return false;

  return challenges.every((challenge) => {
    const progress = getChallengeProgress(challenge.id, submissions);
    return progress.isCompleted;
  });
}
