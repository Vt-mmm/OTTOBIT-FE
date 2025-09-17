/**
 * Phaser Data Converters
 * Central hub for all data conversion logic related to Phaser
 */

// JSON Conversion utilities
export * from './jsonConverter';

// Map Conversion utilities  
export * from './mapConverter';

// Challenge Conversion utilities
export * from './challengeConverter';

// Data Formatting utilities
export * from './dataFormatter';

// Main Data Processor (centralized pipeline)
export * from './dataProcessor';

// Re-export commonly used functions with descriptive names
export {
  // JSON parsing
  getSafeMapData,
  validateMapJson,
  parseJsonSafely,
  parseMapJson,
  parseChallengeJson,
  parseSolutionJson,
  parseAllChallengeJsons,
} from './jsonConverter';

export {
  // Map conversion
  convertBackendMapToPhaser,
  validatePhaserMap,
} from './mapConverter';

export {
  // Challenge conversion
  convertChallengeToJson,
  validateChallengeJson,
  logChallengeJson,
  createEmptyChallengeJson,
} from './challengeConverter';

export {
  // Data formatting
  formatDataForPhaser,
  fixLayerName,
  fixDescription,
  fixMapJson,
  fixChallengeJson,
} from './dataFormatter';