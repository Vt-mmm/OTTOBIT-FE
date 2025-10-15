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
  // AttachMoney as PriceIcon, // Removed - showroom mode
  // Inventory as StockIcon, // Removed - showroom mode
  Category as TypeIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { deleteComponentThunk } from "../../../redux/component/componentThunks";
import {
  ComponentResult,
  ComponentType,
} from "../../../common/@types/component";
// import ImageManagement from "../../../components/admin/ImageManagement"; // Removed - images managed at robot level
// import { formatVND } from "../../../utils/utils"; // Removed - no pricing in showroom mode

interface ComponentDetailsSectionProps {
  component: ComponentResult | null;
  onBack: () => void;
  onEdit: (component: ComponentResult) => void;
  onDelete: () => void;
}

import useLocales from "hooks/useLocales";

export default function ComponentDetailsSection({
  component,
  onBack,
  onEdit,
  onDelete,
}: ComponentDetailsSectionProps) {
  const dispatch = useAppDispatch();
  const { translate } = useLocales();
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
      [ComponentType.SENSOR]: translate("admin.component.typeSensor"),
      [ComponentType.ACTUATOR]: translate("admin.component.typeActuator"),
      [ComponentType.CONTROLLER]: translate("admin.component.typeController"),
      [ComponentType.POWER_SUPPLY]: translate("admin.component.typePowerSupply"),
      [ComponentType.CONNECTIVITY]: translate("admin.component.typeConnectivity"),
      [ComponentType.MECHANICAL]: translate("admin.component.typeMechanical"),
      [ComponentType.DISPLAY]: translate("admin.component.typeDisplay"),
      [ComponentType.AUDIO]: translate("admin.component.typeAudio"),
      [ComponentType.OTHER]: translate("admin.component.typeOther"),
    };
    return typeLabels[type] || translate("admin.component.typeUnknown");
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

  // Removed - Store is showroom only, no stock management
  // const getStockStatusColor = (stock: number) => { ... }
  // const getStockStatusIconColor = (stock: number) => { ... }
  // const getStockStatusText = (stock: number) => { ... }

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
          {translate("admin.component.backToList")}
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => onEdit(component)}
          >
            {translate("admin.edit")}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setShowDeleteConfirm(true)}
            disabled={operations.isDeleting}
          >
            {translate("admin.delete")}
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
          <Tab label={translate("admin.component.componentInformation")} />
          <Tab label={translate("admin.component.images")} />
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

                      {/* Showroom Mode - No pricing/stock display */}
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
                          {translate("admin.component.noImageAvailable")}
                        </Typography>
                      </Box>

                      {/* Showroom Mode - No pricing/stock display */}
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
                  {component.description || translate("admin.component.noDescriptionAvailable")}
                </Typography>

                {/* Technical Specifications */}
                {component.specifications && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {translate("admin.component.technicalSpecifications")}
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
                  {translate("admin.component.componentInformation")}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Basic Info */}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {translate("admin.component.componentID")}
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
                      {translate("admin.component.type")}
                    </Typography>
                    <Typography variant="body1">
                      {getComponentTypeLabel(component.type)}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Showroom Mode - No pricing/inventory */}
                  <Box>
                    <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
                      <Typography variant="body2">
                        {translate("admin.component.visitSalesChannel")}
                      </Typography>
                      <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                        • Facebook Shop<br/>
                        • Shopee Store<br/>
                        • TikTok Shop
                      </Typography>
                    </Alert>
                  </Box>

                  {/* Image URL */}
                  {component.imageUrl && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {translate("admin.component.imageUrl")}
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
                      {translate("admin.component.created")}
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(component.createdAt)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {translate("admin.component.updated")}
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
        <Box sx={{ p: 3 }}>
          <Alert severity="info">
            {translate("admin.component.images")}
          </Alert>
        </Box>
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
            {translate("admin.component.deleteComponent")}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {translate("admin.component.confirmDeleteMessage", { name: component.name })}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => setShowDeleteConfirm(false)}
            >
              {translate("admin.cancel")}
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
                translate("admin.delete")
              )}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

    </Box>
  );
}
