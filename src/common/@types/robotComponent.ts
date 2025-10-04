// RobotComponent entity represents the many-to-many relationship between Robot and Component
// It stores which components are required for each robot and in what quantity

export interface RobotComponent {
  id: string;
  robotId: string;
  componentId: string;
  quantity: number;
  robotName: string; // Populated from Robot entity
  componentName: string; // Populated from Component entity
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// Request for getting list of robot components with filters
export interface GetRobotComponentsRequest {
  page?: number;
  pageSize?: number;
  size?: number;
  searchTerm?: string;
  robotId?: string; // Filter by specific robot
  componentId?: string; // Filter by specific component
  includeDeleted?: boolean;
  orderBy?:
    | "RobotName"
    | "ComponentName"
    | "Quantity"
    | "CreatedAt"
    | "UpdatedAt";
  orderDirection?: "ASC" | "DESC";
}

// Response for paginated list
export interface RobotComponentsResponse {
  items: RobotComponent[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Create new robot component (Admin only)
export interface CreateRobotComponentRequest {
  robotId: string;
  componentId: string;
  quantity: number;
}

// Update existing robot component (Admin only)
export interface UpdateRobotComponentRequest {
  id: string;
  robotId?: string;
  componentId?: string;
  quantity?: number;
}

// Form data for UI (includes optional fields for validation)
export interface RobotComponentFormData {
  robotId: string;
  componentId: string;
  quantity: number;
}
