// CourseType enum from backend
export enum CourseType {
  Free = 1,
  Premium = 2,
}

// Course entity interfaces based on BE models
export interface Course {
  id: string;
  createdById: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  type: CourseType;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  lessonsCount?: number;
  enrollmentsCount?: number;
  createdByName?: string;

  // Enrollment status (from BE when user is authenticated)
  isEnrolled?: boolean | null;
  enrollmentDate?: string | null;

  // Robot requirements (populated by BE if requested)
  courseRobots?: CourseRobotInfo[];
}

// Helper interface for robot info in course
export interface CourseRobotInfo {
  robotId: string;
  robotName: string;
  robotModel: string;
  robotBrand: string;
  robotImageUrl?: string;
  isRequired: boolean;
}

// Request types
export interface CreateCourseRequest {
  title: string;
  description: string;
  imageUrl?: string;
  price: number;
  type: CourseType;
}

export interface UpdateCourseRequest {
  title: string;
  description: string;
  imageUrl?: string;
  price: number;
  type: CourseType;
}

export interface GetCoursesRequest {
  searchTerm?: string;
  createdById?: string;
  type?: CourseType; // NEW: Filter by course type
  minPrice?: number; // NEW: Filter by minimum price
  maxPrice?: number; // NEW: Filter by maximum price
  includeDeleted?: boolean;
  IsDeleted?: boolean; // Admin: filter only deleted or only active
  pageNumber?: number;
  pageSize?: number;
  sortBy?: number;
  sortDirection?: number;
  // Admin filters
  MinPrice?: number;
  MaxPrice?: number;
  Type?: number; // 1=Free, 2=Paid
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
