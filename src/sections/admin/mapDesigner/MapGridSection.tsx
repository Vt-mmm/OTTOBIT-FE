import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
} from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { MapCell } from "common/models";
import { MAP_ASSETS } from "./mapAssets.config";
import { THEME_COLORS, GRID_CONFIG } from "./theme.config";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import GridOnIcon from "@mui/icons-material/GridOn";
import InfoIcon from "@mui/icons-material/Info";

interface MapGridSectionProps {
  mapGrid: MapCell[][];
  selectedAsset: string;
  onCellClick: (row: number, col: number) => void;
  onSaveMap: () => void;
  onTestMap: () => void;
  onClearMap: () => void;
}

export default function MapGridSection({
  mapGrid,
  selectedAsset,
  onCellClick,
  onSaveMap,
  onTestMap,
  onClearMap,
}: MapGridSectionProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [previewAsset, setPreviewAsset] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (row: number, col: number) => {
    setIsDrawing(true);
    onCellClick(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isDrawing) {
      onCellClick(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
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
          // Không dùng border/shadow cho cells - chỉ dùng cho hover
          cursor: "pointer",
          position: "relative",
          overflow: "visible", // Cho phép tiles tràn ra ngoài để kết nối
          boxSizing: "border-box",
          // Empty cell với pattern nhẹ
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
                background: "transparent", // Không có background khi có asset
              }),
          // Hover effect với outline không ảnh hưởng layout
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
                        opacity: 0.7,
                        filter: "brightness(1.2) saturate(1.3)",
                        transition: "all 0.2s ease-in-out",
                        border: `2px solid ${THEME_COLORS.primary}`,
                        borderRadius: 1,
                      }}
                    />
                  );
                } else {
                  return (
                    <Box
                      sx={{
                        position: "relative",
                        width: "85%",
                        height: "85%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* Preview shadow */}
                      <Box
                        component="img"
                        src={asset.imagePath}
                        alt={asset.name}
                        sx={{
                          position: "absolute",
                          top: 2,
                          left: 2,
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          filter: "blur(1px) brightness(0.3)",
                          opacity: 0.3,
                          zIndex: 0,
                        }}
                      />

                      {/* Preview asset */}
                      <Box
                        component="img"
                        src={asset.imagePath}
                        alt={asset.name}
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          imageRendering: "auto",
                          opacity: 0.8,
                          filter:
                            "brightness(1.1) saturate(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                          transition: "all 0.2s ease-in-out",
                          border: `2px solid ${THEME_COLORS.primary}`,
                          borderRadius: 1,
                          zIndex: 1,
                        }}
                      />
                    </Box>
                  );
                }
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
            <InfoIcon
              sx={{ fontSize: 16, color: THEME_COLORS.text.secondary }}
            />
            <Typography
              variant="caption"
              sx={{ color: THEME_COLORS.text.secondary }}
            >
              Ô [{hoveredCell.row}, {hoveredCell.col}]
            </Typography>
          </Box>
        )}
      </Box>

      {/* Grid container with scroll */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#e8e8e8", // Nền xám nhạt giống Tiled
          borderRadius: 1,
          p: 3,
          position: "relative",
        }}
      >
        <Box
          ref={gridRef}
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_CONFIG.cols}, ${GRID_CONFIG.cellSize}px)`,
            gridTemplateRows: `repeat(${GRID_CONFIG.rows}, ${GRID_CONFIG.cellSize}px)`,
            gap: 0, // Không có gap - tiles sát nhau hoàn toàn
            transform: `scale(${zoom})`,
            transformOrigin: "center",
            transition: "transform 0.2s",
            userSelect: "none",
            // Outer border cho toàn bộ grid
            border: "2px solid #333",
            borderRadius: 0, // Không bo tròn để tiles vuông vắn
            bgcolor: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            // Dùng overflow hidden để tiles không tràn ra ngoài grid
            overflow: "hidden",
            position: "relative",
            // Cải thiện rendering quality
            imageRendering: "pixelated",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {mapGrid.map((row) => row.map((cell) => renderCell(cell)))}
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
          Lưu Map
        </Button>
      </Box>
    </Paper>
  );
}
