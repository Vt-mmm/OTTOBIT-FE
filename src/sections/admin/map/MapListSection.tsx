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
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Map as MapIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getMaps, deleteMap } from "../../../redux/map/mapSlice";
import { MapResult, MapSortBy, SortDirection } from "common/@types/map";
import { useNavigate } from "react-router-dom";

export default function MapListSection() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { maps, operations } = useAppSelector((state) => state.map);

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mapToDelete, setMapToDelete] = useState<MapResult | null>(null);
  const [sortBy, setSortBy] = useState<MapSortBy>(MapSortBy.CreatedAt);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.Descending);

  useEffect(() => {
    dispatch(getMaps({
      searchTerm: searchTerm || undefined,
      sortBy,
      sortDirection,
      pageNumber: 1,
      pageSize: 50,
    }));
  }, [dispatch, searchTerm, sortBy, sortDirection]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCreateMap = () => {
    navigate("/admin/map-designer?mode=create");
  };

  const handleEditMap = (map: MapResult) => {
    navigate(`/admin/map-designer?mode=edit&id=${map.id}&title=${encodeURIComponent(map.title)}&description=${encodeURIComponent(map.description || '')}`);
  };

  const handleDeleteConfirm = (map: MapResult) => {
    setMapToDelete(map);
    setDeleteDialogOpen(true);
  };

  const handleDeleteExecute = async () => {
    if (mapToDelete) {
      await dispatch(deleteMap(mapToDelete.id));
      setDeleteDialogOpen(false);
      setMapToDelete(null);
    }
  };

  // const handleRestore = async (mapId: string) => {
  //   await dispatch(restoreMap(mapId));
  // };

  if (maps.isLoading && !maps.data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
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
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as MapSortBy)}
                SelectProps={{ native: true }}
              >
                <option value={MapSortBy.Title}>Title</option>
                <option value={MapSortBy.CreatedAt}>Created Date</option>
                <option value={MapSortBy.UpdatedAt}>Updated Date</option>
                <option value={MapSortBy.ChallengesCount}>Challenges Count</option>
                <option value={MapSortBy.CoursesCount}>Courses Count</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Order"
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value as SortDirection)}
                SelectProps={{ native: true }}
              >
                <option value={SortDirection.Ascending}>Ascending</option>
                <option value={SortDirection.Descending}>Descending</option>
              </TextField>
            </Grid>
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
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <MapIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2" noWrap>
                    {map.title}
                  </Typography>
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
                  }}
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
              <Box sx={{ p: 1, pt: 0, display: "flex", justifyContent: "flex-end" }}>
                <IconButton
                  size="small"
                  onClick={() => handleEditMap(map)}
                  title="Edit Map"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteConfirm(map)}
                  color="error"
                  title="Delete Map"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

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
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateMap}>
            Create First Map
          </Button>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Map</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the map "{mapToDelete?.title}"? 
            This action can be undone by restoring it later.
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
    </Box>
  );
}