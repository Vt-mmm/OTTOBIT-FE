/**
 * Utility functions for converting challenge data to Phaser format
 * Centralizes the challengeJson conversion logic for better maintainability
 */

import { ChallengeResult } from "../../../common/@types/challenge";

/**
 * Interface for challengeJson that gets sent to Phaser (frontend format)
 */
export interface PhaserChallengeJson {
  robot: {
    x?: number;
    y?: number;
    direction?: string;
    [key: string]: any;
  };
  batteries: Array<{
    x?: number;
    y?: number;
    value?: number;
    color?: string;
    [key: string]: any;
  }>;
  boxes: Array<{
    x?: number;
    y?: number;
    type?: string;
    [key: string]: any;
  }>;
  victory: {
    condition?: string;
    target?: any;
    [key: string]: any;
  };
  statement: Array<{
    text?: string;
    order?: number;
    [key: string]: any;
  }>;
  statementNumber: number;
}

/**
 * Interface for backend challengeJson format
 */
export interface BackendChallengeJson {
  robot: {
    tile: {
      x: number;
      y: number;
    };
    direction: string;
  };
  batteries: Array<{
    tiles: Array<{
      x: number;
      y: number;
      count: number;
      type: string;
      spread: number;
      allowedCollect: boolean;
    }>;
  }>;
  victory: {
    byType?: Array<{
      [key: string]: number;
    }>;
    description?: string;
    [key: string]: any;
  };
  statement: string[];
  statementNumber: number;
}

/**
 * Convert ChallengeResult to challengeJson format for Phaser
 */
export function convertChallengeToJson(challengeData: ChallengeResult): PhaserChallengeJson {
  if (!challengeData) {
    return createEmptyChallengeJson();
  }

  // Cast to any to access properties that might not be in ChallengeResult interface
  const data = challengeData as any;


  const challengeJson: PhaserChallengeJson = {
    robot: data.robot || {},
    batteries: data.batteries || [],
    boxes: data.boxes || [],
    victory: data.victory || {},
    statement: data.statement || [],
    statementNumber: data.statementNumber || 0,
  };


  return challengeJson;
}

/**
 * Create empty challengeJson structure
 */
export function createEmptyChallengeJson(): PhaserChallengeJson {
  return {
    robot: {},
    batteries: [],
    boxes: [],
    victory: {},
    statement: [],
    statementNumber: 0,
  };
}

/**
 * Validate challengeJson structure - supports both frontend format and backend format
 */
export function validateChallengeJson(challengeJson: any): challengeJson is PhaserChallengeJson {
  if (!challengeJson || typeof challengeJson !== 'object') {
    return false;
  }

  // Check for backend format (has different structure)
  const hasBackendFormat = 'robot' in challengeJson && 
    challengeJson.robot && 
    'tile' in challengeJson.robot;

  if (hasBackendFormat) {
    return true; // Accept backend format as-is
  }

  // Validate frontend format
  const requiredFields = ['robot', 'batteries', 'victory', 'statement', 'statementNumber'];
  const missingFields = requiredFields.filter(field => !(field in challengeJson));
  
  if (missingFields.length > 0) {
    // Don't fail validation - just warn
  }

  // For frontend format, validate array fields if they exist
  const arrayFields = ['batteries', 'statement'];
  for (const field of arrayFields) {
    if (field in challengeJson && !Array.isArray(challengeJson[field])) {
      return false;
    }
  }

  // For frontend format, validate object fields if they exist
  const objectFields = ['robot', 'victory'];
  for (const field of objectFields) {
    if (field in challengeJson && (typeof challengeJson[field] !== 'object' || challengeJson[field] === null)) {
      return false;
    }
  }

  // Validate statementNumber if exists
  if ('statementNumber' in challengeJson && typeof challengeJson.statementNumber !== 'number') {
    return false;
  }

  return true;
}

/**
 * Debug function to log challengeJson structure
 */
export function logChallengeJson(_challengeJson: any, _challengeId?: string) {
  // Debug logging disabled in production
  return;
}
