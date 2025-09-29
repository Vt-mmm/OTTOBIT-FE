// Robot entity interfaces based on BE RobotController - E-commerce Product Model
export interface Robot {
  id: string;
  name: string;
  model: string;
  brand: string;
  description?: string;
  imageUrl?: string;
  price: number;
  stockQuantity: number;
  technicalSpecs?: string;
  requirements?: string;
  minAge: number;
  maxAge: number;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  
  // Navigation properties (if populated by BE)
  images?: any[];
  courseRobots?: any[];
  studentRobots?: any[];
}

// Age range helper
export interface AgeRange {
  min: number;
  max: number;
}

// Request types
export interface CreateRobotRequest {
  name: string;
  model: string;
  brand: string;
  description?: string;
  imageUrl?: string;
  price: number;
  stockQuantity: number;
  technicalSpecs?: string;
  requirements?: string;
  minAge: number;
  maxAge: number;
}

export interface UpdateRobotRequest {
  name?: string;
  model?: string;
  brand?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  stockQuantity?: number;
  technicalSpecs?: string;
  requirements?: string;
  minAge?: number;
  maxAge?: number;
}

export interface GetRobotsRequest {
  searchTerm?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minAge?: number;
  maxAge?: number;
  inStock?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: number;
  sortDirection?: number;
}

// Response types
export interface RobotResult extends Robot {}

export interface RobotsResponse {
  items: RobotResult[]; // Backend trả về 'items' thay vì 'data'
  page: number; // Backend trả về 'page' thay vì 'pageNumber'
  size: number; // Backend trả về 'size' thay vì 'pageSize'
  total: number; // Backend trả về 'total' thay vì 'totalCount'
  totalPages: number;
}
