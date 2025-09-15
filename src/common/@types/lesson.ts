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
}

// Hook parameter types
export interface GetLessonsParams extends GetLessonsRequest {}

export interface CreateLessonData extends CreateLessonRequest {}

export interface UpdateLessonData extends UpdateLessonRequest {}

// Response types
export interface LessonResult extends Lesson {}

export interface LessonsResponse {
  data: LessonResult[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}