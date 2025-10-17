import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Typography,
  Tooltip,
  CircularProgress,
  Button,
} from "@mui/material";
import { PhotoCamera, Delete, CloudUpload } from "@mui/icons-material";
import { useFirebaseStorage } from "../../hooks/useFirebaseStorage";
import ImageCropDialog from "./ImageCropDialog";

export interface ImageUploaderProps {
  entityId?: string; // Robot ID or Component ID
  entityType: "robot" | "component" | "general";
  currentImageUrl?: string;
  onImageChange?: (imageUrl: string | null) => void;
  height?: number;
  disabled?: boolean;
  enableCrop?: boolean;
  aspectRatio?: number;
  title?: string;
  description?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  entityId,
  entityType,
  currentImageUrl,
  onImageChange,
  height = 200,
  disabled = false,
  enableCrop = false,
  aspectRatio = 1.5, // 3:2 default aspect ratio
  title,
  description,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);

  // Crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { uploading, uploadProgress, uploadAvatar, deleteAvatar } =
    useFirebaseStorage();

  // Sync preview when parent updates currentImageUrl (e.g., editing existing entity)
  useEffect(() => {
    // Only update from prop when not actively uploading
    if (!uploading) {
      setPreviewUrl(currentImageUrl || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImageUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show local preview immediately and start upload
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Start upload to Firebase
    handleUpload(file);

    // Reset file input
    event.target.value = "";
  };

  const handleCropComplete = (croppedFile: File) => {
    // Show preview immediately
    const objectUrl = URL.createObjectURL(croppedFile);
    setPreviewUrl(objectUrl);

    // Upload cropped file
    handleUpload(croppedFile);

    // Clean up
    setSelectedFile(null);
  };

  const handleCropCancel = () => {
    setCropDialogOpen(false);
    setSelectedFile(null);
  };

  const handleUpload = async (file: File) => {
    try {
      // Generate folder path based on entity type
      const folder = `${entityType}s`; // "robots", "components", or "generals"

      // Use entityId if available, otherwise use timestamp for general images
      const uploadId = entityId || `general_${Date.now()}`;

      const result = await uploadAvatar({
        userId: uploadId,
        file,
        folder,
      });

      if (result) {
        setPreviewUrl(result.url);
        setCurrentFileName(result.fileName);
        onImageChange?.(result.url);
      }
    } catch (uploadError) {
      // Reset preview on error
      console.error("Upload failed:", uploadError);
      setPreviewUrl(currentImageUrl || null);
    }
  };

  const handleDelete = async () => {
    if (currentFileName) {
      const folder = `${entityType}s`;
      const success = await deleteAvatar(currentFileName, folder);
      if (success) {
        setPreviewUrl(null);
        setCurrentFileName(null);
        onImageChange?.(null);
      }
    } else {
      // If no filename, just clear the preview
      setPreviewUrl(null);
      onImageChange?.(null);
    }
  };

  const handleUploadClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Title */}
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}

      {/* Description */}
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}

      {/* Image Display Card */}
      <Card
        sx={{
          border: previewUrl ? "2px solid" : "2px dashed",
          borderColor: previewUrl ? "primary.main" : "grey.300",
          backgroundColor: previewUrl ? "background.paper" : "grey.50",
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "background.paper",
          },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
              overflow: "hidden",
              backgroundColor: previewUrl ? "transparent" : "grey.100",
              backgroundImage: previewUrl ? `url(${previewUrl})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              cursor: disabled || uploading ? "default" : "pointer",
            }}
            onClick={handleUploadClick}
          >
            {/* Empty State */}
            {!previewUrl && (
              <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                <CloudUpload sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body2">Click to upload image</Typography>
                <Typography variant="caption">
                  JPEG, PNG, GIF, WebP (max 5MB)
                </Typography>
              </Box>
            )}

            {/* Action Buttons Overlay */}
            {previewUrl && !uploading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  display: "flex",
                  gap: 0.5,
                  opacity: 0,
                  transition: "opacity 0.2s ease",
                  ".MuiCard-root:hover &": {
                    opacity: 1,
                  },
                }}
              >
                <Tooltip title="Change image">
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: "primary.main",
                      color: "white",
                      "&:hover": { backgroundColor: "primary.dark" },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadClick();
                    }}
                    disabled={disabled}
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Remove image">
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: "error.main",
                      color: "white",
                      "&:hover": { backgroundColor: "error.dark" },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={disabled}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            {/* Loading Overlay */}
            {uploading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.7)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <CircularProgress size={40} color="inherit" sx={{ mb: 2 }} />
                <Typography variant="body2">
                  Uploading... {uploadProgress}%
                </Typography>
              </Box>
            )}
          </Box>

          {/* Upload Progress Bar */}
          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{ borderRadius: 1 }}
              />
            </Box>
          )}

          {/* Upload Button (Alternative) */}
          {!previewUrl && !uploading && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={handleUploadClick}
                disabled={disabled}
                size="large"
                fullWidth
              >
                Choose Image File
              </Button>
            </Box>
          )}

          {/* Image Info */}
          {previewUrl && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {entityType === "robot" && "Robot Image"}
                {entityType === "component" && "Component Image"}
                {entityType === "general" && "General Image"}
                {entityId && ` (${entityId.slice(0, 8)}...)`}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {/* Crop Dialog */}
      {enableCrop && (
        <ImageCropDialog
          open={cropDialogOpen}
          onClose={handleCropCancel}
          onCropComplete={handleCropComplete}
          imageFile={selectedFile}
          aspectRatio={aspectRatio}
        />
      )}
    </Box>
  );
};
