// Course Rating entity based on BE CourseRatingResult
export interface CourseRating {
  id: string;
  courseId: string;
  studentId: string;
  stars: number; // 1-5
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface CreateCourseRatingRequest {
  stars: number; // 1-5
  comment?: string; // Optional, max 1000 chars
}

export interface UpdateCourseRatingRequest {
  stars: number; // 1-5
  comment?: string; // Optional, max 1000 chars
}

// Get ratings request with pagination
export interface GetCourseRatingsRequest {
  courseId: string;
  page?: number; // default 1
  size?: number; // default 10, max 100
}

// Response types
export interface CourseRatingResult extends CourseRating {}

export interface CourseRatingsResponse {
  items: CourseRatingResult[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// Statistics response
export interface CourseRatingStatistics {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
