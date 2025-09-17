/**
 * Utilities for safely converting and validating JSON data from backend
 * Provides type-safe conversion with error handling
 */

// Interface for different JSON types from backend
export interface ParsedMapJson {
  width: number;
  height: number;
  tileWidth?: number;
  tileHeight?: number;
  layers?: any[];
  objects?: any[];
  // Add more map-specific fields as needed
}

export interface ParsedChallengeJson {
  objectives?: string[];
  rules?: any[];
  validation?: any;
  // Add more challenge-specific fields as needed
}

export interface ParsedSolutionJson {
  steps?: any[];
  expectedPath?: any[];
  validation?: any;
  // Add more solution-specific fields as needed
}

// Generic JSON parsing result
export interface JsonParseResult<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
  originalString: string;
}

// Generic safe JSON parser
export function parseJsonSafely<T = any>(jsonString: string, fieldName = "JSON"): JsonParseResult<T> {
  const result: JsonParseResult<T> = {
    success: false,
    data: null,
    error: null,
    originalString: jsonString
  };

  if (!jsonString || typeof jsonString !== 'string') {
    result.error = `${fieldName} is empty or not a string`;
    return result;
  }

  try {
    const parsed = JSON.parse(jsonString);
    result.success = true;
    result.data = parsed;
    return result;
  } catch (error: any) {
    result.error = `Invalid ${fieldName}: ${error.message}`;
    return result;
  }
}

// Parse map JSON from challenge
export function parseMapJson(mapJsonString: string): JsonParseResult<ParsedMapJson> {
  const result = parseJsonSafely<ParsedMapJson>(mapJsonString, "MapJson");
  
  // Additional validation for map-specific fields
  if (result.success && result.data) {
    const data = result.data;
    
    // Basic validation for required map fields
    if (typeof data.width !== 'number' || typeof data.height !== 'number') {
      result.success = false;
      result.error = "MapJson missing required width/height fields";
      result.data = null;
    }
  }
  
  return result;
}

// Parse challenge JSON
export function parseChallengeJson(challengeJsonString: string): JsonParseResult<ParsedChallengeJson> {
  return parseJsonSafely<ParsedChallengeJson>(challengeJsonString, "ChallengeJson");
}

// Parse solution JSON
export function parseSolutionJson(solutionJsonString: string): JsonParseResult<ParsedSolutionJson> {
  return parseJsonSafely<ParsedSolutionJson>(solutionJsonString, "SolutionJson");
}

// Batch parse all JSON fields from a challenge
export function parseAllChallengeJsons(challenge: { mapJson: string; challengeJson: string; solutionJson: string }) {
  const mapResult = parseMapJson(challenge.mapJson);
  const challengeResult = parseChallengeJson(challenge.challengeJson);
  const solutionResult = parseSolutionJson(challenge.solutionJson);

  return {
    map: mapResult,
    challenge: challengeResult,
    solution: solutionResult,
    allSuccess: mapResult.success && challengeResult.success && solutionResult.success,
    errors: [
      mapResult.error,
      challengeResult.error,
      solutionResult.error
    ].filter(Boolean),
  };
}

// Validate parsed map JSON for Phaser compatibility
export function validateMapJson(mapData: ParsedMapJson): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!mapData.width || !mapData.height) {
    errors.push("Map must have width and height");
  }

  // Check reasonable dimensions
  if (mapData.width > 1000 || mapData.height > 1000) {
    errors.push("Map dimensions too large (max 1000x1000)");
  }

  if (mapData.width < 1 || mapData.height < 1) {
    errors.push("Map dimensions must be positive");
  }

  // Add more validations as needed
  // - Check layers format
  // - Check tile data
  // - Check object layer format

  return {
    valid: errors.length === 0,
    errors
  };
}

// Helper to get safe parsed data or fallback
export function getSafeMapData(mapJsonString: string, fallback?: ParsedMapJson): ParsedMapJson | null {
  const result = parseMapJson(mapJsonString);
  
  if (result.success && result.data) {
    const validation = validateMapJson(result.data);
    
    if (validation.valid) {
      return result.data;
    } else {
      return fallback || null;
    }
  }
  
  return fallback || null;
}
