import {
  Box,
  Container,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { axiosClient } from "axiosClient";
import { useNotification } from "hooks/useNotification";
import { extractApiErrorMessage } from "utils/errorHandler";
import useLocales from "hooks/useLocales";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "layout/admin/AdminLayout";
import { MapCell } from "common/models";
import { MapGridSection } from "sections/admin/mapDesigner";
import WorkspaceSectionLite from "sections/admin/mapDesigner/WorkspaceSectionLite";
import SimpleIsometricMapGridLite from "sections/admin/mapDesigner/SimpleIsometricMapGridLite";
import {
  GRID_CONFIG,
  THEME_COLORS,
} from "sections/admin/mapDesigner/theme.config";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import { MAP_ASSETS } from "sections/admin/mapDesigner/mapAssets.config";

export default function MapDesignerPage() {
  const { translate } = useLocales();
  const [selectedAsset, setSelectedAsset] = useState<string>("grass");
  const [viewMode, setViewMode] = useState<"orthogonal" | "isometric">(
    "isometric"
  );
  const [mapTitle, setMapTitle] = useState<string>("");
  const [mapDescription, setMapDescription] = useState<string>("");
  const [searchParams] = useSearchParams();
  const [editId, setEditId] = useState<string | null>(null);
  const [openUpdateConfirm, setOpenUpdateConfirm] = useState<boolean>(false);
  const { showNotification: showToast, NotificationComponent: Toast } =
    useNotification({
      anchorOrigin: { vertical: "top", horizontal: "right" },
      autoHideDurationMs: 3000,
    });
  const [mapGrid, setMapGrid] = useState<MapCell[][]>(
    Array(GRID_CONFIG.rows)
      .fill(null)
      .map((_, row) =>
        Array(GRID_CONFIG.cols)
          .fill(null)
          .map((_, col) => ({ row, col, terrain: null, object: null }))
      )
  );

  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerSizeRaw, setContainerSizeRaw] = useState<{
    w: number;
    h: number;
  }>({ w: 0, h: 0 });
  const [containerSizeStable, setContainerSizeStable] = useState<{
    w: number;
    h: number;
  }>({ w: 0, h: 0 });
  const debounceTimerRef = useRef<any>(null);

  // Force reflow when page mounts to fix isometric initial stretch after route change
  useEffect(() => {
    const tick = () => window.dispatchEvent(new Event("resize"));
    requestAnimationFrame(tick);
    const t = setTimeout(tick, 120);
    return () => {
      clearTimeout(t);
    };
  }, []);

  // Detect edit mode from query, fetch map by id and hydrate form + grid
  useEffect(() => {
    const mode = searchParams.get("mode");
    const id = searchParams.get("id");
    if (mode === "edit" && id) {
      setEditId(id);
      const qTitle = searchParams.get("title");
      const qDesc = searchParams.get("description");
      if (qTitle) setMapTitle(qTitle);
      if (qDesc) setMapDescription(qDesc);

      (async () => {
        try {
          const res = await axiosClient.get(`/api/v1/maps/${id}`);
          const map = res?.data?.data || res?.data || res; // backend shape safety
          if (map?.title && !qTitle) setMapTitle(map.title);
          if (map?.description && !qDesc) setMapDescription(map.description);
          if (map?.mapJson) {
            try {
              const tiled =
                typeof map.mapJson === "string"
                  ? JSON.parse(map.mapJson)
                  : map.mapJson;
              const layer = tiled?.layers?.[0];
              const data: number[] = layer?.data || [];
              const inverseTerrain: { [key: number]: string } = {
                1: "road_v",
                2: "road_h",
                3: "wood",
                4: "water",
                5: "grass",
                6: "crossroad",
              };
              const next: typeof mapGrid = Array(GRID_CONFIG.rows)
                .fill(null)
                .map((_, row) =>
                  Array(GRID_CONFIG.cols)
                    .fill(null)
                    .map((_, col) => ({
                      row,
                      col,
                      terrain: null as any,
                      object: null as any,
                    }))
                );
              for (let row = 0; row < GRID_CONFIG.rows; row++) {
                for (let col = 0; col < GRID_CONFIG.cols; col++) {
                  const idx = row * GRID_CONFIG.cols + col;
                  const tileId = data[idx] || 0;
                  const terrainId = inverseTerrain[tileId] || null;
                  (next[row][col] as any).terrain = terrainId;
                }
              }
              setMapGrid(next);
            } catch (e) {
              console.error("[MapDesigner] Failed to parse mapJson:", e);
              showToast(translate("admin.mapLoadFailed"), "error");
            }
          }
        } catch (e) {
          console.error("[MapDesigner] Fetch map failed:", e);
          showToast(translate("admin.mapFetchFailed"), "error");
        }
      })();
    }
  }, [searchParams]);

  // Reflow khi đổi viewMode (orthogonal <-> isometric)
  useEffect(() => {
    const tick = () => window.dispatchEvent(new Event("resize"));
    requestAnimationFrame(tick);
    const t = setTimeout(tick, 120);
    return () => clearTimeout(t);
  }, [viewMode]);

  // Observe container size changes (sidebar collapse, layout changes, tab switches)
  useEffect(() => {
    if (!gridContainerRef.current || !(window as any).ResizeObserver) return;
    const ro = new (window as any).ResizeObserver((entries: any[]) => {
      const entry = entries?.[0];
      if (!entry) return;
      const cr = entry.contentRect || entry.target.getBoundingClientRect();
      const w = Math.round(cr.width);
      const h = Math.round(cr.height);
      setContainerSizeRaw((prev) =>
        prev.w !== w || prev.h !== h ? { w, h } : prev
      );
    });
    ro.observe(gridContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // Debounce to determine when container size is stable
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setContainerSizeStable(containerSizeRaw);
      const tick = () => window.dispatchEvent(new Event("resize"));
      requestAnimationFrame(tick);
    }, 160);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [containerSizeRaw.w, containerSizeRaw.h]);

  const gridKey = `${viewMode}-${containerSizeStable.w}x${containerSizeStable.h}`;

  const handleCellClick = (row: number, col: number) => {
    const newGrid = [...mapGrid];
    const asset = MAP_ASSETS.find((a) => a.id === selectedAsset);
    if (!asset) return;

    const cell = newGrid[row][col];
    if (selectedAsset === "eraser") {
      cell.object = null;
      (cell as any).itemCount = 0;
    } else if (selectedAsset === "empty") {
      cell.terrain = null;
      cell.object = null;
      (cell as any).itemCount = 0;
    } else if (asset.category === "terrain") {
      cell.terrain = selectedAsset;
    } else if (asset.category === "robot") {
      // Disable robot placement in Map Designer
      return;
    } else if (asset.category === "item") {
      // Disable items in Map Designer
      return;
    } else {
      // Disable other objects in Map Designer
      return;
    }

    setMapGrid(newGrid);
  };

  const handleClearMap = () => {
    setMapGrid(
      Array(GRID_CONFIG.rows)
        .fill(null)
        .map((_, row) =>
          Array(GRID_CONFIG.cols)
            .fill(null)
            .map((_, col) => ({ row, col, terrain: null, object: null }))
        )
    );
  };

  const handleSaveMap = async () => {
    const titleValid = mapTitle.trim().length >= 5;
    const descValid = mapDescription.trim().length >= 10;
    if (!titleValid || !descValid) {
      showToast(
        !titleValid && !descValid
          ? translate("admin.invalidTitleAndDescription")
          : !titleValid
          ? translate("admin.invalidTitle")
          : translate("admin.invalidDescription"),
        "error"
      );
      return;
    }
    // Build Tiled map JSON from current grid
    const terrainMap: { [key: string]: number } = {
      grass: 5,
      water: 4,
      wood: 3,
      road_h: 2,
      road_v: 1,
      crossroad: 6,
    };
    const data: number[] = [];
    for (let row = 0; row < GRID_CONFIG.rows; row++) {
      for (let col = 0; col < GRID_CONFIG.cols; col++) {
        const cell = mapGrid[row][col];
        let tileId = 0;
        if (cell.terrain) {
          tileId = terrainMap[cell.terrain] || 0;
        }
        data.push(tileId);
      }
    }

    const tiledMap = {
      compressionlevel: -1,
      height: GRID_CONFIG.rows,
      infinite: false,
      layers: [
        {
          data,
          height: GRID_CONFIG.rows,
          id: 1,
          name: "Tile Layer 1",
          opacity: 1,
          type: "tilelayer",
          visible: true,
          width: GRID_CONFIG.cols,
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
      width: GRID_CONFIG.cols,
    } as any;

    // Call Maps API (ask confirm if editing)
    if (editId) {
      setOpenUpdateConfirm(true);
      return;
    }
    try {
      const payload = {
        title: mapTitle.trim(),
        description: mapDescription.trim(),
        mapJson: JSON.stringify(tiledMap),
      };
      const res = await axiosClient.post("/api/v1/maps", payload);
      console.log("[MapDesigner] Map saved:", res.data);
      showToast(translate("admin.mapSavedSuccess"), "success");
    } catch (err: any) {
      console.error("[MapDesigner] Save map failed:", err);
      const errorMessage = extractApiErrorMessage(
        err,
        translate("admin.mapSaveFailed")
      );
      showToast(errorMessage, "error");
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="xl">
        <Toast />
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
                {translate("admin.mapDesigner")}
              </Typography>
            </Box>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, m) => m && setViewMode(m)}
              aria-label="view mode"
              size="small"
            >
              <ToggleButton value="orthogonal" aria-label="orthogonal view">
                <ViewModuleIcon sx={{ mr: 1 }} />
                {translate("admin.view2D")}
              </ToggleButton>
              <ToggleButton value="isometric" aria-label="isometric view">
                <ThreeDRotationIcon sx={{ mr: 1 }} />
                {translate("admin.view25D")}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          {/* Title & Description moved to bottom */}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Box
              className="map-designer-workspace"
              sx={{
                height: "100%",
                minHeight: "700px",
                // Hard reset some MUI spacing possibly affected by previous page styles
                "& .MuiDivider-root": { mb: 0.5 },
                "& .MuiTabs-root": { mb: 0.5, minHeight: 32 },
                "& .MuiTab-root": { minHeight: 32, py: 0.5, px: 1 },
                // Extra hard reset to kill residual margins/paddings when returning from other pages
                "& .MuiTabs-root + .MuiBox-root": { mt: 0, pt: 0 },
                "& .MuiBox-root": { mt: 0 },
                "& .MuiTabs-flexContainer": { alignItems: "center" },
              }}
            >
              <WorkspaceSectionLite
                selectedAsset={selectedAsset}
                onAssetSelect={setSelectedAsset}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={9}>
            <Box
              ref={gridContainerRef}
              sx={{
                height: "100%",
                width: "100%",
                position: "relative",
                minHeight: "700px",
              }}
            >
              {/* Gate render until container size stabilized to avoid 2.5D stretch */}
              {viewMode === "orthogonal" ? (
                <MapGridSection
                  key={gridKey}
                  mapGrid={mapGrid}
                  selectedAsset={selectedAsset}
                  onCellClick={handleCellClick}
                  onSaveMap={handleSaveMap}
                  onClearMap={handleClearMap}
                />
              ) : (
                containerSizeStable.w > 0 &&
                containerSizeStable.h > 0 && (
                  <SimpleIsometricMapGridLite
                    key={gridKey}
                    mapGrid={mapGrid}
                    selectedAsset={selectedAsset}
                    onCellClick={handleCellClick}
                  />
                )
              )}
            </Box>
          </Grid>
          {/* Bottom: Map Info (Title & Description) */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 2,
                height: "auto",
                overflow: "visible",
                bgcolor: THEME_COLORS.surface,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: THEME_COLORS.text.primary,
                }}
              >
                {translate("admin.mapInformation")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={translate("admin.title")}
                    placeholder={translate("admin.enterMapTitle")}
                    size="small"
                    error={
                      mapTitle.trim().length > 0 && mapTitle.trim().length < 5
                    }
                    helperText={
                      mapTitle.trim().length > 0 && mapTitle.trim().length < 5
                        ? translate("admin.atLeast5Chars")
                        : ""
                    }
                    value={mapTitle}
                    onChange={(e) => setMapTitle(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={translate("admin.description")}
                    placeholder={translate("admin.enterMapDescription")}
                    size="small"
                    multiline
                    minRows={3}
                    maxRows={8}
                    error={
                      mapDescription.trim().length > 0 &&
                      mapDescription.trim().length < 10
                    }
                    helperText={
                      mapDescription.trim().length > 0 &&
                      mapDescription.trim().length < 10
                        ? translate("admin.atLeast10Chars")
                        : ""
                    }
                    value={mapDescription}
                    onChange={(e) => setMapDescription(e.target.value)}
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button variant="contained" onClick={handleSaveMap}>
                  {translate("admin.saveMap")}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      {/* Update confirmation dialog */}
      <Dialog
        open={openUpdateConfirm}
        onClose={() => setOpenUpdateConfirm(false)}
      >
        <DialogTitle>{translate("admin.confirmUpdate")}</DialogTitle>
        <DialogContent>{translate("admin.confirmUpdateMap")}</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateConfirm(false)}>{translate("admin.cancel")}</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setOpenUpdateConfirm(false);
              try {
                const payload = {
                  title: mapTitle.trim(),
                  description: mapDescription.trim(),
                  mapJson: JSON.stringify({
                    compressionlevel: -1,
                    height: GRID_CONFIG.rows,
                    infinite: false,
                    layers: [
                      {
                        data: (() => {
                          const terrainMap: { [key: string]: number } = {
                            grass: 5,
                            water: 4,
                            wood: 3,
                            road_h: 2,
                            road_v: 1,
                            crossroad: 6,
                          };
                          const arr: number[] = [];
                          for (let r = 0; r < GRID_CONFIG.rows; r++) {
                            for (let c = 0; c < GRID_CONFIG.cols; c++) {
                              const cell = mapGrid[r][c];
                              arr.push(
                                cell.terrain ? terrainMap[cell.terrain] || 0 : 0
                              );
                            }
                          }
                          return arr;
                        })(),
                        height: GRID_CONFIG.rows,
                        id: 1,
                        name: "Tile Layer 1",
                        opacity: 1,
                        type: "tilelayer",
                        visible: true,
                        width: GRID_CONFIG.cols,
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
                    width: GRID_CONFIG.cols,
                  }),
                };
                await axiosClient.put(`/api/v1/maps/${editId}`, payload);
                showToast(translate("admin.mapUpdatedSuccess"), "success");
              } catch (e) {
                showToast(translate("admin.mapUpdateFailed"), "error");
              }
            }}
          >
            {translate("admin.update")}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
