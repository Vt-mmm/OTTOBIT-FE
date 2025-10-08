export interface LessonNote {
  id: string;
  studentId: string;
  lessonId: string;
  lessonResourceId?: string;
  content: string;
  timestampInSeconds?: number;
  createdAt: string;
  updatedAt: string;
  studentFullname?: string;
  lessonTitle?: string;
  courseTitle?: string;
  lessonOrder: number;
  resourceTitle?: string;
}

export interface CreateLessonNotePayload {
  lessonId: string;
  lessonResourceId?: string;
  content: string;
  timestampInSeconds?: number;
}

export interface UpdateLessonNotePayload {
  content: string;
  timestampInSeconds?: number;
}

export interface GetMyLessonNotesParams {
  pageNumber?: number;
  pageSize?: number;
  lessonId?: string;
  courseId?: string;
  lessonResourceId?: string;
  searchTerm?: string;
}

export interface LessonNoteResponse {
  items: LessonNote[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
