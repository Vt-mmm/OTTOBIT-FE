// Import related types for relationships
import { Lesson } from './lesson';
import { Enrollment } from './enrollment';

// LessonStatus enum matching BE
export enum LessonStatus {
  Locked = "Locked",
  Available = "Available",
  InProgress = "InProgress",
  Completed = "Completed",
}

// Sorting enums
export enum LessonProgressSortBy {
  LessonOrder = "LessonOrder",
  Status = "Status",
  StartedAt = "StartedAt",
  CompletedAt = "CompletedAt",
  CreatedAt = "CreatedAt",
}

export enum SortDirection {
  Ascending = "Ascending",
  Descending = "Descending",
}

// LessonProgress entity interfaces based on BE models
export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  status: LessonStatus;
  startedAt?: string;
  currentChallengeOrder: number; // Current challenge being worked on
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Navigation properties (populated when requested)
  lesson?: Lesson;
  enrollment?: Enrollment;
}

// LessonProgressResult from BE
export interface LessonProgressResultFromBE {
  id: string;
  enrollmentId: string;
  lessonId: string;
  lessonTitle: string;
  lessonOrder: number;
  status: LessonStatus;
  startedAt?: string;
  completedAt?: string;
  currentChallengeOrder: number;
  totalChallenges: number;
  studentName: string;
  courseTitle: string;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface GetLessonProgressRequest {
  courseId?: string;
  status?: LessonStatus;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: LessonProgressSortBy;
  sortDirection?: SortDirection;
}

export interface StartLessonRequest {
  lessonId: string;
}

// Hook parameter types
export interface GetMyLessonProgressParams extends GetLessonProgressRequest {}

export interface StartLessonParams extends StartLessonRequest {}

// Response types
export interface LessonProgressResult extends LessonProgressResultFromBE {}

export interface LessonProgressResponse {
  items: LessonProgressResult[];  // Backend returns 'items'
  page: number;                   // Backend returns 'page'
  size: number;                   // Backend returns 'size'
  total: number;                  // Backend returns 'total'
  totalPages: number;             // Backend returns 'totalPages'
}

// Additional interfaces for UI
export interface LessonProgressSummary {
  totalLessons: number;
  lockedLessons: number;
  availableLessons: number;
  inProgressLessons: number;
  completedLessons: number;
  completionPercentage: number;
}

export interface CourseProgressOverview {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  currentLesson?: LessonProgress;
  nextLesson?: LessonProgress;
  progressPercentage: number;
}