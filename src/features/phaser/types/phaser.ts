/**
 * Phaser Communication Types
 */

export interface PhaserMessage {
  source: "parent-website";
  type:
    | "START_MAP"
    | "LOAD_MAP"
    | "LOAD_LEVEL"
    | "LOAD_MAP_AND_CHALLENGE"
    | "RUN_PROGRAM"
    | "GET_STATUS"
    | "PAUSE_PROGRAM"
    | "STOP_PROGRAM";
  data: {
    mapKey?: string;
    levelId?: string;
    metadata?: any;
    program?: ProgramData;
    mapJson?: any;
    challengeJson?: any;
  };
}

export interface PhaserResponse {
  source: "phaser-robot-game";
  type:
    | "READY"
    | "VICTORY"
    | "PROGRESS"
    | "ERROR"
    | "LOSE"
    | "STATUS"
    | "PROGRAM_STARTED"
    | "PROGRAM_PAUSED"
    | "PROGRAM_STOPPED";
  data: any;
  timestamp: number;
}

export interface ProgramData {
  version: string;
  programName: string;
  actions: ProgramAction[];
  functions?: ProgramFunction[];
}

export interface ProgramFunction {
  name: string;
  body: ProgramAction[];
}

export interface ProgramAction {
  type:
    | "forward"
    | "turnRight"
    | "turnLeft"
    | "turnBack"
    | "collect"
    | "collectOnce"
    | "takeBox"
    | "putBox"
    | "repeat"
    | "repeatRange"
    | "if"
    | "while"
    | "callFunction";
  count?: number;
  color?: string;
  colors?: string[];
  // Control structure properties
  body?: ProgramAction[];
  variable?: string;
  from?: number;
  to?: number;
  step?: number;
  cond?: any;
  condition?: any;
  then?: ProgramAction[];
  functionName?: string;
}

export interface GameState {
  mapKey: string;
  robotPosition: { x: number; y: number };
  robotDirection: number; // 0: North, 1: East, 2: South, 3: West
  collectedBatteries: number;
  collectedBatteryTypes: {
    red: number;
    yellow: number;
    green: number;
  };
  programStatus: "idle" | "running" | "paused" | "completed" | "error";
  currentStep: number;
  totalSteps: number;
}

export interface VictoryData {
  mapKey: string;
  isVictory: boolean;
  progress: number;
  message: string;
  collected: {
    total: number;
    byType: { red: number; yellow: number; green: number };
  };
  required: {
    total: number;
    byType: { red: number; yellow: number; green: number };
  };
}

export interface ProgressData {
  mapKey: string;
  isVictory: boolean;
  progress: number;
  message: string;
  collected: {
    total: number;
    byType: { red: number; yellow: number; green: number };
  };
  required: {
    total: number;
    byType: { red: number; yellow: number; green: number };
  };
}

export interface ErrorData {
  type:
    | "PROGRAM_ERROR"
    | "MAP_ERROR"
    | "COMMUNICATION_ERROR"
    | "VALIDATION_ERROR";
  message: string;
  details?: any;
  step?: number;
}

export interface LoseData {
  mapKey: string;
  reason: string;
  step?: number;
}

export interface PhaserConfig {
  url: string;
  width: number;
  height: number;
  allowFullscreen: boolean;
  sandbox?: string;
}
