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
import { PATH_PUBLIC, PATH_USER } from "routes/paths";
import { formatVND } from "utils/utils";

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

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (robotId) {
      dispatch(getRobotByIdThunk(robotId));
    }
  }, [dispatch, robotId]);

  const handleBack = () => {
    const path = isAuthenticated ? PATH_USER.robots : PATH_PUBLIC.robots;
    navigate(path);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) =>
      Math.max(1, Math.min(prev + delta, robotData?.stockQuantity || 1))
    );
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

  // Thumbnail images - in real app this would come from robotData.images
  const thumbnails = robotData.imageUrl ? [robotData.imageUrl] : [];

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
              }}
            >
              {robotData.imageUrl ? (
                <Box
                  component="img"
                  src={robotData.imageUrl}
                  alt={robotData.name}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Typography variant="h1" sx={{ fontSize: "8rem" }}>
                  🤖
                </Typography>
              )}
            </Box>

            {/* Thumbnail Gallery */}
            {thumbnails.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {thumbnails.map((thumb, index) => (
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
                      "&:hover": {
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={thumb}
                      alt={`${robotData.name} ${index + 1}`}
                      sx={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
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
                label={
                  robotData.stockQuantity > 500 ? "Sold 500+" : "Best Seller"
                }
                size="small"
                sx={{
                  bgcolor: "success.light",
                  color: "success.dark",
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>

          {/* Price */}
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 3, color: "text.primary" }}
          >
            {formatVND(robotData.price)}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            (or starting from {formatVND(Math.round(robotData.price / 12))}
            /month with 0% installment)
          </Typography>

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
                  disabled={quantity >= robotData.stockQuantity}
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

          {/* Availability */}
          <Box sx={{ mb: 4, p: 2, bgcolor: "success.50", borderRadius: 1 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "success.dark" }}
            >
              {robotData.stockQuantity > 0 ? "In Stock" : "Out of Stock"} —{" "}
              {robotData.stockQuantity > 0
                ? `Ships in 1-2 business days (${robotData.stockQuantity} units available)`
                : "Currently unavailable"}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={robotData.stockQuantity === 0}
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
    </Container>
  );
}
