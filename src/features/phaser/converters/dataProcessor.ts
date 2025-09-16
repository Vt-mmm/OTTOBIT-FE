/**
 * Main Data Processor for Backend → Phaser Conversion
 * Centralized processing pipeline for all data conversion
 */

import { ChallengeResult } from "../../../common/@types/challenge";
import { PhaserMessage } from "../types/phaser";
import { getSafeMapData } from "./jsonConverter";
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

  console.log('🔄 PROCESSING BACKEND DATA FOR PHASER:', {
    challengeId,
    hasMapJson: !!challengeData.mapJson,
    hasChallengeJson: !!challengeData.challengeJson,
    mapJsonLength: challengeData.mapJson?.length || 0,
    challengeJsonLength: challengeData.challengeJson?.length || 0
  });

  try {
    // 1. Process Map JSON
    if (challengeData.mapJson) {
      mapJson = getSafeMapData(challengeData.mapJson);
      if (!mapJson) {
        errors.push('Failed to parse map JSON');
      }
    } else {
      errors.push('No map JSON provided');
    }

    // 2. Process Challenge JSON
    if (challengeData.challengeJson) {
      try {
        console.log('🔄 Parsing challengeJson from string:', {
          rawChallengeJson: challengeData.challengeJson,
          challengeJsonType: typeof challengeData.challengeJson,
          challengeJsonLength: challengeData.challengeJson.length
        });

        challengeJson = JSON.parse(challengeData.challengeJson);
        
        console.log('✅ Challenge JSON parsed successfully:', {
          parsedChallengeJson: challengeJson,
          parsedType: typeof challengeJson,
          parsedKeys: Object.keys(challengeJson)
        });

      } catch (error: any) {
        console.error('❌ Failed to parse challengeJson string:', {
          error: error?.message || 'Unknown error',
          rawChallengeJson: challengeData.challengeJson,
          challengeId
        });

        // Fallback to converter utility if string parsing fails
        console.log('🔄 Falling back to converter utility...');
        challengeJson = convertChallengeToJson(challengeData);
        errors.push('Challenge JSON parsing failed, used fallback');
      }
    } else {
      console.warn('⚠️ No challengeJson string found, using converter utility...');
      challengeJson = convertChallengeToJson(challengeData);
      errors.push('No challenge JSON string provided, used converter fallback');
    }

    // 3. Validate Challenge JSON
    if (challengeJson && !validateChallengeJson(challengeJson)) {
      console.warn('⚠️ Challenge JSON validation failed, but continuing with best effort');
      errors.push('Challenge JSON validation failed');
    }

    // 4. Log Challenge JSON structure
    logChallengeJson(challengeJson, challengeId);

    // 5. Apply Data Formatting Fixes
    const { fixedMapJson, fixedChallengeJson } = formatDataForPhaser(mapJson, challengeJson);

    console.log('✅ BACKEND DATA PROCESSING COMPLETED:', {
      challengeId,
      success: errors.length === 0,
      errorsCount: errors.length,
      hasMapJson: !!fixedMapJson,
      hasChallengeJson: !!fixedChallengeJson
    });

    return {
      mapJson: fixedMapJson,
      challengeJson: fixedChallengeJson,
      success: errors.length === 0,
      errors
    };

  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown processing error';
    console.error('❌ BACKEND DATA PROCESSING FAILED:', {
      challengeId,
      error: errorMessage,
      stack: error?.stack
    });

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
  processedData: ProcessedPhaserData,
  challengeId: string
): PhaserMessage {
  const message: PhaserMessage = {
    source: "parent-website",
    type: "START_MAP",
    data: {
      mapJson: processedData.mapJson,
      challengeJson: processedData.challengeJson
    },
  };

  console.log('📤 PHASER MESSAGE CREATED:', {
    challengeId,
    messageType: message.type,
    messageSource: message.source,
    hasMapJson: !!message.data.mapJson,
    hasChallengeJson: !!message.data.challengeJson,
    totalMessageSize: JSON.stringify(message).length
  });

  return message;
}

/**
 * Complete pipeline: Backend ChallengeResult → Phaser PostMessage
 */
export function processAndCreatePhaserMessage(
  challengeData: ChallengeResult,
  challengeId: string
): { message: PhaserMessage; success: boolean; errors: string[] } {
  console.log('🚀 STARTING COMPLETE DATA PROCESSING PIPELINE:', {
    challengeId,
    timestamp: new Date().toISOString()
  });

  const processedData = processBackendDataForPhaser(challengeData, challengeId);
  
  if (!processedData.success) {
    console.error('❌ PROCESSING PIPELINE FAILED:', {
      challengeId,
      errors: processedData.errors
    });
  }

  const message = createPhaserMessage(processedData, challengeId);

  console.log('🎉 DATA PROCESSING PIPELINE COMPLETED:', {
    challengeId,
    success: processedData.success,
    errorsCount: processedData.errors.length,
    timestamp: new Date().toISOString()
  });

  return {
    message,
    success: processedData.success,
    errors: processedData.errors
  };
}