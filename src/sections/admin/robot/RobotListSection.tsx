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
  Pagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Restore as RestoreIcon,
  SmartToy as RobotIcon,
  AttachMoney as PriceIcon,
  Inventory as StockIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getRobotsThunk, deleteRobotThunk, restoreRobotThunk } from "../../../redux/robot/robotThunks";
import { clearSuccessFlags } from "../../../redux/robot/robotSlice";
import { RobotResult } from "../../../common/@types/robot";

interface RobotListSectionProps {
  onViewModeChange: (mode: "create" | "edit" | "details", robot?: RobotResult) => void;
}

export default function RobotListSection({ onViewModeChange }: RobotListSectionProps) {
  const dispatch = useAppDispatch();
  const { robots, operations } = useAppSelector((state) => state.robot);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [filterStock, setFilterStock] = useState<string>("all");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Fetch robots on component mount and when filters change
  useEffect(() => {
    const filters = {
      searchTerm: searchTerm.trim() || undefined,
      brand: filterBrand !== "all" ? filterBrand : undefined,
      inStock: filterStock === "inStock" ? true : filterStock === "outOfStock" ? false : undefined,
      includeDeleted,
      pageNumber,
      pageSize,
    };
    
    dispatch(getRobotsThunk(filters));
  }, [dispatch, searchTerm, filterBrand, filterStock, includeDeleted, pageNumber]);

  // Clear success flags after operations
  useEffect(() => {
    if (operations.deleteSuccess || operations.restoreSuccess) {
      dispatch(clearSuccessFlags());
    }
  }, [operations.deleteSuccess, operations.restoreSuccess, dispatch]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this robot product? This will soft-delete the product.")) {
      await dispatch(deleteRobotThunk(id));
    }
  };

  const handleRestore = async (id: string) => {
    if (window.confirm("Are you sure you want to restore this robot product?")) {
      await dispatch(restoreRobotThunk(id));
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPageNumber(1); // Reset to first page when searching
  };

  const handleBrandFilterChange = (brand: string) => {
    setFilterBrand(brand);
    setPageNumber(1); // Reset to first page when filtering
  };

  const robotList = robots.data?.items || [];

  // Get unique brands for filter
  const uniqueBrands = Array.from(new Set(robotList.map(robot => robot.brand))).filter(Boolean);

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return "error";
    if (stock < 10) return "warning";
    return "success";
  };

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock < 10) return "Low Stock";
    return "In Stock";
  };

  if (robots.isLoading && !robots.data) {
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
          placeholder="Search robots..."
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
          <InputLabel>Brand</InputLabel>
          <Select
            value={filterBrand}
            label="Brand"
            onChange={(e) => handleBrandFilterChange(e.target.value)}
          >
            <MenuItem value="all">All Brands</MenuItem>
            {uniqueBrands.map((brand) => (
              <MenuItem key={brand} value={brand}>
                {brand}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Stock Status</InputLabel>
          <Select
            value={filterStock}
            label="Stock Status"
            onChange={(e) => setFilterStock(e.target.value)}
          >
            <MenuItem value="all">All Products</MenuItem>
            <MenuItem value="inStock">In Stock</MenuItem>
            <MenuItem value="outOfStock">Out of Stock</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={includeDeleted ? "all" : "active"}
            label="Status"
            onChange={(e) => setIncludeDeleted(e.target.value === "all")}
          >
            <MenuItem value="active">Active Only</MenuItem>
            <MenuItem value="all">Include Deleted</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => onViewModeChange("create")}
          sx={{ ml: "auto" }}
        >
          Add Product
        </Button>
      </Box>

      {/* Success/Error Messages */}
      {operations.deleteSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Robot product deleted successfully!
        </Alert>
      )}
      
      {operations.restoreSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Robot product restored successfully!
        </Alert>
      )}
      
      {robots.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {robots.error}
        </Alert>
      )}

      {/* Results Summary */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {robots.data && `Showing ${robotList.length} of ${robots.data.total} robot products`}
      </Typography>

      {/* Robots Grid */}
      {robotList.length === 0 ? (
        <Box textAlign="center" py={8}>
          <RobotIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={2}>
            No robot products found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {searchTerm || filterBrand !== "all" || filterStock !== "all"
              ? "Try adjusting your search or filters"
              : "Add your first robot product to get started"
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onViewModeChange("create")}
          >
            Add First Product
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {robotList.map((robot) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={robot.id}>
              <Card 
                sx={{ 
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  opacity: robot.isDeleted ? 0.6 : 1,
                  "&:hover": {
                    transform: robot.isDeleted ? "none" : "translateY(-4px)",
                    boxShadow: robot.isDeleted ? 1 : 4,
                  },
                }}
              >
                {/* Product Image */}
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
                  onClick={() => onViewModeChange("details", robot)}
                >
                  {/* Actual Image Element */}
                  {robot.imageUrl && (
                    <Box
                      component="img"
                      src={robot.imageUrl}
                      alt={`${robot.name} - ${robot.brand}`}
                      sx={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                        objectFit: "contain",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: robot.isDeleted ? "none" : "scale(1.05)",
                        },
                      }}
                      onError={(e) => {
                        // Hide broken image and show fallback
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  {/* Price Tag */}
                  <Chip
                    label={`$${robot.price.toFixed(2)}`}
                    color="primary"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      fontWeight: "bold",
                    }}
                  />

                  {/* Stock Status */}
                  <Chip
                    label={getStockStatusText(robot.stockQuantity)}
                    color={getStockStatusColor(robot.stockQuantity)}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                    }}
                  />

                  {/* Deleted Status */}
                  {robot.isDeleted && (
                    <Chip
                      label="DELETED"
                      color="error"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 42,
                        right: 8,
                      }}
                    />
                  )}
                  
                  {/* Action Buttons */}
                  {!robot.isDeleted && (
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
                        sx={{ backgroundColor: "background.paper", "&:hover": { backgroundColor: "grey.100" } }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewModeChange("details", robot);
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ backgroundColor: "background.paper", "&:hover": { backgroundColor: "grey.100" } }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewModeChange("edit", robot);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        sx={{ backgroundColor: "background.paper", "&:hover": { backgroundColor: "error.light", color: "white" } }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(robot.id);
                        }}
                        disabled={operations.isDeleting}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {/* Restore Button for Deleted Products */}
                  {robot.isDeleted && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                      }}
                    >
                      <IconButton
                        size="small"
                        color="success"
                        sx={{ backgroundColor: "background.paper", "&:hover": { backgroundColor: "success.light", color: "white" } }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(robot.id);
                        }}
                        disabled={operations.isRestoring}
                      >
                        <RestoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {/* Default Robot Icon if no image */}
                  {!robot.imageUrl && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <Avatar sx={{ width: 60, height: 60, backgroundColor: "primary.main" }}>
                        <RobotIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                    </Box>
                  )}
                </Box>

                {/* Product Info */}
                <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                  <Typography variant="h6" noWrap sx={{ mb: 1 }}>
                    {robot.name}
                  </Typography>
                  
                  <Typography variant="body2" color="primary.main" noWrap sx={{ mb: 1 }}>
                    {robot.brand} - {robot.model}
                  </Typography>
                  
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
                    {robot.description || "No description available"}
                  </Typography>

                  {/* Product Details */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <PriceIcon fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight="medium">
                        ${robot.price.toFixed(2)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <StockIcon fontSize="small" color={getStockStatusColor(robot.stockQuantity)} />
                      <Typography variant="body2">
                        {robot.stockQuantity} units
                      </Typography>
                      <Chip 
                        label={getStockStatusText(robot.stockQuantity)}
                        color={getStockStatusColor(robot.stockQuantity)}
                        size="small"
                        sx={{ ml: 0.5, height: 16, fontSize: "0.7rem" }}
                      />
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      <strong>Age:</strong> {robot.minAge}-{robot.maxAge} years
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      <strong>Status:</strong> 
                      <Chip 
                        label={robot.isDeleted ? "Deleted" : "Active"}
                        color={robot.isDeleted ? "error" : "success"}
                        size="small"
                        sx={{ ml: 0.5, height: 16, fontSize: "0.7rem" }}
                      />
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      <strong>Added:</strong> {new Date(robot.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {robots.data?.totalPages ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
            p: 2,
          }}
        >
          <FormControl size="small">
            <InputLabel>Page Size</InputLabel>
            <Select
              label="Page Size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageNumber(1);
              }}
              sx={{ minWidth: 120 }}
            >
              {[6, 12, 24, 48].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Pagination
            count={robots.data.totalPages}
            page={pageNumber}
            onChange={(_, v) => setPageNumber(v)}
            shape="rounded"
            color="primary"
          />
        </Box>
      ) : null}
    </Box>
  );
}
