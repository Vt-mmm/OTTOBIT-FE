import { useCallback, useMemo } from 'react';

/**
 * Interface cho Challenge JSON data
 */
export interface ChallengeData {
  robot: {
    tile: { x: number; y: number };
    direction: "north" | "south" | "east" | "west";
  };
  boxes: Array<{
    tiles: Array<{ x: number; y: number; count: number }>;
    warehouse: { x: number; y: number; count: number };
    spread: number;
  }>;
  victory: {
    byType: Array<{ x: number; y: number; count: number }>;
    description: string;
  };
  statement: string[];
  statementNumber: number;
}

/**
 * Interface cho Tiled Map JSON data
 */
export interface TileLayer {
  data: number[];
  height: number;
  id: number;
  name: string;
  opacity: number;
  type: "tilelayer";
  visible: boolean;
  width: number;
  x: number;
  y: number;
}

export interface Tileset {
  columns: number;
  firstgid: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  margin: number;
  name: string;
  spacing: number;
  tilecount: number;
  tileheight: number;
  tilewidth: number;
}

export interface MapData {
  compressionlevel: number;
  height: number;
  infinite: boolean;
  layers: TileLayer[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: "orthogonal" | "isometric" | "staggered" | "hexagonal";
  renderorder: "right-down" | "right-up" | "left-down" | "left-up";
  tiledversion: string;
  tileheight: number;
  tilesets: Tileset[];
  tilewidth: number;
  type: "map";
  version: string;
  width: number;
}

/**
 * Generic type cho JSON data
 */
export type JsonData = ChallengeData | MapData | Record<string, any>;

/**
 * Hook result interface
 */
interface UseJsonParserResult {
  // Parse JSON string to object
  parseJsonString: <T = JsonData>(jsonString: string | null | undefined) => T | null;
  
  // Convert object to JSON string
  stringifyJson: (
    jsonObject: JsonData | null | undefined, 
    options?: { pretty?: boolean; replacer?: any; space?: number }
  ) => string | null;
  
  // Safe parse with error handling
  safeParseJson: <T = JsonData>(jsonString: string | null | undefined) => {
    data: T | null;
    error: string | null;
    isValid: boolean;
  };
  
  // Validate JSON string format
  isValidJsonString: (jsonString: string | null | undefined) => boolean;
  
  // Format JSON string for display
  formatJsonString: (jsonString: string | null | undefined) => string | null;
}

/**
 * Custom hook để xử lý chuyển đổi JSON string từ database
 * 
 * @returns Object chứa các utility functions để xử lý JSON
 */
export const useJsonParser = (): UseJsonParserResult => {
  
  /**
   * Parse JSON string thành object
   */
  const parseJsonString = useCallback(<T = JsonData>(
    jsonString: string | null | undefined
  ): T | null => {
    if (!jsonString || typeof jsonString !== 'string') {
      return null;
    }

    try {
      // Remove any extra whitespace and handle escaped strings
      const cleanedString = jsonString.trim();
      
      if (cleanedString === '' || cleanedString === 'null' || cleanedString === 'undefined') {
        return null;
      }

      // Handle double-encoded JSON strings from database
      let stringToParse = cleanedString;
      
      // Check if string is double-encoded (starts and ends with quotes)
      if (stringToParse.startsWith('"') && stringToParse.endsWith('"')) {
        try {
          // Try to decode the outer quotes first
          stringToParse = JSON.parse(stringToParse);
        } catch {
          // If fails, continue with original string
        }
      }

      const parsed = JSON.parse(stringToParse) as T;
      
      // Basic validation for parsed object
      if (parsed === null || parsed === undefined) {
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('❌ JSON Parse Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        jsonString: jsonString?.substring(0, 200) + '...',
        jsonLength: jsonString?.length,
      });
      return null;
    }
  }, []);

  /**
   * Convert object thành JSON string
   */
  const stringifyJson = useCallback((
    jsonObject: JsonData | null | undefined,
    options?: { pretty?: boolean; replacer?: any; space?: number }
  ): string | null => {
    if (!jsonObject || typeof jsonObject !== 'object') {
      return null;
    }

    // Handle arrays
    if (Array.isArray(jsonObject) && jsonObject.length === 0) {
      return '[]';
    }

    try {
      const { pretty = false, replacer = null, space = 0 } = options || {};
      
      if (pretty) {
        return JSON.stringify(jsonObject, replacer, space || 2);
      }
      
      return JSON.stringify(jsonObject, replacer);
    } catch (error) {
      console.error('❌ JSON Stringify Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        objectType: Array.isArray(jsonObject) ? 'array' : typeof jsonObject,
        objectKeys: typeof jsonObject === 'object' ? Object.keys(jsonObject) : 'N/A',
      });
      return null;
    }
  }, []);

  /**
   * Safe parse với error handling chi tiết
   */
  const safeParseJson = useCallback(<T = JsonData>(
    jsonString: string | null | undefined
  ) => {
    if (!jsonString || typeof jsonString !== 'string') {
      return {
        data: null as T | null,
        error: 'Invalid input: JSON string is null, undefined, or not a string',
        isValid: false,
      };
    }

    try {
      const cleanedString = jsonString.trim();
      
      if (cleanedString === '' || cleanedString === 'null' || cleanedString === 'undefined') {
        return {
          data: null as T | null,
          error: 'Empty or null JSON string',
          isValid: false,
        };
      }

      const parsed = JSON.parse(cleanedString) as T;
      
      return {
        data: parsed,
        error: null,
        isValid: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown JSON parsing error';
      
      return {
        data: null as T | null,
        error: errorMessage,
        isValid: false,
      };
    }
  }, []);

  /**
   * Validate JSON string format
   */
  const isValidJsonString = useCallback((
    jsonString: string | null | undefined
  ): boolean => {
    if (!jsonString || typeof jsonString !== 'string') {
      return false;
    }

    try {
      const cleanedString = jsonString.trim();
      if (cleanedString === '' || cleanedString === 'null' || cleanedString === 'undefined') {
        return false;
      }
      
      JSON.parse(cleanedString);
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Format JSON string cho việc hiển thị (pretty print)
   */
  const formatJsonString = useCallback((
    jsonString: string | null | undefined
  ): string | null => {
    const parsed = parseJsonString(jsonString);
    if (!parsed) {
      return null;
    }

    try {
      return JSON.stringify(parsed, null, 2);
    } catch {
      return null;
    }
  }, [parseJsonString]);

  // Return memoized object để tránh re-render không cần thiết
  return useMemo(() => ({
    parseJsonString,
    stringifyJson,
    safeParseJson,
    isValidJsonString,
    formatJsonString,
  }), [
    parseJsonString,
    stringifyJson,
    safeParseJson,
    isValidJsonString,
    formatJsonString,
  ]);
};

/**
 * Hook chuyên biệt cho Challenge data
 */
export const useChallengeParser = () => {
  const { parseJsonString, stringifyJson, safeParseJson } = useJsonParser();
  
  /**
   * Validate Challenge data structure
   */
  const validateChallengeData = useCallback((challengeData: any): challengeData is ChallengeData => {
    if (!challengeData || typeof challengeData !== 'object') {
      return false;
    }

    const requiredFields = ['robot', 'boxes', 'victory', 'statement', 'statementNumber'];
    
    const hasRequiredFields = requiredFields.every(field => 
      field in challengeData && challengeData[field] !== undefined
    );
    
    if (!hasRequiredFields) {
      return false;
    }

    // Validate robot structure
    if (!challengeData.robot || 
        !challengeData.robot.tile || 
        typeof challengeData.robot.tile.x !== 'number' ||
        typeof challengeData.robot.tile.y !== 'number' ||
        !challengeData.robot.direction) {
      return false;
    }

    // Validate boxes array
    if (!Array.isArray(challengeData.boxes)) {
      return false;
    }

    // Validate victory structure
    if (!challengeData.victory || 
        !Array.isArray(challengeData.victory.byType) ||
        typeof challengeData.victory.description !== 'string') {
      return false;
    }

    // Validate statement array
    if (!Array.isArray(challengeData.statement)) {
      return false;
    }

    // Validate statementNumber
    if (typeof challengeData.statementNumber !== 'number') {
      return false;
    }

    return true;
  }, []);
  
  /**
   * Parse challenge JSON string từ database với validation
   */
  const parseChallengeData = useCallback((
    challengeJsonString: string | null | undefined
  ): ChallengeData | null => {
    const parsed = parseJsonString<ChallengeData>(challengeJsonString);
    
    if (!parsed || !validateChallengeData(parsed)) {
      console.warn('⚠️ Invalid Challenge Data Structure:', {
        hasParsedData: !!parsed,
        parsedKeys: parsed ? Object.keys(parsed) : 'none'
      });
      return null;
    }
    
    return parsed;
  }, [parseJsonString, validateChallengeData]);

  /**
   * Convert challenge object thành JSON string cho database
   */
  const stringifyChallengeData = useCallback((
    challengeData: ChallengeData | null | undefined,
    pretty?: boolean
  ): string | null => {
    if (!challengeData || !validateChallengeData(challengeData)) {
      console.warn('⚠️ Invalid Challenge Data for stringify:', challengeData);
      return null;
    }
    
    return stringifyJson(challengeData, { pretty });
  }, [stringifyJson, validateChallengeData]);

  /**
   * Safe parse cho challenge data với validation
   */
  const safeParseChallengeData = useCallback((
    challengeJsonString: string | null | undefined
  ) => {
    const result = safeParseJson<ChallengeData>(challengeJsonString);
    
    if (result.isValid && result.data && !validateChallengeData(result.data)) {
      return {
        data: null,
        error: 'Parsed data does not match ChallengeData structure',
        isValid: false,
      };
    }
    
    return result;
  }, [safeParseJson, validateChallengeData]);

  return useMemo(() => ({
    parseChallengeData,
    stringifyChallengeData,
    safeParseChallengeData,
    validateChallengeData,
  }), [parseChallengeData, stringifyChallengeData, safeParseChallengeData, validateChallengeData]);
};

/**
 * Hook chuyên biệt cho Map data
 */
export const useMapParser = () => {
  const { parseJsonString, stringifyJson, safeParseJson } = useJsonParser();
  
  /**
   * Validate Map data structure
   */
  const validateMapData = useCallback((mapData: any): mapData is MapData => {
    if (!mapData || typeof mapData !== 'object') {
      return false;
    }

    const requiredFields = [
      'height', 'width', 'layers', 'tilesets', 'type', 'orientation'
    ];
    
    const hasRequiredFields = requiredFields.every(field => 
      field in mapData && mapData[field] !== undefined
    );
    
    if (!hasRequiredFields) {
      return false;
    }

    // Validate layers array
    if (!Array.isArray(mapData.layers) || mapData.layers.length === 0) {
      return false;
    }

    // Validate tilesets array
    if (!Array.isArray(mapData.tilesets) || mapData.tilesets.length === 0) {
      return false;
    }

    // Validate type is 'map'
    if (mapData.type !== 'map') {
      return false;
    }

    return true;
  }, []);
  
  /**
   * Parse map JSON string từ database với validation
   */
  const parseMapData = useCallback((
    mapJsonString: string | null | undefined
  ): MapData | null => {
    const parsed = parseJsonString<MapData>(mapJsonString);
    
    if (!parsed || !validateMapData(parsed)) {
      console.warn('⚠️ Invalid Map Data Structure:', {
        hasParsedData: !!parsed,
        parsedKeys: parsed ? Object.keys(parsed) : 'none'
      });
      return null;
    }
    
    return parsed;
  }, [parseJsonString, validateMapData]);

  /**
   * Convert map object thành JSON string cho database
   */
  const stringifyMapData = useCallback((
    mapData: MapData | null | undefined,
    pretty?: boolean
  ): string | null => {
    if (!mapData || !validateMapData(mapData)) {
      console.warn('⚠️ Invalid Map Data for stringify:', mapData);
      return null;
    }
    
    return stringifyJson(mapData, { pretty });
  }, [stringifyJson, validateMapData]);

  /**
   * Safe parse cho map data với validation
   */
  const safeParseMapData = useCallback((
    mapJsonString: string | null | undefined
  ) => {
    const result = safeParseJson<MapData>(mapJsonString);
    
    if (result.isValid && result.data && !validateMapData(result.data)) {
      return {
        data: null,
        error: 'Parsed data does not match MapData structure',
        isValid: false,
      };
    }
    
    return result;
  }, [safeParseJson, validateMapData]);

  return useMemo(() => ({
    parseMapData,
    stringifyMapData,
    safeParseMapData,
    validateMapData,
  }), [parseMapData, stringifyMapData, safeParseMapData, validateMapData]);
};
