// CourseMap entity interfaces based on BE CourseMapController
export interface CourseMap {
  id: string;
  courseId: string;
  mapId: string;
  isRequired: boolean;
  order?: number;
  unlockCriteria?: UnlockCriteria;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  
  // Navigation properties (if populated by BE)
  course?: {
    id: string;
    title: string;
    imageUrl?: string;
  };
  map?: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
  };
}

// Unlock criteria for accessing the map in a course
export interface UnlockCriteria {
  requiredCourseMapIds?: string[]; // Must complete these course-maps first
  requiredScore?: number; // Minimum score required
  requiredLessonsCompleted?: number; // Number of lessons that must be completed
  requiredChallengesCompleted?: number; // Number of challenges that must be completed
}

// Request types
export interface CreateCourseMapRequest {
  courseId: string;
  mapId: string;
  isRequired?: boolean;
  order?: number;
  unlockCriteria?: UnlockCriteria;
  isActive?: boolean;
}

export interface UpdateCourseMapRequest {
  courseId?: string;
  mapId?: string;
  isRequired?: boolean;
  order?: number;
  unlockCriteria?: UnlockCriteria;
  isActive?: boolean;
}

export interface GetCourseMapsRequest {
  courseId?: string;
  mapId?: string;
  isRequired?: boolean;
  isActive?: boolean;
  includeDeleted?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: number;
  sortDirection?: number;
}

// Response types
export interface CourseMapResult extends CourseMap {}

export interface CourseMapsResponse {
  items: CourseMapResult[]; // Backend trả về 'items' thay vì 'data'
  page: number; // Backend trả về 'page' thay vì 'pageNumber'
  size: number; // Backend trả về 'size' thay vì 'pageSize'
  total: number; // Backend trả về 'total' thay vì 'totalCount'
  totalPages: number;
}

// Helper interfaces for specific use cases
export interface CourseMapWithProgress extends CourseMapResult {
  progress?: {
    isCompleted: boolean;
    completedAt?: string;
    score?: number;
    attempts?: number;
  };
}

export interface MapForCourse {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isRequired: boolean;
  order?: number;
  isUnlocked: boolean;
  progress?: {
    isCompleted: boolean;
    score?: number;
  };
}
