import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  InputAdornment,
  Alert,
  Pagination,
  Paper,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { getComponentsThunk } from "store/component/componentThunks";
import { useNavigate } from "react-router-dom";
import { PATH_PUBLIC, PATH_USER } from "routes/paths";
import ProductCard from "components/store/ProductCard";
import { ComponentType } from "common/@types/component";

export default function ComponentListingSection() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { components } = useAppSelector((state) => state.component);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ComponentType | "all">("all");
  const [filterStock, setFilterStock] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Fetch components
  useEffect(() => {
    const filters = {
      page: pageNumber,
      size: pageSize,
      searchTerm: searchTerm.trim() || undefined,
      type: filterType !== "all" ? filterType : undefined,
      inStock: filterStock === "inStock" ? true : filterStock === "outOfStock" ? false : undefined,
      orderBy: "CreatedAt",
      orderDirection: "DESC" as const,
    };

    dispatch(getComponentsThunk(filters));
  }, [dispatch, searchTerm, filterType, filterStock, pageNumber, pageSize]);

  const handleComponentClick = (componentId: string) => {
    const path = isAuthenticated
      ? PATH_USER.componentDetail.replace(":id", componentId)
      : PATH_PUBLIC.componentDetail.replace(":id", componentId);
    navigate(path);
  };

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

  const componentList = components.data?.items || [];

  if (components.isLoading && !components.data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "white", minHeight: "100vh" }}>
      {/* Filters Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: "white", border: "1px solid #e0e0e0" }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPageNumber(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => {
                  setFilterType(e.target.value as ComponentType | "all");
                  setPageNumber(1);
                }}
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
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Stock Status</InputLabel>
              <Select
                value={filterStock}
                label="Stock Status"
                onChange={(e) => {
                  setFilterStock(e.target.value);
                  setPageNumber(1);
                }}
              >
                <MenuItem value="all">All Items</MenuItem>
                <MenuItem value="inStock">In Stock</MenuItem>
                <MenuItem value="outOfStock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Per Page</InputLabel>
              <Select
                value={pageSize}
                label="Per Page"
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageNumber(1);
                }}
              >
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={24}>24</MenuItem>
                <MenuItem value={36}>36</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Info */}
      {components.data && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Showing {componentList.length} of {components.data.total} components
          {searchTerm && ` for "${searchTerm}"`}
          {filterType !== "all" && ` • Type: ${getComponentTypeLabel(filterType)}`}
          {filterStock !== "all" && ` • Stock: ${filterStock}`}
        </Typography>
      )}

      {/* Error State */}
      {components.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {components.error}
        </Alert>
      )}

      {/* Loading State */}
      {components.isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Products Grid */}
      {!components.isLoading && componentList.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No components found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || filterType !== "all" || filterStock !== "all"
              ? "Try adjusting your search or filters"
              : "No components available at the moment"}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {componentList.map((component) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={component.id}>
              <ProductCard
                id={component.id}
                name={component.name}
                imageUrl={component.imageUrl}
                description={component.description}
                onClick={() => handleComponentClick(component.id)}
                type="component"
                componentType={component.type}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {components.data?.totalPages && components.data.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <Pagination
            count={components.data.totalPages}
            page={pageNumber}
            onChange={(_, value) => setPageNumber(value)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}