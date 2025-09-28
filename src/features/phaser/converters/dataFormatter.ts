/**
 * Data formatter utilities to fix spacing and format issues
 * from backend data before sending to Phaser
 */

/**
 * Fix layer names to have proper spacing
 */
export function fixLayerName(layerName: string): string {
  if (!layerName) return layerName;

  // Convert "TileLayer1" to "Tile Layer 1"
  const fixed = layerName
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase
    .replace(/([a-zA-Z])(\d)/g, '$1 $2') // Add space between letter and number
    .replace(/(\d)([a-zA-Z])/g, '$1 $2'); // Add space between number and letter

  return fixed;
}

/**
 * Fix description text by adding spaces between words
 */
export function fixDescription(description: string): string {
  if (!description) return description;

  // Add spaces before lowercase letters that follow uppercase letters
  // and before uppercase letters that follow lowercase letters
  let fixed = description
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();

  // NOTE: Do not attempt to inject spaces around common words.
  // This previously caused corrupted text like "comm and" and "ga the r".
  // Keep only camelCase and acronym spacing above.

  // Clean up multiple spaces
  fixed = fixed.replace(/\s+/g, ' ').trim();

  return fixed;
}

/**
 * Fix tileset image paths to use /map/ directory
 */
export function fixTilesetImagePath(imagePath: string): string {
  if (!imagePath) return imagePath;
  
  // If already using /map/ prefix, keep it
  if (imagePath.startsWith('/map/')) {
    return imagePath;
  }
  
  // Extract filename from any path format
  const filename = imagePath.split(/[\/\\]/).pop()?.replace(/\.[^/.]+$/, '') || 'unknown';
  
  // Return standardized /map/ path
  return `/map/${filename}.png`;
}

/**
 * Fix map JSON formatting issues
 */
export function fixMapJson(mapJson: any): any {
  if (!mapJson) {
    return mapJson; // Return original value, don't convert to null
  }

  const fixedMapJson = { ...mapJson };

  // IMPORTANT: Keep original orientation - DO NOT CHANGE!
  // Phaser needs to know if it's isometric or orthogonal
  
  // WARNING: DO NOT modify these critical properties:
  // - orientation (isometric/orthogonal)
  // - tileheight/tilewidth (must match original map design)
  // These are set by the map designer and MUST be preserved!

  // Only fix layer names for display
  if (fixedMapJson.layers && Array.isArray(fixedMapJson.layers)) {
    fixedMapJson.layers = fixedMapJson.layers.map((layer: any) => ({
      ...layer,
      name: fixLayerName(layer.name)
    }));
  }
  
  // Keep tileset data mostly as-is
  if (fixedMapJson.tilesets && Array.isArray(fixedMapJson.tilesets)) {
    // DO NOT change tileset dimensions - they must match the actual image files!
    fixedMapJson.tilesets = fixedMapJson.tilesets.map((tileset: any) => ({
      ...tileset
      // Keep all original tileset properties
      // DO NOT override tilewidth/tileheight
    }));
  }

  return fixedMapJson;
}

/**
 * Fix challenge JSON formatting issues
 */
export function fixChallengeJson(challengeJson: any): any {
  if (!challengeJson) {
    return challengeJson; // Return original value, don't convert to null
  }

  const fixedChallengeJson = { ...challengeJson };

  // Fix victory description
  if (fixedChallengeJson.victory && fixedChallengeJson.victory.description) {
    fixedChallengeJson.victory.description = fixDescription(fixedChallengeJson.victory.description);
  }

  // Fix any other text fields that might have spacing issues
  // You can add more fixes here as needed

  return fixedChallengeJson;
}

/**
 * Apply all formatting fixes to both map and challenge data
 */
export function formatDataForPhaser(mapJson: any, challengeJson: any): {
  fixedMapJson: any;
  fixedChallengeJson: any;
} {
  const fixedMapJson = fixMapJson(mapJson);
  const fixedChallengeJson = fixChallengeJson(challengeJson);

  return {
    fixedMapJson,
    fixedChallengeJson
  };
}
