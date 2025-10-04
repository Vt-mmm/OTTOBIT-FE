// LessonResource entity interfaces based on BE LessonResourceController

// Resource type enum
export enum ResourceType {
  VIDEO = 1,
  DOCUMENT = 2,
  LINK = 3,
  FILE = 4,
}

// LessonResource entity
export interface LessonResource {
  id: string;
  lessonId: string;
  type: ResourceType;
  title: string;
  description: string;
  url: string;
  order: number;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;

  // Navigation properties (if populated by BE)
  lesson?: {
    id: string;
    title: string;
    courseId: string;
  };
  lessonTitle?: string;
  courseTitle?: string;
}

// Request types
export interface CreateLessonResourceRequest {
  lessonId: string;
  type: ResourceType;
  title: string;
  description: string;
  url: string;
  order: number;
  isRequired?: boolean;
}

export interface UpdateLessonResourceRequest {
  lessonId?: string;
  type?: ResourceType;
  title?: string;
  description?: string;
  url?: string;
  order?: number;
  isRequired?: boolean;
}

export interface GetLessonResourcesRequest {
  lessonId?: string;
  courseId?: string;
  type?: ResourceType;
  searchTerm?: string;
  includeDeleted?: boolean; // ⭐️ NEW: For admin list
  pageNumber?: number;
  pageSize?: number;
}

// Response types
export interface LessonResourceResult extends LessonResource {}

export interface LessonResourcesResponse {
  items: LessonResourceResult[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
