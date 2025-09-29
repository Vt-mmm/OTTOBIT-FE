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
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getImagesThunk, deleteImageThunk } from "../../../redux/image/imageThunks";
import { clearSuccessFlags } from "../../../redux/image/imageSlice";
import { ImageResult } from "../../../common/@types/image";

interface ImageListSectionProps {
  onViewModeChange: (mode: "create" | "edit" | "details", image?: ImageResult) => void;
}

export default function ImageListSection({ onViewModeChange }: ImageListSectionProps) {
  const dispatch = useAppDispatch();
  const { images, operations } = useAppSelector((state) => state.image);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState(0); // 0: All, 1: Robot, 2: Component
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 12;

  // Fetch images on component mount and when filters change
  useEffect(() => {
    const filters = {
      pageNumber,
      pageSize,
      // Don't send robotId or componentId filters - let frontend filter instead
      // Backend expects valid GUIDs, not wildcards
    };
    
    dispatch(getImagesThunk(filters));
  }, [dispatch, pageNumber]);

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
    
    // First filter by tab
    let tabFiltered;
    switch (currentTab) {
      case 1: // Robot Images
        tabFiltered = allImages.filter(image => image.robotId);
        break;
      case 2: // Component Images  
        tabFiltered = allImages.filter(image => image.componentId);
        break;
      default: // All Images
        tabFiltered = allImages;
    }

    // Then filter by search term if provided
    if (!searchTerm.trim()) {
      return tabFiltered;
    }

    const search = searchTerm.toLowerCase();
    return tabFiltered.filter(image => 
      image.id.toLowerCase().includes(search) ||
      image.robot?.name.toLowerCase().includes(search) ||
      image.component?.name.toLowerCase().includes(search) ||
      image.url.toLowerCase().includes(search)
    );
  };

  const filteredImages = getFilteredImages();

  // Get counts for tabs
  const allImages = images.data?.items || [];
  const robotImagesCount = allImages.filter(image => image.robotId).length;
  const componentImagesCount = allImages.filter(image => image.componentId).length;

  const getImageCategory = (image: ImageResult) => {
    if (image.robotId) return "Robot";
    if (image.componentId) return "Component";
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
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => onViewModeChange("create")}
          sx={{ ml: 2 }}
        >
          Upload Image
        </Button>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label={`All Images (${images.data?.total || 0})`} />
          <Tab label={`Robot Images (${robotImagesCount})`} />
          <Tab label={`Component Images (${componentImagesCount})`} />
        </Tabs>
      </Box>

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
            {searchTerm.trim() ? "No images match your search" : "No images found"}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {searchTerm.trim() 
              ? `Try adjusting your search term "${searchTerm}"`
              : currentTab === 0 ? "Upload your first image to get started"
              : currentTab === 1 ? "No robot images found. Upload images via Robot Management or assign existing images to robots."
              : "No component images found. Upload images via Component Management or assign existing images to components."
            }
          </Typography>
          {!searchTerm.trim() && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => onViewModeChange("create")}
            >
              Upload First Image
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
                    paddingTop: "60%", // 5:3 aspect ratio
                    backgroundImage: `url(${image.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: "grey.100",
                    cursor: "pointer",
                  }}
                  onClick={() => onViewModeChange("details", image)}
                >
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
                      sx={{ backgroundColor: "background.paper", "&:hover": { backgroundColor: "grey.100" } }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewModeChange("details", image);
                      }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ backgroundColor: "background.paper", "&:hover": { backgroundColor: "grey.100" } }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewModeChange("edit", image);
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
                        handleDelete(image.id);
                      }}
                      disabled={operations.isDeleting}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Image Info */}
                <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    ID: {image.id.slice(0, 8)}...
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {new Date(image.createdAt).toLocaleDateString()}
                  </Typography>
                  
                  {/* Related Entity Info */}
                  {image.robot && (
                    <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
                      Robot: {image.robot.name}
                    </Typography>
                  )}
                  {image.component && (
                    <Typography variant="body2" color="secondary.main" sx={{ mt: 0.5 }}>
                      Component: {image.component.name}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Load More Button */}
      {images.data && images.data.totalPages > pageNumber && (
        <Box textAlign="center" mt={4}>
          <Button
            variant="outlined"
            onClick={() => setPageNumber(prev => prev + 1)}
            disabled={images.isLoading}
          >
            {images.isLoading ? <CircularProgress size={20} /> : "Load More"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
