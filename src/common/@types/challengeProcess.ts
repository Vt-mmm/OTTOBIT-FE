// Import related types for relationships
import { Challenge } from './challenge';
import { Enrollment } from './enrollment';
import { Submission } from './submission';

// ChallengeProcess entity interfaces based on BE models
export interface ChallengeProcess {
  id: string;
  enrollmentId: string;
  challengeId: string;
  bestStar: number; // Best rating achieved (0-5)
  bestSubmissionId?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Navigation properties (populated when requested)
  challenge?: Challenge;
  enrollment?: Enrollment;
  bestSubmission?: Submission;
}

// Request types
export interface GetChallengeProcessesRequest {
  page?: number;
  size?: number;
  isCompleted?: boolean;
  minStars?: number;
  difficulty?: number;
  lessonId?: string;
  courseId?: string;
}

// Hook parameter types
export interface GetMyChallengeProcessesParams extends GetChallengeProcessesRequest {}

// Response types
export interface ChallengeProcessResult extends ChallengeProcess {}

export interface ChallengeProcessesResponse {
  items: ChallengeProcessResult[];  // Backend returns 'items'
  page: number;                     // Backend returns 'page'
  size: number;                     // Backend returns 'size'
  total: number;                    // Backend returns 'total'
  totalPages: number;               // Backend returns 'totalPages'
}

// Additional interfaces for UI
export interface ChallengeProgressSummary {
  totalChallenges: number;
  completedChallenges: number;
  averageStars: number;
  completionPercentage: number;
}

export interface ChallengeDifficulty {
  difficulty: number;
  total: number;
  completed: number;
  percentage: number;
}