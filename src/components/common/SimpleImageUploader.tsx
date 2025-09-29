import React, { useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Typography,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { 
  PhotoCamera, 
  Delete, 
  CloudUpload,
} from "@mui/icons-material";
import { useFirebaseStorage } from "../../hooks/useFirebaseStorage";

export interface SimpleImageUploaderProps {
  entityId?: string;
  entityType: "robot" | "component" | "general";
  currentImageUrl?: string;
  onImageChange?: (imageUrl: string | null) => void;
  height?: number;
  disabled?: boolean;
  title?: string;
  description?: string;
}

export const SimpleImageUploader: React.FC<SimpleImageUploaderProps> = ({
  entityId,
  entityType,
  currentImageUrl,
  onImageChange,
  height = 200,
  disabled = false,
  title,
  description,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);

  const { uploading, uploadProgress, uploadAvatar, deleteAvatar } = useFirebaseStorage();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Prevent upload if already uploading
    if (uploading) {
      return;
    }

    // Start upload immediately
    handleUpload(file);

    // Reset file input
    event.target.value = "";
  };

  const handleUpload = async (file: File) => {
    // Prevent duplicate uploads
    if (uploading) {
      return;
    }

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
      // Keep current image on error
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
          border: "2px dashed",
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
              backgroundColor: "grey.100",
              cursor: disabled || uploading ? "default" : "pointer",
            }}
            onClick={handleUploadClick}
          >
            {/* Actual Image Element */}
            {previewUrl && !uploading && (
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                sx={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: 1,
                }}
                onError={(e) => {
                  // Hide broken image
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {/* Empty State */}
            {!previewUrl && !uploading && (
              <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                <CloudUpload sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body2">
                  Click to upload image
                </Typography>
                <Typography variant="caption">
                  JPEG, PNG, GIF, WebP (max 5MB)
                </Typography>
              </Box>
            )}

            {/* Upload Progress */}
            {uploading && (
              <Box sx={{ 
                textAlign: "center", 
                color: "text.secondary",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: 1,
                p: 2
              }}>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="body2">
                  Uploading... {uploadProgress}%
                </Typography>
                <Typography variant="caption" color="warning.main">
                  Please do not refresh or navigate away
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
                      "&:hover": { backgroundColor: "primary.dark" }
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
                      "&:hover": { backgroundColor: "error.dark" }
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

          {/* Image Info */}
          {previewUrl && !uploading && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {entityType === "robot" && "Robot Image"}
                {entityType === "component" && "Component Image"} 
                {entityType === "general" && "General Image"}
                {entityId && ` (${entityId.slice(0, 8)}...)`}
              </Typography>
              <Typography variant="caption" color="success.main" display="block">
                ✅ Upload successful
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
    </Box>
  );
};
