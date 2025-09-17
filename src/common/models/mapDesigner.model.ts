// Map Designer Models - Chuẩn theo BE response

export interface MapAsset {
  id: string;
  name: string;
  imagePath: string;
  category: "terrain" | "object" | "robot" | "item" | "tool";
  rotatable?: boolean;
  description?: string;
}

export interface MapCell {
  row: number;
  col: number;
  terrain: string | null;
  object: string | null;
  items?: string[]; // Support multiple items (pins, boxes) on one cell
  itemCount?: number; // Number of items stacked
}

export interface MapData {
  id?: string;
  name: string;
  description?: string;
  rows: number;
  cols: number;
  cells: MapCell[][];
  winConditions: WinCondition[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface WinCondition {
  id: string;
  type: string;
  value?: number;
  description: string;
}

export interface WinConditionType {
  id: string;
  name: string;
  description: string;
  requiresValue?: boolean;
  valueLabel?: string;
}

// Response types từ BE
export interface MapAssetResponse {
  message: string;
  data: MapAsset[];
  errors?: string[] | null;
  errorCode?: string | null;
}

export interface MapDataResponse {
  message: string;
  data: MapData;
  errors?: string[] | null;
  errorCode?: string | null;
}

export interface MapListResponse {
  message: string;
  data: MapData[];
  errors?: string[] | null;
  errorCode?: string | null;
}
