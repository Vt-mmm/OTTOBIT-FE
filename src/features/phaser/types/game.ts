/**
 * Game State and Configuration Types
 */

export interface MapConfig {
  key: string;
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  requiredBatteries: {
    total: number;
    byType: { red: number; yellow: number; green: number };
  };
  maxSteps?: number;
  timeLimit?: number;
}

export interface RobotState {
  position: { x: number; y: number };
  direction: number; // 0: North, 1: East, 2: South, 3: West
  isMoving: boolean;
  currentAction?: string;
}

export interface BatteryState {
  position: { x: number; y: number };
  type: "red" | "yellow" | "green";
  collected: boolean;
  sprite?: any;
}

export interface TileState {
  x: number;
  y: number;
  type: "grass" | "road" | "ice" | "wall";
  hasRobot: boolean;
  batteries: BatteryState[];
}

export interface GameProgress {
  currentMap: string;
  completedMaps: string[];
  totalScore: number;
  bestScores: Record<string, number>;
  achievements: string[];
}

export interface SimulationConfig {
  executionSpeed: number; // ms between commands
  animationSpeed: number; // ms for animations
  enableSounds: boolean;
  enableParticles: boolean;
  showGrid: boolean;
  showCoordinates: boolean;
}

export interface GameSession {
  id: string;
  startTime: number;
  endTime?: number;
  mapKey: string;
  program: any;
  result?: "victory" | "defeat" | "error";
  score?: number;
  steps?: number;
  timeSpent?: number;
}
