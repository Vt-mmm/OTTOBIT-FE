/**
 * Main Data Processor for Backend → Phaser Conversion
 * Centralized processing pipeline for all data conversion
 */

import { ChallengeResult } from "../../../common/@types/challenge";
import { PhaserMessage } from "../types/phaser";
import { convertChallengeToJson, validateChallengeJson, logChallengeJson } from "./challengeConverter";
import { formatDataForPhaser } from "./dataFormatter";

export interface ProcessedPhaserData {
  mapJson: any;
  challengeJson: any;
  success: boolean;
  errors: string[];
}

/**
 * Main processing function: Backend ChallengeResult → Processed Phaser Data
 */
export function processBackendDataForPhaser(
  challengeData: ChallengeResult,
  challengeId: string
): ProcessedPhaserData {
  const errors: string[] = [];
  let mapJson = null;
  let challengeJson = {};

  // Process backend data for Phaser

  try {
    // 1. Process Map JSON - Challenge now has mapId instead of mapJson
    if (challengeData.mapId) {
      // TODO: Implement map loading by mapId from Map service
      // For now, use challengeJson as mapJson fallback
      mapJson = challengeData.challengeJson ? JSON.parse(challengeData.challengeJson) : null;
      if (!mapJson) {
        errors.push('Failed to process map data from mapId');
      }
    } else {
      errors.push('No mapId provided in challenge');
    }

    // 2. Process Challenge JSON
    if (challengeData.challengeJson) {
      try {
        challengeJson = JSON.parse(challengeData.challengeJson);

      } catch (error: any) {
        // Fallback to converter utility if string parsing fails
        challengeJson = convertChallengeToJson(challengeData);
        errors.push('Challenge JSON parsing failed, used fallback');
      }
    } else {
      challengeJson = convertChallengeToJson(challengeData);
      errors.push('No challenge JSON string provided, used converter fallback');
    }

    // 3. Validate Challenge JSON
    if (challengeJson && !validateChallengeJson(challengeJson)) {
      errors.push('Challenge JSON validation failed');
    }

    // 4. Log Challenge JSON structure
    logChallengeJson(challengeJson, challengeId);

    // 5. Apply Data Formatting Fixes
    const { fixedMapJson, fixedChallengeJson } = formatDataForPhaser(mapJson, challengeJson);

    // Backend data processing completed

    return {
      mapJson: fixedMapJson,
      challengeJson: fixedChallengeJson,
      success: errors.length === 0,
      errors
    };

  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown processing error';

    errors.push(errorMessage);
    return {
      mapJson: null,
      challengeJson: {},
      success: false,
      errors
    };
  }
}

/**
 * Create Phaser PostMessage from processed data
 */
export function createPhaserMessage(
  processedData: ProcessedPhaserData
): PhaserMessage {
  const message: PhaserMessage = {
    source: "parent-website",
    type: "START_MAP",
    data: {
      mapJson: processedData.mapJson,
      challengeJson: processedData.challengeJson
    },
  };

  // Phaser message created

  return message;
}

/**
 * Complete pipeline: Backend ChallengeResult → Phaser PostMessage
 */
export function processAndCreatePhaserMessage(
  challengeData: ChallengeResult,
  challengeId: string
): { message: PhaserMessage; success: boolean; errors: string[] } {
  const processedData = processBackendDataForPhaser(challengeData, challengeId);

  const message = createPhaserMessage(processedData);

  // Data processing pipeline completed

  return {
    message,
    success: processedData.success,
    errors: processedData.errors
  };
}