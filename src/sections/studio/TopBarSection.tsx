import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  PlayArrow as RunIcon,
  Stop as StopIcon,
  CheckCircle as ValidateIcon,
  ViewModule as WorkspaceIcon,
  Code as PythonIcon,
  Javascript as JavascriptIcon,
  CameraAlt as CameraIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Refresh as RestartIcon,
  Usb as UsbIcon,
} from "@mui/icons-material";
import { usePhaserContext } from "../../features/phaser/context/PhaserContext";
import { useNotification } from "hooks/useNotification";
import { forceCleanupBeforeExecute } from "../../theme/block/renderer-ottobit";
import { useFieldInputManager } from "../../components/block/hooks/useFieldInputManager";
import { useAppDispatch } from "../../redux/config";
import { createSubmissionThunk } from "../../redux/submission/submissionThunks";
import { BlocklyToPhaserConverter } from "../../features/phaser/services/blocklyToPhaserConverter";
import MicrobitDialog from "../../components/MicrobitDialog";

interface TopBarSectionProps {
  activeTab?: number;
  onTabChange?: (tab: number) => void;
  workspace?: any; // Blockly workspace for code generation
}

export default function TopBarSection({
  activeTab = 0,
  onTabChange,
  workspace,
}: TopBarSectionProps) {
  return (
    <TopBarContent
      activeTab={activeTab}
      onTabChange={onTabChange}
      workspace={workspace}
    />
  );
}

function TopBarContent({
  activeTab = 0,
  onTabChange,
  workspace,
}: TopBarSectionProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [showMicrobitDialog, setShowMicrobitDialog] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
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
  const { showNotification, NotificationComponent } = useNotification();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Field input manager for cleanup
  const { forceCleanupFields } = useFieldInputManager();

  // Track submission to prevent duplicates
  const submissionInProgress = useRef(false);

  // Phaser context for running programs
  const {
    isConnected: phaserConnected,
    isReady: phaserReady,
    runProgramFromWorkspace,
    stopProgram,
    restartScene,
    gameState,
    currentChallengeId,
    onMessage,
    offMessage,
  } = usePhaserContext();

  // Function to submit solution after completing challenge - memoized to prevent recreations
  const submitSolution = useCallback(
    async (stars: number) => {
      // Prevent duplicate submissions
      if (submissionInProgress.current) {
        console.warn("🚫 Submission already in progress, skipping duplicate");
        return;
      }

      if (!currentChallengeId || !workspace) {
        console.warn("Cannot submit: missing challenge ID or workspace");
        return;
      }

      submissionInProgress.current = true;

      try {
        console.log("🎆 Submitting solution:", {
          challengeId: currentChallengeId,
          stars,
          hasWorkspace: !!workspace,
        });

        // Convert workspace to program using existing converter
        const programData =
          BlocklyToPhaserConverter.convertWorkspace(workspace);
        const codeJson = JSON.stringify(programData);

        console.log("📝 Generated code JSON:", {
          programData,
          codeJsonLength: codeJson.length,
        });

        // Submit to backend
        const result = await dispatch(
          createSubmissionThunk({
            challengeId: currentChallengeId,
            codeJson,
            star: stars,
          })
        ).unwrap();

        console.log("✅ Submission successful:", result);

        showNotification(
          `Chúc mừng! Bạn đã hoàn thành challenge với ${stars} sao! ⭐️`,
          "success"
        );
      } catch (error: any) {
        console.error("❌ Submission failed:", error);

        showNotification(
          `Hoàn thành challenge nhưng không thể lưu kết quả: ${error}`,
          "warning"
        );
      } finally {
        // Reset submission flag after completion
        submissionInProgress.current = false;
      }
    },
    [currentChallengeId, workspace, dispatch, showNotification]
  );

  // Create stable victory handler - memoized to prevent useEffect re-runs
  const handleVictory = useCallback(
    (victoryData: any) => {
      console.log("🎆 Victory event received:", victoryData);

      // Use stars calculation logic from VictoryModal (same as UI)
      const score = victoryData.starScore ?? victoryData.score ?? 0;
      console.log("🎯 Final score used for stars calculation:", score);

      // Use the same calculateStarsFromScore logic as VictoryModal
      const calculateStarsFromScore = (score: number): number => {
        const clamp = (value: number, min: number, max: number) =>
          Math.max(min, Math.min(max, value));
        const stars = clamp(Math.ceil(score * 3), 1, 3);

        console.log("🌟 Stars Calculation - Input score:", score);
        console.log("🌟 Formula: stars = clamp(ceil(score * 3), 1, 3)");
        console.log(
          `🌟 Step: ${score} * 3 = ${score * 3}, ceil = ${Math.ceil(
            score * 3
          )}, clamp = ${stars}`
        );
        console.log("🌟 Final stars:", stars);

        return stars;
      };

      // Calculate stars exactly like VictoryModal does
      const calculatedStars =
        victoryData.stars ?? calculateStarsFromScore(score);

      console.log("🏆 Final stars for submission:", {
        providedStars: victoryData.stars,
        calculatedStars,
        finalStars: calculatedStars,
      });

      // Submit solution with calculated stars
      submitSolution(calculatedStars);
    },
    [submitSolution]
  ); // Only depend on memoized submitSolution

  // Listen for victory events from Phaser - optimized effect with minimal dependencies
  useEffect(() => {
    console.log("🎵 Registering VICTORY listener");

    // Register victory listener
    onMessage("VICTORY", handleVictory);

    // Cleanup listener on unmount or effect re-run
    return () => {
      console.log("🧹 Cleaning up VICTORY listener");
      offMessage("VICTORY", handleVictory);
    };
  }, [onMessage, offMessage, handleVictory]); // Minimal dependencies

  const handleRun = async () => {
    console.log("🚀 [TopBar] Execute button clicked");

    // CRITICAL: Emergency cleanup before execute to prevent field editor leaks
    console.log("🚨 [TopBar] Running emergency cleanup before execute...");
    forceCleanupBeforeExecute();

    // ENHANCED: Also cleanup field inputs specifically
    console.log("🧡 [TopBar] Cleaning up field inputs...");
    forceCleanupFields();

    if (!workspace) {
      console.error("❌ [TopBar] No workspace available");
      return;
    }

    console.log("📋 [TopBar] Workspace available:", {
      workspaceId: workspace.id,
      blockCount: workspace.getAllBlocks().length,
      hasStartBlock: workspace
        .getAllBlocks()
        .some((b: any) => b.type === "ottobit_start"),
    });

    setIsRunning(true);

    try {
      // Đảm bảo Phaser thực sự sẵn sàng
      console.log("🎮 [TopBar] Checking Phaser connection:", {
        phaserConnected,
        phaserReady,
      });

      if (!phaserConnected || !phaserReady) {
        console.log("⏳ [TopBar] Waiting for Phaser to be ready...");
        // Đợi một chút để Phaser sẵn sàng
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!phaserConnected || !phaserReady) {
          console.error("❌ [TopBar] Phaser still not ready after wait");
          setIsRunning(false);
          return;
        }
      }

      // Thêm delay nhỏ trước khi gửi message để đảm bảo Phaser thực sự sẵn sàng
      console.log("⏳ [TopBar] Adding safety delay before execution...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("🎯 [TopBar] Calling runProgramFromWorkspace...");
      await runProgramFromWorkspace(workspace);
    } catch (error) {
      console.error("❌ [TopBar] Error during execution:", error);

      // CRITICAL: Cleanup again on error to prevent leaks
      forceCleanupBeforeExecute();

      // ENHANCED: Also cleanup field inputs on error
      forceCleanupFields();

      setIsRunning(false);
      return;
    }

    // Theo dõi trạng thái chương trình và cập nhật UI
    const checkProgramStatus = () => {
      if (gameState?.programStatus === "running") {
        // Nếu chương trình vẫn đang chạy, tiếp tục kiểm tra
        setTimeout(checkProgramStatus, 1000);
      } else {
        // Chương trình đã dừng hoặc hoàn thành
        setIsRunning(false);
      }
    };

    // Bắt đầu kiểm tra sau 2 giây để Phaser có thời gian xử lý
    setTimeout(checkProgramStatus, 2000);
  };

  const handleStop = async () => {
    try {
      await stopProgram();
    } catch (error) {}
    setIsRunning(false);
  };

  const handleRestart = async () => {
    console.log("🔄 [TopBar] Restart button clicked");

    try {
      console.log("⏳ [TopBar] Calling restartScene...");
      await restartScene();
      console.log("✅ [TopBar] Scene restarted successfully");

      showNotification("Map đã được tải lại thành công!", "success");
    } catch (error) {
      console.error("❌ [TopBar] Error restarting scene:", error);
      showNotification("Không thể tải lại map. Vui lòng thử lại.", "error");
    }
  };

  const handleValidate = () => {
    // TODO: Implement validation logic
  };

  const handleSendToMicrobit = () => {
    setShowMicrobitDialog(true);
  };

  const handleCamera = async () => {
    setShowCameraDialog(true);
    setCameraError(null);

    // Load available cameras
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      setAvailableCameras(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error loading cameras:", error);
    }
  };

  const handleStartCamera = async () => {
    try {
      setIsCameraLoading(true);
      setCameraError(null);

      // Use selected camera or default constraints
      const constraints: MediaStreamConstraints = {
        video: selectedCameraId
          ? {
              width: { ideal: 720 },
              height: { ideal: 1280 },
              facingMode: { ideal: "user" },
              deviceId: { exact: selectedCameraId },
            }
          : {
              width: { ideal: 720 },
              height: { ideal: 1280 },
              facingMode: { ideal: "user" },
            },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
    } catch (error: any) {
      console.error("Camera access error:", error);

      // Try fallback with basic constraints
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setCameraStream(fallbackStream);
      } catch (fallbackError: any) {
        setCameraError(
          fallbackError.name === "NotAllowedError"
            ? "Camera access denied. Please allow camera access and try again."
            : "Failed to access camera. Please check your camera and try again. You can also connect your phone via USB for better camera access."
        );
      }
    } finally {
      setIsCameraLoading(false);
    }
  };

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const handleCloseCameraDialog = () => {
    handleStopCamera();
    setShowCameraDialog(false);
    setCameraError(null);
    setCapturedImage(null);
    setIsCaptured(false);
    setImageSource(null);
  };

  const handleTakePhoto = () => {
    if (!cameraStream) return;

    try {
      // Create canvas to capture the video frame
      const video = document.querySelector("video");
      if (!video) return;

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to data URL (base64 image)
      const imageDataUrl = canvas.toDataURL("image/png");

      // Save the captured image
      setCapturedImage(imageDataUrl);
      setIsCaptured(true);
      setImageSource("camera");
    } catch (error) {
      console.error("Failed to capture photo:", error);
      setCameraError("Failed to capture photo. Please try again.");
    }
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setIsCaptured(false);
    setImageSource(null);
    handleStopCamera(); // Stop camera if running
  };

  const base64ToFile = (base64String: string, filename: string): File => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleExecute = async () => {
    if (!capturedImage) {
      console.error("No image to execute");
      showNotification("Please select an image before executing!", "error");
      return;
    }

    try {
      // Convert base64 to File
      const file = base64ToFile(capturedImage, `image_${Date.now()}.jpg`);

      // Create FormData
      const formData = new FormData();
      formData.append("file", file, file.name);

      // Make API call
      const response = await fetch("/detect?min_thresh=0.5", {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Detection result:", result);

      // Render blocks in Blockly workspace immediately if available
      try {
        const detections = Array.isArray(result?.detections)
          ? result.detections
          : [];
        if (
          detections.length > 0 &&
          (window as any).StudioBlocks?.loadDetections
        ) {
          (window as any).StudioBlocks.loadDetections(detections);
        }
      } catch {}

      // Close dialog first
      handleCloseCameraDialog();

      // Show success notification
      showNotification(
        "Image analysis completed successfully! Results have been saved.",
        "success"
      );
    } catch (error) {
      console.error("Error executing detection:", error);

      // Show error notification with user-friendly message
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        showNotification(
          "Unable to connect to server. Please check your network connection and try again.",
          "error"
        );
      } else if (
        error instanceof Error &&
        error.message.includes("HTTP error")
      ) {
        showNotification(
          "Server is experiencing issues. Please try again later.",
          "error"
        );
      } else {
        showNotification(
          "An error occurred while analyzing the image. Please try again.",
          "error"
        );
      }
    }
  };

  const handleSelectFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setCapturedImage(result);
          setIsCaptured(true);
          setImageSource("file");
          handleStopCamera(); // Stop camera if running
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "#10b981",
        borderBottom: "1px solid #059669",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: "56px", sm: "64px", md: "72px" },
          px: { xs: 1, sm: 2 },
          gap: { xs: 1, sm: 2 },
          flexWrap: { xs: "wrap", md: "nowrap" }, // Allow wrapping on mobile
        }}
      >
        {/* Ottobit Logo - Mobile Responsive with Navigation */}
        <Box
          onClick={() => navigate("/")}
          sx={{
            width: { xs: 40, sm: 45, md: 50 },
            height: { xs: 40, sm: 45, md: 50 },
            bgcolor: "#ffffff",
            borderRadius: { xs: "8px", md: "12px" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: { xs: 1, sm: 2 },
            p: 0.5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              bgcolor: "#f8f9fa",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
        >
          <img
            src="/asset/OttobitLogoText.png"
            alt="Ottobit Logo - Click to go home"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </Box>

        {/* Project Title - Responsive with Navigation */}
        <Typography
          variant="h5"
          onClick={() => navigate("/")}
          sx={{
            fontWeight: 700,
            color: "#ffffff",
            fontSize: { xs: "18px", sm: "20px", md: "24px" },
            letterSpacing: "0.5px",
            display: { xs: "none", sm: "block" }, // Hide on very small screens
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              color: "#d1fae5",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            },
          }}
        >
          Ottobit Studio
        </Typography>

        {/* Short title for mobile with Navigation */}
        <Typography
          variant="h6"
          onClick={() => navigate("/")}
          sx={{
            fontWeight: 700,
            color: "#ffffff",
            fontSize: "16px",
            letterSpacing: "0.5px",
            display: { xs: "block", sm: "none" }, // Only show on very small screens
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              color: "#d1fae5",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            },
          }}
        >
          Ottobit
        </Typography>

        {/* Spacer to center tabs */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Tabs for switching views - Hidden on mobile */}
        <Box
          sx={{
            bgcolor: "#ffffff",
            borderRadius: "20px",
            p: 0.5,
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: { xs: "none", md: "block" }, // Hide on mobile and tablet
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => onTabChange?.(newValue)}
            sx={{
              minHeight: 48,
              "& .MuiTab-root": {
                minHeight: 48,
                minWidth: 60,
                color: "#64748b",
                "&.Mui-selected": {
                  color: "#10b981",
                  bgcolor: "#f0fdf4",
                  borderRadius: "16px",
                },
                "&:hover": {
                  bgcolor: "#f8fafc",
                  borderRadius: "16px",
                },
              },
              "& .MuiTabs-indicator": {
                display: "none",
              },
            }}
          >
            <Tab
              icon={
                <WorkspaceIcon
                  sx={{
                    fontSize: 32,
                    color: activeTab === 0 ? "#10b981" : "#64748b",
                  }}
                />
              }
              title="Workspace"
            />
            <Tab
              icon={
                <PythonIcon
                  sx={{
                    fontSize: 32,
                    color: activeTab === 1 ? "#306998" : "#64748b",
                  }}
                />
              }
              title="Python"
            />
            <Tab
              icon={
                <JavascriptIcon
                  sx={{
                    fontSize: 32,
                    color: activeTab === 2 ? "#f7df1e" : "#64748b",
                  }}
                />
              }
              title="JavaScript"
            />
          </Tabs>
        </Box>

        {/* Spacer to push buttons right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* All Action Buttons - Mobile Responsive */}
        <Box
          sx={{
            bgcolor: "#ffffff",
            borderRadius: { xs: "12px", md: "20px" },
            p: { xs: 0.5, sm: 0.6, md: 0.8 },
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            gap: { xs: 0.5, sm: 0.6, md: 0.8 },
            alignItems: "center",
            flexWrap: { xs: "wrap", sm: "nowrap" },
          }}
        >
          <Tooltip title="Send to micro:bit">
            <IconButton
              onClick={handleSendToMicrobit}
              sx={{
                bgcolor: "#eef2ff",
                color: "#4338ca",
                width: { xs: 36, sm: 42, md: 48 },
                height: { xs: 36, sm: 42, md: 48 },
                "&:hover": {
                  bgcolor: "#e0e7ff",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(67, 56, 202, 0.25)",
                },
              }}
            >
              <UsbIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Open Camera">
            <IconButton
              onClick={handleCamera}
              sx={{
                bgcolor: "#fff3e0",
                color: "#f57c00",
                width: 48,
                height: 48,
                "&:hover": {
                  bgcolor: "#ffe0b2",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(245, 124, 0, 0.3)",
                },
              }}
            >
              <CameraIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>

          {/* Divider */}
          <Box sx={{ width: 1, height: 32, bgcolor: "#e2e8f0", mx: 0.8 }} />

          <Tooltip title={isRunning ? "Stop Program" : "Run Program"}>
            <span>
              <IconButton
                onClick={isRunning ? handleStop : handleRun}
                disabled={!workspace}
                sx={{
                  bgcolor: isRunning ? "#ef4444" : "#10b981",
                  color: "white",
                  width: { xs: 36, sm: 42, md: 48 },
                  height: { xs: 36, sm: 42, md: 48 },
                  "&:hover": {
                    bgcolor: isRunning ? "#dc2626" : "#059669",
                    transform: "translateY(-1px)",
                    boxShadow: isRunning
                      ? "0 4px 12px rgba(239, 68, 68, 0.4)"
                      : "0 4px 12px rgba(16, 185, 129, 0.4)",
                  },
                  "&:disabled": {
                    bgcolor: "#9ca3af",
                    color: "#6b7280",
                    "&:hover": {
                      transform: "none",
                      boxShadow: "none",
                    },
                  },
                }}
              >
                {isRunning ? (
                  <StopIcon sx={{ fontSize: 24 }} />
                ) : (
                  <RunIcon sx={{ fontSize: 24 }} />
                )}
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Restart Map">
            <span>
              <IconButton
                onClick={handleRestart}
                disabled={!phaserConnected || !phaserReady}
                sx={{
                  bgcolor: "#f3f4f6",
                  color: "#6b7280",
                  width: { xs: 36, sm: 42, md: 48 },
                  height: { xs: 36, sm: 42, md: 48 },
                  "&:hover": {
                    bgcolor: "#ff9800",
                    color: "white",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(255, 152, 0, 0.4)",
                  },
                  "&:disabled": {
                    bgcolor: "#f3f4f6",
                    color: "#9ca3af",
                    "&:hover": {
                      transform: "none",
                      boxShadow: "none",
                    },
                  },
                }}
              >
                <RestartIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Validate Code">
            <IconButton
              onClick={handleValidate}
              sx={{
                bgcolor: "#e8f5e8",
                color: "#2e7d32",
                width: { xs: 36, sm: 42, md: 48 },
                height: { xs: 36, sm: 42, md: 48 },
                border: "2px solid #4caf50",
                "&:hover": {
                  bgcolor: "#4caf50",
                  color: "white",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)",
                },
              }}
            >
              <ValidateIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Microbit Dialog */}
      <MicrobitDialog
        open={showMicrobitDialog}
        onClose={() => setShowMicrobitDialog(false)}
        workspace={workspace}
      />

      {/* Camera Dialog */}
      <Dialog
        open={showCameraDialog}
        onClose={handleCloseCameraDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CameraIcon sx={{ color: "#f57c00" }} />
            <Typography variant="h6">Camera Capture</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {cameraError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {cameraError}
            </Alert>
          )}

          {!cameraStream && !isCameraLoading && !isCaptured && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 4,
                textAlign: "center",
              }}
            >
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <CameraIcon sx={{ fontSize: 48, color: "#e0e0e0" }} />
                <PhotoLibraryIcon sx={{ fontSize: 48, color: "#e0e0e0" }} />
              </Box>
              <Typography variant="h6" gutterBottom>
                Choose Image Source
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Take a photo with camera or select an existing image
              </Typography>

              {/* Debug info */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Found {availableCameras.length} camera(s)
              </Typography>

              {availableCameras.length > 0 && (
                <FormControl fullWidth sx={{ mb: 3, maxWidth: 400 }}>
                  <InputLabel>Select Camera</InputLabel>
                  <Select
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    label="Select Camera"
                  >
                    {availableCameras.map((camera, index) => (
                      <MenuItem key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || `Camera ${index + 1}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleStartCamera}
                  startIcon={<CameraIcon />}
                  sx={{
                    bgcolor: "#f57c00",
                    "&:hover": { bgcolor: "#e65100" },
                  }}
                >
                  Start Camera
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleSelectFile}
                  startIcon={<PhotoLibraryIcon />}
                  sx={{
                    borderColor: "#1976d2",
                    color: "#1976d2",
                    "&:hover": {
                      borderColor: "#1565c0",
                      backgroundColor: "rgba(25, 118, 210, 0.04)",
                    },
                  }}
                >
                  Select Image
                </Button>
              </Box>
            </Box>
          )}

          {isCameraLoading && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 4,
              }}
            >
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="body1">
                Requesting camera access...
              </Typography>
            </Box>
          )}

          {cameraStream && !isCaptured && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 400,
                  height: 500,
                  backgroundColor: "#000",
                  borderRadius: 1,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <video
                  autoPlay
                  playsInline
                  muted
                  ref={(video) => {
                    if (video && cameraStream) {
                      video.srcObject = cameraStream;
                    }
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                Camera is ready! Click "Take Photo" to capture an image.
              </Typography>
            </Box>
          )}

          {isCaptured && capturedImage && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 400,
                  height: 500,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 1,
                  overflow: "hidden",
                  position: "relative",
                  border: "2px solid #4caf50",
                }}
              >
                <img
                  src={capturedImage}
                  alt="Captured photo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(76, 175, 80, 0.9)",
                    color: "white",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  ✓ Captured
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary">
                {imageSource === "camera"
                  ? "Photo captured successfully! You can retake or execute with this image."
                  : "Image selected successfully! You can select another image or execute with this image."}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseCameraDialog} color="inherit">
            Cancel
          </Button>

          {cameraStream && !isCaptured && (
            <Button onClick={handleStopCamera} color="warning">
              Stop Camera
            </Button>
          )}

          {cameraStream && !isCaptured && (
            <Button
              onClick={handleTakePhoto}
              variant="contained"
              startIcon={<CameraIcon />}
              sx={{
                bgcolor: "#f57c00",
                "&:hover": { bgcolor: "#e65100" },
              }}
            >
              Take Photo
            </Button>
          )}

          {isCaptured && (
            <Button
              onClick={handleRetakePhoto}
              variant="outlined"
              startIcon={
                imageSource === "camera" ? <CameraIcon /> : <PhotoLibraryIcon />
              }
              sx={{
                borderColor: "#f57c00",
                color: "#f57c00",
                "&:hover": {
                  borderColor: "#e65100",
                  backgroundColor: "rgba(245, 124, 0, 0.04)",
                },
              }}
            >
              {imageSource === "camera" ? "Chụp lại" : "Chọn ảnh khác"}
            </Button>
          )}

          {isCaptured && (
            <Button
              onClick={handleExecute}
              variant="contained"
              sx={{
                bgcolor: "#4caf50",
                "&:hover": { bgcolor: "#388e3c" },
              }}
            >
              Execute
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Notification Component */}
      <NotificationComponent />
    </AppBar>
  );
}
