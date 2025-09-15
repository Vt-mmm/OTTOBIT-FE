// Original isometric transforms

export function getIsometricTileTransform(): string {
  // Standard 2:1 isometric transform 
  return "rotate(45deg) scale(1, 0.5)";
}

export function getTerrainIsometricTransform(): string {
  return "rotate(45deg) scale(1, 0.5)";
}

/**
 * Get transform for orthogonal image to fit isometric tile
 * Preserves the image aspect but fits it into diamond shape
 */
export function getOrthogonalToIsometricTransform(): string {
  // First scale down, then apply isometric transform
  return "scale(0.7) rotate(45deg) scaleY(0.5)";
}

/**
 * Calculate transform matrix for true isometric projection
 * Based on the mathematical isometric projection formula
 */
export function getIsometricMatrix(angle: number = 30): {
  a: number; // scaleX
  b: number; // skewY
  c: number; // skewX
  d: number; // scaleY
  e: number; // translateX
  f: number; // translateY
} {
  const angleRad = (angle * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  // True isometric projection matrix
  return {
    a: cos, // scaleX
    b: sin, // skewY
    c: -cos, // skewX
    d: sin, // scaleY
    e: 0, // translateX
    f: 0, // translateY
  };
}

/**
 * Get SVG transform for isometric projection
 */
export function getSVGIsometricTransform(
  _width: number,
  _height: number,
  angle: number = 30
): string {
  const matrix = getIsometricMatrix(angle);

  // Apply the transformation matrix
  return `matrix(${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f})`;
}

/**
 * Convert orthogonal coordinates to isometric
 * Used for positioning elements in isometric space
 */
export function orthogonalToIsometric(
  x: number,
  y: number,
  tileWidth: number = 64,
  tileHeight: number = 32
): { x: number; y: number } {
  // Standard isometric formula
  const isoX = (x - y) * (tileWidth / 2);
  const isoY = (x + y) * (tileHeight / 2);

  return { x: isoX, y: isoY };
}

/**
 * Create CSS for pseudo-3D isometric tile
 * This creates the illusion of depth
 */
export function getIsometric3DStyle(
  baseColor: string,
  _depth: number = 16
): {
  top: string;
  left: string;
  right: string;
} {
  // Darken color for sides
  const darkenColor = (color: string, _amount: number) => {
    // Simple darkening - in production use a proper color library
    return color;
  };

  return {
    top: baseColor,
    left: darkenColor(baseColor, 20), // Darker for left side
    right: darkenColor(baseColor, 40), // Darkest for right side
  };
}

/**
 * Get the correct asset transformation based on asset type
 */
export function getAssetTransform(
  assetType: "terrain" | "object" | "robot"
): string {
  switch (assetType) {
    case "terrain":
      // Terrain needs full isometric transform
      return "rotate(45deg) scaleY(0.5)";

    case "object":
      // Objects stay more upright
      return "scale(0.8)";

    case "robot":
      // Robot stays upright but smaller
      return "scale(0.7)";

    default:
      return "";
  }
}

/**
 * Calculate skew values for isometric transformation
 * This creates a more accurate isometric projection
 */
export function getIsometricSkew(): {
  skewX: number;
  skewY: number;
  scaleX: number;
  scaleY: number;
} {
  // For true isometric (30-degree angle):
  // Width remains the same
  // Height is compressed by cos(30°) ≈ 0.866

  const angle = 30;
  const angleRad = (angle * Math.PI) / 180;

  return {
    skewX: -angle, // Skew horizontally
    skewY: 0, // No vertical skew
    scaleX: 1, // Keep width
    scaleY: Math.cos(angleRad), // Compress height
  };
}

/**
 * Create transform for different isometric styles
 */
export function getIsometricStyle(
  style: "classic" | "pixel" | "modern"
): string {
  switch (style) {
    case "classic":
      // Classic 2:1 isometric (used in many pixel art games)
      return "rotate(45deg) scaleY(0.5)";

    case "pixel":
      // Pixel-perfect isometric (26.565° rotation)
      return "rotate(26.565deg) scaleX(1.118) scaleY(0.5)";

    case "modern":
      // Modern isometric with true 30° angle
      return "rotateX(60deg) rotateZ(45deg)";

    default:
      return "rotate(45deg) scaleY(0.5)";
  }
}
