import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Alert,
  Divider,
  Avatar,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  Link as LinkIcon,
  Memory as ComponentIcon,
  AttachMoney as PriceIcon,
  Inventory as StockIcon,
  Category as TypeIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { deleteComponentThunk } from "../../../redux/component/componentThunks";
import {
  ComponentResult,
  ComponentType,
} from "../../../common/@types/component";
import ImageManagement from "../../../components/admin/ImageManagement";
import { formatVND } from "../../../utils/utils";

interface ComponentDetailsSectionProps {
  component: ComponentResult | null;
  onBack: () => void;
  onEdit: (component: ComponentResult) => void;
  onDelete: () => void;
}

export default function ComponentDetailsSection({
  component,
  onBack,
  onEdit,
  onDelete,
}: ComponentDetailsSectionProps) {
  const dispatch = useAppDispatch();
  const { operations } = useAppSelector((state) => state.component);

  const [currentTab, setCurrentTab] = useState(0);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!component) {
    return <Alert severity="error">Component not found</Alert>;
  }

  const handleDelete = async () => {
    await dispatch(deleteComponentThunk(component.id));
    setShowDeleteConfirm(false);
    onDelete();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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

  const getComponentTypeColor = (
    type: ComponentType
  ):
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "info"
    | "error" => {
    const typeColors: Record<
      ComponentType,
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "info"
      | "error"
    > = {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Back to List
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => onEdit(component)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setShowDeleteConfirm(true)}
            disabled={operations.isDeleting}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="standard"
          sx={{
            '& .MuiTab-root': {
              minWidth: 160,
              px: 3,
              py: 1.5,
              fontSize: '0.95rem',
              fontWeight: 500,
              textTransform: 'none',
              '&:not(:last-child)': {
                mr: 2
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab label="Component Information" />
          <Tab label="Images" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {currentTab === 0 && (
        <Grid container spacing={4}>
          {/* Component Image & Description */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                {/* Component Image */}
                <Box sx={{ position: "relative", mb: 3 }}>
                  {component.imageUrl ? (
                    <Box
                      sx={{
                        width: "100%",
                        height: 300,
                        position: "relative",
                        borderRadius: 2,
                        overflow: "hidden",
                        backgroundColor: "grey.100",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onClick={() => setFullScreenOpen(true)}
                    >
                      {/* Actual Image Element */}
                      <Box
                        component="img"
                        src={component.imageUrl}
                        alt={`${component.name} - ${getComponentTypeLabel(component.type)}`}
                        sx={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          width: "auto",
                          height: "auto",
                          objectFit: "contain",
                          transition: "transform 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.02)",
                          },
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {/* Zoom Icon */}
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: "background.paper",
                          "&:hover": { backgroundColor: "grey.100" },
                        }}
                      >
                        <ZoomInIcon />
                      </IconButton>

                      {/* Status Chips */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          display: "flex",
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={formatVND(component.price)}
                          color="primary"
                          sx={{ fontWeight: "bold", fontSize: "0.8rem" }}
                        />
                        <Chip
                          label={getStockStatusText(component.stockQuantity)}
                          color={getStockStatusColor(component.stockQuantity)}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        paddingTop: "50%",
                        position: "relative",
                        borderRadius: 2,
                        backgroundColor: "grey.100",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          textAlign: "center",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            backgroundColor: "primary.main",
                            mx: "auto",
                            mb: 2,
                          }}
                        >
                          <ComponentIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                          No component image available
                        </Typography>
                      </Box>

                      {/* Status Chips */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          display: "flex",
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={formatVND(component.price)}
                          color="primary"
                          sx={{ fontWeight: "bold", fontSize: "0.8rem" }}
                        />
                        <Chip
                          label={getStockStatusText(component.stockQuantity)}
                          color={getStockStatusColor(component.stockQuantity)}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Component Name & Details */}
                <Typography variant="h4" gutterBottom>
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

                <Typography variant="body1" color="text.secondary" paragraph>
                  {component.description || "No description available"}
                </Typography>

                {/* Technical Specifications */}
                {component.specifications && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Technical Specifications
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-line",
                        backgroundColor: "grey.50",
                        p: 2,
                        borderRadius: 1,
                      }}
                    >
                      {component.specifications}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Component Information Panel */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Component Information
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Basic Info */}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Component ID
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                    >
                      {component.id}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1">
                      {getComponentTypeLabel(component.type)}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Pricing & Inventory */}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Price
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PriceIcon color="primary" />
                      <Typography variant="h6" color="primary.main">
                        {formatVND(component.price)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Stock Status
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <StockIcon
                        color={getStockStatusIconColor(component.stockQuantity)}
                      />
                      <Typography variant="body1">
                        {component.stockQuantity} units
                      </Typography>
                      <Chip
                        label={getStockStatusText(component.stockQuantity)}
                        color={getStockStatusColor(component.stockQuantity)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  {/* Image URL */}
                  {component.imageUrl && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Image URL
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            wordBreak: "break-all",
                            flexGrow: 1,
                            fontSize: "0.75rem",
                          }}
                        >
                          {component.imageUrl.length > 50
                            ? `${component.imageUrl.substring(0, 50)}...`
                            : component.imageUrl}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(component.imageUrl!)}
                          title="Copy URL"
                        >
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  )}

                  <Divider />

                  {/* Timestamps */}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(component.createdAt)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(component.updatedAt)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Images Tab */}
      {currentTab === 1 && (
        <ImageManagement
          componentId={component.id}
          title="Component Images"
          description={`Manage images for ${component.name}`}
          showHeader={false}
        />
      )}

      {/* Full Screen Image Dialog */}
      {component.imageUrl && (
        <Dialog
          open={fullScreenOpen}
          onClose={() => setFullScreenOpen(false)}
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
              onClick={() => setFullScreenOpen(false)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.7)",
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Delete Component
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Are you sure you want to delete "{component.name}"? This action cannot be undone.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={operations.isDeleting}
            >
              {operations.isDeleting ? (
                <CircularProgress size={20} />
              ) : (
                "Delete"
              )}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

    </Box>
  );
}
