import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { ISOMETRIC_CONFIG } from "./isometricHelpers";
import { GRID_CONFIG } from "./theme.config";

export default function IsometricDebugTest() {
  // Create a simple test grid
  const testGrid = Array(GRID_CONFIG.rows)
    .fill(null)
    .map((_, row) =>
      Array(GRID_CONFIG.cols)
        .fill(null)
        .map((_, col) => ({
          row,
          col,
          terrain: row === 1 && col === 1 ? "grass" : null,
          object: null,
        }))
    );

  // Render a simple isometric tile
  const renderTestTile = (row: number, col: number) => {
    const x = (col - row) * (ISOMETRIC_CONFIG.tileWidth / 2);
    const y = (col + row) * (ISOMETRIC_CONFIG.tileHeight / 2);
    const halfWidth = ISOMETRIC_CONFIG.tileWidth / 2;
    const halfHeight = ISOMETRIC_CONFIG.tileHeight / 2;

    return (
      <svg
        key={`${row}-${col}`}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: ISOMETRIC_CONFIG.tileWidth,
          height: ISOMETRIC_CONFIG.tileHeight + ISOMETRIC_CONFIG.tileDepth,
          zIndex: row + col,
        }}
      >
        {/* 3D faces */}
        <g>
          {/* Left face */}
          <polygon
            points={`0,${halfHeight} ${halfWidth},${ISOMETRIC_CONFIG.tileHeight} ${halfWidth},${ISOMETRIC_CONFIG.tileHeight + ISOMETRIC_CONFIG.tileDepth} 0,${halfHeight + ISOMETRIC_CONFIG.tileDepth}`}
            fill="#4CAF50"
            stroke="#333"
            strokeWidth="0.5"
          />
          {/* Right face */}
          <polygon
            points={`${halfWidth},${ISOMETRIC_CONFIG.tileHeight} ${ISOMETRIC_CONFIG.tileWidth},${halfHeight} ${ISOMETRIC_CONFIG.tileWidth},${halfHeight + ISOMETRIC_CONFIG.tileDepth} ${halfWidth},${ISOMETRIC_CONFIG.tileHeight + ISOMETRIC_CONFIG.tileDepth}`}
            fill="#2E7D32"
            stroke="#333"
            strokeWidth="0.5"
          />
        </g>

        {/* Top face - Diamond shape */}
        <polygon
          points={`${halfWidth},0 ${ISOMETRIC_CONFIG.tileWidth},${halfHeight} ${halfWidth},${ISOMETRIC_CONFIG.tileHeight} 0,${halfHeight}`}
          fill="#4CAF50"
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

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        🔍 Isometric Debug Test
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Test component để kiểm tra 2.5D isometric rendering
      </Typography>

      {/* Test Grid */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "300px",
          border: "2px solid #ddd",
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "#f9f9f9",
        }}
      >
        {testGrid.map((row) => row.map((cell) => renderTestTile(cell.row, cell.col)))}
      </Box>

      <Box sx={{ mt: 2, p: 2, bgcolor: "#e3f2fd", borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          📊 Current Config:
        </Typography>
        <Typography variant="body2">
          Tile Width: {ISOMETRIC_CONFIG.tileWidth}px
        </Typography>
        <Typography variant="body2">
          Tile Height: {ISOMETRIC_CONFIG.tileHeight}px
        </Typography>
        <Typography variant="body2">
          Tile Depth: {ISOMETRIC_CONFIG.tileDepth}px
        </Typography>
        <Typography variant="body2">
          Grid Size: {GRID_CONFIG.rows}x{GRID_CONFIG.cols}
        </Typography>
      </Box>
    </Paper>
  );
}
