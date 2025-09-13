import { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import {
  PlayArrow as RunIcon,
  Stop as StopIcon,
  CheckCircle as ValidateIcon,
  ViewModule as WorkspaceIcon,
  Code as PythonIcon,
  Javascript as JavascriptIcon,
  Bluetooth as BluetoothIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import DownloadMenu from "../../features/microbit/components/DownloadMenu";
import {
  MicrobitProvider,
  useMicrobitContext,
} from "../../features/microbit/context/MicrobitContext";
import { MicrobitConnectionDialog } from "../../features/microbit/components/MicrobitConnectionDialog";
import { usePhaserContext } from "../../features/phaser/context/PhaserContext";

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
    <MicrobitProvider>
      <TopBarContent
        activeTab={activeTab}
        onTabChange={onTabChange}
        workspace={workspace}
      />
    </MicrobitProvider>
  );
}

function TopBarContent({
  activeTab = 0,
  onTabChange,
  workspace,
}: TopBarSectionProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const { isConnected } = useMicrobitContext();

  // Phaser context for running programs
  const {
    isConnected: phaserConnected,
    isReady: phaserReady,
    runProgramFromWorkspace,
    stopProgram,
    gameState,
  } = usePhaserContext();

  const handleRun = async () => {
    if (!workspace) {
      console.warn("No workspace provided to run program");
      return;
    }

    setIsRunning(true);

    try {
      // Đảm bảo Phaser thực sự sẵn sàng
      console.log("🚀 Running program in Phaser...");
      console.log("🔍 Phaser status:", { phaserConnected, phaserReady });

      if (!phaserConnected || !phaserReady) {
        console.warn("⚠️ Phaser not ready, waiting...");
        // Đợi một chút để Phaser sẵn sàng
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!phaserConnected || !phaserReady) {
          console.error("❌ Phaser still not ready after waiting");
          setIsRunning(false);
          return;
        }
      }

      // Thêm delay nhỏ trước khi gửi message để đảm bảo Phaser thực sự sẵn sàng
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("📤 Sending program to Phaser...");
      await runProgramFromWorkspace(workspace);
      console.log("✅ Program sent to Phaser successfully");
    } catch (error) {
      console.error("❌ Failed to run program:", error);
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
      console.log("🛑 Stopping program...");
      await stopProgram();
      console.log("✅ Program stopped successfully");
    } catch (error) {
      console.error("❌ Failed to stop program:", error);
    }
    setIsRunning(false);
  };

  const handleValidate = () => {
    // TODO: Implement validation logic
    console.log("Validating code...");
  };

  const handleBluetooth = async () => {
    setShowConnectionDialog(true);
  };

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
        {/* Ottobit Logo - Mobile Responsive */}
        <Box
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
          }}
        >
          <img
            src="/asset/LogoOttobit.png"
            alt="Ottobit Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </Box>

        {/* Project Title - Responsive */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#ffffff",
            fontSize: { xs: "18px", sm: "20px", md: "24px" },
            letterSpacing: "0.5px",
            display: { xs: "none", sm: "block" }, // Hide on very small screens
          }}
        >
          Ottobit Studio
        </Typography>
        
        {/* Short title for mobile */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#ffffff",
            fontSize: "16px",
            letterSpacing: "0.5px",
            display: { xs: "block", sm: "none" }, // Only show on very small screens
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
          <Tooltip title={isConnected ? "Disconnect" : "Connect Bluetooth"}>
            <IconButton
              onClick={handleBluetooth}
              sx={{
                bgcolor: isConnected ? "#3b82f6" : "#e3f2fd",
                color: isConnected ? "white" : "#1976d2",
                width: { xs: 36, sm: 42, md: 48 },
                height: { xs: 36, sm: 42, md: 48 },
                "&:hover": {
                  bgcolor: isConnected ? "#2563eb" : "#bbdefb",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                },
              }}
            >
              <BluetoothIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>

          <DownloadMenu
            trigger={
              <Tooltip title="Upload to micro:bit">
                <IconButton
                  sx={{
                    bgcolor: "#f3e5f5",
                    color: "#7b1fa2",
                    width: { xs: 36, sm: 42, md: 48 },
                    height: { xs: 36, sm: 42, md: 48 },
                    "&:hover": {
                      bgcolor: "#e1bee7",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(123, 31, 162, 0.3)",
                    },
                  }}
                >
                  <DownloadIcon sx={{ fontSize: 24 }} />
                </IconButton>
              </Tooltip>
            }
          />

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

      {/* Microbit Connection Dialog */}
      <MicrobitConnectionDialog
        open={showConnectionDialog}
        onClose={() => setShowConnectionDialog(false)}
      />
    </AppBar>
  );
}
