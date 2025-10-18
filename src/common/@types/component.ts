// Component entity interfaces based on BE ComponentController
export interface Component {
  id: string;
  name: string;
  description: string;
  type: ComponentType;
  imageUrl?: string;
  specifications?: string; // Backend uses string, not object
  
  // Store is showroom only - purchases via external platforms
  externalPurchaseLinks?: {
    facebook?: string;
    shopee?: string;
    lazada?: string;
    tiktokShop?: string;
    website?: string;
  };
  
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  imagesCount: number;
}

// Component type enum - MUST match backend exactly
export enum ComponentType {
  SENSOR = 1,
  ACTUATOR = 2,
  CONTROLLER = 3,
  POWER_SUPPLY = 4,
  CONNECTIVITY = 5,
  MECHANICAL = 6,
  DISPLAY = 7,
  AUDIO = 8,
  OTHER = 99,
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
  description: string;
  type: ComponentType;
  imageUrl?: string;
  specifications?: string;
}

export interface UpdateComponentRequest {
  name?: string;
  description?: string;
  type?: ComponentType;
  imageUrl?: string;
  specifications?: string;
}

export interface GetComponentsRequest {
  page?: number;
  size?: number;
  searchTerm?: string;
  type?: ComponentType;
  orderBy?: string;           // BE supports: "Name", "Type", "CreatedAt", "UpdatedAt"
  orderDirection?: "ASC" | "DESC";
}

// Response types
export interface ComponentResult extends Component {}

export interface ComponentsResponse {
  items: ComponentResult[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
