import { useEffect, useRef } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { usePhaserContext } from "../context/PhaserContext.js";
import VictoryModal from "./VictoryModal.js";
import DefeatModal from "./DefeatModal";
import { VictoryErrorBoundary } from "./VictoryErrorBoundary.js";
import { DefeatErrorBoundary } from "./DefeatErrorBoundary";

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
    // Victory state
    victoryData,
    isVictoryModalOpen,
    hideVictoryModal,
    // Defeat state
    defeatData,
    isDefeatModalOpen,
    hideDefeatModal,
    // Map actions
    loadMap,
    // Current map
    currentMapKey,
  } = usePhaserContext();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle replay current map
  const handleReplay = async () => {
    try {
      const mapKeyToReload =
        currentMapKey || gameState?.mapKey || victoryData?.mapKey;

      if (mapKeyToReload) {
        await loadMap(mapKeyToReload);
        hideVictoryModal();
      } else {
        console.warn("⚠️ No current map to reload");

        // Fallback: Reload iframe if no mapKey found
        const iframe = iframeRef.current;
        if (iframe) {
          iframe.src = iframe.src; // Force iframe reload
        }

        hideVictoryModal();
      }
    } catch (error) {
      console.error("❌ Failed to reload map:", error);
      hideVictoryModal();
    }
  };

  // Auto-connect when component mounts
  useEffect(() => {
    if (!isConnected && !isLoading) {
      // Small delay to ensure iframe is rendered
      const timer = setTimeout(() => {
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
          overflow: "hidden",
          backgroundColor: "#f8f9fa", // Light background thay vì trong suốt
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
            width: "100%",
            height: "100%",
            display: "block",
            margin: 0,
            padding: 0,
            backgroundColor: "transparent",
            borderRadius: "inherit",
          }}
          title="Phaser Robot Simulator"
        />

        {/* Loading overlay with better styling */}
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
            backgroundColor: "rgba(248, 249, 250, 0.95)", // Match container background
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              p: 3,
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <CircularProgress size={48} sx={{ color: "#28a745" }} />
            <Typography variant="h6" color="text.primary" fontWeight={600}>
              🎮 Robot Simulator
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Đang khởi tạo kết nối...
            </Typography>
          </Box>
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
        overflow: "hidden",
        backgroundColor: "#f8f9fa", // Match container background
        // Add CSS to handle black bars in iframe
        "& iframe": {
          backgroundColor: "#f8f9fa !important",
        },
        // Override any internal Phaser black background
        "& iframe canvas": {
          backgroundColor: "transparent !important",
        },
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
          width: "100%",
          height: "100%",
          display: "block",
          margin: 0,
          padding: 0,
          backgroundColor: "#f8f9fa", // Match container background
          borderRadius: "inherit",
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
            backgroundColor: "rgba(248, 249, 250, 0.95)", // Match container background
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              p: 3,
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <CircularProgress size={48} sx={{ mb: 2, color: "#28a745" }} />
            <Typography variant="h6" color="text.primary" fontWeight={600}>
              🎮 Robot Simulator
            </Typography>
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

      {/* Victory Modal with Error Boundary */}
      <VictoryErrorBoundary
        onClose={hideVictoryModal}
        onReplay={handleReplay}
        isOpen={isVictoryModalOpen}
      >
        <VictoryModal
          open={isVictoryModalOpen}
          onClose={hideVictoryModal}
          victoryData={victoryData}
          onPlayNext={() => {
            // TODO: Implement play next logic
            hideVictoryModal();
          }}
          onReplay={handleReplay}
          onGoHome={() => {
            // TODO: Implement go home logic
            hideVictoryModal();
          }}
        />
      </VictoryErrorBoundary>

      {/* Defeat Modal */}
      <DefeatErrorBoundary
        isOpen={isDefeatModalOpen}
        onClose={hideDefeatModal}
        onReplay={handleReplay}
      >
        <DefeatModal
          open={isDefeatModalOpen}
          onClose={hideDefeatModal}
          defeatData={defeatData}
          onReplay={handleReplay}
          onGoHome={() => {
            // TODO: Implement go home logic
            hideDefeatModal();
          }}
        />
      </DefeatErrorBoundary>
    </Box>
  );
}
