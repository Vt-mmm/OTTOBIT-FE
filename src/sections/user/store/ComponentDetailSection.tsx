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
import { getComponentByIdThunk } from "store/component/componentThunks";
import { PATH_PUBLIC, PATH_USER } from "routes/paths";
import { ComponentType } from "common/@types/component";

interface ComponentDetailSectionProps {
  componentId: string;
}

export default function ComponentDetailSection({ componentId }: ComponentDetailSectionProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentComponent } = useAppSelector((state) => state.component);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (componentId) {
      dispatch(getComponentByIdThunk(componentId));
    }
  }, [dispatch, componentId]);

  const handleBack = () => {
    const path = isAuthenticated ? PATH_USER.components : PATH_PUBLIC.components;
    navigate(path);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
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

  const getComponentTypeColor = (type: ComponentType): "default" | "primary" | "secondary" | "success" | "warning" | "info" | "error" => {
    const typeColors: Record<ComponentType, "default" | "primary" | "secondary" | "success" | "warning" | "info" | "error"> = {
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

  const component = currentComponent.data;
  const isLoading = currentComponent.isLoading;
  const error = currentComponent.error;

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !component) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || "Component not found"}
        </Alert>
      </Container>
    );
  }

  // Thumbnail images
  const thumbnails = component.imageUrl ? [component.imageUrl] : [];

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
          sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
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
          sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
        >
          Components
        </Link>
        <Typography
          color="text.primary"
          fontSize="0.875rem"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "300px",
          }}
          title={component.name}
        >
          {component.name}
        </Typography>
      </Breadcrumbs>

      {/* Main Product Section */}
      <Box sx={{ display: "flex", gap: 6, flexDirection: { xs: "column", md: "row" } }}>
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
              {component.imageUrl ? (
                <Box
                  component="img"
                  src={component.imageUrl}
                  alt={component.name}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Typography variant="h1" sx={{ fontSize: "8rem" }}>🔧</Typography>
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
                      borderColor: selectedImage === index ? "primary.main" : "grey.300",
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
                      alt={`${component.name} ${index + 1}`}
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
          {/* Title & Category */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {component.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Chip
                label={getComponentTypeLabel(component.type)}
                color={getComponentTypeColor(component.type)}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Box>

          {/* Price - Contact for purchase */}
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: "primary.main" }}>
            Contact us to purchase
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Component Type */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Component Type
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                label={getComponentTypeLabel(component.type)}
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
                <Typography sx={{ px: 3, minWidth: 60, textAlign: "center", fontWeight: 600 }}>
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
              sx={{
                lineHeight: 1.8,
                color: "text.secondary",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {component.description || "No description available"}
            </Typography>
          </Box>

          {/* Key Features */}
          {component.specifications && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Key Features
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {component.specifications.split("\n").filter(Boolean).slice(0, 5).map((spec, idx) => (
                  <Typography
                    key={idx}
                    component="li"
                    variant="body2"
                    sx={{
                      mb: 1,
                      color: "text.secondary",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    {spec}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          {/* Availability */}
          <Box sx={{ mb: 4, p: 2, bgcolor: "info.50", borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "info.dark" }}>
              Contact us for availability and pricing information
            </Typography>
          </Box>

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
              How to Buy
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
      {component.specifications && (
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
              sx={{
                whiteSpace: "pre-line",
                lineHeight: 1.8,
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {component.specifications}
            </Typography>
          </Box>
        </Box>
      )}
    </Container>
  );
}