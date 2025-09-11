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

      await runProgramFromWorkspace(workspace);
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
      await stopProgram();
    } catch (error) {
      console.error("❌ Failed to stop program:", error);
    }
    setIsRunning(false);
  };

  const handleValidate = () => {
    // TODO: Implement validation logic
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
      <Toolbar sx={{ minHeight: "72px !important", px: 2, gap: 2 }}>
        {/* Ottobit Logo */}
        <Box
          sx={{
            width: 50,
            height: 50,
            bgcolor: "#ffffff",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 2,
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

        {/* Project Title - Larger */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#ffffff",
            fontSize: "24px",
            letterSpacing: "0.5px",
          }}
        >
          Ottobit Studio
        </Typography>

        {/* Spacer to center tabs */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Tabs for switching views - Centered with larger icons */}
        <Box
          sx={{
            bgcolor: "#ffffff",
            borderRadius: "20px",
            p: 0.5,
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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

        {/* All Action Buttons - Wrapped together with larger icons */}
        <Box
          sx={{
            bgcolor: "#ffffff",
            borderRadius: "20px",
            p: 0.8,
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            gap: 0.8,
            alignItems: "center",
          }}
        >
          <Tooltip title={isConnected ? "Disconnect" : "Connect Bluetooth"}>
            <IconButton
              onClick={handleBluetooth}
              sx={{
                bgcolor: isConnected ? "#3b82f6" : "#e3f2fd",
                color: isConnected ? "white" : "#1976d2",
                width: 48,
                height: 48,
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
                    width: 48,
                    height: 48,
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
                  width: 48,
                  height: 48,
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
                width: 48,
                height: 48,
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
