import { useState, useRef } from "react";
import { Box } from "@mui/material";
import { useNotification } from "hooks/useNotification";
import { MapCell } from "common/models";
import { MAP_ASSETS } from "./mapAssets.config";
import { THEME_COLORS } from "./theme.config";
import {
  gridToIsometric,
  getIsometricGridDimensions,
} from "./isometricHelpers";

// Mini map specific config with smaller tiles
const MINI_ISOMETRIC_CONFIG = {
  tileWidth: 40, // Smaller than main map (64 -> 32)
  tileHeight: 50, // Smaller than main map (60 -> 30)
  tileDepth: 8, // Smaller than main map (16 -> 8)
};

interface MiniIsometricMapGridProps {
  mapGrid: MapCell[][];
  selectedAsset: string;
  onCellClick: (row: number, col: number) => void;
}

function MiniIsometricMapGrid({
  mapGrid,
  onCellClick,
}: MiniIsometricMapGridProps) {
  const ENABLE_PAN = true; // Enable pan for mini map
  const LIFT_PER_DIAGONAL = 22; // Lift per diagonal (makes tiles sink)
  const DIAGONAL_SPACING = 10; // Spacing per diagonal (keeps tiles separated)
  const [zoom] = useState(1);
  // const [hoveredCell, setHoveredCell] = useState<{
  //   row: number;
  //   col: number;
  // } | null>(null);
  const [cornerOffsetsByCell] = useState<
    Record<string, { top: number; right: number; bottom: number; left: number }>
  >({});
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const panStartOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const { NotificationComponent } = useNotification({
    anchorOrigin: { vertical: "top", horizontal: "right" },
    autoHideDurationMs: 3000,
  });

  // Calculate grid dimensions using mini config
  const actualRows = mapGrid?.length || 0;
  const actualCols = mapGrid?.[0]?.length || 0;
  const gridDimensions = getIsometricGridDimensions(
    actualRows,
    actualCols,
    MINI_ISOMETRIC_CONFIG
  );

  // Frame offsets for empty cell diamonds (half of main map)
  const FRAME_OFFSET_DEFAULT = {
    top: 5, // Half of main map (10 / 2)
    right: 0, // Same as main map
    bottom: -5, // Half of main map (-10 / 2)
    left: 0, // Same as main map
  };

  // const terrainCount = countTerrainCells(mapGrid);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Mini map header - simplified */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      ></Box>

      {/* Cell info removed for mini map - not needed for read-only preview */}

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
          p: 2,
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
            transform: `translate(${-panOffset.x}px, ${
              -panOffset.y + 120
            }px) scale(${zoom})`,
            transformOrigin: "center center",
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
                MINI_ISOMETRIC_CONFIG
              );
              const left = pos.x + gridDimensions.offsetX;
              const top =
                pos.y +
                gridDimensions.offsetY -
                (cell.row + cell.col) * LIFT_PER_DIAGONAL +
                (cell.row + cell.col) * DIAGONAL_SPACING;
              const w = MINI_ISOMETRIC_CONFIG.tileWidth;
              const h = MINI_ISOMETRIC_CONFIG.tileHeight;
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
                (objectAsset as any)?.category === "object";
              const itemCount = (cell as any)?.itemCount || 0;
              const stackShift =
                objectAsset && !isRobot ? Math.min(itemCount - 1, 3) * 2 : 0;

              return (
                <Box
                  key={key}
                  sx={{
                    position: "absolute",
                    left: left - halfW,
                    top: top - halfH,
                    width: w,
                    height: h,
                    cursor: "pointer",
                    zIndex: 1000 + (cell.row + cell.col),
                  }}
                  onMouseEnter={() => {}}
                  onMouseLeave={() => {}}
                  onClick={() => onCellClick(cell.row, cell.col)}
                >
                  {/* Terrain layer */}
                  {terrainAsset && (
                    <Box
                      component="img"
                      src={terrainAsset.imagePath}
                      alt={terrainAsset.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                      }}
                    />
                  )}

                  {/* Object layer */}
                  {objectAsset && (
                    <Box
                      component="img"
                      src={objectAsset.imagePath}
                      alt={objectAsset.name}
                      title={`${objectAsset.name}${
                        itemCount > 1 ? ` ×${itemCount}` : ""
                      }`}
                      sx={{
                        position: "absolute",
                        top: -12 - stackShift,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                        zIndex: 1,
                        transform: isRobot ? "scale(0.7)" : "scale(0.5)", // Robot lớn hơn vật phẩm
                      }}
                    />
                  )}

                  {/* Item count badge for stacked items */}
                  {itemCount > 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -4 - stackShift,
                        right: -6,
                        bgcolor: "rgba(0,0,0,0.7)",
                        color: "#fff",
                        fontSize: 10,
                        px: 0.5,
                        py: 0.25,
                        borderRadius: 1,
                        zIndex: 2,
                      }}
                    >
                      ×{itemCount}
                    </Box>
                  )}

                  {/* Empty tile frame overlay (only for empty cells) */}
                  {isEmpty && (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        borderTop: `${1}px solid ${THEME_COLORS.frame}`,
                        borderRight: `${1}px solid ${THEME_COLORS.frame}`,
                        borderBottom: `${1}px solid ${THEME_COLORS.frame}`,
                        borderLeft: `${1}px solid ${THEME_COLORS.frame}`,
                        borderRadius: `${co.top}px ${co.right}px ${co.bottom}px ${co.left}px`,
                        opacity: 0.3,
                      }}
                    />
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {NotificationComponent()}
    </Box>
  );
}

export default MiniIsometricMapGrid;
