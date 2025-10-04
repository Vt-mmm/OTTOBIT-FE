// Robot entity interfaces based on BE RobotController - E-commerce Product Model
export interface Robot {
  id: string;
  name: string;
  model: string;
  brand: string;
  description?: string;
  imageUrl?: string;
  technicalSpecs?: string;
  requirements?: string;
  minAge: number;
  maxAge: number;
  // No price/stock - Store is showroom only, purchases via external platforms
  externalPurchaseLinks?: {
    facebook?: string;
    shopee?: string;
    lazada?: string;
    tiktokShop?: string;
  };
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;

  // Navigation properties (if populated by BE)
  images?: any[];
  courseRobots?: any[];
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
  technicalSpecs?: string;
  requirements?: string;
  minAge?: number;
  maxAge?: number;
}

export interface GetRobotsRequest {
  searchTerm?: string;
  brand?: string;
  minAge?: number;
  maxAge?: number;
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
