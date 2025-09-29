import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";

interface ImageCropDialogProps {
  open: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
  imageFile: File | null;
  aspectRatio?: number;
}

export default function ImageCropDialog({
  open,
  onClose,
  onCropComplete,
  imageFile,
  aspectRatio: _aspectRatio = 1,
}: ImageCropDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const handleCrop = () => {
    if (!imageFile || !previewUrl) return;

    // For now, just return the original file
    // TODO: Implement actual cropping logic if needed
    onCropComplete(imageFile);
    onClose();
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>Crop Image</DialogTitle>
      <DialogContent>
        {previewUrl && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
              backgroundColor: "grey.100",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                objectFit: "contain",
              }}
            />
          </Box>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Simple preview mode. Advanced cropping can be added later.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleCrop}>
          Use Image
        </Button>
      </DialogActions>
      
      {/* Hidden canvas for future cropping implementation */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </Dialog>
  );
}
