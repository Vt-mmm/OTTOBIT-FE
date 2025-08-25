import { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
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
  Link as PairIcon,
} from "@mui/icons-material";

interface TopBarSectionProps {
  activeTab?: number;
  onTabChange?: (tab: number) => void;
}

export default function TopBarSection({
  activeTab = 0,
  onTabChange,
}: TopBarSectionProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    // TODO: Implement run logic
  };

  const handleStop = () => {
    setIsRunning(false);
    // TODO: Implement stop logic
  };

  const handleValidate = () => {
    // TODO: Implement validation logic
    console.log("Validating code...");
  };

  const handleBluetooth = () => {
    setIsConnected(!isConnected);
    // TODO: Implement bluetooth logic
  };

  const handleDownload = () => {
    // TODO: Implement download logic
    console.log("Downloading code...");
  };

  const handlePair = () => {
    // TODO: Implement pair device logic
    console.log("Pairing device...");
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "#22c55e", // OttoBit theme color
        borderBottom: "1px solid #16a34a",
        boxShadow: "0 2px 8px rgba(34, 197, 94, 0.15)",
      }}
    >
      <Toolbar sx={{ minHeight: "72px !important", px: 2, gap: 2 }}>
        {/* Logo OttoBit */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mr: 2,
          }}
        >
          <img
            src="/asset/LogoOttobit.png"
            alt="OttoBit Logo"
            style={{
              height: "40px",
              width: "auto",
            }}
          />
        </Box>

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
                  color: "#22c55e", // OttoBit theme color
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
                    color: activeTab === 0 ? "#22c55e" : "#64748b", // OttoBit theme
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
                    color: activeTab === 1 ? "#22c55e" : "#64748b", // OttoBit theme
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
                    color: activeTab === 2 ? "#22c55e" : "#64748b", // OttoBit theme
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

          <Tooltip title="Download Code">
            <IconButton
              onClick={handleDownload}
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

          <Tooltip title="Pair Device">
            <IconButton
              onClick={handlePair}
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
              <PairIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>

          {/* Divider */}
          <Box sx={{ width: 1, height: 32, bgcolor: "#e2e8f0", mx: 0.8 }} />

          <Tooltip title={isRunning ? "Stop" : "Run"}>
            <IconButton
              onClick={isRunning ? handleStop : handleRun}
              sx={{
                bgcolor: isRunning ? "#ef4444" : "#22c55e", // OttoBit theme
                color: "white",
                width: 48,
                height: 48,
                "&:hover": {
                  bgcolor: isRunning ? "#dc2626" : "#16a34a", // OttoBit theme hover
                  transform: "translateY(-1px)",
                  boxShadow: isRunning
                    ? "0 4px 12px rgba(239, 68, 68, 0.4)"
                    : "0 4px 12px rgba(34, 197, 94, 0.4)", // OttoBit theme shadow
                },
              }}
            >
              {isRunning ? (
                <StopIcon sx={{ fontSize: 24 }} />
              ) : (
                <RunIcon sx={{ fontSize: 24 }} />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Validate Code">
            <IconButton
              onClick={handleValidate}
              sx={{
                bgcolor: "#f0fdf4", // OttoBit light background
                color: "#16a34a", // OttoBit darker green
                width: 48,
                height: 48,
                border: "2px solid #22c55e", // OttoBit theme border
                "&:hover": {
                  bgcolor: "#22c55e", // OttoBit theme
                  color: "white",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)", // OttoBit theme shadow
                },
              }}
            >
              <ValidateIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
