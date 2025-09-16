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

  console.log(`🔧 Fixed layer name: "${layerName}" → "${fixed}"`);
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

  // Add spaces around common words if they're stuck together
  const commonWords = [
    'all', 'the', 'and', 'or', 'if', 'using', 'with', 'without', 'from', 'to',
    'collect', 'batteries', 'battery', 'yellow', 'red', 'green', 'blue',
    'statements', 'loops', 'functions', 'variables'
  ];

  commonWords.forEach(word => {
    // Add space before the word if it's preceded by a letter
    const beforePattern = new RegExp(`([a-z])${word}`, 'gi');
    fixed = fixed.replace(beforePattern, `$1 ${word}`);
    
    // Add space after the word if it's followed by a letter
    const afterPattern = new RegExp(`${word}([a-z])`, 'gi');
    fixed = fixed.replace(afterPattern, `${word} $1`);
  });

  // Clean up multiple spaces
  fixed = fixed.replace(/\s+/g, ' ').trim();

  if (fixed !== description) {
    console.log(`🔧 Fixed description: "${description}" → "${fixed}"`);
  }
  
  return fixed;
}

/**
 * Fix map JSON formatting issues
 */
export function fixMapJson(mapJson: any): any {
  if (!mapJson) return mapJson;

  const fixedMapJson = { ...mapJson };

  // Fix layer names
  if (fixedMapJson.layers && Array.isArray(fixedMapJson.layers)) {
    fixedMapJson.layers = fixedMapJson.layers.map((layer: any) => ({
      ...layer,
      name: fixLayerName(layer.name)
    }));
  }

  console.log('🗺️ Map JSON formatting fixed:', {
    layersFixed: fixedMapJson.layers?.length || 0,
    originalOrientation: mapJson.orientation,
    fixedOrientation: fixedMapJson.orientation
  });

  return fixedMapJson;
}

/**
 * Fix challenge JSON formatting issues
 */
export function fixChallengeJson(challengeJson: any): any {
  if (!challengeJson) return challengeJson;

  const fixedChallengeJson = { ...challengeJson };

  // Fix victory description
  if (fixedChallengeJson.victory && fixedChallengeJson.victory.description) {
    fixedChallengeJson.victory.description = fixDescription(fixedChallengeJson.victory.description);
  }

  // Fix any other text fields that might have spacing issues
  // You can add more fixes here as needed

  console.log('🏆 Challenge JSON formatting fixed:', {
    hasVictoryDescription: !!fixedChallengeJson.victory?.description,
    victoryDescription: fixedChallengeJson.victory?.description,
    hasRobot: !!fixedChallengeJson.robot,
    batteriesCount: fixedChallengeJson.batteries?.length || 0
  });

  return fixedChallengeJson;
}

/**
 * Apply all formatting fixes to both map and challenge data
 */
export function formatDataForPhaser(mapJson: any, challengeJson: any): {
  fixedMapJson: any;
  fixedChallengeJson: any;
} {
  console.log('🔧 Applying data formatting fixes...');

  const fixedMapJson = fixMapJson(mapJson);
  const fixedChallengeJson = fixChallengeJson(challengeJson);

  console.log('✅ Data formatting completed:', {
    mapChanges: {
      layersCount: fixedMapJson?.layers?.length || 0,
      layerNames: fixedMapJson?.layers?.map((l: any) => l.name) || []
    },
    challengeChanges: {
      victoryDescription: fixedChallengeJson?.victory?.description || 'N/A'
    }
  });

  return {
    fixedMapJson,
    fixedChallengeJson
  };
}