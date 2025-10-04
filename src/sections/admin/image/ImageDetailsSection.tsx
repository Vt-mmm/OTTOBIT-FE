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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { deleteImageThunk } from "../../../redux/image/imageThunks";
import { ImageResult } from "../../../common/@types/image";

interface ImageDetailsSectionProps {
  image: ImageResult | null;
  onBack: () => void;
  onEdit?: (image: ImageResult) => void;
  onDelete: () => void;
  /** Allow editing of the image */
  allowEdit?: boolean;
  /** Allow deletion of the image */
  allowDelete?: boolean;
}

export default function ImageDetailsSection({ 
  image, 
  onBack, 
  onEdit, 
  onDelete,
  allowEdit = true,
  allowDelete = true,
}: ImageDetailsSectionProps) {
  const dispatch = useAppDispatch();
  const { operations } = useAppSelector((state) => state.image);
  
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!image) {
    return (
      <Alert severity="error">
        Image not found
      </Alert>
    );
  }

  const handleDelete = async () => {
    await dispatch(deleteImageThunk(image.id));
    setShowDeleteConfirm(false);
    onDelete();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const getImageCategory = () => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
        >
          Back to List
        </Button>
        
        <Box sx={{ display: "flex", gap: 1 }}>
          {allowEdit && onEdit && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => onEdit(image)}
            >
              Edit
            </Button>
          )}
          {allowDelete && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setShowDeleteConfirm(true)}
              disabled={operations.isDeleting}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Image Display */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ position: "relative" }}>
                <Box
                  sx={{
                    width: "100%",
                    height: 400, // Fixed height instead of aspect ratio  
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
                        transform: "scale(1.02)",
                      },
                    }}
                    onError={(e) => {
                      // Hide broken image and show fallback
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullScreenOpen(true);
                    }}
                  >
                    <ZoomInIcon />
                  </IconButton>

                  {/* Category Chip */}
                  <Chip
                    label={getImageCategory()}
                    color={getCategoryColor(getImageCategory())}
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Image Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Image Information
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Basic Info */}
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    ID
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                    {image.id}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    URL
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        wordBreak: "break-all", 
                        flexGrow: 1,
                        fontSize: "0.875rem"
                      }}
                    >
                      {image.url}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(image.url)}
                      title="Copy URL"
                    >
                      <LinkIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Divider />

                {/* Assignment Info */}
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Assignment
                  </Typography>
                  <Chip
                    label={getImageCategory()}
                    color={getCategoryColor(getImageCategory())}
                    size="small"
                  />
                </Box>

                {/* Robot Info */}
                {image.robot && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Robot
                    </Typography>
                    <Typography variant="body1" color="primary.main">
                      {image.robot.name}
                    </Typography>
                  </Box>
                )}

                {/* Component Info - Removed */}

                <Divider />

                {/* Timestamps */}
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(image.createdAt)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(image.updatedAt)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Full Screen Image Dialog */}
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
              backgroundImage: `url(${image.url})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Delete Image
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Are you sure you want to delete this image? This action cannot be undone.
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
              Delete
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
