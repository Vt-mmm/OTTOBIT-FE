// CourseRobot entity interfaces - Many-to-Many relationship between Course and Robot
export interface CourseRobot {
  id: string;
  courseId: string;
  robotId: string;
  isRequired: boolean;
  order?: number;
  unlockCriteria?: {
    requiredLessonId?: string;
    requiredLevel?: number;
    minimumScore?: number;
  };
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;

  // Navigation properties (if populated by BE)
  course?: {
    id: string;
    title: string;
    imageUrl?: string;
  };
  robot?: {
    id: string;
    name: string;
    model: string;
    brand: string;
    imageUrl?: string;
    price: number;
  };
}

// Request types
export interface CreateCourseRobotRequest {
  courseId: string;
  robotId: string;
  isRequired?: boolean;
  order?: number;
  unlockCriteria?: {
    requiredLessonId?: string;
    requiredLevel?: number;
    minimumScore?: number;
  };
}

export interface UpdateCourseRobotRequest {
  isRequired?: boolean;
  order?: number;
  unlockCriteria?: {
    requiredLessonId?: string;
    requiredLevel?: number;
    minimumScore?: number;
  };
}

export interface GetCourseRobotsRequest {
  courseId?: string;
  robotId?: string;
  isRequired?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: number;
  sortDirection?: number;
}

// Response types
export interface CourseRobotResult extends CourseRobot {
  // Flat fields from backend response (alternative to nested course/robot objects)
  courseTitle?: string;
  robotName?: string;
  robotBrand?: string;
  robotModel?: string;
  robotPrice?: number;
  robotStockQuantity?: number;
}

export interface CourseRobotsResponse {
  items: CourseRobotResult[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// Helper type for displaying robot requirements in course
export interface CourseRobotSummary {
  robotId: string;
  robotName: string;
  robotModel: string;
  robotBrand: string;
  robotImageUrl?: string;
  robotPrice: number;
  isRequired: boolean;
  order?: number;
  unlockCriteria?: {
    requiredLessonId?: string;
    requiredLevel?: number;
    minimumScore?: number;
  };
}