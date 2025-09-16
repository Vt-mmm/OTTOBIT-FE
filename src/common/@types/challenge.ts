// Challenge entity interfaces based on BE models
export interface Challenge {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  order: number;
  difficulty: number; // 1-5 scale
  mapJson: string; // JSON string for map configuration
  challengeJson: string; // JSON string for challenge rules
  solutionJson: string; // JSON string for solution
  createdAt: string;
  updatedAt: string;
  submissionsCount?: number;
  lessonTitle?: string;
  courseTitle?: string;
}

// Request types
export interface CreateChallengeRequest {
  lessonId: string;
  title: string;
  description: string;
  order: number;
  difficulty: number;
  mapJson: string;
  challengeJson: string;
  solutionJson: string;
}

export interface UpdateChallengeRequest {
  lessonId: string;
  title: string;
  description: string;
  order: number;
  difficulty: number;
  mapJson: string;
  challengeJson: string;
  solutionJson: string;
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
