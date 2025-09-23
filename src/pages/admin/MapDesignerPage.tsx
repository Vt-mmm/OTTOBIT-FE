import {
  Box,
  Container,
  Typography,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
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
import { axiosClient } from "axiosClient";
import { ROUTES_API_CHALLENGE } from "constants/routesApiKeys";

const MapDesignerPage = () => {
  const [selectedAsset, setSelectedAsset] = useState<string>("grass");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mapName, setMapName] = useState<string>("New Map");
  const [mapDescription, setMapDescription] = useState<string>("");
  const [solutionJson, setSolutionJson] = useState<string | null>(null);
  const [challengeJson, setChallengeJson] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string>("");
  const [order, setOrder] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<number>(1);
  const [openUpdateConfirm, setOpenUpdateConfirm] = useState(false);
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

  // Prefill from query params when navigated from Map Management (Edit)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qpTitle = params.get("title");
    const qpDescription = params.get("description");
    const qpOrder = params.get("order");
    const qpDifficulty = params.get("difficulty");
    const qpLessonId = params.get("lessonId");
    const qpId = params.get("id");

    if (qpTitle) setMapName(qpTitle);
    if (qpDescription) setMapDescription(qpDescription);
    if (qpOrder && !Number.isNaN(Number(qpOrder))) setOrder(Number(qpOrder));
    if (qpDifficulty && !Number.isNaN(Number(qpDifficulty)))
      setDifficulty(Number(qpDifficulty));
    if (qpLessonId) setLessonId(qpLessonId);

    // If an id is present, set edit mode and fetch details to load mapJson and solution/challenge into state
    if (qpId) {
      setEditingId(qpId);
      (async () => {
        try {
          const res = await axiosClient.get(
            ROUTES_API_CHALLENGE.GET_BY_ID(qpId)
          );
          const item = res?.data?.data;
          if (item?.solutionJson) setSolutionJson(item.solutionJson);
          if (item?.challengeJson) setChallengeJson(item.challengeJson);

          const mapJsonStr: string | undefined = item?.mapJson;
          let newGrid: (MapCell & { itemCount?: number })[][] | null = null;
          if (mapJsonStr) {
            try {
              const parsed = JSON.parse(mapJsonStr);
              const width: number = parsed?.width ?? GRID_CONFIG.cols;
              const height: number = parsed?.height ?? GRID_CONFIG.rows;
              const layer = Array.isArray(parsed?.layers)
                ? parsed.layers[0]
                : null;
              const data: number[] = Array.isArray(layer?.data)
                ? layer.data
                : [];

              if (data.length >= width * height) {
                const idToTerrain: Record<number, string | null> = {
                  0: null,
                  1: "road_v",
                  2: "road_h",
                  3: "wood",
                  4: "water",
                  5: "grass",
                  6: "crossroad",
                };

                newGrid = Array(GRID_CONFIG.rows)
                  .fill(null)
                  .map((_, row) =>
                    Array(GRID_CONFIG.cols)
                      .fill(null)
                      .map((_, col) => {
                        const idx = row * GRID_CONFIG.cols + col;
                        const tileId = data[idx] || 0;
                        const terrain = idToTerrain[tileId] ?? null;
                        return {
                          row,
                          col,
                          terrain: terrain as any,
                          object: null,
                          itemCount: 0,
                        } as any;
                      })
                  );
              }
            } catch (e) {
              // ignore parse errors
            }
          }

          // Overlay challengeJson robot/items
          try {
            const chStr: string | null | undefined = item?.challengeJson;
            if (chStr) {
              const ch = JSON.parse(chStr);
              if (!newGrid) {
                newGrid = Array(GRID_CONFIG.rows)
                  .fill(null)
                  .map((_, row) =>
                    Array(GRID_CONFIG.cols)
                      .fill(null)
                      .map((_, col) => ({
                        row,
                        col,
                        terrain: null,
                        object: null,
                        itemCount: 0,
                      }))
                  );
              }

              // Robot
              const robot = ch?.robot;
              if (
                robot?.tile &&
                typeof robot.tile.x === "number" &&
                typeof robot.tile.y === "number"
              ) {
                const r = robot.tile.y;
                const c = robot.tile.x;
                if (
                  r >= 0 &&
                  r < GRID_CONFIG.rows &&
                  c >= 0 &&
                  c < GRID_CONFIG.cols
                ) {
                  const dir = String(robot.direction || "east").toLowerCase();
                  const dirToAsset: Record<string, string> = {
                    north: "robot_north",
                    east: "robot_east",
                    south: "robot_south",
                    west: "robot_west",
                  };
                  newGrid[r][c].object = dirToAsset[dir] || "robot_east";
                  newGrid[r][c].itemCount = 1;
                }
              }

              // Boxes
              const boxes = Array.isArray(ch?.boxes) ? ch.boxes : [];
              boxes.forEach((box: any) => {
                const tiles = Array.isArray(box?.tiles) ? box.tiles : [];
                tiles.forEach((t: any) => {
                  const c = t?.x;
                  const r = t?.y;
                  const count = typeof t?.count === "number" ? t.count : 1;
                  if (
                    typeof r === "number" &&
                    typeof c === "number" &&
                    r >= 0 &&
                    r < GRID_CONFIG.rows &&
                    c >= 0 &&
                    c < GRID_CONFIG.cols
                  ) {
                    newGrid![r][c].object = "box";
                    newGrid![r][c].itemCount = count;
                  }
                });
              });

              // Batteries
              const batteries = Array.isArray(ch?.batteries)
                ? ch.batteries
                : [];
              const typeToAsset: Record<string, string> = {
                yellow: "pin_yellow",
                red: "pin_red",
                green: "pin_green",
              };
              batteries.forEach((batt: any) => {
                const tiles = Array.isArray(batt?.tiles) ? batt.tiles : [];
                tiles.forEach((t: any) => {
                  const c = t?.x;
                  const r = t?.y;
                  const count = typeof t?.count === "number" ? t.count : 1;
                  const type = String(t?.type || "yellow").toLowerCase();
                  const assetId = typeToAsset[type] || "pin_yellow";
                  if (
                    typeof r === "number" &&
                    typeof c === "number" &&
                    r >= 0 &&
                    r < GRID_CONFIG.rows &&
                    c >= 0 &&
                    c < GRID_CONFIG.cols
                  ) {
                    newGrid![r][c].object = assetId as any;
                    newGrid![r][c].itemCount = count;
                  }
                });
              });
            }
          } catch {}

          if (newGrid) setMapGrid(newGrid);
        } catch (e) {
          // ignore fetch errors
        }
      })();
    }
  }, []);

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
      // Items (including box): clicking same item stacks count on the same cell
      if (currentCell.object === selectedAsset) {
        currentCell.itemCount = (currentCell.itemCount || 0) + 1;
      } else {
        currentCell.object = selectedAsset;
        currentCell.itemCount = 1;
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

  const handleSaveMap = async () => {
    // Validate required fields
    if (!lessonId || lessonId.trim().length === 0) {
      const msg = "Please select a Lesson before saving";
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
    const nameTrim = (mapName || "").trim();
    const descTrim = (mapDescription || "").trim();
    const missingName = nameTrim.length === 0;
    const missingDescription = descTrim.length === 0;
    const tooShortDescription = !missingDescription && descTrim.length < 10;

    if (missingName || missingDescription || tooShortDescription) {
      let msg = "";
      if (missingName && missingDescription) {
        msg = "Please enter map name and description";
      } else if (missingName) {
        msg = "Please enter map name";
      } else if (missingDescription) {
        msg = "Please enter map description";
      } else if (tooShortDescription) {
        msg = "Map description must be at least 10 characters";
      }
      const variant: "error" | "warning" =
        missingName || missingDescription ? "error" : "warning";
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

    // Continue to build payload first; for editing, we'll open confirm right before API call
    if (!hasRobot) {
      const msg = "Please place a robot on the map before saving";
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
          ? "Please configure Solution and Challenge before saving"
          : missingSolution
          ? "Please configure Solution before saving"
          : "Please configure Challenge before saving";
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

    // Extra validation for Battery challenge: per-color victory must not exceed available pins on map
    try {
      const ch = JSON.parse(challengeJson || "{}");
      const victory = ch?.victory || {};
      const batteries = Array.isArray(ch?.batteries) ? ch.batteries : [];
      const batteryTiles =
        batteries.length > 0 && Array.isArray(batteries[0]?.tiles)
          ? batteries[0].tiles
          : [];
      if (Array.isArray(victory?.byType) && victory.byType.length > 0) {
        const needObj = victory.byType[0] || {};
        const need = {
          yellow: Math.max(0, Number(needObj.yellow) || 0),
          red: Math.max(0, Number(needObj.red) || 0),
          green: Math.max(0, Number(needObj.green) || 0),
        };
        const have = { yellow: 0, red: 0, green: 0 } as Record<string, number>;
        for (const t of batteryTiles) {
          const c = Math.max(1, Number(t?.count) || 0);
          const type = String(t?.type || "yellow").toLowerCase();
          if (type === "red") have.red += c;
          else if (type === "green") have.green += c;
          else have.yellow += c;
        }
        if (
          need.yellow > have.yellow ||
          need.red > have.red ||
          need.green > have.green
        ) {
          const color =
            need.yellow > have.yellow
              ? "yellow"
              : need.red > have.red
              ? "red"
              : "green";
          const msg = `Battery victory for ${color} requires ${need[color]} but only ${have[color]} on map.`;
          if ((window as any).Snackbar?.enqueueSnackbar) {
            (window as any).Snackbar.enqueueSnackbar(msg, {
              variant: "error",
              anchorOrigin: { vertical: "top", horizontal: "right" },
            });
          } else {
            showLocalToast(msg, "error");
          }
          return;
        }
      }
    } catch {
      // ignore parse errors; validation best-effort
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
          image: ".",
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
          image: ".",
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
          image: ".",
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
          image: ".",
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
          image: ".",
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
          image: ".",
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

    try {
      let res;
      if (editingId) {
        // Ask for confirmation only after all validations pass, before PUT
        setOpenUpdateConfirm(true);
        return;
      } else {
        // Create new challenge
        res = await axiosClient.post(ROUTES_API_CHALLENGE.CREATE, lessonData);
      }
      const ok = res && (res.status === 200 || res.status === 201);
      const msg = ok
        ? "Map (challenge) saved successfully"
        : "Failed to save map";
      const variant = ok ? "success" : "error";
      if ((window as any).Snackbar?.enqueueSnackbar) {
        (window as any).Snackbar.enqueueSnackbar(msg, {
          variant,
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
      } else {
        showLocalToast(msg, variant as any);
      }
    } catch (e: any) {
      const msg = "Failed to save map";
      if ((window as any).Snackbar?.enqueueSnackbar) {
        (window as any).Snackbar.enqueueSnackbar(msg, {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
      } else {
        showLocalToast(msg, "error");
      }
    }
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

  // Sync boxes from challengeJson into mapGrid when Challenge modal saves
  const handleChallengeJsonChange = (newJson: string) => {
    setChallengeJson(newJson);
    try {
      const ch = JSON.parse(newJson || "{}");
      const boxes = Array.isArray(ch?.boxes) ? ch.boxes : [];
      const tiles =
        boxes.length > 0 && Array.isArray(boxes[0]?.tiles)
          ? boxes[0].tiles
          : [];
      if (!Array.isArray(tiles)) return;
      setMapGrid((prev) => {
        const next = prev.map((row) => row.map((cell) => ({ ...cell })));
        // Clear existing boxes
        for (const row of next) {
          for (const cell of row) {
            if (cell.object === "box") {
              cell.object = null;
              (cell as any).itemCount = 0;
            }
          }
        }
        // Apply tiles from challengeJson
        tiles.forEach((t: any) => {
          const x = Number(t?.x);
          const y = Number(t?.y);
          const count = Math.max(1, Number(t?.count) || 0);
          if (
            Number.isFinite(x) &&
            Number.isFinite(y) &&
            y >= 0 &&
            y < GRID_CONFIG.rows &&
            x >= 0 &&
            x < GRID_CONFIG.cols
          ) {
            next[y][x].object = "box";
            (next[y][x] as any).itemCount = count;
          }
        });
        return next;
      });
    } catch {}
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
                Map Designer - Tiled Studio
              </Typography>
              <Typography variant="body1" sx={{ color: "#558B2F" }}>
                Create and edit maps for robot game with realistic tiles
              </Typography>
            </Box>

            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
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
              onChallengeJsonChange={handleChallengeJsonChange}
              challengeJson={challengeJson}
            />
          </Grid>
        </Grid>
      </Container>
      <Dialog
        open={openUpdateConfirm}
        onClose={() => setOpenUpdateConfirm(false)}
      >
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          You are updating an existing map. Proceed?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateConfirm(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setOpenUpdateConfirm(false);
              try {
                const data: number[] = [];
                for (let row = 0; row < GRID_CONFIG.rows; row++) {
                  for (let col = 0; col < GRID_CONFIG.cols; col++) {
                    const cell = mapGrid[row][col];
                    let tileId = 0;
                    if (cell.terrain) {
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
                      image: ".",
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
                      image: ".",
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
                      image: ".",
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
                      image: ".",
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
                      image: ".",
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
                      image: ".",
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
                } as any;
                const updateBody = {
                  title: mapName,
                  description: mapDescription,
                  order,
                  difficulty,
                  mapJson: JSON.stringify(tiledMap),
                  challengeJson: challengeJson,
                  solutionJson: solutionJson,
                } as any;
                const res = await axiosClient.put(
                  ROUTES_API_CHALLENGE.ADMIN_UPDATE(editingId as string),
                  updateBody
                );
                const ok = res && (res.status === 200 || res.status === 201);
                const msg = ok
                  ? "Map (challenge) saved successfully"
                  : "Failed to save map";
                const variant = ok ? "success" : "error";
                if ((window as any).Snackbar?.enqueueSnackbar) {
                  (window as any).Snackbar.enqueueSnackbar(msg, {
                    variant,
                    anchorOrigin: { vertical: "top", horizontal: "right" },
                  });
                } else {
                  showLocalToast(msg, variant as any);
                }
              } catch (e) {
                const msg = "Failed to save map";
                if ((window as any).Snackbar?.enqueueSnackbar) {
                  (window as any).Snackbar.enqueueSnackbar(msg, {
                    variant: "error",
                    anchorOrigin: { vertical: "top", horizontal: "right" },
                  });
                } else {
                  showLocalToast(msg, "error");
                }
              }
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default MapDesignerPage;
