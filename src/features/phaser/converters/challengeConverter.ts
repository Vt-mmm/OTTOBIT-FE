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
    console.warn('⚠️ No challenge data provided, returning empty challengeJson');
    return createEmptyChallengeJson();
  }

  // Cast to any to access properties that might not be in ChallengeResult interface
  const data = challengeData as any;

  console.log('🔄 Converting challenge data to challengeJson:', {
    challengeId: challengeData.id,
    challengeTitle: challengeData.title,
    hasRobot: !!data.robot,
    batteriesCount: data.batteries?.length || 0,
    boxesCount: data.boxes?.length || 0,
    hasVictory: !!data.victory,
    statementsCount: data.statement?.length || 0,
    // Log raw data for inspection
    rawRobot: data.robot,
    rawBatteries: data.batteries,
    rawBoxes: data.boxes,
    rawVictory: data.victory,
    rawStatement: data.statement,
    rawStatementNumber: data.statementNumber
  });

  const challengeJson: PhaserChallengeJson = {
    robot: data.robot || {},
    batteries: data.batteries || [],
    boxes: data.boxes || [],
    victory: data.victory || {},
    statement: data.statement || [],
    statementNumber: data.statementNumber || 0,
  };

  // Log the converted structure
  console.log('✅ Challenge converted to challengeJson:', {
    robot: {
      hasData: Object.keys(challengeJson.robot).length > 0,
      keys: Object.keys(challengeJson.robot),
      preview: challengeJson.robot,
    },
    batteries: {
      count: challengeJson.batteries.length,
      preview: challengeJson.batteries.slice(0, 2), // First 2 items
    },
    boxes: {
      count: challengeJson.boxes.length,
      preview: challengeJson.boxes.slice(0, 2),
    },
    victory: {
      hasData: Object.keys(challengeJson.victory).length > 0,
      keys: Object.keys(challengeJson.victory),
      preview: challengeJson.victory,
    },
    statement: {
      count: challengeJson.statement.length,
      preview: challengeJson.statement.slice(0, 2),
    },
    statementNumber: challengeJson.statementNumber,
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
    statement: [],
    statementNumber: 0,
  };
}

/**
 * Validate challengeJson structure - supports both frontend format and backend format
 */
export function validateChallengeJson(challengeJson: any): challengeJson is PhaserChallengeJson {
  if (!challengeJson || typeof challengeJson !== 'object') {
    console.error('❌ Invalid challengeJson: not an object');
    return false;
  }

  // Check for backend format (has different structure)
  const hasBackendFormat = 'robot' in challengeJson && 
    challengeJson.robot && 
    'tile' in challengeJson.robot;

  if (hasBackendFormat) {
    console.log('✅ challengeJson validation passed (backend format detected)');
    return true; // Accept backend format as-is
  }

  // Validate frontend format
  const requiredFields = ['robot', 'batteries', 'victory', 'statement', 'statementNumber'];
  const missingFields = requiredFields.filter(field => !(field in challengeJson));
  
  if (missingFields.length > 0) {
    console.warn('⚠️ challengeJson missing some fields, but may still be valid:', missingFields);
    // Don't fail validation - just warn
  }

  // For frontend format, validate array fields if they exist
  const arrayFields = ['batteries', 'statement'];
  for (const field of arrayFields) {
    if (field in challengeJson && !Array.isArray(challengeJson[field])) {
      console.error(`❌ Invalid challengeJson: ${field} should be an array`);
      return false;
    }
  }

  // For frontend format, validate object fields if they exist
  const objectFields = ['robot', 'victory'];
  for (const field of objectFields) {
    if (field in challengeJson && (typeof challengeJson[field] !== 'object' || challengeJson[field] === null)) {
      console.error(`❌ Invalid challengeJson: ${field} should be an object`);
      return false;
    }
  }

  // Validate statementNumber if exists
  if ('statementNumber' in challengeJson && typeof challengeJson.statementNumber !== 'number') {
    console.error('❌ Invalid challengeJson: statementNumber should be a number');
    return false;
  }

  console.log('✅ challengeJson validation passed');
  return true;
}

/**
 * Debug function to log challengeJson structure
 */
export function logChallengeJson(challengeJson: any, challengeId?: string) {
  if (!challengeJson) {
    console.log(`🔍 ChallengeJson Debug ${challengeId ? `(${challengeId})` : ''}: challengeJson is null/undefined`);
    return;
  }

  try {
    console.log(`🔍 ChallengeJson Debug ${challengeId ? `(${challengeId})` : ''}:`, {
      structure: {
        robot: {
          type: typeof challengeJson.robot,
          keys: challengeJson.robot ? Object.keys(challengeJson.robot) : [],
          empty: challengeJson.robot ? Object.keys(challengeJson.robot).length === 0 : true,
        },
        batteries: {
          type: Array.isArray(challengeJson.batteries) ? 'array' : typeof challengeJson.batteries,
          count: challengeJson.batteries?.length || 0,
          empty: !challengeJson.batteries || challengeJson.batteries.length === 0,
        },
        boxes: {
          type: challengeJson.boxes ? (Array.isArray(challengeJson.boxes) ? 'array' : typeof challengeJson.boxes) : 'undefined',
          count: challengeJson.boxes?.length || 0,
          empty: !challengeJson.boxes || challengeJson.boxes.length === 0,
        },
        victory: {
          type: typeof challengeJson.victory,
          keys: challengeJson.victory ? Object.keys(challengeJson.victory) : [],
          empty: challengeJson.victory ? Object.keys(challengeJson.victory).length === 0 : true,
        },
        statement: {
          type: Array.isArray(challengeJson.statement) ? 'array' : typeof challengeJson.statement,
          count: challengeJson.statement?.length || 0,
          empty: !challengeJson.statement || challengeJson.statement.length === 0,
        },
        statementNumber: {
          type: typeof challengeJson.statementNumber,
          value: challengeJson.statementNumber,
        },
      },
      data: challengeJson,
    });
  } catch (error: any) {
    console.error(`❌ Error in logChallengeJson:`, {
      error: error?.message || 'Unknown error',
      challengeId,
      challengeJsonType: typeof challengeJson,
      challengeJsonKeys: challengeJson ? Object.keys(challengeJson) : 'N/A'
    });
  }
}
