import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ShoppingCart as CartIcon,
  FavoriteBorder as FavoriteIcon,
  Share as ShareIcon,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon,
  Category as TypeIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import { getComponentByIdThunk } from "store/component/componentThunks";
import { PATH_PUBLIC, PATH_USER } from "routes/paths";
import { ComponentType } from "common/@types/component";
import { formatVND } from "utils/utils";

interface ComponentDetailSectionProps {
  componentId: string;
}

export default function ComponentDetailSection({ componentId }: ComponentDetailSectionProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentComponent } = useAppSelector((state) => state.component);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  useEffect(() => {
    if (componentId) {
      dispatch(getComponentByIdThunk(componentId));
    }
  }, [dispatch, componentId]);

  const handleBack = () => {
    const path = isAuthenticated ? PATH_USER.components : PATH_PUBLIC.components;
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

  const getStockStatusColor = (stock: number): "default" | "primary" | "secondary" | "success" | "warning" | "info" | "error" => {
    if (stock === 0) return "error";
    if (stock < 10) return "warning";
    return "success";
  };

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock < 10) return "Low Stock";
    return "In Stock";
  };

  // Get data from Redux state with correct structure
  const component = currentComponent.data;
  const isLoading = currentComponent.isLoading;
  const error = currentComponent.error;

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ bgcolor: "white", minHeight: "100vh" }}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !component) {
    return (
      <Container maxWidth="xl" sx={{ bgcolor: "white", minHeight: "100vh" }}>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || "Component not found"}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ bgcolor: "white", minHeight: "100vh" }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href={isAuthenticated ? PATH_USER.store : PATH_PUBLIC.store}
          onClick={(e) => {
            e.preventDefault();
            navigate(isAuthenticated ? PATH_USER.store : PATH_PUBLIC.store);
          }}
        >
          Store
        </Link>
        <Link
          color="inherit"
          href={isAuthenticated ? PATH_USER.components : PATH_PUBLIC.components}
          onClick={(e) => {
            e.preventDefault();
            handleBack();
          }}
        >
          Components
        </Link>
        <Typography color="text.primary">{component.name}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Components
      </Button>

      <Grid container spacing={6}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card sx={{ position: "relative", overflow: "hidden" }}>
            {component.imageUrl ? (
              <Box
                sx={{
                  position: "relative",
                  height: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "grey.50",
                }}
                onClick={() => setImageDialogOpen(true)}
              >
                <Box
                  component="img"
                  src={component.imageUrl}
                  alt={component.name}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    bgcolor: "rgba(0,0,0,0.6)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.8)",
                    },
                  }}
                >
                  <ZoomInIcon />
                </IconButton>
              </Box>
            ) : (
              <Box
                sx={{
                  height: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "grey.100",
                  fontSize: "4rem",
                }}
              >
                🔧
              </Box>
            )}
          </Card>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
              {component.name}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <TypeIcon color="action" />
              <Chip
                label={getComponentTypeLabel(component.type)}
                color={getComponentTypeColor(component.type)}
                size="medium"
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Chip
                label={formatVND(component.price || 0)}
                color="primary"
                size="medium"
                sx={{ fontSize: "1.1rem", fontWeight: "bold", px: 2 }}
              />
              <Chip
                label={getStockStatusText(component.stockQuantity || 0)}
                color={getStockStatusColor(component.stockQuantity || 0)}
                size="medium"
              />
            </Box>

            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7 }}>
              {component.description || "No description available"}
            </Typography>

            {/* Key Information */}
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Component Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {getComponentTypeLabel(component.type)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Stock Available
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {component.stockQuantity || 0} units
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<CartIcon />}
                disabled={(component.stockQuantity || 0) === 0}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                {(component.stockQuantity || 0) > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<FavoriteIcon />}
                sx={{ px: 3 }}
              >
                Wishlist
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ShareIcon />}
                sx={{ px: 3 }}
              >
                Share
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Technical Specifications */}
      {component.specifications && (
        <Box sx={{ mt: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Technical Specifications
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-line",
                  bgcolor: "grey.50",
                  p: 3,
                  borderRadius: 2,
                  lineHeight: 1.7,
                }}
              >
                {component.specifications}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Full Screen Image Dialog */}
      {component.imageUrl && (
        <Dialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          maxWidth={false}
          PaperProps={{
            sx: {
              width: "90vw",
              height: "90vh",
              maxWidth: "none",
              maxHeight: "none",
            },
          }}
        >
          <DialogContent sx={{ p: 0, position: "relative" }}>
            <IconButton
              onClick={() => setImageDialogOpen(false)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 1,
                bgcolor: "rgba(0,0,0,0.6)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.8)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              sx={{
                width: "100%",
                height: "100%",
                backgroundImage: `url(${component.imageUrl})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
}