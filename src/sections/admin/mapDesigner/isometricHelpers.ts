// Isometric helper functions for 2.5D map rendering

export interface IsometricPoint {
  x: number;
  y: number;
}

export interface CartesianPoint {
  x: number;
  y: number;
}

export interface IsometricConfig {
  tileWidth: number; // Width of tile in isometric view (diamond shape)
  tileHeight: number; // Height of tile in isometric view (diamond shape)
  tileDepth: number; // Visual depth/height of tile for 3D effect
}

// Default isometric configuration - optimized for seamless rendering
export const ISOMETRIC_CONFIG: IsometricConfig = {
  tileWidth: 64, // Width of diamond tile
  tileHeight: 60, // Height should be exactly half the width for perfect isometric
  tileDepth: 16, // Depth for 3D effect
};

/**
 * Convert grid coordinates (row, col) to isometric screen coordinates
 * This creates the diamond/rhombus shape typical of isometric views
 */
export function gridToIsometric(
  row: number,
  col: number,
  config: IsometricConfig = ISOMETRIC_CONFIG
): IsometricPoint {
  // Standard isometric projection formula
  // Using precise calculations for perfect tile alignment
  const x = (col - row) * (config.tileWidth / 2);
  const y = (col + row) * (config.tileHeight / 2);

  return { x, y };
}

/**
 * Convert isometric screen coordinates back to grid coordinates
 * Used for mouse interaction and click detection
 */
export function isometricToGrid(
  screenX: number,
  screenY: number,
  config: IsometricConfig = ISOMETRIC_CONFIG
): CartesianPoint {
  // Inverse of the isometric projection
  const tileHalfWidth = config.tileWidth / 2;
  const tileHalfHeight = config.tileHeight / 2;

  const col = (screenX / tileHalfWidth + screenY / tileHalfHeight) / 2;
  const row = (screenY / tileHalfHeight - screenX / tileHalfWidth) / 2;

  return {
    x: Math.floor(col),
    y: Math.floor(row),
  };
}

/**
 * Convert mouse event coordinates to grid coordinates for isometric view
 * Takes into account grid offset and container positioning
 */
export function mouseToIsometricGrid(
  mouseX: number,
  mouseY: number,
  containerRect: DOMRect,
  gridDimensions: { offsetX: number; offsetY: number },
  config: IsometricConfig = ISOMETRIC_CONFIG
): { row: number; col: number } {
  // Get relative mouse position within the container
  const relativeX = mouseX - containerRect.left;
  const relativeY = mouseY - containerRect.top;

  // Adjust for grid offset
  const adjustedX = relativeX - gridDimensions.offsetX;
  const adjustedY = relativeY - gridDimensions.offsetY;

  // Convert to grid coordinates
  const gridPos = isometricToGrid(adjustedX, adjustedY, config);

  return {
    row: gridPos.y,
    col: gridPos.x,
  };
}

/**
 * Get the diamond shape path for an isometric tile
 * Used for SVG rendering or CSS clip-path
 */
export function getIsometricTilePath(
  config: IsometricConfig = ISOMETRIC_CONFIG
): string {
  const halfWidth = config.tileWidth / 2;
  const halfHeight = config.tileHeight / 2;

  // Diamond shape points (clockwise from top)
  const points = [
    `${halfWidth},0`, // Top
    `${config.tileWidth},${halfHeight}`, // Right
    `${halfWidth},${config.tileHeight}`, // Bottom
    `0,${halfHeight}`, // Left
  ];

  return `polygon(${points.join(" ")})`;
}

/**
 * Get the 3D box path for an isometric tile with depth
 * Creates the illusion of height/depth
 */
export function getIsometric3DBoxPath(
  config: IsometricConfig = ISOMETRIC_CONFIG
): {
  top: string;
  left: string;
  right: string;
} {
  const halfWidth = config.tileWidth / 2;
  const halfHeight = config.tileHeight / 2;
  const depth = config.tileDepth;

  // Top face (diamond)
  const top = getIsometricTilePath(config);

  // Left face (parallelogram)
  const leftPoints = [
    `0,${halfHeight}`, // Top-left
    `${halfWidth},${config.tileHeight}`, // Top-right
    `${halfWidth},${config.tileHeight + depth}`, // Bottom-right
    `0,${halfHeight + depth}`, // Bottom-left
  ];

  // Right face (parallelogram)
  const rightPoints = [
    `${halfWidth},${config.tileHeight}`, // Top-left
    `${config.tileWidth},${halfHeight}`, // Top-right
    `${config.tileWidth},${halfHeight + depth}`, // Bottom-right
    `${halfWidth},${config.tileHeight + depth}`, // Bottom-left
  ];

  return {
    top,
    left: `polygon(${leftPoints.join(" ")})`,
    right: `polygon(${rightPoints.join(" ")})`,
  };
}

/**
 * Calculate z-index for proper rendering order in isometric view
 * Tiles further back (lower row, lower col) are rendered first
 */
export function getIsometricZIndex(row: number, col: number): number {
  // Simplified z-index calculation for seamless alignment
  // Objects further back should have lower z-index
  return row + col;
}

/**
 * Get the bounding box for an isometric tile
 * Used for collision detection and hover effects
 */
export function getIsometricBounds(
  row: number,
  col: number,
  config: IsometricConfig = ISOMETRIC_CONFIG
): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const pos = gridToIsometric(row, col, config);

  return {
    x: pos.x,
    y: pos.y,
    width: config.tileWidth,
    height: config.tileHeight + config.tileDepth,
  };
}

/**
 * Check if a point is inside an isometric tile diamond
 * Used for precise mouse hit detection
 */
export function isPointInIsometricTile(
  pointX: number,
  pointY: number,
  tileX: number,
  tileY: number,
  config: IsometricConfig = ISOMETRIC_CONFIG
): boolean {
  // Convert to tile-relative coordinates
  const relX = pointX - tileX;
  const relY = pointY - tileY;

  const halfWidth = config.tileWidth / 2;
  const halfHeight = config.tileHeight / 2;

  // Check if point is inside the diamond shape using linear equations
  // Diamond is defined by 4 lines: y = ±(h/w)x ± h
  const inTopRight = relY >= (-halfHeight * relX) / halfWidth + halfHeight;
  const inBottomRight = relY <= (halfHeight * relX) / halfWidth + halfHeight;
  const inBottomLeft =
    relY <= (-halfHeight * (relX - config.tileWidth)) / halfWidth + halfHeight;
  const inTopLeft =
    relY >= (halfHeight * (relX - config.tileWidth)) / halfWidth + halfHeight;

  return inTopRight && inBottomRight && inBottomLeft && inTopLeft;
}

/**
 * Get neighboring tiles in isometric grid
 * Returns the 4 adjacent tiles (not diagonals)
 */
export function getIsometricNeighbors(
  row: number,
  col: number
): CartesianPoint[] {
  return [
    { x: col, y: row - 1 }, // North
    { x: col + 1, y: row }, // East
    { x: col, y: row + 1 }, // South
    { x: col - 1, y: row }, // West
  ];
}

/**
 * Calculate the visual offset for stacked objects
 * Used when placing objects on top of terrain
 */
export function getStackOffset(
  level: number,
  config: IsometricConfig = ISOMETRIC_CONFIG
): IsometricPoint {
  return {
    x: 0,
    y: -level * config.tileDepth,
  };
}

/**
 * Get CSS transform for isometric tile positioning
 */
export function getIsometricTransform(
  row: number,
  col: number,
  config: IsometricConfig = ISOMETRIC_CONFIG
): string {
  const pos = gridToIsometric(row, col, config);
  return `translate(${pos.x}px, ${pos.y}px)`;
}

/**
 * Get seamless asset positioning for isometric view
 * Ensures all assets align perfectly on the grid
 */
export function getSeamlessAssetPosition(
  row: number,
  col: number,
  assetType: "terrain" | "object" | "robot",
  config: IsometricConfig = ISOMETRIC_CONFIG
): {
  x: number;
  y: number;
  transform: string;
} {
  const basePos = gridToIsometric(row, col, config);

  // Unified positioning for seamless alignment
  const adjustments = {
    terrain: { x: 0, y: 0, transform: "" },
    object: {
      x: config.tileWidth / 2,
      y: config.tileHeight * 0.3,
      transform: "translate(-50%, -50%)",
    },
    robot: {
      x: config.tileWidth / 2,
      y: config.tileHeight * 0.2,
      transform: "translate(-50%, -50%)",
    },
  };

  const adjustment = adjustments[assetType];

  return {
    x: basePos.x + adjustment.x,
    y: basePos.y + adjustment.y,
    transform: adjustment.transform,
  };
}

/**
 * Calculate grid dimensions for isometric view container
 */
export function getIsometricGridDimensions(
  rows: number,
  cols: number,
  config: IsometricConfig = ISOMETRIC_CONFIG
): {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
} {
  // Calculate the bounding box for the entire grid
  // Using precise calculations for perfect alignment
  const width = (cols + rows) * (config.tileWidth / 2);
  const height = (cols + rows) * (config.tileHeight / 2) + config.tileDepth;

  // Correct offset to center the grid properly
  const offsetX = (rows - 1) * (config.tileWidth / 2);
  const offsetY = config.tileDepth; // Add depth offset for proper positioning

  return {
    width,
    height,
    offsetX,
    offsetY,
  };
}
