import { useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import { MapCell } from "common/models";
import { MAP_ASSETS } from "./mapAssets.config";
import {
  gridToIsometric,
  getIsometricGridDimensions,
  ISOMETRIC_CONFIG,
} from "./isometricHelpers";

interface IsometricMapGridV2Props {
  mapGrid: MapCell[][];
  onCellClick?: (row: number, col: number) => void;
  onInvalidPlacement?: (row: number, col: number) => void;
  scale?: number; // external scale if needed
  diagonalLift?: number; // px per (row+col) to lift tiles upward (reduce y)
  diagonalSpacing?: number; // px per (row+col) extra spacing between diagonals (increase y)
  offsetX?: number; // px to nudge the whole grid horizontally inside the frame
  offsetY?: number; // px to nudge the whole grid vertically inside the frame
  robotLift?: number; // px to lift robot images upward within tile
  itemLift?: number; // px to lift non-robot object images within tile
  itemStackStep?: number; // px additional lift per extra itemCount (>1)
}

export default function IsometricMapGridV2({
  mapGrid,
  onCellClick,
  onInvalidPlacement,
  scale = 1,
  diagonalLift = 0,
  diagonalSpacing = 0,
  offsetX = 0,
  offsetY = 0,
  robotLift = 20,
  itemLift = 12,
  itemStackStep = 6,
}: IsometricMapGridV2Props) {
  // One-frame deferral to stabilize size before painting children
  const [gridReady, setGridReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Compute dimensions once per size change
  const { rows, cols } = useMemo(
    () => ({
      rows: Array.isArray(mapGrid) ? mapGrid.length : 0,
      cols: Array.isArray(mapGrid) && mapGrid[0] ? mapGrid[0].length : 0,
    }),
    [mapGrid]
  );

  const gridDimensions = useMemo(
    () => getIsometricGridDimensions(rows, cols, ISOMETRIC_CONFIG),
    [rows, cols]
  );

  useEffect(() => {
    setGridReady(false);
    const id = requestAnimationFrame(() => setGridReady(true));
    return () => cancelAnimationFrame(id);
  }, [
    gridDimensions.width,
    gridDimensions.height,
    gridDimensions.offsetX,
    gridDimensions.offsetY,
  ]);

  const safeWidth = useMemo(() => {
    const w = Number(gridDimensions.width) + Number(gridDimensions.offsetX);
    return Number.isFinite(w) && w > 0 ? w : 1;
  }, [gridDimensions.width, gridDimensions.offsetX]);

  const safeHeight = useMemo(() => {
    const h = Number(gridDimensions.height);
    return Number.isFinite(h) && h > 0 ? h : 1;
  }, [gridDimensions.height]);

  // Guard against corner clipping by adding half-tile padding around the grid
  const padX = ISOMETRIC_CONFIG.tileWidth / 2;
  const padY = ISOMETRIC_CONFIG.tileHeight / 2;

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#9E9E9E",
        p: 2,
        flexShrink: 0,
        contain: "layout paint size",
      }}
    >
      <Box
        ref={gridRef}
        sx={{
          position: "relative",
          width: safeWidth + padX * 2,
          height: safeHeight + padY * 2,
          transform: `translate(${Number(offsetX) || 0}px, ${
            Number(offsetY) || 0
          }px) scale(${Number.isFinite(scale) ? scale : 1})`,
          transformOrigin: "center center",
          userSelect: "none",
          contain: "layout paint size",
        }}
      >
        {gridReady &&
          mapGrid.map((rowArr) =>
            rowArr.map((cell) => {
              const terrainAsset = cell.terrain
                ? MAP_ASSETS.find((a) => a.id === cell.terrain)
                : null;
              const objectAsset = cell.object
                ? MAP_ASSETS.find((a) => a.id === cell.object)
                : null;

              const pos = gridToIsometric(cell.row, cell.col, ISOMETRIC_CONFIG);
              const left = Math.round(pos.x + gridDimensions.offsetX);
              const diagonalIndex = cell.row + cell.col;
              const adjustedY =
                pos.y +
                gridDimensions.offsetY -
                diagonalIndex * (Number(diagonalLift) || 0) +
                diagonalIndex * (Number(diagonalSpacing) || 0);
              const top = Math.round(adjustedY);

              const w = ISOMETRIC_CONFIG.tileWidth;
              const h = ISOMETRIC_CONFIG.tileHeight;
              const halfW = w / 2;
              const halfH = h / 2;

              return (
                <Box
                  key={`${cell.row}-${cell.col}`}
                  sx={{
                    position: "absolute",
                    left: left - halfW + padX,
                    top: top - halfH + padY,
                    width: w,
                    height: h,
                    cursor: onCellClick ? "pointer" : "default",
                    zIndex: 1000 + (cell.row + cell.col),
                  }}
                  onClick={() => {
                    // Prevent placing robot/items on cells without a terrain tile
                    if (!terrainAsset) {
                      if (onInvalidPlacement) {
                        onInvalidPlacement(cell.row, cell.col);
                      } else {
                        try {
                          (window as any).Snackbar?.enqueueSnackbar?.(
                            "Place on a terrain tile first.",
                            {
                              variant: "warning",
                              anchorOrigin: {
                                vertical: "top",
                                horizontal: "right",
                              },
                            }
                          );
                        } catch {}
                      }
                      return;
                    }
                    onCellClick?.(cell.row, cell.col);
                  }}
                >
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

                  {objectAsset &&
                    (() => {
                      const isRobot =
                        (objectAsset as any)?.category === "robot" ||
                        (objectAsset?.id as any)?.startsWith?.("robot_");
                      const count = Math.max(
                        0,
                        Number((cell as any)?.itemCount) || 0
                      );
                      const extra =
                        !isRobot && count > 1 ? (count - 1) * itemStackStep : 0;

                      return (
                        <Box
                          component="img"
                          src={objectAsset.imagePath}
                          alt={objectAsset.name}
                          sx={{
                            position: "absolute",
                            top: -12 - (isRobot ? robotLift : itemLift + extra),
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                            zIndex: 1,
                            transform: "scale(0.7)",
                          }}
                        />
                      );
                    })()}

                  {/* Item count badge when stacking (>1) - only show for items, not robots */}
                  {objectAsset &&
                    ((objectAsset as any).category === "item" ||
                      (objectAsset as any).id === "box") &&
                    Math.max(0, Number((cell as any)?.itemCount) || 0) > 1 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: (() => {
                            const count = Math.max(
                              0,
                              Number((cell as any)?.itemCount) || 0
                            );
                            const extra =
                              count > 1 ? (count - 1) * itemStackStep : 0;
                            // Align closely to the object's top-right corner
                            return -12 - (Number(itemLift) || 0) - extra + 2;
                          })(),
                          right: 2,
                          bgcolor: "rgba(0,0,0,0.78)",
                          color: "#fff",
                          px: 0.5,
                          py: 0.15,
                          fontSize: 10.5,
                          fontWeight: 700,
                          lineHeight: 1.1,
                          borderRadius: 0.75,
                          zIndex: 2,
                          pointerEvents: "none",
                        }}
                      >
                        ×{Math.max(0, Number((cell as any)?.itemCount) || 0)}
                      </Box>
                    )}
                </Box>
              );
            })
          )}
      </Box>
    </Box>
  );
}
