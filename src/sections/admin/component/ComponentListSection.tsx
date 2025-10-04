import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Memory as ComponentIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import {
  getComponentsThunk,
  deleteComponentThunk,
} from "../../../redux/component/componentThunks";
import { clearSuccessFlags } from "../../../redux/component/componentSlice";
import {
  ComponentResult,
  ComponentType,
} from "../../../common/@types/component";
import PaginationFooter from "components/common/PaginationFooter";
import ConfirmDialog from "components/common/ConfirmDialog";

interface ComponentListSectionProps {
  onViewModeChange: (
    mode: "create" | "edit" | "details",
    component?: ComponentResult
  ) => void;
}

export default function ComponentListSection({
  onViewModeChange,
}: ComponentListSectionProps) {
  const dispatch = useAppDispatch();
  const { components, operations } = useAppSelector((state) => state.component);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ComponentType | "all">("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    componentId?: string;
    componentName?: string;
  }>({ open: false });

  // Fetch components on component mount and when filters change
  useEffect(() => {
    const filters = {
      page: pageNumber,
      size: pageSize,
      searchTerm: searchTerm.trim() || undefined,
      type: filterType !== "all" ? filterType : undefined,
      orderBy: "CreatedAt",
      orderDirection: "DESC" as const,
    };

    dispatch(getComponentsThunk(filters));
  }, [dispatch, searchTerm, filterType, pageNumber, pageSize]);

  // Clear success flags after operations
  useEffect(() => {
    if (operations.deleteSuccess) {
      dispatch(clearSuccessFlags());
    }
  }, [operations.deleteSuccess, dispatch]);

  const handleDeleteClick = (component: ComponentResult) => {
    setDeleteDialog({
      open: true,
      componentId: component.id,
      componentName: component.name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.componentId) {
      await dispatch(deleteComponentThunk(deleteDialog.componentId));
      setDeleteDialog({ open: false });
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPageNumber(1); // Reset to first page when searching
  };

  const handleTypeFilterChange = (type: ComponentType | "all") => {
    setFilterType(type);
    setPageNumber(1); // Reset to first page when filtering
  };

  const componentList = components.data?.items || [];

  const getComponentTypeLabel = (type: ComponentType) => {
    const typeLabels = {
      [ComponentType.SENSOR]: "Sensor",
      [ComponentType.ACTUATOR]: "Actuator",
      [ComponentType.CONTROLLER]: "Controller",
      [ComponentType.POWER_SUPPLY]: "Power Supply",
      [ComponentType.CONNECTIVITY]: "Connectivity",
      [ComponentType.MECHANICAL]: "Mechanical",
      [ComponentType.DISPLAY]: "Display",
      [ComponentType.AUDIO]: "Audio",
      [ComponentType.OTHER]: "Other",
    };
    return typeLabels[type] || "Unknown";
  };

  const getComponentTypeColor = (
    type: ComponentType
  ):
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "info"
    | "error" => {
    const typeColors: Record<
      ComponentType,
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "info"
      | "error"
    > = {
      [ComponentType.SENSOR]: "primary",
      [ComponentType.ACTUATOR]: "secondary",
      [ComponentType.CONTROLLER]: "success",
      [ComponentType.POWER_SUPPLY]: "warning",
      [ComponentType.CONNECTIVITY]: "info",
      [ComponentType.MECHANICAL]: "default",
      [ComponentType.DISPLAY]: "secondary",
      [ComponentType.AUDIO]: "success",
      [ComponentType.OTHER]: "default",
    };
    return typeColors[type] || "default";
  };

  if (components.isLoading && !components.data) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search and Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            label="Type"
            onChange={(e) =>
              handleTypeFilterChange(e.target.value as ComponentType | "all")
            }
          >
            <MenuItem value="all">All Types</MenuItem>
            {Object.values(ComponentType)
              .filter((v) => typeof v === "number")
              .map((type) => (
                <MenuItem key={type} value={type}>
                  {getComponentTypeLabel(type as ComponentType)}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => onViewModeChange("create")}
          sx={{ ml: "auto" }}
        >
          Add Component
        </Button>
      </Box>

      {/* Success/Error Messages */}
      {operations.deleteSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Component deleted successfully!
        </Alert>
      )}

      {components.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {components.error}
        </Alert>
      )}

      {/* Results Summary */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {components.data &&
          `Showing ${componentList.length} of ${components.data.total} components`}
      </Typography>

      {/* Components Grid */}
      {componentList.length === 0 ? (
        <Box textAlign="center" py={8}>
          <ComponentIcon
            sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" mb={2}>
            No components found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {searchTerm || filterType !== "all"
              ? "Try adjusting your search or filters"
              : "Add your first component to get started"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onViewModeChange("create")}
          >
            Add First Component
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {componentList.map((component) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={component.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                {/* Component Image */}
                <Box
                  sx={{
                    position: "relative",
                    height: 200, // Fixed height for consistency
                    backgroundColor: "grey.100",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: "4px 4px 0 0",
                  }}
                  onClick={() => onViewModeChange("details", component)}
                >
                  {/* Actual Image Element */}
                  {component.imageUrl && (
                    <Box
                      component="img"
                      src={component.imageUrl}
                      alt={`${component.name} - ${getComponentTypeLabel(
                        component.type
                      )}`}
                      sx={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                        objectFit: "contain",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                      onError={(e) => {
                        // Hide broken image and show fallback
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      display: "flex",
                      gap: 0.5,
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: "background.paper",
                        "&:hover": { backgroundColor: "grey.100" },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewModeChange("details", component);
                      }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: "background.paper",
                        "&:hover": { backgroundColor: "grey.100" },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewModeChange("edit", component);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      sx={{
                        backgroundColor: "background.paper",
                        "&:hover": {
                          backgroundColor: "error.light",
                          color: "white",
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(component);
                      }}
                      disabled={operations.isDeleting}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Default Component Icon if no image */}
                  {!component.imageUrl && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          backgroundColor: "primary.main",
                        }}
                      >
                        <ComponentIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                    </Box>
                  )}
                </Box>

                {/* Component Info */}
                <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                  <Typography variant="h6" noWrap sx={{ mb: 1 }}>
                    {component.name}
                  </Typography>

                  <Chip
                    label={getComponentTypeLabel(component.type)}
                    color={getComponentTypeColor(component.type)}
                    size="small"
                    sx={{ mb: 1 }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "2.5em",
                    }}
                  >
                    {component.description || "No description available"}
                  </Typography>

                  {/* Component Details */}
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      <strong>Added:</strong>{" "}
                      {new Date(component.createdAt).toLocaleDateString()}
                    </Typography>

                    {component.imagesCount > 0 && (
                      <Typography variant="caption" color="primary.main">
                        <strong>Images:</strong> {component.imagesCount}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      <PaginationFooter
        totalPages={components.data?.totalPages || 0}
        currentPage={pageNumber}
        pageSize={pageSize}
        totalItems={components.data?.total}
        onPageChange={setPageNumber}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPageNumber(1);
        }}
        showTotalInfo={true}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Component"
        message={`Are you sure you want to delete "${deleteDialog.componentName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ open: false })}
        isLoading={operations.isDeleting}
      />
    </Box>
  );
}
