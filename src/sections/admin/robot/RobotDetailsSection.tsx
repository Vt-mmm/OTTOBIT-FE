import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
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
  SmartToy as RobotIcon,
  Group as AgeIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { deleteRobotThunk } from "store/robot/robotThunks";
import { RobotResult } from "../../../common/@types/robot";
import ImageManagement from "../../../components/admin/ImageManagement";
import RobotComponentsTab from "./RobotComponentsTab";

interface RobotDetailsSectionProps {
  robot: RobotResult | null;
  onBack: () => void;
  onEdit: (robot: RobotResult) => void;
  onDelete: () => void;
}

export default function RobotDetailsSection({
  robot,
  onBack,
  onEdit,
  onDelete,
}: RobotDetailsSectionProps) {
  const dispatch = useAppDispatch();
  const { operations } = useAppSelector((state) => state.robot);

  const [currentTab, setCurrentTab] = useState(0);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!robot) {
    return <Alert severity="error">Robot product not found</Alert>;
  }

  const handleDelete = async () => {
    await dispatch(deleteRobotThunk(robot.id));
    setShowDeleteConfirm(false);
    onDelete();
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
            onClick={() => onEdit(robot)}
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
            "& .MuiTab-root": {
              minWidth: 160,
              px: 3,
              py: 1.5,
              fontSize: "0.95rem",
              fontWeight: 500,
              textTransform: "none",
              "&:not(:last-child)": {
                mr: 2,
              },
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <Tab label="Robot Information" />
          <Tab label="Images" />
          <Tab label="Components (BOM)" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {currentTab === 0 && (
        <Grid container spacing={4}>
          {/* Product Image & Description */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                {/* Product Image */}
                <Box sx={{ position: "relative", mb: 3 }}>
                  {robot.imageUrl ? (
                    <Box
                      sx={{
                        width: "100%",
                        height: 300, // Fixed height instead of aspect ratio
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
                        src={robot.imageUrl}
                        alt={`${robot.name} - ${robot.brand}`}
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
                          // Hide broken image and show fallback
                          e.currentTarget.style.display = "none";
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
                          <RobotIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                          No product image available
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Product Name & Details */}
                <Typography variant="h4" gutterBottom>
                  {robot.name}
                </Typography>

                <Typography variant="h6" color="primary.main" gutterBottom>
                  {robot.brand} - {robot.model}
                </Typography>

                <Typography variant="body1" color="text.secondary" paragraph>
                  {robot.description || "No description available"}
                </Typography>

                {/* Technical Specifications */}
                {robot.technicalSpecs && (
                  <Box sx={{ mb: 3 }}>
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
                      {robot.technicalSpecs}
                    </Typography>
                  </Box>
                )}

                {/* Requirements */}
                {robot.requirements && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Requirements
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
                      {robot.requirements}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Product Information Panel */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Product Information
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Basic Info */}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Product ID
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                    >
                      {robot.id}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Brand & Model
                    </Typography>
                    <Typography variant="body1">
                      {robot.brand} - {robot.model}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Age Range
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AgeIcon color="info" />
                      <Typography variant="body1">
                        {robot.minAge} - {robot.maxAge} tuổi
                      </Typography>
                    </Box>
                  </Box>

                  {/* Image URL */}
                  {robot.imageUrl && (
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
                          {robot.imageUrl.length > 50
                            ? `${robot.imageUrl.substring(0, 50)}...`
                            : robot.imageUrl}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(robot.imageUrl!)}
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
                      {formatDate(robot.createdAt)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(robot.updatedAt)}
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
          robotId={robot.id}
          title="Robot Images"
          description={`Manage images for ${robot.name}`}
          showHeader={false}
        />
      )}

      {/* Components Tab */}
      {currentTab === 2 && (
        <RobotComponentsTab robotId={robot.id} robotName={robot.name} />
      )}

      {/* Full Screen Image Dialog */}
      {robot.imageUrl && (
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
                backgroundImage: `url(${robot.imageUrl})`,
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
            Delete Robot Product
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Are you sure you want to delete "{robot.name}"? This action cannot
            be undone.
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
