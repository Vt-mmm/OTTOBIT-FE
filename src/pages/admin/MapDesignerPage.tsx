import {
  Box,
  Container,
  Typography,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useState } from "react";
import AdminLayout from "layout/admin/AdminLayout";
import { MapCell, WinCondition } from "common/models";
import {
  WorkspaceSection,
  MapGridSection,
  IsometricMapGrid,
  WinConditionsSection,
} from "sections/admin/mapDesigner";
import { GRID_CONFIG } from "sections/admin/mapDesigner/theme.config";
import { MAP_ASSETS } from "sections/admin/mapDesigner/mapAssets.config";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";

const MapDesignerPage = () => {
  const [selectedAsset, setSelectedAsset] = useState<string>("grass");
  const [mapName, setMapName] = useState<string>("New Map");
  const [viewMode, setViewMode] = useState<"orthogonal" | "isometric">(
    "isometric"
  );
  const [mapGrid, setMapGrid] = useState<MapCell[][]>(
    Array(GRID_CONFIG.rows)
      .fill(null)
      .map((_, row) =>
        Array(GRID_CONFIG.cols)
          .fill(null)
          .map((_, col) => ({
            row,
            col,
            terrain: null, // Start with empty cells
            object: null,
          }))
      )
  );
  const [winConditions, setWinConditions] = useState<WinCondition[]>([]);

  const handleCellClick = (row: number, col: number) => {
    const newGrid = [...mapGrid];
    const asset = MAP_ASSETS.find((a) => a.id === selectedAsset);
    const currentCell = newGrid[row][col];

    if (!asset) return;

    // Tool actions
    if (selectedAsset === "eraser") {
      // Erase object and items on the cell (keep terrain)
      currentCell.object = null;
      currentCell.items = [];
      currentCell.itemCount = 0;
    } else if (selectedAsset === "empty") {
      // Clear the cell completely
      currentCell.terrain = null;
      currentCell.object = null;
      currentCell.items = [];
      currentCell.itemCount = 0;
    }
    // Asset placement
    else if (asset.category === "terrain") {
      // Set terrain - can replace existing terrain
      currentCell.terrain = selectedAsset;
    } else if (asset.category === "robot") {
      // Only one robot allowed per map
      newGrid.forEach((gridRow) =>
        gridRow.forEach((cell) => {
          if (
            cell.object &&
            MAP_ASSETS.find((a) => a.id === cell.object)?.category === "robot"
          ) {
            cell.object = null;
          }
        })
      );
      currentCell.object = selectedAsset;
    } else if (asset.category === "item") {
      // Handle items (pins) - can stack multiple items
      if (!currentCell.items) {
        currentCell.items = [];
      }

      // Check if item already exists in this cell
      const existingItemIndex = currentCell.items.findIndex(
        (item) => item === selectedAsset
      );

      if (existingItemIndex >= 0) {
        // Remove existing item
        currentCell.items.splice(existingItemIndex, 1);
        currentCell.itemCount = Math.max(0, (currentCell.itemCount || 1) - 1);

        // Update object display
        if (currentCell.items.length === 0) {
          currentCell.object = null;
        } else {
          currentCell.object = currentCell.items[0];
        }
      } else {
        // Add new item
        currentCell.items.push(selectedAsset);
        currentCell.itemCount = (currentCell.itemCount || 0) + 1;
        currentCell.object = selectedAsset; // Show the latest item
      }
    } else if (asset.category === "object") {
      // Handle other objects (obstacles, decorations)
      if (currentCell.object === selectedAsset) {
        // Remove if same object is clicked again
        currentCell.object = null;
      } else {
        // Replace with new object
        currentCell.object = selectedAsset;
      }
    }

    setMapGrid(newGrid);
  };

  const handleSaveMap = () => {
    // TODO: Implement save map logic
    console.log("Save map:", { mapName, mapGrid, winConditions });
  };

  const handleTestMap = () => {
    // TODO: Implement test map logic
    console.log("Test map");
  };

  const handleClearMap = () => {
    setMapGrid(
      Array(GRID_CONFIG.rows)
        .fill(null)
        .map((_, row) =>
          Array(GRID_CONFIG.cols)
            .fill(null)
            .map((_, col) => ({
              row,
              col,
              terrain: null, // Clear to empty
              object: null,
            }))
        )
    );
  };

  const handleAddCondition = (condition: WinCondition) => {
    setWinConditions([...winConditions, condition]);
  };

  const handleRemoveCondition = (id: string) => {
    setWinConditions(winConditions.filter((c) => c.id !== id));
  };

  return (
    <AdminLayout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, color: "#1B5E20", mb: 1 }}
              >
                Thiết kế Map - Tiled Studio
              </Typography>
              <Typography variant="body1" sx={{ color: "#558B2F" }}>
                Tạo và chỉnh sửa map cho game robot với các tiles thực tế
              </Typography>
            </Box>

            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              aria-label="view mode"
              size="small"
            >
              <ToggleButton value="orthogonal" aria-label="orthogonal view">
                <ViewModuleIcon sx={{ mr: 1 }} />
                2D View
              </ToggleButton>
              <ToggleButton value="isometric" aria-label="isometric view">
                <ThreeDRotationIcon sx={{ mr: 1 }} />
                2.5D View
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ height: "calc(100vh - 250px)" }}>
          {/* Left Panel - Workspace */}
          <Grid item xs={12} md={3}>
            <WorkspaceSection
              selectedAsset={selectedAsset}
              onAssetSelect={setSelectedAsset}
              mapName={mapName}
              onMapNameChange={setMapName}
            />
          </Grid>

          {/* Middle Panel - Map Grid */}
          <Grid item xs={12} md={6}>
            {viewMode === "orthogonal" ? (
              <MapGridSection
                mapGrid={mapGrid}
                selectedAsset={selectedAsset}
                onCellClick={handleCellClick}
                onSaveMap={handleSaveMap}
                onTestMap={handleTestMap}
                onClearMap={handleClearMap}
              />
            ) : (
              <IsometricMapGrid
                mapGrid={mapGrid}
                selectedAsset={selectedAsset}
                onCellClick={handleCellClick}
                onSaveMap={handleSaveMap}
                onTestMap={handleTestMap}
                onClearMap={handleClearMap}
              />
            )}
          </Grid>

          {/* Right Panel - Win Conditions */}
          <Grid item xs={12} md={3}>
            <WinConditionsSection
              conditions={winConditions}
              onAddCondition={handleAddCondition}
              onRemoveCondition={handleRemoveCondition}
            />
          </Grid>
        </Grid>
      </Container>
    </AdminLayout>
  );
};

export default MapDesignerPage;
