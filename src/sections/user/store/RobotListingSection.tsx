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
import useLocales from "hooks/useLocales";

export default function RobotListingSection() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { robots } = useAppSelector((state) => state.robot);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { translate } = useLocales();

  const [searchTerm, setSearchTerm] = useState("");
  // Age range from 1 to 99 years old
  const [ageRange, setAgeRange] = useState<[number, number]>([1, 99]);
  const [applyAgeFilter, setApplyAgeFilter] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch robots with debounce for slider changes
  useEffect(() => {
    const filters: GetRobotsRequest = {
      searchTerm: searchTerm.trim() || undefined,
      // inStock filter removed - no stock data available
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

    // Use debounce for age range changes (500ms delay)
    if (applyAgeFilter) {
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
    ageRange,
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
        flexDirection: { xs: "column", lg: "row" },
        gap: { xs: 2, sm: 3 },
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
        p: { xs: 0, sm: 2, md: 3 },
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {/* Sidebar Filter - Hidden on mobile */}
      <Box
        sx={{
          display: { xs: "none", lg: "block" },
          width: { lg: 280, xl: 300 },
          flexShrink: 0,
          bgcolor: "white",
          borderRadius: 2,
          p: { lg: 2.5, xl: 3 },
          height: "fit-content",
          position: "sticky",
          top: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 600,
            fontSize: { lg: "1.125rem", xl: "1.25rem" },
          }}
        >
          {translate('store.Category')}
        </Typography>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={translate('store.SearchRobots')}
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

        {/* Age Range */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            {translate('store.AgeRange')}
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
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
            >
              <Typography variant="caption" color="text.secondary">
                {ageRange[0]} {translate('store.Years')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {ageRange[1]} {translate('store.Years')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        {/* Top Bar with Results Info */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1.5, sm: 0 },
            mb: { xs: 2, sm: 3 },
            bgcolor: "white",
            p: { xs: 2, sm: 2, md: 2.5 },
            borderRadius: { xs: 0, sm: 2 },
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Box>
            {robots.data && (
              <Typography variant="body2" color="text.secondary">
                {translate('store.Showing')}{" "}
                <Typography component="span" fontWeight={600}>
                  {robotList.length}
                </Typography>{" "}
                {translate('store.Of')}{" "}
                <Typography component="span" fontWeight={600}>
                  {robots.data.total}
                </Typography>{" "}
                {translate('store.Robots')}
              </Typography>
            )}
          </Box>
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 120 } }}>
            <InputLabel>{translate('store.PerPage')}</InputLabel>
            <Select
              value={pageSize}
              label={translate('store.PerPage')}
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  {translate('store.Loading')}
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
                {translate('store.NoRobotsFound')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm
                  ? translate('store.TryAdjustingFilters')
                  : translate('store.NoRobotsAvailable')}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                  xl: "repeat(4, 1fr)",
                },
                gap: { xs: 2, sm: 2.5, md: 3 },
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
              mt: { xs: 3, sm: 4 },
              bgcolor: "white",
              p: { xs: 1.5, sm: 2 },
              borderRadius: { xs: 0, sm: 2 },
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Pagination
              count={robots.data.totalPages}
              page={pageNumber}
              onChange={(_, value) => setPageNumber(value)}
              color="primary"
              size={{ xs: "medium", sm: "large" } as any}
              showFirstButton={{ xs: false, sm: true } as any}
              showLastButton={{ xs: false, sm: true } as any}
              siblingCount={{ xs: 0, sm: 1 } as any}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
