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
  // Support scoring inputs for Phaser (min/max cards)
  minCards?: number;
  maxCards?: number;
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
  // Support scoring inputs for Phaser (min/max cards)
  minCards?: number;
  maxCards?: number;
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

  // If challengeJson exists as string/object, attempt to parse and preserve min/max
  let rootMinCards: number | undefined;
  let rootMaxCards: number | undefined;
  try {
    const raw = data.challengeJson;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.minCards === 'number') rootMinCards = parsed.minCards;
      if (typeof parsed.maxCards === 'number') rootMaxCards = parsed.maxCards;
      // Also check nested victory block
      if (parsed.victory) {
        if (typeof parsed.victory.minCards === 'number') rootMinCards = parsed.victory.minCards;
        if (typeof parsed.victory.maxCards === 'number') rootMaxCards = parsed.victory.maxCards;
      }
    }
  } catch {}

  const challengeJson: PhaserChallengeJson = {
    robot: data.robot || {},
    batteries: data.batteries || [],
    boxes: data.boxes || [],
    victory: data.victory || {},
    // Preserve scoring bounds if present
    minCards: typeof data.minCards === 'number' ? data.minCards : rootMinCards,
    maxCards: typeof data.maxCards === 'number' ? data.maxCards : rootMaxCards,
    statement: data.statement || [],
    statementNumber: data.statementNumber || 0,
  };

  // Debug log to verify minCards/maxCards are preserved
  console.log('🔧 challengeConverter: Preserved minCards/maxCards', {
    minCards: challengeJson.minCards,
    maxCards: challengeJson.maxCards,
    fromRootData: { minCards: data.minCards, maxCards: data.maxCards },
    fromParsedJson: { minCards: rootMinCards, maxCards: rootMaxCards }
  });

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
    // No defaults for min/max; Phaser will fall back if undefined
    minCards: undefined,
    maxCards: undefined,
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
