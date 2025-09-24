import { useState, useRef, useEffect } from "react";
import { Box, Paper, Typography, IconButton, Chip } from "@mui/material";
import { MapCell } from "common/models";
import { MAP_ASSETS } from "./mapAssets.config";
import { THEME_COLORS, GRID_CONFIG } from "./theme.config";
import {
  gridToIsometric,
  getIsometricGridDimensions,
  ISOMETRIC_CONFIG,
} from "./isometricHelpers";
// Bottom action buttons removed per request; keep only zoom controls
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

interface SimpleIsometricMapGridLiteProps {
  mapGrid: MapCell[][];
  selectedAsset: string;
  onCellClick: (row: number, col: number) => void;
}

// This "Lite" version is isolated for Map Designer only to avoid any shared state/styles side-effects
export default function SimpleIsometricMapGridLite({
  mapGrid,
  selectedAsset,
  onCellClick,
}: SimpleIsometricMapGridLiteProps) {
  const ENABLE_PAN = true;
  const MAP_VIEWPORT_HEIGHT = 700;
  const LIFT_PER_DIAGONAL = 15.5;
  const DIAGONAL_SPACING = 4.5;
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const panStartOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const FRAME_OFFSET_DEFAULT = { top: 10, right: 0, bottom: -10, left: 0 };

  const handleMouseDown = (row: number, col: number) => {
    const selected = MAP_ASSETS.find((a) => a.id === selectedAsset);
    const targetCell = mapGrid[row]?.[col];
    if (selected && selected.category !== "terrain") {
      if (!targetCell || !targetCell.terrain) {
        setHoveredCell({ row, col });
        return;
      }
    }
    setIsDrawing(true);
    onCellClick(row, col);
    setHoveredCell({ row, col });
  };

  const handleMouseEnter = (row: number, col: number) => {
    setHoveredCell({ row, col });
    if (isDrawing) {
      const selected = MAP_ASSETS.find((a) => a.id === selectedAsset);
      const targetCell = mapGrid[row]?.[col];
      if (selected && selected.category !== "terrain") {
        if (!targetCell || !targetCell.terrain) {
          return;
        }
      }
      onCellClick(row, col);
    }
  };

  const handleMouseLeave = () => {
    if (!isDrawing) setHoveredCell(null);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setTimeout(() => {
      if (!isDrawing) setHoveredCell(null);
    }, 100);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Nudge zoom slightly on mount to force a stable layout without requiring manual resize/toggle
  useEffect(() => {
    const t1 = setTimeout(() => setZoom((z) => z + 0.0001), 0);
    const t2 = setTimeout(() => setZoom((z) => Math.max(0.5, z - 0.0001)), 40);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Use local immutable copy of isometric config to avoid any shared mutation from other pages
  const ISO = useRef({ ...ISOMETRIC_CONFIG });

  const gridDimensions = getIsometricGridDimensions(
    GRID_CONFIG.rows,
    GRID_CONFIG.cols,
    ISO.current
  );

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
            <IconButton
              size="small"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
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
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              sx={{ color: THEME_COLORS.primary }}
            >
              <ZoomInIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 0,
          height: MAP_VIEWPORT_HEIGHT,
          minHeight: MAP_VIEWPORT_HEIGHT,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 6,
            bgcolor: "#00000099",
            color: "#fff",
            px: 1.25,
            py: 0.5,
            borderRadius: 999,
            fontSize: 12,
            lineHeight: 1.4,
            pointerEvents: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            backdropFilter: "blur(4px)",
          }}
        >
          Cell [{hoveredCell?.row ?? "-"}, {hoveredCell?.col ?? "-"}]
        </Box>
        <Box
          ref={containerRef}
          sx={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "#9E9E9E",
            borderRadius: 1,
            p: 3,
            cursor: ENABLE_PAN ? (isPanning ? "grabbing" : "grab") : "default",
          }}
          onMouseDown={(e) => {
            if (!ENABLE_PAN) return;
            if (e.button !== 0) return;
            e.preventDefault();
            setIsPanning(true);
            panStartRef.current = { x: e.clientX, y: e.clientY };
            panStartOffsetRef.current = { x: panOffset.x, y: panOffset.y };
          }}
          onMouseMove={(e) => {
            if (!ENABLE_PAN || !isPanning) return;
            const dx = e.clientX - panStartRef.current.x;
            const dy = e.clientY - panStartRef.current.y;
            setPanOffset({
              x: panStartOffsetRef.current.x - dx,
              y: panStartOffsetRef.current.y - dy,
            });
          }}
          onMouseUp={() => {
            if (!ENABLE_PAN) return;
            setIsPanning(false);
          }}
          onMouseLeave={() => {
            if (!ENABLE_PAN) return;
            setIsPanning(false);
          }}
        >
          <Box
            ref={gridRef}
            sx={{
              position: "relative",
              width: gridDimensions.width + gridDimensions.offsetX,
              height: gridDimensions.height,
              transform: `translate(${-panOffset.x}px, ${-panOffset.y}px) scale(${zoom})`,
              transformOrigin: "top left",
              transition: "transform 0.2s",
              userSelect: "none",
            }}
          >
            {mapGrid.map((row) =>
              row.map((cell) => {
                const terrainAsset = cell.terrain
                  ? MAP_ASSETS.find((a) => a.id === cell.terrain)
                  : null;
                const objectAsset = cell.object
                  ? MAP_ASSETS.find((a) => a.id === cell.object)
                  : null;
                const pos = gridToIsometric(cell.row, cell.col, ISO.current);
                const left = pos.x + gridDimensions.offsetX;
                const top =
                  pos.y +
                  gridDimensions.offsetY -
                  (cell.row + cell.col) * LIFT_PER_DIAGONAL +
                  (cell.row + cell.col) * DIAGONAL_SPACING;
                const w = ISO.current.tileWidth;
                const h = ISO.current.tileHeight;
                const halfW = w / 2;
                const halfH = h / 2;
                const isEmpty = !terrainAsset && !objectAsset;
                const isHovered =
                  hoveredCell?.row === cell.row &&
                  hoveredCell?.col === cell.col;
                return (
                  <svg
                    key={`${cell.row}-${cell.col}`}
                    style={{
                      position: "absolute",
                      left,
                      top,
                      width: w,
                      height: h,
                      overflow: "visible",
                      cursor: "pointer",
                      zIndex: 2,
                    }}
                    onMouseDown={() => handleMouseDown(cell.row, cell.col)}
                    onMouseEnter={() => {
                      setHoveredCell({ row: cell.row, col: cell.col });
                      handleMouseEnter(cell.row, cell.col);
                    }}
                    onMouseLeave={handleMouseLeave}
                  >
                    {isEmpty && (
                      <polygon
                        points={`${halfW},${
                          0 + FRAME_OFFSET_DEFAULT.top
                        } ${w},${halfH + FRAME_OFFSET_DEFAULT.right} ${halfW},${
                          h + FRAME_OFFSET_DEFAULT.bottom
                        } 0,${halfH + FRAME_OFFSET_DEFAULT.left}`}
                        fill="#ffffff"
                        stroke="#e5e5e5"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                    )}
                    {terrainAsset?.imagePath && (
                      <image
                        href={terrainAsset.imagePath}
                        x={0}
                        y={0}
                        width={w}
                        height={h}
                        preserveAspectRatio="none"
                      />
                    )}
                    {objectAsset?.imagePath && (
                      <image
                        href={objectAsset.imagePath}
                        x={w * 0.075}
                        y={h * 0.075}
                        width={w * 0.85}
                        height={h * 0.85}
                        preserveAspectRatio="xMidYMid meet"
                      />
                    )}
                    {isHovered && (
                      <>
                        <polygon
                          points={`${halfW},${
                            0 + FRAME_OFFSET_DEFAULT.top
                          } ${w},${
                            halfH + FRAME_OFFSET_DEFAULT.right
                          } ${halfW},${h + FRAME_OFFSET_DEFAULT.bottom} 0,${
                            halfH + FRAME_OFFSET_DEFAULT.left
                          }`}
                          fill="none"
                          stroke={THEME_COLORS.primary}
                          strokeWidth="2"
                        />
                        {(() => {
                          const asset = MAP_ASSETS.find(
                            (a) => a.id === selectedAsset
                          );
                          if (!asset || !asset.imagePath) return null;
                          if (asset.id === "eraser" || asset.id === "empty")
                            return null;
                          if (asset.category === "terrain") {
                            return (
                              <image
                                href={asset.imagePath}
                                x={0}
                                y={0}
                                width={w}
                                height={h}
                                preserveAspectRatio="none"
                                opacity={0.6}
                              />
                            );
                          }
                          // object preview centered
                          return (
                            <image
                              href={asset.imagePath}
                              x={w * 0.075}
                              y={h * 0.075}
                              width={w * 0.85}
                              height={h * 0.85}
                              preserveAspectRatio="xMidYMid meet"
                              opacity={0.8}
                            />
                          );
                        })()}
                      </>
                    )}
                  </svg>
                );
              })
            )}
          </Box>
        </Box>
      </Box>

      {/* Action buttons removed under map for Map Designer */}
    </Paper>
  );
}
