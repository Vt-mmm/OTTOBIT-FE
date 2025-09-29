// Component entity interfaces based on BE ComponentController
export interface Component {
  id: string;
  name: string;
  description?: string;
  type: ComponentType;
  imageUrl?: string;
  specifications?: ComponentSpecifications;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

// Component type enum
export enum ComponentType {
  SENSOR = "SENSOR",
  ACTUATOR = "ACTUATOR", 
  CONTROLLER = "CONTROLLER",
  STRUCTURAL = "STRUCTURAL",
  OTHER = "OTHER",
}

// Component specifications
export interface ComponentSpecifications {
  voltage?: string;
  current?: string;
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
  };
  weight?: number;
  operatingTemperature?: {
    min: number;
    max: number;
  };
  compatibility?: string[];
  pins?: ComponentPin[];
}

export interface ComponentPin {
  name: string;
  type: "INPUT" | "OUTPUT" | "POWER" | "GROUND";
  description?: string;
}

// Request types
export interface CreateComponentRequest {
  name: string;
  description?: string;
  type: ComponentType;
  imageUrl?: string;
  specifications?: ComponentSpecifications;
  isActive?: boolean;
}

export interface UpdateComponentRequest {
  name?: string;
  description?: string;
  type?: ComponentType;
  imageUrl?: string;
  specifications?: ComponentSpecifications;
  isActive?: boolean;
}

export interface GetComponentsRequest {
  searchTerm?: string;
  type?: ComponentType;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: number;
  sortDirection?: number;
}

// Response types
export interface ComponentResult extends Component {}

export interface ComponentsResponse {
  items: ComponentResult[]; // Backend trả về 'items' thay vì 'data'
  page: number; // Backend trả về 'page' thay vì 'pageNumber'
  size: number; // Backend trả về 'size' thay vì 'pageSize'
  total: number; // Backend trả về 'total' thay vì 'totalCount'
  totalPages: number;
}
