// Map Designer Types & Interfaces

export interface CreateMapRequest {
  name: string;
  description?: string;
  rows: number;
  cols: number;
  cells: MapCellData[][];
  winConditions: WinConditionData[];
}

export interface UpdateMapRequest {
  id: string;
  name?: string;
  description?: string;
  cells?: MapCellData[][];
  winConditions?: WinConditionData[];
}

export interface MapCellData {
  row: number;
  col: number;
  terrain: string | null;
  object: string | null;
}

export interface WinConditionData {
  type: string;
  value?: number;
  description: string;
}

export interface MapDesignerState {
  selectedAsset: string;
  mapName: string;
  mapGrid: MapCellData[][];
  winConditions: WinConditionData[];
  isDrawing: boolean;
  zoom: number;
}

export type AssetCategory = 'terrain' | 'object' | 'robot' | 'item' | 'tool';