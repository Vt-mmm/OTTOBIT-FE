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
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import {
  getImagesThunk,
  deleteImageThunk,
} from "../../../redux/image/imageThunks";
import { clearSuccessFlags } from "../../../redux/image/imageSlice";
import { ImageResult } from "../../../common/@types/image";

interface ImageListSectionProps {
  onViewModeChange: (
    mode: "create" | "edit" | "details",
    image?: ImageResult
  ) => void;
  /** Robot ID to filter images */
  robotId?: string;
  /** Component ID to filter images - Removed */
  // componentId?: string;
  /** Allow creation of new images */
  allowCreate?: boolean;
  /** Allow editing of existing images */
  allowEdit?: boolean;
  /** Allow deletion of images */
  allowDelete?: boolean;
}

export default function ImageListSection({
  onViewModeChange,
  robotId,
  // componentId,
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
}: ImageListSectionProps) {
  const dispatch = useAppDispatch();
  const { images, operations } = useAppSelector((state) => state.image);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState(0); // 0: All, 1: Robot, 2: Component
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Fetch images on component mount and when filters change
  useEffect(() => {
    const filters = {
      pageNumber,
      pageSize,
      // If we're filtering by specific robot, send that to backend
      ...(robotId && { robotId }),
    };

    dispatch(getImagesThunk(filters));
  }, [dispatch, pageNumber, robotId]);

  // Clear success flags after operations
  useEffect(() => {
    if (operations.deleteSuccess) {
      dispatch(clearSuccessFlags());
    }
  }, [operations.deleteSuccess, dispatch]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      await dispatch(deleteImageThunk(id));
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setPageNumber(1); // Reset to first page when changing tabs
  };

  // Filter images based on current tab and search term
  const getFilteredImages = () => {
    const allImages = images.data?.items || [];

    // If we're filtering by specific robot, skip tab filtering
    let tabFiltered;
    if (robotId) {
      // Backend already filtered by robotId, use all returned images
      tabFiltered = allImages;
    } else {
      // Filter by tab when in general image management
      switch (currentTab) {
        case 1: // Robot Images
          tabFiltered = allImages.filter((image) => image.robotId);
          break;
        case 2: // Component Images - Removed
          tabFiltered = allImages;
          break;
        default: // All Images
          tabFiltered = allImages;
      }
    }

    // Then filter by search term if provided
    if (!searchTerm.trim()) {
      return tabFiltered;
    }

    const search = searchTerm.toLowerCase();
    return tabFiltered.filter(
      (image) =>
        image.id.toLowerCase().includes(search) ||
        image.robot?.name.toLowerCase().includes(search) ||
        image.url.toLowerCase().includes(search)
    );
  };

  const filteredImages = getFilteredImages();

  // Get counts for tabs
  const allImages = images.data?.items || [];
  const robotImagesCount = allImages.filter((image) => image.robotId).length;

  const getImageCategory = (image: ImageResult) => {
    if (image.robotId) return "Robot";
    // Component relation removed
    return "General";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Robot":
        return "primary";
      case "Component":
        return "secondary";
      default:
        return "default";
    }
  };

  if (images.isLoading && !images.data) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <TextField
          placeholder="Search images..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />

        {allowCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onViewModeChange("create")}
            sx={{ ml: 2 }}
          >
            Upload Image
          </Button>
        )}
      </Box>

      {/* Filter Tabs - Only show when not filtering by specific robot */}
      {!robotId && (
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label={`All Images (${images.data?.total || 0})`} />
            <Tab label={`Robot Images (${robotImagesCount})`} />
          </Tabs>
        </Box>
      )}

      {/* Success/Error Messages */}
      {operations.deleteSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Image deleted successfully!
        </Alert>
      )}

      {images.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {images.error}
        </Alert>
      )}

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            {searchTerm.trim()
              ? "No images match your search"
              : "No images found"}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {searchTerm.trim()
              ? `Try adjusting your search term "${searchTerm}"`
              : robotId
              ? "This robot has no images yet. Upload images to get started."
              : currentTab === 0
              ? "Upload your first image to get started"
              : currentTab === 1
              ? "No robot images found. Upload images via Robot Management or assign existing images to robots."
              : "No component images found. Upload images via Component Management or assign existing images to components."}
          </Typography>
          {!searchTerm.trim() && allowCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => onViewModeChange("create")}
            >
              {robotId
                ? "Upload Robot Images"
                : "Upload First Image"}
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredImages.map((image) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
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
                {/* Image Display */}
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
                  onClick={() => onViewModeChange("details", image)}
                >
                  {/* Actual Image Element */}
                  <Box
                    component="img"
                    src={image.url}
                    alt={`Image ${image.id}`}
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
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.style.backgroundImage = 'none';
                        parent.innerHTML += '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; flex-direction: column;"><span>📷</span><span style="font-size: 12px; margin-top: 4px;">Failed to load</span></div>';
                      }
                    }}
                  />
                  {/* Category Chip */}
                  <Chip
                    label={getImageCategory(image)}
                    color={getCategoryColor(getImageCategory(image))}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                    }}
                  />

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
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
                        onViewModeChange("details", image);
                      }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    {allowEdit && (
                      <IconButton
                        size="small"
                        sx={{
                          backgroundColor: "background.paper",
                          "&:hover": { backgroundColor: "grey.100" },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewModeChange("edit", image);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {allowDelete && (
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
                          handleDelete(image.id);
                        }}
                        disabled={operations.isDeleting}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                {/* Image Info */}
                <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    ID: {image.id.slice(0, 8)}...
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {new Date(image.createdAt).toLocaleDateString()}
                  </Typography>

                  {/* Related Entity Info */}
                  {image.robot && (
                    <Typography
                      variant="body2"
                      color="primary.main"
                      sx={{ mt: 0.5 }}
                    >
                      Robot: {image.robot.name}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {images.data?.totalPages ? (
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
            count={images.data.totalPages}
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
