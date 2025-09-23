import { ChallengeResult, ChallengeProcessResult } from "common/@types/challenge";

/**
 * Check if a challenge is accessible based on sequential completion logic
 * @param challenge - The challenge to check
 * @param challengeProcesses - Array of completed challenge processes
 * @returns boolean - true if challenge is accessible, false otherwise
 */
export function isChallengeAccessible(
  challenge: ChallengeResult,
  challengeProcesses: ChallengeProcessResult[] = []
): boolean {
  // First challenge (order 1) is always accessible
  if (challenge.order <= 1) {
    return true;
  }

  // Check if all previous challenges in the same lesson are completed
  const previousChallenges = challengeProcesses.filter(
    (process) => 
      process.challengeOrder < challenge.order &&
      process.challengeId !== challenge.id // Exclude current challenge
  );

  // For sequential access, we need all challenges from 1 to (current order - 1) to be completed
  for (let i = 1; i < challenge.order; i++) {
    const requiredProcess = previousChallenges.find(
      (process) => process.challengeOrder === i
    );
    
    // If any previous challenge is not completed, current challenge is locked
    if (!requiredProcess || !requiredProcess.completedAt) {
      return false;
    }
  }

  return true;
}

/**
 * Get challenge progress info (completion status, stars earned)
 * @param challengeId - The challenge ID to check
 * @param challengeProcesses - Array of challenge processes
 * @returns object with completion info
 */
export function getChallengeProgress(
  challengeId: string,
  challengeProcesses: ChallengeProcessResult[] = []
) {
  const process = challengeProcesses.find(
    (p) => p.challengeId === challengeId
  );

  return {
    isCompleted: !!process?.completedAt,
    stars: process?.bestStar || 0,
    completedAt: process?.completedAt,
    bestSubmissionId: process?.bestSubmissionId,
  };
}

/**
 * Calculate overall lesson progress
 * @param challenges - All challenges in the lesson
 * @param challengeProcesses - Array of challenge processes
 * @returns progress statistics
 */
export function getLessonProgress(
  challenges: ChallengeResult[] = [],
  challengeProcesses: ChallengeProcessResult[] = []
) {
  const totalChallenges = challenges.length;
  const completedChallenges = challengeProcesses.filter(
    (process) => 
      process.completedAt &&
      challenges.some(c => c.id === process.challengeId)
  ).length;

  const totalStars = challengeProcesses.reduce(
    (sum, process) => {
      // Only count stars for challenges that exist in current lesson
      if (challenges.some(c => c.id === process.challengeId)) {
        return sum + process.bestStar;
      }
      return sum;
    }, 
    0
  );

  const maxPossibleStars = totalChallenges * 3; // Assuming max 3 stars per challenge

  return {
    totalChallenges,
    completedChallenges,
    totalStars,
    maxPossibleStars,
    progressPercentage: totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0,
    starPercentage: maxPossibleStars > 0 ? (totalStars / maxPossibleStars) * 100 : 0,
  };
}

/**
 * Get the next accessible challenge in a lesson
 * @param challenges - All challenges in the lesson (sorted by order)
 * @param challengeProcesses - Array of challenge processes
 * @returns the next challenge that user can access, or null if all completed
 */
export function getNextAccessibleChallenge(
  challenges: ChallengeResult[] = [],
  challengeProcesses: ChallengeProcessResult[] = []
): ChallengeResult | null {
  // Sort challenges by order to ensure correct sequence
  const sortedChallenges = [...challenges].sort((a, b) => a.order - b.order);

  for (const challenge of sortedChallenges) {
    const progress = getChallengeProgress(challenge.id, challengeProcesses);
    
    // If challenge is not completed and is accessible, return it
    if (!progress.isCompleted && isChallengeAccessible(challenge, challengeProcesses)) {
      return challenge;
    }
  }

  // All challenges are completed or none are accessible
  return null;
}

/**
 * Check if user has completed all challenges in a lesson
 * @param challenges - All challenges in the lesson
 * @param challengeProcesses - Array of challenge processes
 * @returns boolean - true if all challenges are completed
 */
export function isLessonCompleted(
  challenges: ChallengeResult[] = [],
  challengeProcesses: ChallengeProcessResult[] = []
): boolean {
  if (challenges.length === 0) return false;

  return challenges.every(challenge => {
    const progress = getChallengeProgress(challenge.id, challengeProcesses);
    return progress.isCompleted;
  });
}