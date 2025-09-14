import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";
import { CameraAlt as CameraIcon } from "@mui/icons-material";

const CameraTestButton: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [imageSource, setImageSource] = useState<"camera" | "file" | null>(
    null
  );
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  );
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const handleCamera = async () => {
    setShowCameraDialog(true);
    setCameraError(null);

    // Load available cameras
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("All devices:", devices);

      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      console.log("Video devices:", videoDevices);

      setAvailableCameras(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error loading cameras:", error);
      setCameraError("Failed to load cameras");
    }
  };

  const handleStartCamera = async () => {
    setCameraLoading(true);
    setCameraError(null);
    setImageSource("camera");

    try {
      // Stop existing stream
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: selectedCameraId
          ? {
              deviceId: { exact: selectedCameraId },
              width: { ideal: 720 },
              height: { ideal: 1280 },
            }
          : {
              width: { ideal: 720 },
              height: { ideal: 1280 },
            },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      if (error.name === "NotAllowedError") {
        setCameraError("Camera access denied. Please allow camera permission.");
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError(`Camera error: ${error.message}`);
      }
    } finally {
      setCameraLoading(false);
    }
  };

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setImageSource(null);
  };

  const handleCloseCameraDialog = () => {
    handleStopCamera();
    setShowCameraDialog(false);
    setCapturedImage(null);
    setIsCaptured(false);
    setImageSource(null);
    setCameraError(null);
  };

  const handleTakePhoto = () => {
    if (videoRef.current && cameraStream) {
      const canvas = document.createElement("canvas");
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageDataUrl);
        setIsCaptured(true);
        handleStopCamera();
      }
    }
  };

  const handleSelectImage = () => {
    setImageSource("file");
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
        setIsCaptured(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setIsCaptured(false);
    setImageSource(null);
    handleStopCamera();
  };

  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleExecute = async () => {
    if (!capturedImage) return;

    try {
      const file = base64ToFile(capturedImage, "captured-image.jpg");
      const formData = new FormData();
      formData.append("file", file);

      console.log("Sending image to API...");
      const response = await fetch("/detect?min_thresh=0.5", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Detection result:", result);
      } else {
        console.error("API Error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error calling API:", error);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<CameraIcon />}
        onClick={handleCamera}
        sx={{
          bgcolor: "#ff9800",
          "&:hover": {
            bgcolor: "#f57c00",
          },
          color: "white",
          fontWeight: "bold",
          px: { xs: 2, sm: 3 },
          py: { xs: 1, sm: 1.5 },
          borderRadius: 2,
          textTransform: "none",
          fontSize: { xs: "0.875rem", sm: "1rem" },
          minWidth: { xs: "140px", sm: "160px" },
          height: { xs: "40px", sm: "48px" },
        }}
      >
        {isMobile ? "Camera" : "Test Camera"}
      </Button>

      <Dialog
        open={showCameraDialog}
        onClose={handleCloseCameraDialog}
        maxWidth={isMobile ? "sm" : "md"}
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            maxHeight: isMobile ? "100vh" : "90vh",
            m: isMobile ? 0 : 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            color: "#1976d2",
            borderBottom: "1px solid #e0e0e0",
            pb: { xs: 1.5, sm: 2 },
            pt: { xs: 2, sm: 3 },
          }}
        >
          {isMobile ? "Camera" : "Camera Test"}
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {cameraError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {cameraError}
            </Alert>
          )}

          {!isCaptured && imageSource === null && (
            <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                sx={{ mb: { xs: 1.5, sm: 2 } }}
              >
                Choose Image Source
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  variant="contained"
                  onClick={handleStartCamera}
                  disabled={isCameraLoading || availableCameras.length === 0}
                  startIcon={
                    isCameraLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <CameraIcon />
                    )
                  }
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    minWidth: { xs: "140px", sm: "160px" },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  {isCameraLoading ? "Starting..." : "Start Camera"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleSelectImage}
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    minWidth: { xs: "140px", sm: "160px" },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  Select Image
                </Button>
              </Stack>
            </Box>
          )}

          {availableCameras.length > 0 && imageSource === null && (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, textAlign: "center" }}
              >
                Found {availableCameras.length} camera(s)
              </Typography>

              <FormControl
                fullWidth
                sx={{
                  mb: { xs: 2, sm: 3 },
                  maxWidth: { xs: "100%", sm: "400px" },
                  mx: "auto",
                  display: "block",
                }}
              >
                <InputLabel>Select Camera</InputLabel>
                <Select
                  value={selectedCameraId}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  label="Select Camera"
                >
                  {availableCameras.map((camera) => (
                    <MenuItem key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          {imageSource === "camera" && cameraStream && !isCaptured && (
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  position: "relative",
                  display: "inline-block",
                  border: "3px solid #1976d2",
                  borderRadius: 2,
                  overflow: "hidden",
                  mb: { xs: 1.5, sm: 2 },
                  width: "100%",
                  maxWidth: { xs: "280px", sm: "400px" },
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    height: isMobile ? "350px" : "500px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>
              <Button
                variant="contained"
                onClick={handleTakePhoto}
                sx={{
                  bgcolor: "#4caf50",
                  "&:hover": { bgcolor: "#45a049" },
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  minWidth: { xs: "120px", sm: "140px" },
                }}
              >
                Take Photo
              </Button>
            </Box>
          )}

          {isCaptured && capturedImage && (
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  position: "relative",
                  display: "inline-block",
                  border: "3px solid #4caf50",
                  borderRadius: 2,
                  overflow: "hidden",
                  mb: { xs: 1.5, sm: 2 },
                  width: "100%",
                  maxWidth: { xs: "280px", sm: "400px" },
                }}
              >
                <img
                  src={capturedImage}
                  alt="Captured"
                  style={{
                    width: "100%",
                    height: isMobile ? "350px" : "500px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  variant="outlined"
                  onClick={handleRetakePhoto}
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    minWidth: { xs: "120px", sm: "140px" },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  Chụp lại
                </Button>
                <Button
                  variant="contained"
                  onClick={handleExecute}
                  sx={{
                    bgcolor: "#1976d2",
                    "&:hover": { bgcolor: "#1565c0" },
                    px: { xs: 3, sm: 4 },
                    py: { xs: 1, sm: 1.5 },
                    minWidth: { xs: "120px", sm: "140px" },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  Execute
                </Button>
              </Stack>
            </Box>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
        </DialogContent>

        <DialogActions
          sx={{
            p: { xs: 2, sm: 3 },
            pt: 0,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Button
            onClick={handleCloseCameraDialog}
            color="inherit"
            sx={{
              width: { xs: "100%", sm: "auto" },
              order: { xs: 2, sm: 1 },
            }}
          >
            Cancel
          </Button>
          {imageSource === "camera" && cameraStream && !isCaptured && (
            <Button
              onClick={handleStopCamera}
              color="warning"
              sx={{
                width: { xs: "100%", sm: "auto" },
                order: { xs: 1, sm: 2 },
              }}
            >
              Stop Camera
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CameraTestButton;
