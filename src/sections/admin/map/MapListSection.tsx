import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Map as MapIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getMaps, deleteMap } from "../../../redux/map/mapSlice";
import { axiosClient } from "axiosClient";
import { extractApiErrorMessage } from "utils/errorHandler";
import {
  MapResult as BackendMapResult,
  MapSortBy,
  SortDirection,
} from "common/@types/map";
import { useNavigate } from "react-router-dom";
import { useNotification } from "hooks/useNotification";
import { MAP_ASSETS } from "sections/admin/mapDesigner/mapAssets.config";

export default function MapListSection() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { maps, operations } = useAppSelector((state) => state.map);
  const { showNotification: showToast, NotificationComponent: Toast } =
    useNotification({
      anchorOrigin: { vertical: "top", horizontal: "right" },
      autoHideDurationMs: 3000,
    });

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewMap, setViewMap] = useState<BackendMapResult | null>(null);
  const [viewMapJson, setViewMapJson] = useState<any | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [committedSearch, setCommittedSearch] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mapToDelete, setMapToDelete] = useState<BackendMapResult | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [mapToRestore, setMapToRestore] = useState<BackendMapResult | null>(
    null
  );
  const [sortBy] = useState<MapSortBy>(MapSortBy.CreatedAt);
  const [sortDirection] = useState<SortDirection>(SortDirection.Descending);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  useEffect(() => {
    dispatch(
      getMaps({
        searchTerm: committedSearch || undefined,
        sortBy,
        sortDirection,
        includeDeleted: true,
        pageNumber,
        pageSize,
      })
    );
  }, [dispatch, committedSearch, sortBy, sortDirection, pageNumber, pageSize]);

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const triggerSearch = () => {
    setCommittedSearch(searchTerm.trim());
    setPageNumber(1);
  };

  const handleCreateMap = () => {
    navigate("/admin/map-designer?mode=create");
  };

  const handleEditMap = (map: BackendMapResult) => {
    navigate(
      `/admin/map-designer?mode=edit&id=${map.id}&title=${encodeURIComponent(
        map.title
      )}&description=${encodeURIComponent(map.description || "")}`
    );
  };

  const handleViewMap = async (map: BackendMapResult) => {
    try {
      const res = await axiosClient.get(`/api/v1/maps/${map.id}`);
      const m = res?.data?.data || map;
      setViewMap(m);
      const json = m?.mapJson
        ? typeof m.mapJson === "string"
          ? JSON.parse(m.mapJson)
          : m.mapJson
        : null;
      setViewMapJson(json);
      setViewDialogOpen(true);
    } catch (e: any) {
      const errorMessage = extractApiErrorMessage(
        e,
        "Failed to load map for preview."
      );
      showToast(errorMessage, "error");
    }
  };

  const handleDeleteConfirm = (map: BackendMapResult) => {
    setMapToDelete(map);
    setDeleteDialogOpen(true);
  };

  const handleDeleteExecute = async () => {
    if (mapToDelete) {
      try {
        const action: any = await dispatch(deleteMap(mapToDelete.id));
        const ok = action?.meta?.requestStatus === "fulfilled";
        if (ok) {
          showToast("Map deleted successfully.", "success");
        } else {
          showToast(action?.payload || "Failed to delete map.", "error");
        }
      } catch (e: any) {
        const errorMessage = extractApiErrorMessage(e, "Failed to delete map.");
        showToast(errorMessage, "error");
      } finally {
        setDeleteDialogOpen(false);
        setMapToDelete(null);
      }
    }
  };

  const handleRestore = async (mapId: string) => {
    try {
      await axiosClient.post(`/api/v1/maps/${mapId}/restore`);
      showToast("Map restored successfully.", "success");
      dispatch(
        getMaps({
          searchTerm: searchTerm || undefined,
          sortBy,
          sortDirection,
          pageNumber: 1,
          pageSize: 50,
          includeDeleted: true,
        })
      );
    } catch (e) {
      // Swallow; Map slice may handle global errors/toasts elsewhere
      console.error("Restore map failed", e);
      showToast("Failed to restore map.", "error");
    }
  };

  const handleRestoreConfirm = (map: BackendMapResult) => {
    setMapToRestore(map);
    setRestoreDialogOpen(true);
  };

  if (maps.isLoading && !maps.data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Toast />
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          🗺️ Maps Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateMap}
          sx={{ minWidth: 120 }}
        >
          Create Map
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search maps by title or description..."
                value={searchTerm}
                onChange={handleSearchInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") triggerSearch();
                }}
                sx={{
                  "& .MuiInputBase-root": { pr: 4 },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={triggerSearch}
                        sx={{ mr: 0 }}
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Removed top dropdowns (Sort By, Order, Page Size) as requested */}
          </Grid>
        </CardContent>
      </Card>

      {/* Error Display */}
      {maps.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {maps.error}
        </Alert>
      )}

      {/* Maps Grid */}
      <Grid container spacing={3}>
        {maps.data?.items?.map((map) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={map.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s",
                bgcolor: map.isDeleted ? "rgba(255, 0, 0, 0.04)" : undefined,
                border: map.isDeleted
                  ? "1px dashed rgba(244,67,54,0.5)"
                  : undefined,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}
                >
                  <MapIcon color="primary" sx={{ mr: 1 }} />
                  <Typography
                    variant="h6"
                    component="h2"
                    noWrap
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "block",
                      maxWidth: "100%",
                    }}
                  >
                    {map.title}
                  </Typography>
                  {map.isDeleted && (
                    <Chip
                      size="small"
                      label="Deleted"
                      color="error"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    height: 40,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    wordBreak: "break-word",
                  }}
                  title={map.description || "No description"}
                >
                  {map.description || "No description"}
                </Typography>

                {/* Stats */}
                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                  {map.challengesCount !== undefined && (
                    <Chip
                      label={`${map.challengesCount} challenges`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {map.coursesCount !== undefined && (
                    <Chip
                      label={`${map.coursesCount} courses`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(map.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>

              {/* Actions */}
              <Box
                sx={{
                  p: 1,
                  pt: 0,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleViewMap(map)}
                  title="View in Studio"
                >
                  <ViewIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleEditMap(map)}
                  title="Edit Map"
                >
                  <EditIcon />
                </IconButton>
                {map.isDeleted ? (
                  <IconButton
                    size="small"
                    onClick={() => handleRestoreConfirm(map)}
                    color="success"
                    title="Restore Map"
                  >
                    <RestoreIcon />
                  </IconButton>
                ) : (
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteConfirm(map)}
                    color="error"
                    title="Delete Map"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination (MUI Pagination like Challenges) */}
      {maps.data?.totalPages ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          <TextField
            select
            label="Page Size"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageNumber(1);
            }}
            size="small"
            SelectProps={{ native: true }}
            sx={{ minWidth: 140 }}
          >
            {[6, 12, 24, 48].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </TextField>
          <Pagination
            count={maps.data.totalPages}
            page={pageNumber}
            onChange={(_, v) => setPageNumber(v)}
            shape="rounded"
            color="primary"
          />
        </Box>
      ) : null}

      {/* Empty State */}
      {!maps.isLoading && maps.data?.items?.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <MapIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Maps Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Create your first map to get started"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateMap}
          >
            Create First Map
          </Button>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Map</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the map "{mapToDelete?.title}"? This
            action can be undone by restoring it later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteExecute}
            color="error"
            variant="contained"
            disabled={operations.isDeleting}
          >
            {operations.isDeleting ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Map Preview</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <MapIcon color="primary" sx={{ mr: 1 }} />
                <Typography
                  variant="h6"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {viewMap?.title}
                </Typography>
                {viewMap?.isDeleted && (
                  <Chip
                    size="small"
                    label="Deleted"
                    color="error"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "pre-wrap" }}
              >
                {viewMap?.description || "No description"}
              </Typography>
              <Box
                sx={{
                  mt: 2,
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  rowGap: 0.5,
                  columnGap: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="caption">
                  {viewMap?.createdAt
                    ? new Date(viewMap.createdAt).toLocaleString()
                    : "-"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Updated
                </Typography>
                <Typography variant="caption">
                  {viewMap?.updatedAt
                    ? new Date(viewMap.updatedAt).toLocaleString()
                    : "-"}
                </Typography>
                {typeof viewMap?.challengesCount === "number" && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      Challenges
                    </Typography>
                    <Typography variant="caption">
                      {viewMap?.challengesCount}
                    </Typography>
                  </>
                )}
                {typeof viewMap?.coursesCount === "number" && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      Courses
                    </Typography>
                    <Typography variant="caption">
                      {viewMap?.coursesCount}
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  height: 420,
                  bgcolor: "#e8e8e8",
                  borderRadius: 1,
                  p: 2,
                  overflow: "auto",
                  position: "relative",
                }}
              >
                {(() => {
                  if (!viewMapJson)
                    return (
                      <Typography variant="body2">No map data.</Typography>
                    );
                  const layer = viewMapJson?.layers?.[0];
                  const rows = viewMapJson?.height || 10;
                  const cols = viewMapJson?.width || 10;
                  const data: number[] = layer?.data || [];
                  const inverseTerrain: { [key: number]: string } = {
                    1: "road_v",
                    2: "road_h",
                    3: "wood",
                    4: "water",
                    5: "grass",
                    6: "crossroad",
                  };
                  // 2.5D preview config (scaled down)
                  const tileW = 72;
                  const tileH = 42;
                  // Adjust vertical spacing between diagonals (1 = default)
                  const verticalScale = 0.64;
                  const halfW = tileW / 2;
                  const halfH = tileH / 2;
                  const totalW = (rows + cols) * halfW + halfW;
                  const totalH =
                    (rows + cols) * (halfH * verticalScale) + tileH;

                  const toIso = (r: number, c: number) => ({
                    x: (c - r) * halfW + rows * halfW,
                    y: (c + r) * (halfH * verticalScale),
                  });

                  return (
                    <Box
                      sx={{
                        position: "relative",
                        width: totalW,
                        height: totalH,
                      }}
                    >
                      {Array.from({ length: rows }).map((_, r) =>
                        Array.from({ length: cols }).map((__, c) => {
                          const idx = r * cols + c;
                          const tileId = data[idx] || 0;
                          const terrainId = inverseTerrain[tileId];
                          const asset = terrainId
                            ? MAP_ASSETS.find((a) => a.id === terrainId)
                            : null;
                          const { x, y } = toIso(r, c);
                          return (
                            <svg
                              key={`${r}-${c}`}
                              style={{
                                position: "absolute",
                                left: x,
                                top: y,
                                width: tileW,
                                height: tileH,
                                overflow: "visible",
                              }}
                            >
                              {/* hidden base diamond to remove white tiles */}
                              <polygon
                                points={`${halfW},0 ${tileW},${halfH} ${halfW},${tileH} 0,${halfH}`}
                                fill="none"
                                stroke="none"
                                opacity={0}
                              />
                              {asset?.imagePath && (
                                <image
                                  href={asset.imagePath}
                                  x={0}
                                  y={0}
                                  width={tileW}
                                  height={tileH}
                                  preserveAspectRatio="none"
                                />
                              )}
                            </svg>
                          );
                        })
                      )}
                    </Box>
                  );
                })()}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
      >
        <DialogTitle>Confirm Restore</DialogTitle>
        <DialogContent>
          Are you sure you want to restore this map?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              if (mapToRestore) {
                handleRestore(mapToRestore.id);
                setRestoreDialogOpen(false);
                setMapToRestore(null);
              }
            }}
          >
            Restore
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
