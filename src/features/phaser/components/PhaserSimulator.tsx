import { useEffect, useRef, useCallback } from "react";
import { Box, Typography, Alert } from "@mui/material";
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
    gameState,
    error,
    isLoading,
    config,
    connect,
    clearError,
    restartScene, // Thêm restartScene để sử dụng logic giống TopBar
    // Victory state
    victoryData,
    isVictoryModalOpen,
    hideVictoryModal,
    // Defeat state
    defeatData,
    isDefeatModalOpen,
    hideDefeatModal,
    // Note: loadMap and currentMapKey are available through PhaserContext
    // But they may not be directly exposed in the current interface
  } = usePhaserContext();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle replay using proper restart logic from PhaserContext
  const handleReplay = async () => {
    console.log('🔄 [PhaserSimulator] Replay button clicked');
    
    try {
      // Sử dụng restartScene từ PhaserContext giống TopBar
      console.log('⏳ [PhaserSimulator] Calling restartScene...');
      await restartScene();
      console.log('✅ [PhaserSimulator] Scene restarted successfully');
      
      // Đóng modal
      hideVictoryModal();
      hideDefeatModal();
    } catch (error) {
      console.error('❌ [PhaserSimulator] Error restarting scene:', error);
      
      // Fallback: Reload iframe nếu restart không thành công
      const iframe = iframeRef.current;
      if (iframe) {
        console.log('🔄 [PhaserSimulator] Fallback: Reloading iframe');
        iframe.src = iframe.src;
      }
      
      hideVictoryModal();
      hideDefeatModal();
    }
  };

  // Debounced resize function to optimize performance
  // Simple iframe scaling theo iframe-resizer approach - không dùng transform phức tạp
  const sendResizeToPhaser = useCallback((containerWidth: number, containerHeight: number) => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    // Đơn giản hóa: sử dụng CSS thuần túy
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.position = 'relative';
    iframe.style.transform = 'none';
    iframe.style.left = 'auto';
    iframe.style.top = 'auto';
    iframe.style.marginLeft = '0';
    iframe.style.marginTop = '0';
    
    // Gửi resize message đến Phaser để adjust game size
    try {
      iframe.contentWindow?.postMessage({
        source: "parent-website",
        type: "RESIZE",
        data: {
          width: Math.round(containerWidth),
          height: Math.round(containerHeight)
        }
      }, "*");
      
      console.log('🎯 Simple resize sent to Phaser:', {
        containerWidth, 
        containerHeight
      });
    } catch (error) {
      // Silently ignore errors if iframe is not ready
    }
    
  }, []);

  // Handle iframe resize based on container size (debounced)
  const handleContainerResize = useCallback((entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    if (entry) {
      const { width, height } = entry.contentRect;
      
      // Clear existing timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // Debounce resize calls
      resizeTimeoutRef.current = setTimeout(() => {
        sendResizeToPhaser(width, height);
      }, 150); // 150ms debounce
    }
  }, [sendResizeToPhaser]);

  // Setup ResizeObserver to monitor container size changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create ResizeObserver
    const resizeObserver = new ResizeObserver(handleContainerResize);
    resizeObserverRef.current = resizeObserver;
    
    // Start observing
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      resizeObserverRef.current = null;
      // Cleanup resize timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
    };
  }, [handleContainerResize]);

  // Auto-connect when component mounts
  useEffect(() => {
    if (!isConnected && !isLoading) {
      // Small delay to ensure iframe is rendered
      const timer = setTimeout(() => {
        connect().catch((_err) => {
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isConnected, isLoading, connect]);

  // Apply initial resize khi iframe đã kết nối
  useEffect(() => {
    if (isConnected && containerRef.current && iframeRef.current) {
      const container = containerRef.current;
      const { width, height } = container.getBoundingClientRect();
      if (width > 0 && height > 0) {
        // Small delay to ensure iframe is fully loaded
        setTimeout(() => {
          sendResizeToPhaser(width, height);
        }, 300);
      }
    }
  }, [isConnected, sendResizeToPhaser]);

  // DISABLED: Auto-load removed - manual control via StudioContent
  // useEffect(() => {
  //   if (isReady && !gameState?.mapKey) {
  //     // Load basic1 map for testing
  //     loadMap("basic1").catch((err) => {
  //       //     });
  //   }
  // }, [isReady, gameState?.mapKey, loadMap]);

  // REMOVED: Don't hide iframe on error - keep it available for message sending
  // This allows us to send mapJson/challengeJson even after initial Phaser errors

  // Initial loading state removed as we want to show iframe immediately to speed up loading process

  // Always render iframe directly without loading overlays
  // Phaser will handle its own loading states internally

  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        width: "100%",
        height: "100%",
        flex: 1,
        minHeight: 0,
        position: "relative",
        overflow: "hidden",
        backgroundColor: "transparent",
        // Force iframe content scale với object-fit
        "& iframe": {
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
          backgroundColor: "transparent",
          // Force scaling content to fit container
          objectFit: "contain", // Giữ aspect ratio, fit trong container
          objectPosition: "center", // Center content
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
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
          margin: 0,
          padding: 0,
          backgroundColor: "transparent",
        }}
        title="Phaser Robot Simulator"
      />

      {/* Error overlay - shown over iframe, not replacing it */}
      {error && (
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
            backgroundColor: "rgba(248, 249, 250, 0.98)",
            zIndex: 10, // Higher z-index than loading overlay
            p: 2,
          }}
        >
          <Alert
            severity="warning" // Changed from error to warning since we're trying to recover
            onClose={clearError}
            sx={{ mb: 2, width: "100%", maxWidth: 600 }}
          >
            {error}
          </Alert>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Đang khởi tạo simulator... Nếu lỗi vẫn còn, vui lòng thử tải lại trang.
          </Typography>
        </Box>
      )}

      {/* Status overlay - Removed as Phaser handles loading states internally */}

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
