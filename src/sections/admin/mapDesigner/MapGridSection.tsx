import { Box, Paper, Typography, IconButton, Chip } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { MapCell } from "common/models";
import { MAP_ASSETS } from "./mapAssets.config";
import { THEME_COLORS, GRID_CONFIG } from "./theme.config";
// Action buttons removed per request
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

interface MapGridSectionProps {
  mapGrid: MapCell[][];
  selectedAsset: string;
  onCellClick: (row: number, col: number) => void;
  onSaveMap?: () => void;
  onClearMap?: () => void;
}

export default function MapGridSection({
  mapGrid,
  selectedAsset,
  onCellClick,
}: MapGridSectionProps) {
  const ENABLE_PAN = true;
  const MAP_VIEWPORT_HEIGHT = 700; // px - fixed map viewport height
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showGrid] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [previewAsset, setPreviewAsset] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const panStartOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (row: number, col: number) => {
    setIsDrawing(true);
    onCellClick(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    setHoveredCell({ row, col });
    setPreviewAsset(selectedAsset);
    if (isDrawing) {
      onCellClick(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsPanning(false);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Background drag-to-pan handlers
  const handleBackgroundMouseDown = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (!ENABLE_PAN) return;
    if (e.button !== 0) return; // left button only
    // Only start panning when clicking background (not on the grid content)
    if (gridRef.current && gridRef.current.contains(e.target as Node)) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY };
    panStartOffsetRef.current = { x: panOffset.x, y: panOffset.y };
  };

  const handleBackgroundMouseMove = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (!ENABLE_PAN) return;
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPanOffset({
      x: panStartOffsetRef.current.x - dx,
      y: panStartOffsetRef.current.y - dy,
    });
  };

  const handleBackgroundMouseLeave = () => {
    if (!ENABLE_PAN) return;
    if (!isPanning) return;
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const renderCell = (cell: MapCell) => {
    const terrainAsset = cell.terrain
      ? MAP_ASSETS.find((a) => a.id === cell.terrain)
      : null;
    const objectAsset = cell.object
      ? MAP_ASSETS.find((a) => a.id === cell.object)
      : null;
    const isEmpty = !terrainAsset && !objectAsset;
    const isHovered =
      hoveredCell?.row === cell.row && hoveredCell?.col === cell.col;

    return (
      <Box
        key={`${cell.row}-${cell.col}`}
        onMouseDown={() => handleMouseDown(cell.row, cell.col)}
        onMouseEnter={() => {
          handleMouseEnter(cell.row, cell.col);
          setHoveredCell({ row: cell.row, col: cell.col });
          setPreviewAsset(selectedAsset);
        }}
        onMouseLeave={() => {
          setHoveredCell(null);
          setPreviewAsset(null);
        }}
        sx={{
          width: GRID_CONFIG.cellSize,
          height: GRID_CONFIG.cellSize,
          // No border/shadow for cells - only for hover
          cursor: "pointer",
          position: "relative",
          overflow: "visible", // Allow tiles to overflow for connection
          boxSizing: "border-box",
          // Empty cell with light pattern
          ...(isEmpty
            ? {
                background:
                  "repeating-conic-gradient(from 45deg at 50% 50%, #f9f9f9 0deg 90deg, #f5f5f5 90deg 180deg)",
                ...(showGrid && {
                  borderRight: "1px solid rgba(0,0,0,0.05)",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                }),
              }
            : {
                background: "transparent", // No background when asset exists
              }),
          // Hover effect with outline that does not affect layout
          ...(isHovered && {
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: `2px solid ${THEME_COLORS.primary}`,
              pointerEvents: "none",
              zIndex: 100,
            },
          }),
        }}
      >
        {/* Terrain layer - smooth rendering */}
        {terrainAsset && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: GRID_CONFIG.cellSize,
              height: GRID_CONFIG.cellSize,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {/* Main terrain image */}
            <Box
              component="img"
              src={terrainAsset.imagePath}
              alt={terrainAsset.name}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                imageRendering: "auto", // Smooth rendering instead of pixelated
                objectFit: "fill",
                margin: 0,
                padding: 0,
                display: "block",
                border: "none",
                outline: "none",
                verticalAlign: "top",
                transform: "translateZ(0)",
                WebkitTransform: "translateZ(0)",
                // Subtle gradient overlay for depth
                filter: "brightness(1.02) contrast(1.05)",
              }}
            />

            {/* Subtle gradient overlay for depth */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          </Box>
        )}

        {/* Object layer - smooth rendering with transforms */}
        {objectAsset && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: GRID_CONFIG.cellSize,
              height: GRID_CONFIG.cellSize,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 1,
              // Hardware acceleration for smooth transforms
              transform: "translateZ(0)",
              willChange: "transform, opacity",
            }}
          >
            {/* Shadow effect for depth */}
            <Box
              component="img"
              src={objectAsset.imagePath}
              alt={objectAsset.name}
              sx={{
                position: "absolute",
                top: 2,
                left: 2,
                width: "85%",
                height: "85%",
                objectFit: "contain",
                filter: "blur(1px) brightness(0.3)",
                opacity: 0.4,
                zIndex: 0,
                // Smooth shadow animation
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: "translateZ(0)",
              }}
            />

            {/* Main asset with smooth rendering and transforms */}
            <Box
              component="img"
              src={objectAsset.imagePath}
              alt={objectAsset.name}
              sx={{
                position: "relative",
                width: "85%",
                height: "85%",
                objectFit: "contain",
                // Smooth rendering instead of pixelated
                imageRendering: "auto",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                // Smooth transitions with cubic-bezier
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                // Better blending
                mixBlendMode: "normal",
                zIndex: 1,
                // Hardware acceleration
                transform: "translateZ(0)",
                willChange: "transform, opacity, filter",
                // Smooth scale animation on hover
                "&:hover": {
                  transform: "translateZ(0) scale(1.05)",
                  filter:
                    "drop-shadow(0 4px 8px rgba(0,0,0,0.4)) brightness(1.1)",
                },
              }}
            />
          </Box>
        )}

        {/* Preview asset when hovering */}
        {isHovered &&
          previewAsset &&
          previewAsset !== "eraser" &&
          previewAsset !== "empty" && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: GRID_CONFIG.cellSize,
                height: GRID_CONFIG.cellSize,
                zIndex: 2,
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {(() => {
                const asset = MAP_ASSETS.find((a) => a.id === previewAsset);
                if (!asset || !asset.imagePath) return null;

                if (asset.category === "terrain") {
                  return (
                    <Box
                      component="img"
                      src={asset.imagePath}
                      alt={asset.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        imageRendering: "auto",
                        objectFit: "fill",
                        opacity: 0.6,
                        transition: "all 0.2s ease-in-out",
                        border: `2px solid ${THEME_COLORS.primary}`,
                        borderRadius: 1,
                      }}
                    />
                  );
                }
                return (
                  <Box
                    component="img"
                    src={asset.imagePath}
                    alt={asset.name}
                    sx={{
                      position: "relative",
                      width: "85%",
                      height: "85%",
                      objectFit: "contain",
                      imageRendering: "auto",
                      opacity: 0.8,
                      transition: "all 0.2s ease-in-out",
                      border: `2px solid ${THEME_COLORS.primary}`,
                      borderRadius: 1,
                      zIndex: 1,
                    }}
                  />
                );
              })()}
            </Box>
          )}

        {/* Grid coordinates (for development) */}
        {process.env.NODE_ENV === "development" && (
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              top: 2,
              left: 2,
              fontSize: "8px",
              color: "rgba(0,0,0,0.3)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          >
            {cell.row},{cell.col}
          </Typography>
        )}
      </Box>
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
        position: "relative",
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
            Map Grid ({GRID_CONFIG.rows}x{GRID_CONFIG.cols})
          </Typography>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
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
      </Box>

      {/* Grid viewport wrapper (non-scrolling) */}
      <Box
        sx={{
          flexGrow: 0,
          height: MAP_VIEWPORT_HEIGHT,
          minHeight: MAP_VIEWPORT_HEIGHT,
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#e8e8e8", // Light gray background like Tiled
          borderRadius: 1,
          p: 3,
          overflow: "hidden",
        }}
      >
        {/* Fixed badge inside map area (won't scroll) */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1000,
            display: "flex",
            gap: 1,
            alignItems: "center",
            bgcolor: "rgba(0,0,0,0.7)",
            color: "white",
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontSize: "12px",
            fontWeight: 500,
            pointerEvents: "none",
          }}
        >
          <Typography variant="caption" sx={{ color: "white" }}>
            Ô [{hoveredCell?.row ?? "-"}, {hoveredCell?.col ?? "-"}]
          </Typography>
        </Box>

        {/* Scrollable map pane */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 1,
            cursor: isPanning ? "grabbing" : "grab",
          }}
          ref={scrollContainerRef}
          onMouseDown={handleBackgroundMouseDown}
          onMouseMove={handleBackgroundMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleBackgroundMouseLeave}
        >
          <Box
            ref={gridRef}
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${GRID_CONFIG.cols}, ${GRID_CONFIG.cellSize}px)`,
              gridTemplateRows: `repeat(${GRID_CONFIG.rows}, ${GRID_CONFIG.cellSize}px)`,
              gap: 0, // No gap - tiles are completely adjacent
              transform: `translate(${-panOffset.x}px, ${-panOffset.y}px) scale(${zoom})`,
              transformOrigin: "top left",
              transition: "transform 0.2s",
              userSelect: "none",
              // No border or background
              border: "none",
              borderRadius: 0,
              bgcolor: "transparent",
              boxShadow: "none",
              // Allow zoomed content to overflow so end cells are not cut off
              overflow: "visible",
              position: "relative",
              // Improve rendering quality
              imageRendering: "pixelated",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {mapGrid.map((row) => row.map((cell) => renderCell(cell)))}
          </Box>
        </Box>
      </Box>

      {/* Action buttons removed per request */}
    </Paper>
  );
}
