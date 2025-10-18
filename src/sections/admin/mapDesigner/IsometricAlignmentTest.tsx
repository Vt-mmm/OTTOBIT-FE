import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Slider,
  Stack,
  Chip,
} from "@mui/material";
import { ISOMETRIC_CONFIG } from "./isometricHelpers";

interface AlignmentConfig {
  tileWidth: number;
  tileHeight: number;
  tileDepth: number;
  offsetX: number;
  offsetY: number;
}

export default function IsometricAlignmentTest() {
  const [config, setConfig] = useState<AlignmentConfig>({
    tileWidth: ISOMETRIC_CONFIG.tileWidth,
    tileHeight: ISOMETRIC_CONFIG.tileHeight,
    tileDepth: ISOMETRIC_CONFIG.tileDepth,
    offsetX: 0,
    offsetY: 0,
  });

  const [showGrid, setShowGrid] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(true);

  // Render a test tile at specific position
  const renderTestTile = (row: number, col: number, color: string) => {
    const x = (col - row) * (config.tileWidth / 2) + config.offsetX;
    const y = (col + row) * (config.tileHeight / 2) + config.offsetY;
    const halfWidth = config.tileWidth / 2;
    const halfHeight = config.tileHeight / 2;

    return (
      <svg
        key={`${row}-${col}`}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: config.tileWidth,
          height: config.tileHeight + config.tileDepth,
          zIndex: row + col,
        }}
      >
        {/* 3D faces */}
        <g>
          {/* Left face */}
          <polygon
            points={`0,${halfHeight} ${halfWidth},${
              config.tileHeight
            } ${halfWidth},${config.tileHeight + config.tileDepth} 0,${
              halfHeight + config.tileDepth
            }`}
            fill={`${color}CC`}
            stroke="#333"
            strokeWidth="0.5"
          />
          {/* Right face */}
          <polygon
            points={`${halfWidth},${config.tileHeight} ${
              config.tileWidth
            },${halfHeight} ${config.tileWidth},${
              halfHeight + config.tileDepth
            } ${halfWidth},${config.tileHeight + config.tileDepth}`}
            fill={`${color}99`}
            stroke="#333"
            strokeWidth="0.5"
          />
        </g>

        {/* Top face - Diamond shape */}
        <polygon
          points={`${halfWidth},0 ${config.tileWidth},${halfHeight} ${halfWidth},${config.tileHeight} 0,${halfHeight}`}
          fill={color}
          stroke="#333"
          strokeWidth="1"
        />

        {/* Grid lines */}
        {showGrid && (
          <polygon
            points={`${halfWidth},0 ${config.tileWidth},${halfHeight} ${halfWidth},${config.tileHeight} 0,${halfHeight}`}
            fill="none"
            stroke="#666"
            strokeWidth="0.5"
            opacity="0.7"
          />
        )}

        {/* Coordinates */}
        {showCoordinates && (
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
        )}
      </svg>
    );
  };

  // Test grid - 3x3 for alignment testing
  const testTiles = [];
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
  ];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      testTiles.push(renderTestTile(row, col, colors[row * 3 + col]));
    }
  }

  const handleConfigChange = (key: keyof AlignmentConfig, value: number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const resetToDefault = () => {
    setConfig({
      tileWidth: ISOMETRIC_CONFIG.tileWidth,
      tileHeight: ISOMETRIC_CONFIG.tileHeight,
      tileDepth: ISOMETRIC_CONFIG.tileDepth,
      offsetX: 0,
      offsetY: 0,
    });
  };

  const applyToIsometricConfig = () => {
    // This would update the actual ISOMETRIC_CONFIG
    alert(
      `Config applied! Check console for values to update ISOMETRIC_CONFIG.`
    );
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        🔧 Isometric Alignment Test
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Adjust parameters to make tiles fit together perfectly
      </Typography>

      {/* Controls */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setShowGrid(!showGrid)}
            size="small"
          >
            {showGrid ? "Hide" : "Show"} Grid
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowCoordinates(!showCoordinates)}
            size="small"
          >
            {showCoordinates ? "Hide" : "Show"} Coordinates
          </Button>
          <Button variant="outlined" onClick={resetToDefault} size="small">
            Reset to Default
          </Button>
          <Button
            variant="contained"
            onClick={applyToIsometricConfig}
            size="small"
          >
            Apply to Config
          </Button>
        </Stack>

        {/* Sliders */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 2,
          }}
        >
          <Box>
            <Typography gutterBottom>
              Tile Width: {config.tileWidth}px
            </Typography>
            <Slider
              value={config.tileWidth}
              onChange={(_, value) =>
                handleConfigChange("tileWidth", value as number)
              }
              min={32}
              max={128}
              step={2}
            />
          </Box>

          <Box>
            <Typography gutterBottom>
              Tile Height: {config.tileHeight}px
            </Typography>
            <Slider
              value={config.tileHeight}
              onChange={(_, value) =>
                handleConfigChange("tileHeight", value as number)
              }
              min={16}
              max={64}
              step={2}
            />
          </Box>

          <Box>
            <Typography gutterBottom>
              Tile Depth: {config.tileDepth}px
            </Typography>
            <Slider
              value={config.tileDepth}
              onChange={(_, value) =>
                handleConfigChange("tileDepth", value as number)
              }
              min={0}
              max={32}
              step={2}
            />
          </Box>

          <Box>
            <Typography gutterBottom>Offset X: {config.offsetX}px</Typography>
            <Slider
              value={config.offsetX}
              onChange={(_, value) =>
                handleConfigChange("offsetX", value as number)
              }
              min={-50}
              max={50}
              step={1}
            />
          </Box>

          <Box>
            <Typography gutterBottom>Offset Y: {config.offsetY}px</Typography>
            <Slider
              value={config.offsetY}
              onChange={(_, value) =>
                handleConfigChange("offsetY", value as number)
              }
              min={-50}
              max={50}
              step={1}
            />
          </Box>
        </Box>
      </Box>

      {/* Current Configuration */}
      <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Current Configuration:
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip label={`Width: ${config.tileWidth}px`} />
          <Chip label={`Height: ${config.tileHeight}px`} />
          <Chip label={`Depth: ${config.tileDepth}px`} />
          <Chip label={`Offset X: ${config.offsetX}px`} />
          <Chip label={`Offset Y: ${config.offsetY}px`} />
        </Box>
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

      {/* Instructions */}
      <Box sx={{ mt: 2, p: 2, bgcolor: "#e3f2fd", borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          📋 Instructions:
        </Typography>
        <ul>
          <li>
            Adjust <strong>Tile Width</strong> and <strong>Tile Height</strong>{" "}
            to make tiles fit together
          </li>
          <li>
            <strong>Tile Height</strong> is usually half of{" "}
            <strong>Tile Width</strong> for standard isometric
          </li>
          <li>
            Use <strong>Offset X/Y</strong> to align overall position
          </li>
          <li>
            When satisfied, click <strong>Apply to Config</strong> to apply
          </li>
        </ul>
      </Box>
    </Paper>
  );
}
