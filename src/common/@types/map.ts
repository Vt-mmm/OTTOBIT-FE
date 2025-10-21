// Map entity interfaces based on BE models
export interface Map {
  id: string;
  title: string;
  mapJson: string; // JSON string for map configuration
  description?: string;
  createdAt: string;
  updatedAt: string;
  challengesCount?: number; // Number of challenges using this map
  coursesCount?: number; // Number of courses this map is assigned to
  // Soft-delete flag from backend
  isDeleted?: boolean;
}

// Request types
export interface CreateMapRequest {
  title: string;
  mapJson: string;
  description?: string;
}

export interface UpdateMapRequest {
  title: string;
  mapJson: string;
  description?: string;
}

export interface GetMapsRequest {
  searchTerm?: string;
  sortBy?: MapSortBy;
  sortDirection?: SortDirection;
  includeDeleted?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// Enums for sorting
export enum MapSortBy {
  Title = 0, // Sắp xếp theo tên map
  CreatedAt = 1, // Sắp xếp theo ngày tạo
  UpdatedAt = 2, // Sắp xếp theo ngày cập nhật
  ChallengesCount = 3, // Sắp xếp theo số lượng challenges
  CoursesCount = 4, // Sắp xếp theo số lượng courses
}

export enum SortDirection {
  Ascending = "Ascending",
  Descending = "Descending",
}

// Hook parameter types
export interface GetMapsParams extends GetMapsRequest {}

export interface CreateMapData extends CreateMapRequest {}

export interface UpdateMapData extends UpdateMapRequest {}

// Response types
export interface MapResult extends Map {}

export interface MapsResponse {
  items: MapResult[]; // Backend returns 'items'
  page: number; // Backend returns 'page'
  size: number; // Backend returns 'size'
  total: number; // Backend returns 'total'
  totalPages: number; // Backend returns 'totalPages'
}
