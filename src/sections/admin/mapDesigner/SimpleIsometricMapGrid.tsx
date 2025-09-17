import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
} from "@mui/material";
import { useNotification } from "hooks/useNotification";
import { MapCell } from "common/models";
import { MAP_ASSETS } from "./mapAssets.config";
import { THEME_COLORS, GRID_CONFIG } from "./theme.config";
import {
  gridToIsometric,
  getIsometricGridDimensions,
  ISOMETRIC_CONFIG,
} from "./isometricHelpers";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

interface SimpleIsometricMapGridProps {
  mapGrid: MapCell[][];
  selectedAsset: string;
  onCellClick: (row: number, col: number) => void;
  onSaveMap: () => void;
  onClearMap: () => void;
}

export default function SimpleIsometricMapGrid({
  mapGrid,
  selectedAsset,
  onCellClick,
  onSaveMap,
  onClearMap,
}: SimpleIsometricMapGridProps) {
  const ENABLE_PAN = true;
  const MAP_VIEWPORT_HEIGHT = 700; // px - fixed map viewport height for 2.5D
  // Elevation per isometric diagonal (row+col). Positive lifts tiles up (smaller Y)
  const LIFT_PER_DIAGONAL = 15.5; // px per diagonal step (lift up)
  const DIAGONAL_SPACING = 4.5; // px per diagonal step (extra spacing between diagonal bands)
  // Placement interactions (2D-style)
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  // Per-cell frame corner offsets for empty cell diamonds (visual-only)
  const [cornerOffsetsByCell] = useState<
    Record<string, { top: number; right: number; bottom: number; left: number }>
  >({});
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Drag-to-pan state
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const panStartOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const { showNotification, NotificationComponent } = useNotification({
    anchorOrigin: { vertical: "top", horizontal: "right" },
    autoHideDurationMs: 3000,
  });

  // Global frame-corner offsets (apply to all empty-cell diamonds). Adjust here in code.
  const FRAME_OFFSET_DEFAULT = { top: 10, right: 0, bottom: -10, left: 0 };

  const handleMouseDown = (row: number, col: number) => {
    // Prevent placing non-terrain assets on cells without a terrain tile
    const selected = MAP_ASSETS.find((a) => a.id === selectedAsset);
    const targetCell = mapGrid[row]?.[col];
    if (selected && selected.category !== "terrain") {
      if (!targetCell || !targetCell.terrain) {
        showNotification("Place on a terrain tile first.", "warning");
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
          showNotification("Place on a terrain tile first.", "warning");
          return;
        }
      }
      onCellClick(row, col);
    }
  };

  const handleMouseLeave = () => {
    if (!isDrawing) {
      setHoveredCell(null);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setTimeout(() => {
      if (!isDrawing) {
        setHoveredCell(null);
      }
    }, 100);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Calculate grid dimensions
  const gridDimensions = getIsometricGridDimensions(
    GRID_CONFIG.rows,
    GRID_CONFIG.cols,
    ISOMETRIC_CONFIG
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
      {/* Toast notifications */}
      <NotificationComponent />
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
            {/* Zoom controls */}
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

        {/* Cell info hidden to avoid layout jump (moved to overlay badge) */}
      </Box>

      {/* Isometric grid viewport wrapper (non-scrolling) */}
      <Box
        sx={{
          flexGrow: 0,
          height: MAP_VIEWPORT_HEIGHT,
          minHeight: MAP_VIEWPORT_HEIGHT,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Pretty coordinate badge - fixed inside map area */}
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
        {/* Scrollable/pannable map container */}
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
            if (!ENABLE_PAN) return;
            if (!isPanning) return;
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
            {/* 2D map placement UX, projected to isometric */}
            {mapGrid.map((row) =>
              row.map((cell) => {
                const terrainAsset = cell.terrain
                  ? MAP_ASSETS.find((a) => a.id === cell.terrain)
                  : null;
                const objectAsset = cell.object
                  ? MAP_ASSETS.find((a) => a.id === cell.object)
                  : null;

                const pos = gridToIsometric(
                  cell.row,
                  cell.col,
                  ISOMETRIC_CONFIG
                );
                const left = pos.x + gridDimensions.offsetX;
                const top =
                  pos.y +
                  gridDimensions.offsetY -
                  (cell.row + cell.col) * LIFT_PER_DIAGONAL +
                  (cell.row + cell.col) * DIAGONAL_SPACING;
                const w = ISOMETRIC_CONFIG.tileWidth;
                const h = ISOMETRIC_CONFIG.tileHeight;
                const halfW = w / 2;
                const halfH = h / 2;

                const isEmpty = !terrainAsset && !objectAsset;
                const key = `${cell.row}-${cell.col}`;
                const saved = cornerOffsetsByCell[key] || {
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                };
                const co = {
                  top: FRAME_OFFSET_DEFAULT.top + saved.top,
                  right: FRAME_OFFSET_DEFAULT.right + saved.right,
                  bottom: FRAME_OFFSET_DEFAULT.bottom + saved.bottom,
                  left: FRAME_OFFSET_DEFAULT.left + saved.left,
                };
                // Stack shift: lift object/robot when there are items stacked in this cell
                const isRobot =
                  (objectAsset as any)?.category === "robot" ||
                  (objectAsset?.id?.startsWith &&
                    objectAsset.id.startsWith("robot_"));

                // For robots: don't lift based on item count since robot replaces the position
                // For items: lift based on stack level
                let stackShiftY = 0;
                let stackLevel = 0;
                if (isRobot) {
                  // Robot always has base lift, no additional stacking
                  stackShiftY = 20; // ROBOT_BASE_LIFT
                } else {
                  // Items: calculate stack level normally
                  stackLevel = Math.max(
                    cell.itemCount ?? 0,
                    Array.isArray(cell.items) ? cell.items.length : 0
                  );
                  const ITEM_STEP = 20;
                  stackShiftY = stackLevel > 0 ? stackLevel * ITEM_STEP : 0;
                }
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
                    onMouseLeave={() => {
                      handleMouseLeave();
                    }}
                  >
                    {/* Empty cell: subtle diamond background like 2D grid pattern */}
                    {isEmpty && (
                      <polygon
                        points={`${halfW},${0 + co.top} ${w},${
                          halfH + co.right
                        } ${halfW},${h + co.bottom} 0,${halfH + co.left}`}
                        fill="#ffffff"
                        stroke="#e5e5e5"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                    )}

                    {/* Terrain image (2D style) */}
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

                    {/* Object image centered */}
                    {objectAsset?.imagePath &&
                      (() => {
                        const isRobot =
                          (objectAsset as any)?.category === "robot" ||
                          (objectAsset?.id?.startsWith &&
                            objectAsset.id.startsWith("robot_"));
                        const SCALE = isRobot ? 0.85 : 0.5; // items smaller than robots
                        const ow = w * SCALE;
                        const oh = h * SCALE;
                        const ox = (w - ow) / 2;
                        const oy = (h - oh) / 2 - stackShiftY;
                        return (
                          <g>
                            {objectAsset.category === "item" && (
                              <title>
                                {`${objectAsset.name}${
                                  (cell.itemCount ?? 0) > 1
                                    ? ` ×${cell.itemCount}`
                                    : ""
                                }`}
                              </title>
                            )}
                            <image
                              href={objectAsset.imagePath}
                              x={ox}
                              y={oy}
                              width={ow}
                              height={oh}
                              preserveAspectRatio="xMidYMid meet"
                              style={{
                                filter:
                                  !isRobot && (cell.itemCount ?? 0) > 0
                                    ? "drop-shadow(0 2px 4px rgba(0,0,0,0.35))"
                                    : undefined,
                              }}
                            />
                            {/* Visible count badge next to item */}
                            {objectAsset.category === "item" &&
                              (cell.itemCount || 0) > 1 && (
                                <text
                                  x={ox + ow - 2}
                                  y={oy + 12}
                                  textAnchor="end"
                                  fontSize="11"
                                  fontWeight="700"
                                  fill="#ffffff"
                                  stroke="#000000"
                                  strokeWidth="0.8"
                                  style={{ pointerEvents: "none" }}
                                >
                                  {`x${cell.itemCount}`}
                                </text>
                              )}
                          </g>
                        );
                      })()}

                    {/* Hover preview of selected asset on empty cells */}
                    {isEmpty &&
                      isHovered &&
                      selectedAsset &&
                      selectedAsset !== "eraser" &&
                      selectedAsset !== "empty" &&
                      (() => {
                        const ghost = MAP_ASSETS.find(
                          (a) => a.id === selectedAsset
                        );
                        if (!ghost || !ghost.imagePath) return null;
                        if (ghost.category === "terrain") {
                          return (
                            <image
                              href={ghost.imagePath}
                              x={0}
                              y={0}
                              width={w}
                              height={h}
                              preserveAspectRatio="none"
                              opacity={0.55}
                            />
                          );
                        }
                        return (
                          <image
                            href={ghost.imagePath}
                            x={w * 0.075}
                            y={h * 0.075}
                            width={w * 0.85}
                            height={h * 0.85}
                            preserveAspectRatio="xMidYMid meet"
                            opacity={0.7}
                          />
                        );
                      })()}

                    {/* Hover outline like 2D */}
                    {isHovered && (
                      <polygon
                        points={`${halfW},${0 + co.top} ${w},${
                          halfH + co.right
                        } ${halfW},${h + co.bottom} 0,${halfH + co.left}`}
                        fill="none"
                        stroke={THEME_COLORS.primary}
                        strokeWidth="2"
                      />
                    )}
                  </svg>
                );
              })
            )}
          </Box>
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
          Xóa tất cả
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
          Lưu Map
        </Button>
      </Box>
    </Paper>
  );
}
