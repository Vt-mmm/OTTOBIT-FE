// Enrollment Status enum
export enum EnrollmentStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Enrollment entity interfaces based on BE models
export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  progress: number; // 0.0 to 1.0 (0% to 100%)
  enrollmentDate: string;
  isCompleted: boolean;
  status: EnrollmentStatus;
  completedLessonsCount: number;
  totalLessonsCount: number;
  lastAccessedAt?: string;
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
  status?: EnrollmentStatus;
  isCompleted?: boolean;
  includeDeleted?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetMyEnrollmentsRequest {
  pageNumber?: number;
  pageSize?: number;
  isCompleted?: boolean; // filter per BE: default false
}

export interface CompleteEnrollmentRequest {
  id: string;
}

// Response types
export interface EnrollmentResult extends Enrollment {}

export interface EnrollmentsResponse {
  items: EnrollmentResult[];  // Backend trả về 'items' thay vì 'data'
  page: number;               // Backend trả về 'page' thay vì 'pageNumber' 
  size: number;               // Backend trả về 'size' thay vì 'pageSize'
  total: number;              // Backend trả về 'total' thay vì 'totalCount'
  totalPages: number;
}
