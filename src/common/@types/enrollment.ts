// Enrollment entity interfaces based on BE models
export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  progress: number; // 0.0 to 1.0 (0% to 100%)
  enrollmentDate: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  studentName?: string;
  courseTitle?: string;
  courseDescription?: string;
  courseImageUrl?: string;
}

// Request types
export interface CreateEnrollmentRequest {
  courseId: string;
}

export interface GetEnrollmentsRequest {
  searchTerm?: string;
  studentId?: string;
  courseId?: string;
  isCompleted?: boolean;
  includeDeleted?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetMyEnrollmentsRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface CompleteEnrollmentRequest {
  id: string;
}

// Response types
export interface EnrollmentResult extends Enrollment {}

export interface EnrollmentsResponse {
  data: EnrollmentResult[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}