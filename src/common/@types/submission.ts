// Submission entity interfaces based on BE models
export interface Submission {
  id: string;
  challengeId: string;
  studentId: string;
  codeJson: string; // JSON string for user's code/blocks
  star: number; // 0-5 rating
  createdAt: string;
  updatedAt: string;
  challengeTitle?: string;
  studentName?: string;
  lessonTitle?: string;
  courseTitle?: string;
}

// Request types
export interface CreateSubmissionRequest {
  challengeId: string;
  codeJson: string;
  star?: number; // Default 0
}

export interface UpdateSubmissionRequest {
  challengeId: string;
  codeJson: string;
  star?: number;
}

export interface GetSubmissionsRequest {
  searchTerm?: string;
  challengeId?: string;
  studentId?: string;
  starFrom?: number;
  starTo?: number;
  includeDeleted?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetMySubmissionsRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface GetSubmissionsByChallengeRequest {
  challengeId: string;
  pageNumber?: number;
  pageSize?: number;
}

// Response types
export interface SubmissionResult extends Submission {}

export interface SubmissionsResponse {
  data: SubmissionResult[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}