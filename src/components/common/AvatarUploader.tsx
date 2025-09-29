import React, { useRef, useState } from "react";
import {
  Box,
  Avatar,
  IconButton,
  LinearProgress,
  Typography,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { PhotoCamera, Delete } from "@mui/icons-material";
import { useFirebaseStorage } from "../../hooks/useFirebaseStorage";
import ImageCropDialog from "./ImageCropDialog";

export interface AvatarUploaderProps {
  userId: string;
  currentAvatarUrl?: string;
  onAvatarChange?: (avatarUrl: string | null) => void;
  size?: number;
  disabled?: boolean;
  folder?: string;
  enableCrop?: boolean; // Enable crop functionality
  aspectRatio?: number; // Crop aspect ratio (1 for square)
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  userId,
  currentAvatarUrl,
  onAvatarChange,
  size = 120,
  disabled = false,
  folder = "avatars",
  enableCrop = true,
  aspectRatio = 1,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentAvatarUrl || null
  );
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);

  // Crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { uploading, uploadProgress, uploadAvatar, deleteAvatar } =
    useFirebaseStorage();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (enableCrop) {
      // Open crop dialog
      setSelectedFile(file);
      setCropDialogOpen(true);
    } else {
      // Direct upload without crop
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      handleUpload(file);
    }

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
      const result = await uploadAvatar({
        userId,
        file,
        folder,
      });

      if (result) {
        setPreviewUrl(result.url);
        setCurrentFileName(result.fileName);
        onAvatarChange?.(result.url);
      }
    } catch (uploadError) {
      // Reset preview on error
      console.error("Upload failed:", uploadError);
      setPreviewUrl(currentAvatarUrl || null);
    }
  };

  const handleDelete = async () => {
    if (currentFileName) {
      const success = await deleteAvatar(currentFileName, folder);
      if (success) {
        setPreviewUrl(null);
        setCurrentFileName(null);
        onAvatarChange?.(null);
      }
    } else {
      // If no filename, just clear the preview
      setPreviewUrl(null);
      onAvatarChange?.(null);
    }
  };

  const handleCameraClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Avatar
          src={previewUrl || undefined}
          sx={{
            width: size,
            height: size,
            border: 2,
            borderColor: "divider",
          }}
        >
          {!previewUrl && (
            <Typography variant="h6" color="text.secondary">
              {userId.charAt(0).toUpperCase()}
            </Typography>
          )}
        </Avatar>

        {/* Upload button */}
        <Tooltip title={uploading ? "Uploading..." : "Change avatar"}>
          <IconButton
            sx={{
              position: "absolute",
              bottom: -8,
              right: -8,
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
            onClick={handleCameraClick}
            disabled={disabled || uploading}
            size="small"
          >
            {uploading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <PhotoCamera fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {/* Delete button */}
        {previewUrl && !uploading && (
          <Tooltip title="Remove avatar">
            <IconButton
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                backgroundColor: "error.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "error.dark",
                },
              }}
              onClick={handleDelete}
              disabled={disabled}
              size="small"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Upload progress */}
      {uploading && (
        <Box sx={{ width: "100%", maxWidth: size }}>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{ borderRadius: 1 }}
          />
          <Typography variant="caption" color="text.secondary" align="center">
            Uploading... {uploadProgress}%
          </Typography>
        </Box>
      )}

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
