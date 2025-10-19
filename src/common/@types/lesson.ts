// Import Challenge type for relationship
import { Challenge } from "./challenge";

// Lesson entity interfaces based on BE models
export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  durationInMinutes: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  challengesCount?: number;
  courseTitle?: string;
  challenges?: Challenge[]; // Array of challenges for this lesson
  isDeleted?: boolean;
}

// LessonPreview interface matching BE LessonPreviewResult
export interface LessonPreview {
  id: string;
  courseId: string;
  title: string;
  durationInMinutes: number;
  order: number;
  courseTitle?: string;
  // Note: BE LessonPreviewResult does NOT include challengesCount or content
}

// Request types
export interface CreateLessonRequest {
  courseId: string;
  title: string;
  content: string;
  durationInMinutes: number;
  order: number;
}

export interface UpdateLessonRequest {
  courseId: string;
  title: string;
  content: string;
  durationInMinutes: number;
  order: number;
}

export interface GetLessonsRequest {
  searchTerm?: string;
  courseId?: string;
  durationFrom?: number;
  durationTo?: number;
  includeDeleted?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: number;
  sortDirection?: number;
}

export interface GetLessonsPreviewRequest {
  courseId?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Hook parameter types
export interface GetLessonsParams extends GetLessonsRequest {}

export interface CreateLessonData extends CreateLessonRequest {}

export interface UpdateLessonData extends UpdateLessonRequest {}

// Response types
export interface LessonResult extends Lesson {}

export interface LessonsResponse {
  items: LessonResult[]; // Backend trả về 'items' thay vì 'data'
  page: number; // Backend trả về 'page' thay vì 'pageNumber'
  size: number; // Backend trả về 'size' thay vì 'pageSize'
  total: number; // Backend trả về 'total' thay vì 'totalCount'
  totalPages: number;
}

export interface LessonsPreviewResponse {
  items: LessonPreview[]; // Preview lessons - BE returns LessonPreviewResult (no challengesCount)
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// Lesson Progress types (for user progress tracking)
export enum LessonStatus {
  NotStarted = "NotStarted",
  InProgress = "InProgress",
  Completed = "Completed",
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  status: LessonStatus;
  startedAt?: string;
  completedAt?: string;
  currentChallengeOrder: number;
  lessonTitle: string;
  lessonOrder: number;
  courseTitle: string;
  studentName: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgressResult extends LessonProgress {}

export interface LessonProgressResponse {
  items: LessonProgressResult[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// Request types for lesson progress
export interface GetLessonProgressRequest {
  courseId?: string;
  lessonId?: string;
  status?: LessonStatus;
  page?: number;
  size?: number;
}

export interface StartLessonRequest {
  lessonId: string;
}
