import { useEffect, useState, useRef } from "react";
import {
  Box,
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
  Slider,
  Divider,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { getRobotsThunk } from "store/robot/robotThunks";
import { GetRobotsRequest } from "common/@types/robot";
import { useNavigate } from "react-router-dom";
import { PATH_PUBLIC, PATH_USER } from "routes/paths";
import ProductCard from "components/store/ProductCard";
import { formatVNDNumber } from "utils/utils";

export default function RobotListingSection() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { robots } = useAppSelector((state) => state.robot);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  // Price in VND - range from 0 to 50,000,000 VND (default max)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  // Age range from 1 to 99 years old
  const [ageRange, setAgeRange] = useState<[number, number]>([1, 99]);
  const [applyPriceFilter, setApplyPriceFilter] = useState(false);
  const [applyAgeFilter, setApplyAgeFilter] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch robots with debounce for slider changes
  useEffect(() => {
    const filters: GetRobotsRequest = {
      searchTerm: searchTerm.trim() || undefined,
      brand: filterBrand !== "all" ? filterBrand : undefined,
      // inStock filter removed - no stock data available
      // Price filter removed - no pricing data in backend
      // Only apply age filter if user has interacted with it
      minAge: applyAgeFilter && ageRange[0] > 1 ? ageRange[0] : undefined,
      maxAge: applyAgeFilter && ageRange[1] < 99 ? ageRange[1] : undefined,
      pageNumber,
      pageSize,
    };

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Use debounce for price and age range changes (500ms delay)
    if (applyPriceFilter || applyAgeFilter) {
      debounceTimer.current = setTimeout(() => {
        dispatch(getRobotsThunk(filters));
      }, 500);
    } else {
      // Immediate fetch for other filters
      dispatch(getRobotsThunk(filters));
    }

    // Cleanup on unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [
    dispatch,
    searchTerm,
    filterBrand,
    filterStock,
    priceRange,
    ageRange,
    applyPriceFilter,
    applyAgeFilter,
    pageNumber,
    pageSize,
  ]);

  const handleRobotClick = (robotId: string) => {
    const path = isAuthenticated
      ? PATH_USER.robotDetail.replace(":id", robotId)
      : PATH_PUBLIC.robotDetail.replace(":id", robotId);
    navigate(path);
  };

  const robotList = robots.data?.items || [];
  const uniqueBrands = Array.from(
    new Set(robotList.map((robot) => robot.brand))
  ).filter(Boolean);

  if (robots.isLoading && !robots.data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
        p: 3,
      }}
    >
      {/* Sidebar Filter */}
      <Box
        sx={{
          width: 280,
          flexShrink: 0,
          bgcolor: "white",
          borderRadius: 2,
          p: 3,
          height: "fit-content",
          position: "sticky",
          top: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Category
        </Typography>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search robots"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageNumber(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Filter by Price */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Filter by :
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5, color: "text.secondary" }}>
            Price
          </Typography>
          <Box sx={{ px: 1 }}>
            <Slider
              value={priceRange}
              onChange={(_, newValue) => {
                setPriceRange(newValue as [number, number]);
                setApplyPriceFilter(true);
                setPageNumber(1);
              }}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${formatVNDNumber(value)} đ`}
              min={0}
              max={50000000}
              step={500000}
              sx={{
                "& .MuiSlider-thumb": {
                  width: 16,
                  height: 16,
                },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {formatVNDNumber(priceRange[0])} đ
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatVNDNumber(priceRange[1])} đ
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Brand Filter */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Brand
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filterBrand}
              onChange={(e) => {
                setFilterBrand(e.target.value);
                setPageNumber(1);
              }}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="all">All Brands</MenuItem>
              {uniqueBrands.map((brand) => (
                <MenuItem key={brand} value={brand}>
                  {brand}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Stock Status */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Stock Status
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filterStock}
              onChange={(e) => {
                setFilterStock(e.target.value);
                setPageNumber(1);
              }}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="all">All Products</MenuItem>
              <MenuItem value="inStock">In Stock</MenuItem>
              <MenuItem value="outOfStock">Out of Stock</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Age Range */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Age Range
          </Typography>
          <Box sx={{ px: 1 }}>
            <Slider
              value={ageRange}
              onChange={(_, newValue) => {
                setAgeRange(newValue as [number, number]);
                setApplyAgeFilter(true);
                setPageNumber(1);
              }}
              valueLabelDisplay="auto"
              min={1}
              max={99}
              step={1}
              marks={[
                { value: 1, label: "1" },
                { value: 25, label: "25" },
                { value: 50, label: "50" },
                { value: 75, label: "75" },
                { value: 99, label: "99" },
              ]}
              sx={{
                "& .MuiSlider-thumb": {
                  width: 16,
                  height: 16,
                },
                "& .MuiSlider-mark": {
                  display: "none",
                },
                "& .MuiSlider-markLabel": {
                  fontSize: "0.7rem",
                },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {ageRange[0]} tuổi
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {ageRange[1]} tuổi
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar with Results Info */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            bgcolor: "white",
            p: 2,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Box>
            {robots.data && (
              <Typography variant="body2" color="text.secondary">
                Showing{" "}
                <Typography component="span" fontWeight={600}>
                  {robotList.length}
                </Typography>{" "}
                of{" "}
                <Typography component="span" fontWeight={600}>
                  {robots.data.total}
                </Typography>{" "}
                robots
              </Typography>
            )}
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Per Page</InputLabel>
            <Select
              value={pageSize}
              label="Per Page"
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageNumber(1);
              }}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value={12}>12</MenuItem>
              <MenuItem value={24}>24</MenuItem>
              <MenuItem value={36}>36</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Error State */}
        {robots.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {robots.error}
          </Alert>
        )}

        {/* Products Grid with Overlay Loading */}
        <Box sx={{ position: "relative", minHeight: 400 }}>
          {/* Loading Overlay */}
          {robots.isLoading && robots.data && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(2px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
                borderRadius: 2,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <CircularProgress size={40} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading...
                </Typography>
              </Box>
            </Box>
          )}

          {/* Empty State - No Results */}
          {!robots.isLoading && robotList.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 10,
                bgcolor: "white",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No robots found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || filterBrand !== "all" || filterStock !== "all"
                  ? "Try adjusting your search or filters"
                  : "No robots available at the moment"}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 3,
                opacity: robots.isLoading && robots.data ? 0.6 : 1,
                transition: "opacity 0.2s ease",
              }}
            >
              {robotList.map((robot) => (
                <ProductCard
                  key={robot.id}
                  id={robot.id}
                  name={robot.name}
                  imageUrl={robot.imageUrl}
                  description={robot.description}
                  onClick={() => handleRobotClick(robot.id)}
                  type="robot"
                  brand={robot.brand}
                  model={robot.model}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Pagination */}
        {robots.data?.totalPages && robots.data.totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 4,
              bgcolor: "white",
              p: 2,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Pagination
              count={robots.data.totalPages}
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
    </Box>
  );
}
