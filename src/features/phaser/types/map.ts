/**
 * Map API Types for Backend Integration
 */

export enum MapType {
  BASIC = 0,
  INTERMEDIATE = 1,
  ADVANCED = 2,
  CHALLENGE = 3,
}

export interface MapResult {
  id: string;
  index: number;
  key: string;
  type: MapType;
  mapCategoryId: string;
  mapCategoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface MapsQuery {
  page?: number;
  size?: number;
  type?: MapType;
  mapCategoryId?: string;
}

export interface PaginatedMapResult {
  items: MapResult[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface MapsGroupedByTypeResult {
  mapsByType: {
    [key: string]: MapResult[]; // Key là tên loại map từ backend
  };
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  errors?: string[] | null;
  errorCode?: string | null;
  timestamp?: string;
}

export interface MapApiError {
  code: string;
  message: string;
  details?: any;
}

// Types for Map State Management
export interface MapState {
  // All maps data
  allMaps: {
    data: PaginatedMapResult | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: MapsQuery | null;
  };

  // Lesson maps grouped by type
  lessonMaps: {
    data: MapsGroupedByTypeResult | null;
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;
  };

  // Current selected map
  currentMap: {
    mapKey: string | null;
    mapData: MapResult | null;
  };

  // Cache management
  cache: {
    isClearing: boolean;
    lastCleared: number | null;
  };
}

// Action payload types for Redux
export interface FetchAllMapsPayload extends MapsQuery {}

export interface SetCurrentMapPayload {
  mapKey: string;
  mapData?: MapResult;
}

export interface MapApiCallOptions {
  skipCache?: boolean;
  timeout?: number;
  retries?: number;
}
