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

  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  useEffect(() => {
    if (robotId) {
      dispatch(getRobotByIdThunk(robotId));
    }
  }, [dispatch, robotId]);

  const handleBack = () => {
    const path = isAuthenticated ? PATH_USER.robots : PATH_PUBLIC.robots;
    navigate(path);
  };

  const getStockStatusColor = (
    stock: number
  ):
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "info"
    | "error" => {
    if (stock === 0) return "error";
    if (stock < 10) return "warning";
    return "success";
  };

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock < 10) return "Low Stock";
    return "In Stock";
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ bgcolor: "white", minHeight: "100vh" }}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !robotData) {
    return (
      <Container maxWidth="xl" sx={{ bgcolor: "white", minHeight: "100vh" }}>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || "Robot not found"}
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
          href={isAuthenticated ? PATH_USER.robots : PATH_PUBLIC.robots}
          onClick={(e) => {
            e.preventDefault();
            handleBack();
          }}
        >
          Robots
        </Link>
        <Typography color="text.primary">{robotData.name}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 3 }}>
        Back to Robots
      </Button>

      <Grid container spacing={6}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card sx={{ position: "relative", overflow: "hidden" }}>
            {robotData.imageUrl ? (
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
                  src={robotData.imageUrl}
                  alt={robotData.name}
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
                🤖
              </Box>
            )}
          </Card>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              {robotData.name}
            </Typography>

            <Typography variant="h5" color="primary.main" sx={{ mb: 2 }}>
              {robotData.brand} - {robotData.model}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Chip
                label={formatVND(robotData.price || 0)}
                color="primary"
                size="medium"
                sx={{ fontSize: "1.1rem", fontWeight: "bold", px: 2 }}
              />
              <Chip
                label={getStockStatusText(robotData.stockQuantity || 0)}
                color={getStockStatusColor(robotData.stockQuantity || 0)}
                size="medium"
              />
            </Box>

            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7 }}>
              {robotData.description || "No description available"}
            </Typography>

            {/* Key Information */}
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Product Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Age Range
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {robotData.minAge || 0} - {robotData.maxAge || 0} tuổi
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Stock Available
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {robotData.stockQuantity || 0} units
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
                disabled={(robotData.stockQuantity || 0) === 0}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                {(robotData.stockQuantity || 0) > 0 ? "Add to Cart" : "Out of Stock"}
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
      {robotData.technicalSpecs && (
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
                {robotData.technicalSpecs}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Requirements */}
      {robotData.requirements && (
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Requirements
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
                {robotData.requirements}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Full Screen Image Dialog */}
      {robotData.imageUrl && (
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
                backgroundImage: `url(${robotData.imageUrl})`,
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
