/**
 * Backend Map JSON structure từ Challenge
 */
interface BackendMapJson {
  compressionlevel?: number;
  height: number;
  width: number;
  infinite?: boolean;
  layers: Array<{
    data: number[];
    name?: string; // Có thể thiếu
    id?: number;   // Có thể thiếu
    type: 'tilelayer';
    visible?: boolean;
    opacity?: number;
    height: number;
    width: number;
    x?: number;
    y?: number;
  }>;
  tilesets: Array<{
    firstgid: number;
    image: string;
    imageheight: number;
    imagewidth: number;
    margin?: number;
    name?: string; // Có thể thiếu
    spacing?: number;
    tilecount: number;
    tileheight: number;
    tilewidth: number;
    columns: number;
  }>;
  tileheight: number;
  tilewidth: number;
  type?: 'map';
  version?: string;
  tiledversion?: string;
  orientation?: 'orthogonal';
  renderorder?: 'right-down';
  nextlayerid?: number;
  nextobjectid?: number;
}

/**
 * Phaser-compatible Map JSON structure
 */
interface PhaserMapJson {
  compressionlevel: number;
  height: number;
  width: number;
  infinite: boolean;
  layers: Array<{
    data: number[];
    height: number;
    id: number;
    name: string;
    opacity: number;
    type: 'tilelayer';
    visible: boolean;
    width: number;
    x: number;
    y: number;
  }>;
  tilesets: Array<{
    firstgid: number;
    name: string;
    image: string;
    imageheight: number;
    imagewidth: number;
    margin: number;
    spacing: number;
    tilecount: number;
    tileheight: number;
    tilewidth: number;
    columns: number;
  }>;
  tileheight: number;
  tilewidth: number;
  type: 'map';
  version: string;
  tiledversion: string;
  orientation: 'orthogonal';
  renderorder: 'right-down';
  nextlayerid: number;
  nextobjectid: number;
}

/**
 * Convert result interface
 */
interface MapConvertResult {
  success: boolean;
  phaserMap?: PhaserMapJson;
  error?: string;
  debugInfo?: {
    originalLayers: number;
    originalTilesets: number;
    convertedLayers: number;
    convertedTilesets: number;
    layerNameChanges: Array<{ from: string; to: string }>;
    tilesetNameChanges: Array<{ from: string; to: string; reason: string }>;
    imagePathChanges: Array<{ from: string; to: string; name: string }>;
  };
}

/**
 * Constants
 */
const MAP_CONSTANTS = {
  DEFAULT_TILE_SIZE: 128,
  DEFAULT_COMPRESSION_LEVEL: -1,
  DEFAULT_LAYER_NAME_PREFIX: 'Tile Layer',
  DEFAULT_TILESET_NAME_PREFIX: 'tileset',
  ASSETS_PATH_PREFIX: '/map/',
  SUPPORTED_IMAGE_FORMATS: ['.png', '.jpg', '.jpeg', '.gif'],
  MAX_MAP_SIZE: 1000,
  MIN_MAP_SIZE: 1,
} as const;

/**
 * Extract filename từ path (e.g., "/path/to/wood.png" -> "wood")
 */
function extractFilenameFromPath(imagePath: string): string {
  return imagePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
}

/**
 * Fix image path để trỏ về /map/ directory
 */
function fixImagePath(originalPath: string, filename: string): string {
  // Nếu đã là /map/ path thì giữ nguyên
  if (originalPath.startsWith(MAP_CONSTANTS.ASSETS_PATH_PREFIX)) {
    return originalPath;
  }
  
  // Convert về /map/ format
  return `${MAP_CONSTANTS.ASSETS_PATH_PREFIX}${filename}.png`;
}

/**
 * Standardize layer name để phù hợp với Phaser expectations
 */
function standardizeLayerName(layerName: string): string {
  // Convert "TileLayer1" -> "Tile Layer 1"
  // Convert "Layer1" -> "Layer 1"
  // Convert các variations khác
  
  const normalized = layerName
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space between lowercase and uppercase
    .replace(/([A-Z])([0-9])/g, '$1 $2') // Insert space between letter and number
    .replace(/([a-z])([0-9])/g, '$1 $2') // Insert space between lowercase and number
    .trim();
  
  return normalized;
}

/**
 * Generate tileset name từ image path nếu thiếu
 */
function generateTilesetName(imagePath: string, index: number): string {
  const filename = extractFilenameFromPath(imagePath);
  return filename || `${MAP_CONSTANTS.DEFAULT_TILESET_NAME_PREFIX}_${index}`;
}

/**
 * Validate backend map structure
 */
function isBackendMapJson(obj: any): obj is BackendMapJson {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.width === 'number' &&
    typeof obj.height === 'number' &&
    Array.isArray(obj.layers) &&
    Array.isArray(obj.tilesets)
  );
}

/**
 * Validate phaser map structure
 */
function isPhaserMapJson(obj: any): obj is PhaserMapJson {
  return (
    isBackendMapJson(obj) &&
    obj.layers.every((layer: any) => 
      layer.name && 
      Array.isArray(layer.data) &&
      typeof layer.id === 'number'
    ) &&
    obj.tilesets.every((tileset: any) =>
        tileset.name &&
        tileset.image &&
        typeof tileset.firstgid === 'number'
      )
    );
  };

/**
 * Main conversion function
 */
export function convertBackendMapToPhaser(
  backendMap: BackendMapJson
): MapConvertResult {
  try {

      const debugInfo = {
        originalLayers: backendMap.layers?.length || 0,
        originalTilesets: backendMap.tilesets?.length || 0,
        convertedLayers: 0,
        convertedTilesets: 0,
        layerNameChanges: [] as Array<{ from: string; to: string }>,
        tilesetNameChanges: [] as Array<{ from: string; to: string; reason: string }>,
        imagePathChanges: [] as Array<{ from: string; to: string; name: string }>
      };

      // Validate input using type guard
      if (!isBackendMapJson(backendMap)) {
        throw new Error('Invalid backend map data: does not match BackendMapJson structure');
      }

      // Additional validation
      if (backendMap.width < MAP_CONSTANTS.MIN_MAP_SIZE || backendMap.width > MAP_CONSTANTS.MAX_MAP_SIZE) {
        throw new Error(`Invalid map width: ${backendMap.width}. Must be between ${MAP_CONSTANTS.MIN_MAP_SIZE} and ${MAP_CONSTANTS.MAX_MAP_SIZE}`);
      }

      if (backendMap.height < MAP_CONSTANTS.MIN_MAP_SIZE || backendMap.height > MAP_CONSTANTS.MAX_MAP_SIZE) {
        throw new Error(`Invalid map height: ${backendMap.height}. Must be between ${MAP_CONSTANTS.MIN_MAP_SIZE} and ${MAP_CONSTANTS.MAX_MAP_SIZE}`);
      }

      // Convert layers
      const convertedLayers = backendMap.layers.map((layer, index) => {
        const originalName = layer.name || `layer_${index}`;
        const standardName = standardizeLayerName(originalName);
        
        if (originalName !== standardName) {
          debugInfo.layerNameChanges.push({
            from: originalName,
            to: standardName
          });
        }

        return {
          data: layer.data,
          height: layer.height,
          id: layer.id || index + 1,
          name: standardName,
          opacity: layer.opacity || 1,
          type: 'tilelayer' as const,
          visible: layer.visible !== false,
          width: layer.width,
          x: layer.x || 0,
          y: layer.y || 0
        };
      });

      debugInfo.convertedLayers = convertedLayers.length;

      // Convert tilesets
      const convertedTilesets = backendMap.tilesets.map((tileset, index) => {
        const originalPath = tileset.image;
        const filename = extractFilenameFromPath(originalPath);
        const fixedPath = fixImagePath(originalPath, filename);
        
        // Generate name nếu thiếu
        let tilesetName = tileset.name;
        let nameChangeReason = '';
        
        if (!tilesetName) {
          tilesetName = generateTilesetName(originalPath, index);
          nameChangeReason = 'missing_name';
          debugInfo.tilesetNameChanges.push({
            from: '',
            to: tilesetName,
            reason: nameChangeReason
          });
        }

        // Track image path changes
        if (originalPath !== fixedPath) {
          debugInfo.imagePathChanges.push({
            from: originalPath,
            to: fixedPath,
            name: tilesetName
          });
        }

        return {
          firstgid: tileset.firstgid,
          name: tilesetName,
          image: fixedPath,
          imageheight: tileset.imageheight,
          imagewidth: tileset.imagewidth,
          margin: tileset.margin || 0,
          spacing: tileset.spacing || 0,
          tilecount: tileset.tilecount,
          tileheight: tileset.tileheight,
          tilewidth: tileset.tilewidth,
          columns: tileset.columns
        };
      });

      debugInfo.convertedTilesets = convertedTilesets.length;

      // Build final Phaser map with corrected orientation and tile sizes
      const phaserMap: PhaserMapJson = {
        compressionlevel: backendMap.compressionlevel || MAP_CONSTANTS.DEFAULT_COMPRESSION_LEVEL,
        height: backendMap.height,
        width: backendMap.width,
        infinite: backendMap.infinite || false,
        layers: convertedLayers,
        tilesets: convertedTilesets,
        // Force orthogonal orientation and standard tile sizes to match Phaser project expectations
        tileheight: MAP_CONSTANTS.DEFAULT_TILE_SIZE, // 128 instead of backend's 80
        tilewidth: MAP_CONSTANTS.DEFAULT_TILE_SIZE,  // 128 (keep consistent)
        type: backendMap.type || 'map',
        version: backendMap.version || '1.0',
        tiledversion: backendMap.tiledversion || '1.0.0',
        orientation: 'orthogonal', // Force orthogonal instead of backend's isometric
        renderorder: backendMap.renderorder || 'right-down',
        nextlayerid: backendMap.nextlayerid || convertedLayers.length + 1,
        nextobjectid: backendMap.nextobjectid || 1
      };
      
      // Critical fixes applied for Phaser compatibility

      return {
        success: true,
        phaserMap,
        debugInfo
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown conversion error'
      };
  }
}

/**
 * Validate Phaser map format using type guard and additional checks
 */
export function validatePhaserMap(phaserMap: PhaserMapJson): boolean {
  try {
    // Use type guard first
    if (!isPhaserMapJson(phaserMap)) {
      return false;
    }

    // Additional validation
    // Check for valid tileset image paths
    for (const tileset of phaserMap.tilesets) {
      const hasValidExtension = MAP_CONSTANTS.SUPPORTED_IMAGE_FORMATS.some(ext => 
        tileset.image.toLowerCase().endsWith(ext)
      );
      
      if (!hasValidExtension) {
        return false;
      }
    }

    // Check layer data integrity
    for (const layer of phaserMap.layers) {
      const expectedDataLength = layer.width * layer.height;
      if (layer.data.length !== expectedDataLength) {
        return false;
      }
    }

    return true;
    
  } catch (error) {
    return false;
  }
}
