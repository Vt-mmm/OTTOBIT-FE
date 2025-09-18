import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { MapCell } from "common/models";
import { MAP_ASSETS } from "./mapAssets.config";
import { THEME_COLORS, GRID_CONFIG } from "./theme.config";
import {
  gridToIsometric,
  getIsometricZIndex,
  getIsometricGridDimensions,
  ISOMETRIC_CONFIG,
} from "./isometricHelpers";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import GridOnIcon from "@mui/icons-material/GridOn";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";

interface IsometricMapGridProps {
  mapGrid: MapCell[][];
  selectedAsset: string;
  onCellClick: (row: number, col: number) => void;
  onSaveMap: () => void;
  onTestMap: () => void;
  onClearMap: () => void;
}

export default function IsometricMapGrid({
  mapGrid,
  selectedAsset,
  onCellClick,
  onSaveMap,
  onTestMap,
  onClearMap,
}: IsometricMapGridProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [show3D, setShow3D] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [previewAsset, setPreviewAsset] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (row: number, col: number) => {
    setIsDrawing(true);
    onCellClick(row, col);
    // Add visual feedback
    setHoveredCell({ row, col });
  };

  const handleMouseEnter = (row: number, col: number) => {
    setHoveredCell({ row, col });
    setPreviewAsset(selectedAsset);

    if (isDrawing) {
      onCellClick(row, col);
    }
  };

  const handleMouseLeave = () => {
    if (!isDrawing) {
      setHoveredCell(null);
      setPreviewAsset(null);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    // Keep hover state for better UX
    setTimeout(() => {
      if (!isDrawing) {
        setHoveredCell(null);
        setPreviewAsset(null);
      }
    }, 100);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  // Calculate grid dimensions
  const gridDimensions = getIsometricGridDimensions(
    GRID_CONFIG.rows,
    GRID_CONFIG.cols,
    ISOMETRIC_CONFIG
  );

  // Helper function to check if adjacent cells have the same terrain
  const getAdjacentTerrain = (row: number, col: number) => {
    const currentTerrain = mapGrid[row]?.[col]?.terrain;
    if (!currentTerrain) return false;

    return {
      top: row > 0 && mapGrid[row - 1]?.[col]?.terrain === currentTerrain,
      right:
        col < mapGrid[0].length - 1 &&
        mapGrid[row]?.[col + 1]?.terrain === currentTerrain,
      bottom:
        row < mapGrid.length - 1 &&
        mapGrid[row + 1]?.[col]?.terrain === currentTerrain,
      left: col > 0 && mapGrid[row]?.[col - 1]?.terrain === currentTerrain,
    };
  };

  // Check if current tile should have seamless corners
  const shouldHaveSeamlessCorners = (row: number, col: number): boolean => {
    const adjacent = getAdjacentTerrain(row, col);
    if (!adjacent) return false;

    // If 2 or more adjacent tiles are the same, use seamless rendering
    const sameTerrainCount = Object.values(adjacent).filter(Boolean).length;
    return sameTerrainCount >= 2;
  };

  // Render an isometric tile with proper asset handling
  const renderIsometricTile = (cell: MapCell) => {
    const terrainAsset = cell.terrain
      ? MAP_ASSETS.find((a) => a.id === cell.terrain)
      : null;
    const objectAsset = cell.object
      ? MAP_ASSETS.find((a) => a.id === cell.object)
      : null;
    const isHovered =
      hoveredCell?.row === cell.row && hoveredCell?.col === cell.col;

    // Get adjacent terrain info for seamless rendering (currently unused but kept for future enhancements)
    // const adjacentTerrain = terrainAsset
    //   ? getAdjacentTerrain(cell.row, cell.col, terrainAsset.id)
    //   : null;

    // Calculate isometric position
    const position = gridToIsometric(cell.row, cell.col, ISOMETRIC_CONFIG);
    const zIndex = getIsometricZIndex(cell.row, cell.col);

    // Diamond shape points
    const halfWidth = ISOMETRIC_CONFIG.tileWidth / 2;
    const halfHeight = ISOMETRIC_CONFIG.tileHeight / 2;
    const depth = ISOMETRIC_CONFIG.tileDepth;

    // Get fallback colors based on terrain type
    const getTerrainColor = () => {
      if (!terrainAsset) return "#F5F5F5"; // Light gray for empty cells
      // Return semi-transparent white to let texture show through better
      if (terrainAsset.imagePath) return "rgba(255, 255, 255, 0.1)";

      // Fallback colors when no image
      switch (terrainAsset.id) {
        case "grass":
          return "#4CAF50";
        case "water":
          return "#2196F3";
        case "wood":
          return "#8D6E63";
        case "road_h":
        case "road_v":
        case "crossroad":
          return "#616161";
        default:
          return "#BDBDBD";
      }
    };

    return (
      <svg
        key={`${cell.row}-${cell.col}`}
        style={{
          position: "absolute",
          left: position.x + gridDimensions.offsetX,
          top: position.y,
          width: ISOMETRIC_CONFIG.tileWidth,
          height:
            ISOMETRIC_CONFIG.tileHeight +
            (show3D ? ISOMETRIC_CONFIG.tileDepth : 0),
          cursor: "pointer",
          zIndex: zIndex + (terrainAsset ? 1 : 0), // Higher z-index for terrain
          overflow: "visible",
          // Improved rendering quality
          imageRendering: "auto",
          shapeRendering: "geometricPrecision",
          textRendering: "optimizeLegibility",
          // Fix alignment issues
          transformOrigin: "center center",
        }}
        onMouseDown={() => handleMouseDown(cell.row, cell.col)}
        onMouseEnter={() => handleMouseEnter(cell.row, cell.col)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Enhanced 3D Box rendering with seamless corners */}
        {show3D && (
          <g>
            {/* Left face - seamless connection with edge detection */}
            <polygon
              points={`0,${halfHeight} ${halfWidth},${
                ISOMETRIC_CONFIG.tileHeight
              } ${halfWidth},${ISOMETRIC_CONFIG.tileHeight + depth} 0,${
                halfHeight + depth
              }`}
              fill={terrainAsset ? "#3a3a3a" : "#707070"}
              opacity={
                shouldHaveSeamlessCorners(cell.row, cell.col) ? "0.4" : "0.7"
              }
              stroke="none"
              style={{
                shapeRendering: "crispEdges",
                imageRendering: "pixelated",
                mixBlendMode: shouldHaveSeamlessCorners(cell.row, cell.col)
                  ? "multiply"
                  : "normal",
              }}
            />
            {/* Right face - seamless connection with edge detection */}
            <polygon
              points={`${halfWidth},${ISOMETRIC_CONFIG.tileHeight} ${
                ISOMETRIC_CONFIG.tileWidth
              },${halfHeight} ${ISOMETRIC_CONFIG.tileWidth},${
                halfHeight + depth
              } ${halfWidth},${ISOMETRIC_CONFIG.tileHeight + depth}`}
              fill={terrainAsset ? "#2a2a2a" : "#606060"}
              opacity={
                shouldHaveSeamlessCorners(cell.row, cell.col) ? "0.5" : "0.8"
              }
              stroke="none"
              style={{
                shapeRendering: "crispEdges",
                imageRendering: "pixelated",
                mixBlendMode: shouldHaveSeamlessCorners(cell.row, cell.col)
                  ? "multiply"
                  : "normal",
              }}
            />
          </g>
        )}

        {/* Top face - Diamond shape */}
        <g>
          {/* Seamless surface for empty cells with better corner handling */}
          {(!terrainAsset || !terrainAsset.imagePath) && (
            <polygon
              points={`${halfWidth},0 ${ISOMETRIC_CONFIG.tileWidth},${halfHeight} ${halfWidth},${ISOMETRIC_CONFIG.tileHeight} 0,${halfHeight}`}
              fill={getTerrainColor()}
              stroke="none"
              style={{
                shapeRendering: "crispEdges",
                imageRendering: "pixelated",
                mixBlendMode: "normal",
                opacity: 1,
              }}
            />
          )}

          {/* 3D Cube Terrain rendering */}
          {terrainAsset && terrainAsset.imagePath && (
            <g>
              <defs>
                {/* Tiled-compatible seamless terrain pattern */}
                <pattern
                  id={`global-pattern-${terrainAsset.id}`}
                  patternUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width={ISOMETRIC_CONFIG.tileWidth}
                  height={ISOMETRIC_CONFIG.tileHeight}
                  patternTransform="translate(0,0)"
                >
                  {/* Full coverage texture following Tiled standards */}
                  <image
                    xlinkHref={terrainAsset.imagePath}
                    href={terrainAsset.imagePath}
                    x="0"
                    y="0"
                    width={ISOMETRIC_CONFIG.tileWidth}
                    height={ISOMETRIC_CONFIG.tileHeight}
                    style={{
                      imageRendering: "pixelated",
                      shapeRendering: "crispEdges",
                    }}
                    preserveAspectRatio="none"
                    filter="url(#seamless-blend)"
                  />
                </pattern>

                {/* Enhanced seamless blending filter for better corners */}
                <filter
                  id="seamless-blend"
                  x="-5%"
                  y="-5%"
                  width="110%"
                  height="110%"
                >
                  <feGaussianBlur stdDeviation="0.2" result="blur" />
                  <feColorMatrix
                    type="saturate"
                    values="1.02"
                    result="saturated"
                  />
                  <feMerge>
                    <feMergeNode in="saturated" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Enhanced 3D lighting gradient */}
                <linearGradient
                  id={`enhanced-3d-lighting-${cell.row}-${cell.col}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
                  <stop offset="30%" stopColor="rgba(255,255,255,0.15)" />
                  <stop offset="70%" stopColor="rgba(0,0,0,0.1)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
                </linearGradient>
              </defs>

              {/* Seamless Top Face with Edge Detection Corner Handling */}
              <polygon
                points={`${halfWidth},0 ${ISOMETRIC_CONFIG.tileWidth},${halfHeight} ${halfWidth},${ISOMETRIC_CONFIG.tileHeight} 0,${halfHeight}`}
                fill={
                  terrainAsset.id.includes("road")
                    ? "#4a4a4a"
                    : `url(#global-pattern-${terrainAsset.id})`
                }
                stroke="none"
                style={{
                  shapeRendering: "crispEdges",
                  imageRendering: "pixelated",
                  mixBlendMode: shouldHaveSeamlessCorners(cell.row, cell.col)
                    ? "multiply"
                    : "normal",
                  opacity: shouldHaveSeamlessCorners(cell.row, cell.col)
                    ? "0.9"
                    : "1",
                }}
              />

              {/* Enhanced 3D Lighting Effect with Seamless Corners */}
              <polygon
                points={`${halfWidth},0 ${ISOMETRIC_CONFIG.tileWidth},${halfHeight} ${halfWidth},${ISOMETRIC_CONFIG.tileHeight} 0,${halfHeight}`}
                fill={`url(#enhanced-3d-lighting-${cell.row}-${cell.col})`}
                opacity={
                  shouldHaveSeamlessCorners(cell.row, cell.col) ? "0.1" : "0.3"
                }
                stroke="none"
                style={{
                  mixBlendMode: shouldHaveSeamlessCorners(cell.row, cell.col)
                    ? "multiply"
                    : "normal",
                }}
              />

              {/* Hover effect overlay */}
              {isHovered && (
                <polygon
                  points={`${halfWidth},0 ${ISOMETRIC_CONFIG.tileWidth},${halfHeight} ${halfWidth},${ISOMETRIC_CONFIG.tileHeight} 0,${halfHeight}`}
                  fill="rgba(255,255,255,0.2)"
                  opacity="0.8"
                />
              )}

              {/* Add road markings if needed */}
              {terrainAsset.id === "road_h" && (
                <g>
                  <line
                    x1={halfWidth * 0.5}
                    y1={halfHeight * 0.8}
                    x2={halfWidth * 1.5}
                    y2={halfHeight * 1.2}
                    stroke="#FFD700"
                    strokeWidth="2"
                    strokeDasharray="5,3"
                  />
                </g>
              )}
              {terrainAsset.id === "road_v" && (
                <g>
                  <line
                    x1={halfWidth * 0.8}
                    y1={halfHeight * 0.5}
                    x2={halfWidth * 1.2}
                    y2={halfHeight * 1.5}
                    stroke="#FFD700"
                    strokeWidth="2"
                    strokeDasharray="5,3"
                  />
                </g>
              )}
              {terrainAsset.id === "crossroad" && (
                <g>
                  <line
                    x1={halfWidth * 0.5}
                    y1={halfHeight * 0.8}
                    x2={halfWidth * 1.5}
                    y2={halfHeight * 1.2}
                    stroke="#FFD700"
                    strokeWidth="2"
                    strokeDasharray="5,3"
                  />
                  <line
                    x1={halfWidth * 0.8}
                    y1={halfHeight * 0.5}
                    x2={halfWidth * 1.2}
                    y2={halfHeight * 1.5}
                    stroke="#FFD700"
                    strokeWidth="2"
                    strokeDasharray="5,3"
                  />
                </g>
              )}
            </g>
          )}

          {/* Grid lines overlay */}
          {showGrid && (
            <polygon
              points={`${halfWidth},0 ${ISOMETRIC_CONFIG.tileWidth},${halfHeight} ${halfWidth},${ISOMETRIC_CONFIG.tileHeight} 0,${halfHeight}`}
              fill="none"
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="0.5"
            />
          )}

          {/* Hover highlight */}
          {isHovered && (
            <polygon
              points={`${halfWidth},0 ${ISOMETRIC_CONFIG.tileWidth},${halfHeight} ${halfWidth},${ISOMETRIC_CONFIG.tileHeight} 0,${halfHeight}`}
              fill="none"
              stroke={THEME_COLORS.primary}
              strokeWidth="2"
            />
          )}

          {/* Object image with smooth rendering */}
          {objectAsset && (
            <g>
              {/* Enhanced isometric 2.5D filters */}
              <defs>
                <filter
                  id={`isometric-shadow-${cell.row}-${cell.col}`}
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feDropShadow
                    dx="3"
                    dy="4"
                    stdDeviation="2"
                    floodColor="rgba(0,0,0,0.4)"
                  />
                </filter>
                <filter
                  id={`isometric-glow-${cell.row}-${cell.col}`}
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Isometric perspective filter for depth */}
                <filter
                  id={`isometric-perspective-${cell.row}-${cell.col}`}
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feDropShadow
                    dx="2"
                    dy="3"
                    stdDeviation="1.5"
                    floodColor="rgba(0,0,0,0.3)"
                  />
                  <feGaussianBlur stdDeviation="0.5" result="soften" />
                  <feMerge>
                    <feMergeNode in="soften" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Isometric 2.5D positioning based on object type */}
              {objectAsset.category === "robot" ? (
                <g>
                  {/* Ground shadow with proper isometric alignment */}
                  <ellipse
                    cx={halfWidth}
                    cy={ISOMETRIC_CONFIG.tileHeight * 0.85}
                    rx={ISOMETRIC_CONFIG.tileWidth * 0.2}
                    ry={ISOMETRIC_CONFIG.tileHeight * 0.08}
                    fill="rgba(0,0,0,0.2)"
                    opacity="0.6"
                    transform={`skewX(-30) scale(1, 0.5)`}
                  />
                  {/* Main robot image with proper isometric alignment */}
                  <image
                    xlinkHref={objectAsset.imagePath}
                    href={objectAsset.imagePath}
                    x={ISOMETRIC_CONFIG.tileWidth * 0.2}
                    y={ISOMETRIC_CONFIG.tileHeight * 0.1}
                    width={ISOMETRIC_CONFIG.tileWidth * 0.6}
                    height={ISOMETRIC_CONFIG.tileHeight * 1.2}
                    preserveAspectRatio="xMidYMid meet"
                    transform={`translate(${
                      halfWidth - ISOMETRIC_CONFIG.tileWidth * 0.3
                    }, ${halfHeight - ISOMETRIC_CONFIG.tileHeight * 0.6})`}
                    style={{
                      imageRendering: "auto",
                      shapeRendering: "geometricPrecision",
                    }}
                    filter={`url(#isometric-perspective-${cell.row}-${cell.col})`}
                  />
                </g>
              ) : objectAsset.category === "item" ? (
                <g>
                  {/* Ground shadow for items with isometric alignment */}
                  <ellipse
                    cx={halfWidth}
                    cy={ISOMETRIC_CONFIG.tileHeight * 0.75}
                    rx={ISOMETRIC_CONFIG.tileWidth * 0.15}
                    ry={ISOMETRIC_CONFIG.tileHeight * 0.06}
                    fill="rgba(0,0,0,0.15)"
                    opacity="0.5"
                    transform={`skewX(-30) scale(1, 0.5)`}
                  />
                  {/* Main item image with proper isometric alignment */}
                  <image
                    xlinkHref={objectAsset.imagePath}
                    href={objectAsset.imagePath}
                    x={ISOMETRIC_CONFIG.tileWidth * 0.3}
                    y={ISOMETRIC_CONFIG.tileHeight * 0.2}
                    width={ISOMETRIC_CONFIG.tileWidth * 0.4}
                    height={ISOMETRIC_CONFIG.tileHeight * 0.6}
                    preserveAspectRatio="xMidYMid meet"
                    transform={`translate(${
                      halfWidth - ISOMETRIC_CONFIG.tileWidth * 0.2
                    }, ${halfHeight - ISOMETRIC_CONFIG.tileHeight * 0.3})`}
                    style={{
                      imageRendering: "auto",
                      shapeRendering: "geometricPrecision",
                    }}
                    filter={`url(#isometric-perspective-${cell.row}-${cell.col})`}
                  />
                </g>
              ) : (
                /* Default object with isometric positioning */
                <g>
                  {/* Ground shadow for default objects with isometric alignment */}
                  <ellipse
                    cx={halfWidth}
                    cy={ISOMETRIC_CONFIG.tileHeight * 0.8}
                    rx={ISOMETRIC_CONFIG.tileWidth * 0.25}
                    ry={ISOMETRIC_CONFIG.tileHeight * 0.1}
                    fill="rgba(0,0,0,0.2)"
                    opacity="0.5"
                    transform={`skewX(-30) scale(1, 0.5)`}
                  />
                  {/* Main object image with proper isometric alignment */}
                  <image
                    xlinkHref={objectAsset.imagePath}
                    href={objectAsset.imagePath}
                    x={ISOMETRIC_CONFIG.tileWidth * 0.15}
                    y={ISOMETRIC_CONFIG.tileHeight * 0.1}
                    width={ISOMETRIC_CONFIG.tileWidth * 0.7}
                    height={ISOMETRIC_CONFIG.tileHeight * 0.8}
                    preserveAspectRatio="xMidYMid meet"
                    transform={`translate(${
                      halfWidth - ISOMETRIC_CONFIG.tileWidth * 0.35
                    }, ${halfHeight - ISOMETRIC_CONFIG.tileHeight * 0.4})`}
                    style={{
                      imageRendering: "auto",
                      shapeRendering: "geometricPrecision",
                    }}
                    filter={`url(#isometric-perspective-${cell.row}-${cell.col})`}
                  />
                </g>
              )}

              {/* Item count badge - if implementing multiple items */}
              {cell.itemCount && cell.itemCount > 1 && (
                <g>
                  <rect
                    x={ISOMETRIC_CONFIG.tileWidth * 0.75}
                    y={ISOMETRIC_CONFIG.tileHeight * 0.1}
                    width="20"
                    height="16"
                    rx="2"
                    fill="rgba(0, 0, 0, 0.7)"
                    filter={`url(#isometric-perspective-${cell.row}-${cell.col})`}
                  />
                  <text
                    x={ISOMETRIC_CONFIG.tileWidth * 0.75 + 10}
                    y={ISOMETRIC_CONFIG.tileHeight * 0.1 + 12}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    style={{ textRendering: "optimizeLegibility" }}
                  >
                    {cell.itemCount}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* Enhanced Preview asset when hovering */}
          {isHovered &&
            previewAsset &&
            previewAsset !== "eraser" &&
            previewAsset !== "empty" && (
              <g>
                {/* Preview overlay with better visual feedback */}
                <polygon
                  points={`${halfWidth},0 ${ISOMETRIC_CONFIG.tileWidth},${halfHeight} ${halfWidth},${ISOMETRIC_CONFIG.tileHeight} 0,${halfHeight}`}
                  fill="rgba(33, 150, 243, 0.1)"
                  stroke={THEME_COLORS.primary}
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  style={{
                    animation: "dash 1s linear infinite",
                  }}
                />

                {(() => {
                  const asset = MAP_ASSETS.find((a) => a.id === previewAsset);
                  if (!asset || !asset.imagePath) return null;

                  if (asset.category === "terrain") {
                    // Preview terrain with smooth pattern
                    return (
                      <g>
                        <defs>
                          <pattern
                            id={`preview-pattern-${cell.row}-${cell.col}`}
                            patternUnits="userSpaceOnUse"
                            x="0"
                            y="0"
                            width={ISOMETRIC_CONFIG.tileWidth}
                            height={ISOMETRIC_CONFIG.tileHeight}
                          >
                            <g
                              transform={`translate(${
                                ISOMETRIC_CONFIG.tileWidth / 2
                              },${
                                ISOMETRIC_CONFIG.tileHeight / 2
                              }) rotate(45) scale(0.7, 0.35)`}
                            >
                              <image
                                xlinkHref={asset.imagePath}
                                href={asset.imagePath}
                                x={-ISOMETRIC_CONFIG.tileWidth / 2}
                                y={-ISOMETRIC_CONFIG.tileHeight / 2}
                                width={ISOMETRIC_CONFIG.tileWidth}
                                height={ISOMETRIC_CONFIG.tileHeight}
                                style={{
                                  imageRendering: "auto",
                                  shapeRendering: "geometricPrecision",
                                }}
                              />
                            </g>
                          </pattern>
                          <linearGradient
                            id={`preview-glow-${cell.row}-${cell.col}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="rgba(76,175,80,0.3)" />
                            <stop
                              offset="50%"
                              stopColor="rgba(76,175,80,0.1)"
                            />
                            <stop
                              offset="100%"
                              stopColor="rgba(76,175,80,0.2)"
                            />
                          </linearGradient>
                        </defs>
                        <polygon
                          points={`${halfWidth},0 ${ISOMETRIC_CONFIG.tileWidth},${halfHeight} ${halfWidth},${ISOMETRIC_CONFIG.tileHeight} 0,${halfHeight}`}
                          fill={`url(#preview-pattern-${cell.row}-${cell.col})`}
                          opacity="0.7"
                          stroke={THEME_COLORS.primary}
                          strokeWidth="2"
                          style={{ shapeRendering: "geometricPrecision" }}
                        />
                        <polygon
                          points={`${halfWidth},0 ${ISOMETRIC_CONFIG.tileWidth},${halfHeight} ${halfWidth},${ISOMETRIC_CONFIG.tileHeight} 0,${halfHeight}`}
                          fill={`url(#preview-glow-${cell.row}-${cell.col})`}
                          opacity="0.8"
                        />
                      </g>
                    );
                  } else {
                    // Preview object with smooth rendering
                    return (
                      <g>
                        {/* Preview shadow */}
                        <image
                          xlinkHref={asset.imagePath}
                          href={asset.imagePath}
                          x={ISOMETRIC_CONFIG.tileWidth * 0.15 + 1}
                          y={ISOMETRIC_CONFIG.tileHeight * 0.05 + 1}
                          width={ISOMETRIC_CONFIG.tileWidth * 0.7}
                          height={ISOMETRIC_CONFIG.tileHeight * 0.9}
                          preserveAspectRatio="xMidYMid meet"
                          opacity="0.2"
                          filter="blur(1px)"
                        />
                        {/* Preview object */}
                        <image
                          xlinkHref={asset.imagePath}
                          href={asset.imagePath}
                          x={ISOMETRIC_CONFIG.tileWidth * 0.15}
                          y={ISOMETRIC_CONFIG.tileHeight * 0.05}
                          width={ISOMETRIC_CONFIG.tileWidth * 0.7}
                          height={ISOMETRIC_CONFIG.tileHeight * 0.9}
                          preserveAspectRatio="xMidYMid meet"
                          opacity="0.8"
                          style={{
                            imageRendering: "auto",
                            shapeRendering: "geometricPrecision",
                          }}
                          filter={`url(#isometric-perspective-${cell.row}-${cell.col})`}
                        />
                        {/* Preview border */}
                        <rect
                          x={ISOMETRIC_CONFIG.tileWidth * 0.15}
                          y={ISOMETRIC_CONFIG.tileHeight * 0.05}
                          width={ISOMETRIC_CONFIG.tileWidth * 0.7}
                          height={ISOMETRIC_CONFIG.tileHeight * 0.9}
                          fill="none"
                          stroke={THEME_COLORS.primary}
                          strokeWidth="2"
                          strokeDasharray="5,3"
                          opacity="0.8"
                        />
                      </g>
                    );
                  }
                })()}
              </g>
            )}
        </g>

        {/* Removed grid coordinates - keeping empty tiles clean */}
      </svg>
    );
  };

  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: THEME_COLORS.surface,
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header with title and controls */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: THEME_COLORS.text.primary }}
          >
            Isometric Map ({GRID_CONFIG.rows}x{GRID_CONFIG.cols})
          </Typography>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {/* 3D toggle */}
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={show3D}
                  onChange={(e) => setShow3D(e.target.checked)}
                  color="primary"
                />
              }
              label={<ThreeDRotationIcon />}
            />

            {/* Grid toggle */}
            <IconButton
              size="small"
              onClick={() => setShowGrid(!showGrid)}
              sx={{
                color: showGrid ? THEME_COLORS.primary : "#999",
                bgcolor: showGrid ? `${THEME_COLORS.primary}10` : "transparent",
              }}
            >
              <GridOnIcon />
            </IconButton>

            {/* Zoom controls */}
            <IconButton
              size="small"
              onClick={handleZoomOut}
              sx={{ color: THEME_COLORS.primary }}
            >
              <ZoomOutIcon />
            </IconButton>
            <Chip
              label={`${Math.round(zoom * 100)}%`}
              size="small"
              sx={{ minWidth: 60 }}
            />
            <IconButton
              size="small"
              onClick={handleZoomIn}
              sx={{ color: THEME_COLORS.primary }}
            >
              <ZoomInIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Cell info */}
        {hoveredCell && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Typography
              variant="caption"
              sx={{ color: THEME_COLORS.text.secondary }}
            >
              Cell [{hoveredCell.row}, {hoveredCell.col}]
            </Typography>
          </Box>
        )}
      </Box>

      {/* Isometric grid container */}
      <Box
        ref={containerRef}
        sx={{
          flexGrow: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#9E9E9E",
          borderRadius: 1,
          p: 3,
          position: "relative",
          // Add CSS animations for preview effects
          "& @keyframes dash": {
            "0%": { strokeDashoffset: 0 },
            "100%": { strokeDashoffset: 8 },
          },
        }}
      >
        <Box
          ref={gridRef}
          sx={{
            position: "relative",
            width: gridDimensions.width + gridDimensions.offsetX,
            height: gridDimensions.height,
            transform: `scale(${zoom})`,
            transformOrigin: "center",
            transition: "transform 0.2s",
            userSelect: "none",
          }}
        >
          {/* Render all tiles in proper order */}
          {mapGrid.map((row) => row.map((cell) => renderIsometricTile(cell)))}
        </Box>
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onClearMap}
          sx={{
            borderColor: THEME_COLORS.error,
            color: THEME_COLORS.error,
            "&:hover": {
              borderColor: THEME_COLORS.error,
              bgcolor: `${THEME_COLORS.error}10`,
            },
          }}
        >
          Clear All
        </Button>

        <Button
          variant="outlined"
          startIcon={<PlayArrowIcon />}
          onClick={onTestMap}
          sx={{
            borderColor: THEME_COLORS.primary,
            color: THEME_COLORS.primary,
            "&:hover": {
              borderColor: THEME_COLORS.primaryDark,
              bgcolor: THEME_COLORS.hover,
            },
          }}
        >
          Test Map
        </Button>

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={onSaveMap}
          sx={{
            bgcolor: THEME_COLORS.primary,
            "&:hover": {
              bgcolor: THEME_COLORS.primaryDark,
            },
          }}
        >
          Save Map
        </Button>
      </Box>
    </Paper>
  );
}
