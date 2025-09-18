// Challenge difficulty levels
export enum ChallengeDifficulty {
  VERY_EASY = 1,
  EASY = 2,
  MEDIUM = 3,
  HARD = 4,
  VERY_HARD = 5,
}

// Challenge status
export enum ChallengeStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// Difficulty labels for UI
export const DIFFICULTY_LABELS = {
  [ChallengeDifficulty.VERY_EASY]: "Very Easy",
  [ChallengeDifficulty.EASY]: "Easy",
  [ChallengeDifficulty.MEDIUM]: "Medium",
  [ChallengeDifficulty.HARD]: "Hard",
  [ChallengeDifficulty.VERY_HARD]: "Very Hard",
} as const;

// Difficulty colors for UI
export const DIFFICULTY_COLORS = {
  [ChallengeDifficulty.VERY_EASY]: "#4CAF50",
  [ChallengeDifficulty.EASY]: "#8BC34A",
  [ChallengeDifficulty.MEDIUM]: "#FF9800",
  [ChallengeDifficulty.HARD]: "#FF5722",
  [ChallengeDifficulty.VERY_HARD]: "#F44336",
} as const;
