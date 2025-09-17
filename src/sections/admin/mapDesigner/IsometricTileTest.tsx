import { useState } from "react";
import { Box, Paper, Typography, Button, Grid } from "@mui/material";
import { ISOMETRIC_CONFIG } from "./isometricHelpers";
import { MAP_ASSETS } from "./mapAssets.config";

export default function IsometricTileTest() {
  const [selectedAsset, setSelectedAsset] = useState<string>("grass");

  // Render a single isometric tile
  const renderIsometricTile = (row: number, col: number, assetId?: string) => {
    const asset = assetId ? MAP_ASSETS.find((a) => a.id === assetId) : null;

    // Calculate isometric position
    const x = (col - row) * (ISOMETRIC_CONFIG.tileWidth / 2);
    const y = (col + row) * (ISOMETRIC_CONFIG.tileHeight / 2);
    const halfWidth = ISOMETRIC_CONFIG.tileWidth / 2;
    const halfHeight = ISOMETRIC_CONFIG.tileHeight / 2;
    const depth = ISOMETRIC_CONFIG.tileDepth;

    // Get color based on asset
    const getTileColor = () => {
      if (!asset) return "#E0E0E0";
      switch (asset.id) {
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
        key={`${row}-${col}`}
        style={{
          position: "absolute",
          left: x + 200, // Center offset
          top: y + 100, // Center offset
          width: ISOMETRIC_CONFIG.tileWidth,
          height: ISOMETRIC_CONFIG.tileHeight + depth,
          zIndex: row + col,
        }}
      >
        {/* 3D Box faces */}
        <g>
          {/* Left face */}
          <polygon
            points={`0,${halfHeight} ${halfWidth},${
              ISOMETRIC_CONFIG.tileHeight
            } ${halfWidth},${ISOMETRIC_CONFIG.tileHeight + depth} 0,${
              halfHeight + depth
            }`}
            fill={asset ? "#2D4A3E" : "#666"}
            stroke="#333"
            strokeWidth="0.5"
          />
          {/* Right face */}
          <polygon
            points={`${halfWidth},${ISOMETRIC_CONFIG.tileHeight} ${
              ISOMETRIC_CONFIG.tileWidth
            },${halfHeight} ${ISOMETRIC_CONFIG.tileWidth},${
              halfHeight + depth
            } ${halfWidth},${ISOMETRIC_CONFIG.tileHeight + depth}`}
            fill={asset ? "#1E3A2F" : "#555"}
            stroke="#333"
            strokeWidth="0.5"
          />
        </g>

        {/* Top face - Diamond shape */}
        <polygon
          points={`${halfWidth},0 ${ISOMETRIC_CONFIG.tileWidth},${halfHeight} ${halfWidth},${ISOMETRIC_CONFIG.tileHeight} 0,${halfHeight}`}
          fill={getTileColor()}
          stroke="#333"
          strokeWidth="1"
        />

        {/* Grid lines */}
        <polygon
          points={`${halfWidth},0 ${ISOMETRIC_CONFIG.tileWidth},${halfHeight} ${halfWidth},${ISOMETRIC_CONFIG.tileHeight} 0,${halfHeight}`}
          fill="none"
          stroke="#666"
          strokeWidth="0.5"
          opacity="0.7"
        />

        {/* Coordinates */}
        <text
          x={halfWidth}
          y={halfHeight}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="#000"
          style={{ pointerEvents: "none" }}
        >
          {row},{col}
        </text>
      </svg>
    );
  };

  // Create test grid
  const testTiles = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const assetId = row === 1 && col === 1 ? selectedAsset : null;
      testTiles.push(renderIsometricTile(row, col, assetId || ""));
    }
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        🧱 Isometric Tile Test
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Test component để kiểm tra việc render các tile 2.5D
      </Typography>

      {/* Asset Selection */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Chọn Asset:
        </Typography>
        <Grid container spacing={1}>
          {MAP_ASSETS.slice(0, 6).map((asset) => (
            <Grid item key={asset.id}>
              <Button
                variant={selectedAsset === asset.id ? "contained" : "outlined"}
                size="small"
                onClick={() => setSelectedAsset(asset.id)}
                sx={{ minWidth: 80 }}
              >
                {asset.name}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Test Grid */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "400px",
          border: "2px solid #ddd",
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "#f9f9f9",
        }}
      >
        {testTiles}
      </Box>

      <Box sx={{ mt: 2, p: 2, bgcolor: "#e3f2fd", borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          📊 Thông tin:
        </Typography>
        <Typography variant="body2">
          - Tile ở giữa (1,1) sẽ hiển thị asset đã chọn
        </Typography>
        <Typography variant="body2">
          - Các tile khác sẽ hiển thị màu xám (empty)
        </Typography>
        <Typography variant="body2">
          - Mỗi tile có 3 mặt: trái, phải, trên
        </Typography>
        <Typography variant="body2">
          - Tọa độ hiển thị ở giữa mỗi tile
        </Typography>
      </Box>
    </Paper>
  );
}
