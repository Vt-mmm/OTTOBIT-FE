// Course entity interfaces based on BE models
export interface Course {
  id: string;
  createdById: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  lessonsCount?: number;
  enrollmentsCount?: number;
  createdByName?: string;
}

// Request types
export interface CreateCourseRequest {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface UpdateCourseRequest {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface GetCoursesRequest {
  searchTerm?: string;
  createdById?: string;
  includeDeleted?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// Response types
export interface CourseResult extends Course {}

export interface CoursesResponse {
  data: CourseResult[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}