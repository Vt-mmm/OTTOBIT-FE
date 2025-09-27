// Course entity interfaces based on BE models
export interface Course {
  id: string;
  createdById: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
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
  sortBy?: number;
  sortDirection?: number;
}

// Response types
export interface CourseResult extends Course {}

export interface CoursesResponse {
  items: CourseResult[]; // Backend trả về 'items' thay vì 'data'
  page: number; // Backend trả về 'page' thay vì 'pageNumber'
  size: number; // Backend trả về 'size' thay vì 'pageSize'
  total: number; // Backend trả về 'total' thay vì 'totalCount'
  totalPages: number;
}
