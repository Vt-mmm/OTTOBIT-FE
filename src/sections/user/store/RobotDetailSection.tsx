import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  FavoriteBorder as FavoriteIcon,
  Share as ShareIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import { getRobotByIdThunk } from "store/robot/robotThunks";
import { getImagesThunk } from "store/image/imageThunks";
import { PATH_PUBLIC, PATH_USER } from "routes/paths";
import RobotBOMSection from "sections/user/robot/RobotBOMSection";

interface RobotDetailSectionProps {
  robotId: string;
}

export default function RobotDetailSection({
  robotId,
}: RobotDetailSectionProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentRobot } = useAppSelector((state) => state.robot);
  const { data: robotData, isLoading, error } = currentRobot;
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { images } = useAppSelector((state) => state.image);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (robotId) {
      dispatch(getRobotByIdThunk(robotId));
      // Fetch gallery images for this robot
      dispatch(
        getImagesThunk({
          robotId: robotId,
          pageNumber: 1,
          pageSize: 20,
        })
      );
    }
  }, [dispatch, robotId]);

  const handleBack = () => {
    const path = isAuthenticated ? PATH_USER.robots : PATH_PUBLIC.robots;
    navigate(path);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !robotData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || "Robot not found"}
        </Alert>
      </Container>
    );
  }

  // Combine main image + gallery images
  const galleryImages = [];

  // Add main image first (if exists)
  if (robotData.imageUrl) {
    galleryImages.push({
      url: robotData.imageUrl,
      isMain: true,
    });
  }

  // Add gallery images from Image table
  if (images.data?.items && images.data.items.length > 0) {
    images.data.items.forEach((img) => {
      galleryImages.push({
        url: img.url,
        isMain: false,
      });
    });
  }

  // Current selected image URL
  const currentImageUrl =
    galleryImages[selectedImage]?.url || robotData.imageUrl;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3, fontSize: "0.875rem" }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate(isAuthenticated ? PATH_USER.store : PATH_PUBLIC.store);
          }}
          sx={{
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Home
        </Link>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleBack();
          }}
          sx={{
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Robots
        </Link>
        <Typography color="text.primary" fontSize="0.875rem">
          {robotData.name}
        </Typography>
      </Breadcrumbs>

      {/* Main Product Section */}
      <Box
        sx={{
          display: "flex",
          gap: 6,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Left Side - Image Gallery */}
        <Box sx={{ flex: 1, maxWidth: { md: "50%" } }}>
          <Box sx={{ position: "relative" }}>
            {/* Main Image */}
            <Box
              sx={{
                bgcolor: "grey.50",
                borderRadius: 2,
                height: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                position: "relative",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              {currentImageUrl ? (
                <Box
                  component="img"
                  src={currentImageUrl}
                  alt={robotData.name}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    transition: "opacity 0.3s ease-in-out",
                  }}
                />
              ) : (
                <Typography variant="h1" sx={{ fontSize: "8rem" }}>
                  🤖
                </Typography>
              )}
            </Box>

            {/* Thumbnail Gallery */}
            {galleryImages.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                {galleryImages.map((image, index) => (
                  <Box
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    sx={{
                      width: 80,
                      height: 80,
                      border: selectedImage === index ? 2 : 1,
                      borderColor:
                        selectedImage === index ? "primary.main" : "grey.300",
                      borderRadius: 1,
                      cursor: "pointer",
                      overflow: "hidden",
                      bgcolor: "grey.50",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={image.url}
                      alt={`${robotData.name} ${index + 1}`}
                      sx={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                    {/* Main image badge */}
                    {image.isMain && (
                      <Chip
                        label="Main"
                        size="small"
                        color="primary"
                        sx={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          height: 16,
                          fontSize: "0.65rem",
                          "& .MuiChip-label": {
                            px: 0.5,
                          },
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Right Side - Product Info */}
        <Box sx={{ flex: 1 }}>
          {/* Title & Rating */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {robotData.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography variant="subtitle1" color="text.secondary">
                {robotData.brand} • {robotData.model}
              </Typography>
              <Chip
                label="Best Seller"
                size="small"
                sx={{
                  bgcolor: "success.light",
                  color: "success.dark",
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>

          {/* Note: Price removed from Robot entity */}

          <Divider sx={{ my: 3 }} />

          {/* Age Range */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Age Range
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                label={`${robotData.minAge} - ${robotData.maxAge} tuổi`}
                variant="outlined"
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "primary.50",
                  },
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Quantity */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Quantity
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  border: 1,
                  borderColor: "grey.300",
                  borderRadius: 1,
                }}
              >
                <IconButton
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  sx={{ borderRadius: 0 }}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography
                  sx={{
                    px: 3,
                    minWidth: 60,
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  {quantity}
                </Typography>
                <IconButton
                  onClick={() => handleQuantityChange(1)}
                  sx={{ borderRadius: 0 }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Product Description */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Product Description
            </Typography>
            <Typography
              variant="body1"
              sx={{ lineHeight: 1.8, color: "text.secondary" }}
            >
              {robotData.description || "No description available"}
            </Typography>
          </Box>

          {/* Key Features */}
          {robotData.technicalSpecs && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Key Features
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {robotData.technicalSpecs
                  .split("\n")
                  .filter(Boolean)
                  .slice(0, 5)
                  .map((spec, idx) => (
                    <Typography
                      key={idx}
                      component="li"
                      variant="body2"
                      sx={{ mb: 1, color: "text.secondary" }}
                    >
                      {spec}
                    </Typography>
                  ))}
              </Box>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Add to Cart
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Buy Now
            </Button>
          </Box>

          {/* Secondary Actions */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="text"
              startIcon={<NotificationsIcon />}
              sx={{ textTransform: "none", color: "text.secondary" }}
            >
              Get Price Drop Alert
            </Button>
            <IconButton>
              <FavoriteIcon />
            </IconButton>
            <IconButton>
              <ShareIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Technical Specifications Section */}
      {robotData.technicalSpecs && (
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            Technical Specifications
          </Typography>
          <Box
            sx={{
              bgcolor: "grey.50",
              borderRadius: 2,
              p: 4,
            }}
          >
            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}
            >
              {robotData.technicalSpecs}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Requirements Section */}
      {robotData.requirements && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            Requirements
          </Typography>
          <Box
            sx={{
              bgcolor: "grey.50",
              borderRadius: 2,
              p: 4,
            }}
          >
            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}
            >
              {robotData.requirements}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Bill of Materials (BOM) Section */}
      <Box sx={{ mt: 6 }}>
        <RobotBOMSection robotId={robotId} robotName={robotData.name} />
      </Box>
    </Container>
  );
}
