import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  ViewModule as WorkspaceIcon,
  Code as PythonIcon,
  Javascript as JavascriptIcon,
  CameraAlt as CameraIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Refresh as RestartIcon,
  Usb as UsbIcon,
  ArrowBack as BackIcon,
  Lock as LockIcon,
  TipsAndUpdates as HintIcon,
  Tour as TourIcon,
} from "@mui/icons-material";
import { usePhaserContext } from "../../features/phaser/context/PhaserContext";
import { useNotification } from "hooks/useNotification";
import { useLocales } from "hooks";
import { forceCleanupBeforeExecute } from "../../theme/block/renderer-ottobit";
import { useFieldInputManager } from "../../components/block/hooks/useFieldInputManager";
import { useAppDispatch, useAppSelector } from "../../redux/config";
import { createSubmissionThunk } from "../../redux/submission/submissionThunks";
import { BlocklyToPhaserConverter } from "../../features/phaser/services/blocklyToPhaserConverter";
import MicrobitDialog from "../../components/MicrobitDialog";
import { PATH_USER } from "../../routes/paths";
import { ChallengeMode } from "../../common/@types/challenge";
import {
  generateStudioUrl,
  getStoredNavigationData,
} from "../../utils/studioNavigation";
import { isChallengeAccessible } from "../../utils/challengeUtils";
import { getMySubmissionsThunk } from "../../redux/submission/submissionThunks";
import SolutionHintDialog from "./SolutionHintDialog";

interface TopBarSectionProps {
  activeTab?: number;
  onTabChange?: (tab: number) => void;
  workspace?: any; // Blockly workspace for code generation
  roomId?: string;
}

export default function TopBarSection({
  activeTab = 0,
  onTabChange,
  workspace,
  roomId,
}: TopBarSectionProps) {
  return (
    <TopBarContent
      activeTab={activeTab}
      onTabChange={onTabChange}
      workspace={workspace}
      roomId={roomId}
    />
  );
}

function TopBarContent({
  activeTab = 0,
  onTabChange,
  workspace,
  roomId,
}: TopBarSectionProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [showMicrobitDialog, setShowMicrobitDialog] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showHintDialog, setShowHintDialog] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  // Helper: close Blockly toolbox/flyout safely without causing layout shifts
  const closeWorkspaceToolbox = useCallback(() => {
    try {
      if (!workspace) return;

      // Use requestAnimationFrame to defer DOM updates and prevent layout shifts
      requestAnimationFrame(() => {
        try {
          const toolbox = workspace.getToolbox && workspace.getToolbox();
          toolbox?.clearSelection?.();

          const flyout = workspace.getFlyout && workspace.getFlyout();
          if (flyout && typeof flyout.setVisible === "function") {
            flyout.setVisible(false);
          }

          // Update to empty toolbox quietly
          const emptyToolbox = { kind: "flyoutToolbox", contents: [] as any[] };
          if (typeof workspace.updateToolbox === "function") {
            workspace.updateToolbox(emptyToolbox);
          }
        } catch {}
      });
    } catch {}
  }, [workspace]);
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
  const { translate } = useLocales();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  // Lesson context for map navigation
  const [lessonId, setLessonId] = useState<string | null>(null);

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
    currentChallengeId,
    currentChallenge,
    onMessage,
    offMessage,
    fetchChallengesByLesson,
    lessonChallenges,
  } = usePhaserContext();

  // Detect if current challenge is physical mode
  const isPhysicalMap =
    currentChallenge?.challengeMode === ChallengeMode.PhysicalFirst;

  // Derive lessonId from query params or stored navigation data
  useEffect(() => {
    const idFromQuery = searchParams.get("lesson");
    if (idFromQuery) {
      setLessonId(idFromQuery);
      return;
    }
    const stored = getStoredNavigationData();
    if (stored?.lessonId) {
      setLessonId(stored.lessonId);
    }
  }, [searchParams]);

  // Fetch lesson challenges (up to 8) when lessonId is available
  useEffect(() => {
    if (!lessonId) return;
    const items = (lessonChallenges as any)?.items || [];
    if (items.length === 0) {
      // Fetch a larger page size to include all challenges for the lesson
      fetchChallengesByLesson(lessonId, 1, 100);
    }
  }, [lessonId, fetchChallengesByLesson, lessonChallenges]);

  // Challenge list for lesson
  const lessonChallengeItems = (lessonChallenges as any)?.items || [];

  // Index map for quick lookup
  const challengeIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    (lessonChallengeItems || []).forEach((c: any, i: number) =>
      map.set(c.id, i)
    );
    return map;
  }, [lessonChallengeItems]);

  // Submissions from Redux (progress info)
  const { mySubmissions } = useAppSelector((state) => state.submission);
  const submissionsItems = mySubmissions?.data?.items || [];

  // Fetch submissions when lessonId is present
  useEffect(() => {
    if (!lessonId) return;
    dispatch(getMySubmissionsThunk({ pageNumber: 1, pageSize: 100 }));
  }, [lessonId, dispatch]);

  // Check accessibility using the same logic as LessonTabletSection
  const isChallengeUnlocked = useCallback(
    (id: string, index?: number) => {
      const challenge =
        typeof index === "number" && index >= 0
          ? lessonChallengeItems[index]
          : lessonChallengeItems.find((c: any) => c.id === id);
      if (!challenge) return false;
      return isChallengeAccessible(
        challenge,
        lessonChallengeItems,
        submissionsItems
      );
    },
    [lessonChallengeItems, submissionsItems]
  );

  // Function to submit solution after completing challenge - memoized to prevent recreations
  const submitSolution = useCallback(
    async (stars: number) => {
      // Prevent duplicate submissions
      if (submissionInProgress.current) {
        // prevent duplicate
        return;
      }

      if (!currentChallengeId || !workspace) {
        console.warn("Cannot submit: missing challenge ID or workspace");
        return;
      }

      submissionInProgress.current = true;

      try {
        // Convert workspace to program using existing converter
        const programData =
          BlocklyToPhaserConverter.convertWorkspace(workspace);
        const codeJson = JSON.stringify(programData);

        // Submit to backend
        await dispatch(
          createSubmissionThunk({
            challengeId: currentChallengeId,
            codeJson,
            star: stars,
          })
        ).unwrap();

        showNotification(
          `Chúc mừng! Bạn đã hoàn thành challenge với ${stars} sao! ⭐️`,
          "success"
        );
      } catch (error: any) {
        // swallow error; UI will show notification

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
      // Use stars calculation logic from VictoryModal (same as UI)
      const score = victoryData.starScore ?? victoryData.score ?? 0;

      // Use the same calculateStarsFromScore logic as VictoryModal
      const calculateStarsFromScore = (score: number): number => {
        const clamp = (value: number, min: number, max: number) =>
          Math.max(min, Math.min(max, value));
        const stars = clamp(Math.ceil(score * 3), 1, 3);

        return stars;
      };

      // Calculate stars exactly like VictoryModal does
      const calculatedStars =
        victoryData.stars ?? calculateStarsFromScore(score);

      // Refresh progress from server and submit solution
      if (lessonId) {
        dispatch(getMySubmissionsThunk({ pageNumber: 1, pageSize: 100 }));
      }
      submitSolution(calculatedStars);
    },
    [submitSolution, lessonId, dispatch]
  ); // Only depend on memoized submitSolution

  // Listen for victory events from Phaser - optimized effect with minimal dependencies
  useEffect(() => {
    // Combined handler for victory: submission + UI state
    const handleVictoryComplete = (victoryData: any) => {
      // Handle submission
      handleVictory(victoryData);
      // Reset UI state
      setIsRunning(false);
    };

    // Combined handler for defeat: UI state only
    const handleDefeatComplete = () => {
      setIsRunning(false);
    };

    // Register victory and defeat listeners
    onMessage("VICTORY", handleVictoryComplete);
    onMessage("LOSE", handleDefeatComplete);
    onMessage("PROGRAM_STOPPED", handleDefeatComplete);

    // Cleanup listener on unmount or effect re-run
    return () => {
      offMessage("VICTORY", handleVictoryComplete);
      offMessage("LOSE", handleDefeatComplete);
      offMessage("PROGRAM_STOPPED", handleDefeatComplete);
    };
  }, [onMessage, offMessage, handleVictory]); // Minimal dependencies

  const handleRun = async () => {
    // Prevent execution for physical maps
    if (isPhysicalMap) {
      showNotification(
        "Map vật lý không hỗ trợ chạy trên simulator. Vui lòng sử dụng nút 'Send to micro:bit' để nạp code lên thiết bị.",
        "warning"
      );
      return;
    }

    // Prevent double execution
    if (isRunning) {
      return;
    }

    // CRITICAL: Emergency cleanup before execute to prevent field editor leaks
    forceCleanupBeforeExecute();

    // ENHANCED: Also cleanup field inputs specifically
    forceCleanupFields();

    if (!workspace) {
      console.error("❌ [TopBar] No workspace available");
      return;
    }

    setIsRunning(true);

    try {
      // Verify Phaser is ready
      if (!phaserConnected || !phaserReady) {
        console.error("❌ [TopBar] Phaser not ready");
        setIsRunning(false);
        return;
      }

      // Single call to runProgramFromWorkspace - no duplicates
      // Note: UI state reset (setIsRunning(false)) is handled by permanent listeners in useEffect
      await runProgramFromWorkspace(workspace);

      // Safety timeout: force reset isRunning after 30 seconds if no message received
      setTimeout(() => {
        setIsRunning(false);
      }, 30000);
    } catch (error) {
      console.error("❌ [TopBar] Error during execution:", error);

      // CRITICAL: Cleanup again on error to prevent leaks
      forceCleanupBeforeExecute();
      forceCleanupFields();

      setIsRunning(false);
    }
  };

  const handleStop = async () => {
    try {
      await stopProgram();
    } catch (error) {}
    setIsRunning(false);
  };

  // Close toolbox automatically when opening solution dialog
  useEffect(() => {
    if (showHintDialog) {
      closeWorkspaceToolbox();
    }
  }, [showHintDialog, closeWorkspaceToolbox]);

  const handleRestart = async () => {
    try {
      await restartScene();

      showNotification(translate("common.MapReloadedSuccessfully"), "success");
    } catch (error) {
      console.error("❌ [TopBar] Error restarting scene:", error);
      showNotification(translate("common.CannotReloadMap"), "error");
    }
  };

  // Navigate back to lesson or previous page
  const handleBackToLesson = () => {
    if (lessonId) {
      navigate(PATH_USER.lessonDetail.replace(":id", lessonId));
    } else {
      navigate(-1);
    }
  };

  // Navigate to a specific challenge within the lesson (sequential unlock)
  const handleSelectChallenge = (targetChallengeId: string) => {
    if (!targetChallengeId || targetChallengeId === currentChallengeId) return;

    const idx = challengeIndexMap.get(targetChallengeId) ?? -1;
    const unlocked = isChallengeUnlocked(targetChallengeId, idx);
    if (!unlocked) {
      showNotification(
        "Bạn cần hoàn thành map trước đó để mở khóa map này.",
        "warning"
      );
      return;
    }

    const url = lessonId
      ? generateStudioUrl(targetChallengeId, lessonId)
      : generateStudioUrl(targetChallengeId);
    navigate(url);
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
      const response = await fetch(
        "https://otto-detect.felixtien.dev/detect?min_thresh=0.5",
        {
          method: "POST",
          headers: {
            accept: "application/json",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

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
      id="studio-topbar"
      position="static"
      elevation={0}
      sx={{
        bgcolor: "#10b981",
        borderBottom: "1px solid #059669",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        overflow: "hidden", // Prevent scroll bar
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: "56px", sm: "64px", md: "72px" },
          px: { xs: 1, sm: 2 },
          gap: { xs: 1, sm: 2 },
          flexWrap: "nowrap", // Prevent wrapping to avoid layout shift
          position: "relative",
          overflow: "hidden", // Prevent scroll bar on toolbar
        }}
      >
        {/* Ottobit Logo - Mobile Responsive with Navigation */}
        <Box
          id="tour-logo-home"
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


        {/* Short title for mobile without Navigation */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#ffffff",
            fontSize: "16px",
            letterSpacing: "0.5px",
            display: { xs: "block", sm: "none" },
            flexShrink: 0, // Prevent shrinking
            whiteSpace: "nowrap", // Prevent text wrap
          }}
        >
          Ottobit
        </Typography>

        {/* Back to Lesson */}
        <Tooltip
          title={
            lessonId
              ? translate("common.BackToLesson")
              : translate("common.Back")
          }
        >
          <IconButton
            onClick={handleBackToLesson}
            sx={{
              bgcolor: "#ffffff",
              color: "#10b981",
              width: { xs: 36, sm: 40, md: 44 },
              height: { xs: 36, sm: 40, md: 44 },
              mr: { xs: 0.5, sm: 1.5 },
              "&:hover": { bgcolor: "#f0fdf4" },
            }}
          >
            <BackIcon />
          </IconButton>
        </Tooltip>

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

        {/* Map selector - single responsive center container */}
        {lessonChallengeItems && lessonChallengeItems.length > 0 && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              px: { xs: 1, md: 2 },
            }}
          >
            <Box
              id="tour-challenge-nav"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 1 },
                px: 1,
                py: 0.5,
                bgcolor: "#ffffff",
                borderRadius: "9999px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                overflowX: "auto",
                maxWidth: "100%",
              }}
            >
              {lessonChallengeItems.map((c: any, idx: number) => {
                const selected = c.id === currentChallengeId;
                const unlocked = isChallengeUnlocked(c.id, idx);

                const Btn = (
                  <Button
                    key={c.id}
                    onClick={() => handleSelectChallenge(c.id)}
                    variant={selected ? "contained" : "outlined"}
                    size="small"
                    disabled={!unlocked}
                    sx={{
                      minWidth: { xs: 28, sm: 32 },
                      width: { xs: 28, sm: 36 },
                      height: { xs: 28, sm: 36 },
                      borderRadius: "50%",
                      p: 0,
                      fontWeight: 700,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      color: selected
                        ? "#ffffff"
                        : unlocked
                        ? "#10b981"
                        : "#9ca3af",
                      bgcolor: selected ? "#10b981" : "transparent",
                      borderColor: unlocked ? "#10b981" : "#d1d5db",
                      "&:hover": {
                        bgcolor: selected
                          ? "#059669"
                          : unlocked
                          ? "#f0fdf4"
                          : "transparent",
                        borderColor: unlocked ? "#059669" : "#d1d5db",
                      },
                      "&:disabled": {
                        color: "#9ca3af",
                        borderColor: "#d1d5db",
                      },
                    }}
                  >
                    {unlocked ? idx + 1 : <LockIcon fontSize="inherit" />}
                  </Button>
                );

                return unlocked ? (
                  Btn
                ) : (
                  <Tooltip key={c.id} title="Hoàn thành map trước để mở khóa">
                    <span>{Btn}</span>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        )}

        {/* All Action Buttons - Mobile Responsive */}
        <Box
          id="studio-actions"
          sx={{
            bgcolor: "#ffffff",
            borderRadius: { xs: "12px", md: "20px" },
            p: { xs: 0.5, sm: 0.6, md: 0.8 },
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            gap: { xs: 0.5, sm: 0.6, md: 0.8 },
            alignItems: "center",
            flexWrap: "nowrap", // Prevent wrapping to avoid layout shift
            flexShrink: 0, // Prevent shrinking
          }}
        >
          <Tooltip title="Send to micro:bit">
            <IconButton
              id="tour-btn-microbit"
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
              id="tour-btn-camera"
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

          <Tooltip title="Gợi ý lời giải">
            <IconButton
              id="tour-btn-hint"
              onClick={() => {
                closeWorkspaceToolbox();
                setShowHintDialog(true);
              }}
              sx={{
                bgcolor: "#e0f2f1",
                color: "#00695c",
                width: { xs: 36, sm: 42, md: 48 },
                height: { xs: 36, sm: 42, md: 48 },
                "&:hover": {
                  bgcolor: "#b2dfdb",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0, 105, 92, 0.3)",
                },
              }}
            >
              <HintIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>

          {/* Re-run tour */}
          <Tooltip title="Xem lại hướng dẫn">
            <IconButton
              onClick={() => {
                try {
                  window.dispatchEvent(new Event("studio-tour:run"));
                } catch {}
              }}
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
              <TourIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>

          {/* Divider */}
          <Box sx={{ width: 1, height: 32, bgcolor: "#e2e8f0", mx: 0.8 }} />

          <Tooltip
            title={
              isPhysicalMap
                ? "Map vật lý không hỗ trợ simulator. Sử dụng 'Send to micro:bit' để nạp code."
                : isRunning
                ? "Stop Program"
                : "Run Program"
            }
          >
            <span>
              <IconButton
                id="tour-btn-run"
                aria-label={isRunning ? "Stop Program" : "Run Program"}
                onClick={isRunning ? handleStop : handleRun}
                disabled={!workspace || isPhysicalMap}
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
            <span id="tour-btn-restart-wrap">
              <IconButton
                id="tour-btn-restart"
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
        </Box>
      </Toolbar>

      {/* Microbit Dialog */}
      <MicrobitDialog
        open={showMicrobitDialog}
        onClose={() => setShowMicrobitDialog(false)}
        workspace={workspace}
        roomId={roomId}
      />

      {/* Solution Hint Dialog */}
      <SolutionHintDialog
        open={showHintDialog}
        onClose={() => setShowHintDialog(false)}
        challengeId={currentChallengeId as string}
      />

      {/* Camera Dialog */}
      <Dialog
        open={showCameraDialog}
        onClose={handleCloseCameraDialog}
        maxWidth="md"
        fullWidth
        disableScrollLock={true}
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
