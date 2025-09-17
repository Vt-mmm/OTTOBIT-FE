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
import { MapCell } from "common/models";
import {
  WorkspaceSection,
  MapGridSection,
  WinConditionsSection,
} from "sections/admin/mapDesigner";
import SimpleIsometricMapGrid from "sections/admin/mapDesigner/SimpleIsometricMapGrid";
import { GRID_CONFIG } from "sections/admin/mapDesigner/theme.config";
import { MAP_ASSETS } from "sections/admin/mapDesigner/mapAssets.config";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";

const MapDesignerPage = () => {
  const [selectedAsset, setSelectedAsset] = useState<string>("grass");
  const [mapName, setMapName] = useState<string>("New Map");
  const [mapDescription, setMapDescription] = useState<string>("");
  const [solutionJson, setSolutionJson] = useState<string | null>(null);
  const [challengeJson, setChallengeJson] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string>(
    "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  );
  const [order, setOrder] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<number>(1);
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

  // Lightweight toast fallback (top-right) when global Snackbar is unavailable
  const showLocalToast = (
    message: string,
    variant: "success" | "error" | "info" | "warning" = "info"
  ) => {
    const containerId = "local-toast-container";
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      Object.assign(container.style, {
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: "9999",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        pointerEvents: "none",
      } as CSSStyleDeclaration);
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    const bgMap: Record<string, string> = {
      success: "#2e7d32",
      error: "#d32f2f",
      info: "#0288d1",
      warning: "#ed6c02",
    };
    // Align styles to MUI/Notistack look & feel
    Object.assign(toast.style, {
      background: bgMap[variant] || "#323232",
      color: "#fff",
      padding: "6px 16px",
      borderRadius: "4px",
      boxShadow:
        "rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px",
      fontSize: "0.875rem",
      lineHeight: "1.43",
      fontWeight: "500",
      letterSpacing: "0.01071em",
      pointerEvents: "auto",
      transition: "opacity 0.3s, transform 0.3s",
      opacity: "0",
      transform: "translateY(-6px)",
    } as CSSStyleDeclaration);
    toast.textContent = message;
    toast.setAttribute("role", "alert");
    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });
    const remove = () => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-6px)";
      setTimeout(() => toast.remove(), 300);
    };
    setTimeout(remove, 2500);
  };

  const handleCellClick = (row: number, col: number) => {
    const newGrid = [...mapGrid];
    const asset = MAP_ASSETS.find((a) => a.id === selectedAsset);
    const currentCell = newGrid[row][col];

    if (!asset) return;

    // Tool actions
    if (selectedAsset === "eraser") {
      // Simple rule: if cell has itemCount > 1, decrement; else clear object
      if ((currentCell.itemCount || 0) > 1) {
        currentCell.itemCount = (currentCell.itemCount || 1) - 1;
      } else {
        currentCell.object = null;
        currentCell.itemCount = 0;
      }
    } else if (selectedAsset === "empty") {
      // Clear the cell completely
      currentCell.terrain = null;
      currentCell.object = null;
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
      // Special rule for box: allow only one on the entire map, no stacking
      if (selectedAsset === "box") {
        // Remove existing box anywhere
        newGrid.forEach((gridRow) =>
          gridRow.forEach((cell) => {
            if (cell.object === "box") {
              cell.object = null;
              cell.itemCount = 0;
            }
          })
        );
        currentCell.object = "box";
        currentCell.itemCount = 1;
      } else {
        // Other items: keep single object id and a count
        if (currentCell.object === selectedAsset) {
          currentCell.itemCount = (currentCell.itemCount || 0) + 1;
        } else {
          currentCell.object = selectedAsset;
          currentCell.itemCount = 1;
        }
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
    // Validate required fields
    const missingName = !mapName || mapName.trim().length === 0;
    const missingDescription =
      !mapDescription || mapDescription.trim().length === 0;
    if (missingName || missingDescription) {
      const bothMissing = missingName && missingDescription;
      const msg = bothMissing
        ? "Vui lòng nhập tên map và mô tả map"
        : missingName
        ? "Vui lòng nhập tên map"
        : "Vui lòng nhập mô tả map";
      const variant: "error" | "warning" = bothMissing ? "error" : "warning";
      try {
        if ((window as any).Snackbar?.enqueueSnackbar) {
          (window as any).Snackbar.enqueueSnackbar(msg, {
            variant,
            anchorOrigin: { vertical: "top", horizontal: "right" },
          });
        } else {
          showLocalToast(msg, variant);
        }
      } catch {
        showLocalToast(msg, variant);
      }
      return;
    }

    // Validate: must have a robot placed on the map
    let hasRobot = false;
    outer: for (const row of mapGrid) {
      for (const cell of row) {
        if (!cell.object) continue;
        const asset = MAP_ASSETS.find((a) => a.id === cell.object);
        if (asset && (asset as any).category === "robot") {
          hasRobot = true;
          break outer;
        }
      }
    }
    if (!hasRobot) {
      const msg = "Vui lòng đặt robot lên bản đồ trước khi lưu";
      try {
        if ((window as any).Snackbar?.enqueueSnackbar) {
          (window as any).Snackbar.enqueueSnackbar(msg, {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          });
        } else {
          showLocalToast(msg, "error");
        }
      } catch {
        showLocalToast(msg, "error");
      }
      return;
    }

    // Validate: solution and challenge must be configured
    const missingSolution = !solutionJson || solutionJson.trim().length === 0;
    const missingChallenge =
      !challengeJson || challengeJson.trim().length === 0;
    if (missingSolution || missingChallenge) {
      const msg =
        missingSolution && missingChallenge
          ? "Vui lòng thiết lập Solution và Challenge trước khi lưu"
          : missingSolution
          ? "Vui lòng thiết lập Solution trước khi lưu"
          : "Vui lòng thiết lập Challenge trước khi lưu";
      try {
        if ((window as any).Snackbar?.enqueueSnackbar) {
          (window as any).Snackbar.enqueueSnackbar(msg, {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          });
        } else {
          showLocalToast(msg, "error");
        }
      } catch {
        showLocalToast(msg, "error");
      }
      return;
    }

    // Convert mapGrid to Tiled format
    const data: number[] = [];

    // Flatten the 2D grid to 1D array (row by row)
    for (let row = 0; row < GRID_CONFIG.rows; row++) {
      for (let col = 0; col < GRID_CONFIG.cols; col++) {
        const cell = mapGrid[row][col];
        let tileId = 0; // 0 = empty

        if (cell.terrain) {
          // Map terrain assets to tile IDs
          const terrainMap: { [key: string]: number } = {
            grass: 5,
            water: 4,
            wood: 3,
            road_h: 2,
            road_v: 1,
            crossroad: 6,
          };
          tileId = terrainMap[cell.terrain] || 0;
        }

        data.push(tileId);
      }
    }

    const tiledMap = {
      compressionlevel: -1,
      height: 10,
      infinite: false,
      layers: [
        {
          data: data,
          height: 10,
          id: 1,
          name: "Tile Layer 1",
          opacity: 1,
          type: "tilelayer",
          visible: true,
          width: 10,
          x: 0,
          y: 0,
        },
      ],
      nextlayerid: 2,
      nextobjectid: 1,
      orientation: "isometric",
      renderorder: "right-down",
      tiledversion: "1.11.2",
      tileheight: 80,
      tilesets: [
        {
          columns: 1,
          firstgid: 1,
          image: "../../../../../../../Downloads/assetV3/Enviroment/road_v.png",
          imageheight: 128,
          imagewidth: 128,
          margin: 0,
          name: "road_v",
          spacing: 0,
          tilecount: 1,
          tileheight: 128,
          tilewidth: 128,
        },
        {
          columns: 1,
          firstgid: 2,
          image: "../../../../../../../Downloads/assetV3/Enviroment/road_h.png",
          imageheight: 128,
          imagewidth: 128,
          margin: 0,
          name: "road_h",
          spacing: 0,
          tilecount: 1,
          tileheight: 128,
          tilewidth: 128,
        },
        {
          columns: 1,
          firstgid: 3,
          image: "../../../../../../../Downloads/assetV3/Enviroment/wood.png",
          imageheight: 128,
          imagewidth: 128,
          margin: 0,
          name: "wood",
          spacing: 0,
          tilecount: 1,
          tileheight: 128,
          tilewidth: 128,
        },
        {
          columns: 1,
          firstgid: 4,
          image: "../../../../../../../Downloads/assetV3/Enviroment/water.png",
          imageheight: 128,
          imagewidth: 128,
          margin: 0,
          name: "water",
          spacing: 0,
          tilecount: 1,
          tileheight: 128,
          tilewidth: 128,
        },
        {
          columns: 1,
          firstgid: 5,
          image: "../../../../../../../Downloads/assetV3/Enviroment/grass.png",
          imageheight: 128,
          imagewidth: 128,
          margin: 0,
          name: "grass",
          spacing: 0,
          tilecount: 1,
          tileheight: 128,
          tilewidth: 128,
        },
        {
          columns: 1,
          firstgid: 6,
          image:
            "../../../../../../../Downloads/assetV3/Enviroment/crossroad.png",
          imageheight: 128,
          imagewidth: 128,
          margin: 0,
          name: "crossroad",
          spacing: 0,
          tilecount: 1,
          tileheight: 128,
          tilewidth: 128,
        },
      ],
      tilewidth: 128,
      type: "map",
      version: "1.10",
      width: 10,
    };

    // Create lesson form data
    const lessonData = {
      lessonId,
      title: mapName,
      description: mapDescription,
      order,
      difficulty,
      mapJson: JSON.stringify(tiledMap),
      challengeJson: challengeJson,
      solutionJson: solutionJson,
    };

    console.log("Lesson Data:", JSON.stringify(lessonData, null, 2));
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
                onClearMap={handleClearMap}
              />
            ) : (
              <SimpleIsometricMapGrid
                mapGrid={mapGrid}
                selectedAsset={selectedAsset}
                onCellClick={handleCellClick}
                onSaveMap={handleSaveMap}
                onClearMap={handleClearMap}
              />
            )}
          </Grid>

          {/* Right Panel - Map Info */}
          <Grid item xs={12} md={3}>
            <WinConditionsSection
              mapName={mapName}
              onMapNameChange={setMapName}
              mapDescription={mapDescription}
              onMapDescriptionChange={setMapDescription}
              lessonId={lessonId}
              onLessonIdChange={setLessonId}
              order={order}
              onOrderChange={setOrder}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              mapGrid={mapGrid}
              onSolutionJsonChange={setSolutionJson}
              solutionJson={solutionJson}
              onChallengeJsonChange={setChallengeJson}
              challengeJson={challengeJson}
            />
          </Grid>
        </Grid>
      </Container>
    </AdminLayout>
  );
};

export default MapDesignerPage;
