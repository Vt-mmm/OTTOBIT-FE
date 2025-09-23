// Import Map type for relationship
import { Map } from './map';

// Challenge Mode enum
export enum ChallengeMode {
  Simulation = "Simulation",
  PhysicalFirst = "PhysicalFirst",
  SimulationPhysical = "SimulationPhysical",
}

// Challenge entity interfaces based on BE models
export interface Challenge {
  id: string;
  lessonId: string;
  mapId: string; // Reference to Map entity
  title: string;
  description: string;
  order: number;
  difficulty: number; // 1-5 scale
  challengeJson: string; // JSON string for challenge rules
  solutionJson?: string; // JSON string for solution (only for admin)
  challengeMode: ChallengeMode;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  submissionsCount?: number;
  lessonTitle?: string;
  courseTitle?: string;
  // Map data (populated by backend mapping)
  mapTitle?: string; // From Map entity
  mapJson?: string; // From Map entity
  // Navigation properties
  map?: Map; // Map relationship (if needed)
}

// Request types
export interface CreateChallengeRequest {
  lessonId: string;
  mapId: string; // ⭐️ CHANGED: Use mapId instead of mapJson
  title: string;
  description: string;
  order: number;
  difficulty: number;
  challengeJson: string;
  solutionJson: string;
  challengeMode: ChallengeMode; // ⭐️ NEW: Challenge mode
}

export interface UpdateChallengeRequest {
  lessonId: string;
  mapId: string; // ⭐️ CHANGED: Use mapId instead of mapJson
  title: string;
  description: string;
  order: number;
  difficulty: number;
  challengeJson: string;
  solutionJson: string;
  challengeMode: ChallengeMode; // ⭐️ NEW: Challenge mode
}

export interface GetChallengesRequest {
  searchTerm?: string;
  lessonId?: string;
  courseId?: string;
  difficultyFrom?: number;
  difficultyTo?: number;
  includeDeleted?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetChallengesForUserRequest {
  pageNumber?: number;
  pageSize?: number;
}

// Hook parameter types
export interface GetChallengesParams extends GetChallengesRequest {}

export interface GetChallengesByLessonParams {
  lessonId: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateChallengeData extends CreateChallengeRequest {}

export interface UpdateChallengeData extends UpdateChallengeRequest {}

// Response types
export interface ChallengeResult extends Challenge {}

export interface ChallengesResponse {
  items: ChallengeResult[];  // Backend trả về 'items' thay vì 'data'
  page: number;             // Backend trả về 'page' thay vì 'pageNumber'
  size: number;             // Backend trả về 'size' thay vì 'pageSize'
  total: number;            // Backend trả về 'total' thay vì 'totalCount'
  totalPages: number;
}

// Challenge Process types (for user progress tracking)
export interface ChallengeProcess {
  id: string;
  enrollmentId: string;
  challengeId: string;
  challengeTitle: string;
  challengeOrder: number;
  difficulty: number;
  bestStar: number;
  bestSubmissionId?: string;
  completedAt?: string;
  studentName: string;
  lessonTitle: string;
  courseTitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeProcessResult extends ChallengeProcess {}

export interface ChallengeProcessesResponse {
  items: ChallengeProcessResult[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// Request types for challenge processes
export interface GetChallengeProcessesRequest {
  courseId?: string;
  lessonId?: string;
  isCompleted?: boolean;
  minStars?: number;
  difficulty?: number;
  page?: number;
  size?: number;
}
