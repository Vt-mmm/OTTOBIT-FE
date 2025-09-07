import { useEffect, useRef } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { usePhaserContext } from "../context/PhaserContext.js";

interface PhaserSimulatorProps {
  className?: string;
}

export default function PhaserSimulator({ className }: PhaserSimulatorProps) {
  const {
    isConnected,
    isReady,
    gameState,
    error,
    isLoading,
    config,
    connect,
    clearError,
  } = usePhaserContext();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-connect when component mounts
  useEffect(() => {
    if (!isConnected && !isLoading) {
      // Small delay to ensure iframe is rendered
      const timer = setTimeout(() => {
        console.log("🔄 Attempting to connect to Phaser...");
        connect().catch((err) => {
          console.error("Failed to connect to Phaser:", err);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isConnected, isLoading, connect]);

  // DISABLED: Auto-load removed - manual control via StudioContent
  // useEffect(() => {
  //   if (isReady && !gameState?.mapKey) {
  //     // Load basic1 map for testing
  //     loadMap("basic1").catch((err) => {
  //       console.error("Failed to load basic1 map:", err);
  //     });
  //   }
  // }, [isReady, gameState?.mapKey, loadMap]);

  if (error) {
    return (
      <Box
        className={className}
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Alert
          severity="error"
          onClose={clearError}
          sx={{ mb: 2, width: "100%", maxWidth: 600 }}
        >
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Không thể kết nối đến Phaser simulator. Vui lòng kiểm tra kết nối và
          thử lại.
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        className={className}
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Đang kết nối đến Phaser simulator...
        </Typography>
      </Box>
    );
  }

  // Always render iframe, but show loading state if not connected
  if (!isConnected) {
    return (
      <Box
        className={className}
        sx={{
          width: "100%",
          height: "100%",
          position: "relative",
          backgroundColor: "#f5f5f5",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <iframe
          ref={iframeRef}
          id="robot-game-iframe"
          src={config.url}
          width="100%"
          height="100%"
          allow="fullscreen"
          style={{
            border: "none",
            borderRadius: "4px",
          }}
          title="Phaser Robot Simulator"
        />

        {/* Loading overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            zIndex: 1,
          }}
        >
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Phaser Simulator
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Đang khởi tạo kết nối...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      className={className}
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#f5f5f5",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <iframe
        ref={iframeRef}
        id="robot-game-iframe"
        src={config.url}
        width="100%"
        height="100%"
        allow="fullscreen"
        style={{
          border: "none",
          borderRadius: "4px",
        }}
        title="Phaser Robot Simulator"
      />

      {/* Status overlay */}
      {!isReady && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            zIndex: 1,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Đang tải Phaser simulator...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Game state indicator */}
      {gameState && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontSize: "0.75rem",
            zIndex: 2,
          }}
        >
          {gameState.mapKey && `Map: ${gameState.mapKey}`}
          {gameState.programStatus !== "idle" && (
            <span style={{ marginLeft: 8 }}>• {gameState.programStatus}</span>
          )}
        </Box>
      )}
    </Box>
  );
}
