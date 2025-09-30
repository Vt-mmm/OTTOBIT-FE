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
  SmartToy as RobotIcon,
  AttachMoney as PriceIcon,
  Inventory as StockIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getRobotsThunk, deleteRobotThunk } from "../../../redux/robot/robotThunks";
import { clearSuccessFlags } from "../../../redux/robot/robotSlice";
import { RobotResult } from "../../../common/@types/robot";
import ConfirmDialog from "components/common/ConfirmDialog";
import { formatVND } from "../../../utils/utils";

interface RobotListSectionProps {
  onViewModeChange: (mode: "create" | "edit" | "details", robot?: RobotResult) => void;
}

export default function RobotListSection({ onViewModeChange }: RobotListSectionProps) {
  const dispatch = useAppDispatch();
  const { robots, operations } = useAppSelector((state) => state.robot);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [filterStock, setFilterStock] = useState<string>("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  
  // Dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; robotId?: string; robotName?: string }>({ open: false });

  // Fetch robots on component mount and when filters change
  useEffect(() => {
    const filters = {
      searchTerm: searchTerm.trim() || undefined,
      brand: filterBrand !== "all" ? filterBrand : undefined,
      inStock: filterStock === "inStock" ? true : filterStock === "outOfStock" ? false : undefined,
      pageNumber,
      pageSize,
    };
    
    dispatch(getRobotsThunk(filters));
  }, [dispatch, searchTerm, filterBrand, filterStock, pageNumber]);

  // Clear success flags after operations
  useEffect(() => {
    if (operations.deleteSuccess) {
      dispatch(clearSuccessFlags());
    }
  }, [operations.deleteSuccess, dispatch]);

  const handleDeleteClick = (robot: RobotResult) => {
    setDeleteDialog({
      open: true,
      robotId: robot.id,
      robotName: robot.name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.robotId) {
      await dispatch(deleteRobotThunk(deleteDialog.robotId));
      setDeleteDialog({ open: false });
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

  const getStockStatusColor = (stock: number): "default" | "primary" | "secondary" | "success" | "warning" | "info" | "error" => {
    if (stock === 0) return "error";
    if (stock < 10) return "warning";
    return "success";
  };

  const getStockStatusIconColor = (stock: number): "disabled" | "action" | "inherit" | "error" | "success" | "info" | "warning" | "primary" | "secondary" => {
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
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
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
                          transform: "scale(1.05)",
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
                    label={formatVND(robot.price)}
                    color="primary"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      fontWeight: "bold",
                      fontSize: "0.7rem",
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
                        handleDeleteClick(robot);
                      }}
                      disabled={operations.isDeleting}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

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
                        {formatVND(robot.price)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <StockIcon fontSize="small" color={getStockStatusIconColor(robot.stockQuantity)} />
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
                      <strong>Age:</strong> {robot.minAge}-{robot.maxAge} tuổi
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      <strong>Status:</strong> 
                      <Chip 
                        label="Active"
                        color="success"
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
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Robot Product"
        message={`Are you sure you want to delete "${deleteDialog.robotName}"? This action cannot be undone.`}
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
