// Image entity interfaces based on BE ImageController
export interface Image {
  id: string;
  url: string;
  robotId?: string; // Optional - links to Robot
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;

  // Navigation properties (if populated by BE)
  robot?: {
    id: string;
    name: string;
  };
}

// Request types
export interface CreateImageRequest {
  url: string;
  robotId?: string; // Optional - links to Robot
}

export interface UpdateImageRequest {
  url?: string;
  robotId?: string; // Optional - links to Robot
}

export interface GetImagesRequest {
  robotId?: string; // Filter by robot
  pageNumber?: number;
  pageSize?: number;
  sortBy?: number;
  sortDirection?: number;
}

// Response types
export interface ImageResult extends Image {}

export interface ImagesResponse {
  items: ImageResult[]; // Backend trả về 'items' thay vì 'data'
  page: number; // Backend trả về 'page' thay vì 'pageNumber'
  size: number; // Backend trả về 'size' thay vì 'pageSize'
  total: number; // Backend trả về 'total' thay vì 'totalCount'
  totalPages: number;
}
