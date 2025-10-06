import { useEffect, useRef, useCallback } from "react";
import { Box, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  generateStudioUrl,
  getStoredNavigationData,
} from "../../../utils/studioNavigation";
import { usePhaserContext } from "../context/PhaserContext.js";
import { getLastProgram } from "../../socket/actionSocket.js";
import VictoryModal from "./VictoryModal.js";
import DefeatModal from "./DefeatModal";
import { VictoryErrorBoundary } from "./VictoryErrorBoundary.js";
import { DefeatErrorBoundary } from "./DefeatErrorBoundary";

interface PhaserSimulatorProps {
  className?: string;
}

export default function PhaserSimulator({ className }: PhaserSimulatorProps) {
  const navigate = useNavigate();
  const {
    isConnected,
    gameState,
    error,
    isLoading,
    config,
    connect,
    clearError,
    restartScene, // Thêm restartScene để sử dụng logic giống TopBar
    runProgram,
    onMessage,
    offMessage,
    getStatus,
    // Victory state
    victoryData,
    isVictoryModalOpen,
    hideVictoryModal,
    // Defeat state
    defeatData,
    isDefeatModalOpen,
    hideDefeatModal,
    // Challenge context
    currentChallenge,
    // Challenge context
    currentChallengeId,
    lessonChallenges,
    fetchChallengesByLesson,
  } = usePhaserContext();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevVictoryOpenRef = useRef<boolean>(false);
  const prevDefeatOpenRef = useRef<boolean>(false);
  const suppressAutoResetRef = useRef<boolean>(false);

  // Handle replay using proper restart logic from PhaserContext
  const handleReplay = async () => {
    try {
      // Sử dụng restartScene từ PhaserContext giống TopBar
      await restartScene();
      // Đóng modal
      hideVictoryModal();
      hideDefeatModal();
    } catch (error) {
      // Fallback: Reload iframe nếu restart không thành công
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.src = iframe.src;
      }
      hideVictoryModal();
      hideDefeatModal();
    }
  };

  // Run headless simulation for physical challenges
  const handleSimulate = async () => {
    try {
      // Prevent auto-reset effect from triggering due to modal close
      suppressAutoResetRef.current = true;

      // Close result modals first to avoid later close firing restart
      hideVictoryModal();
      hideDefeatModal();

      await restartScene();

      // Wait for READY after restart to avoid race when sending RUN_PROGRAM
      await new Promise<void>((resolve) => {
        let resolved = false;
        const handler = () => {
          if (!resolved) {
            resolved = true;
            offMessage("READY", handler);
            resolve();
          }
        };
        // Fallback timeout
        const to = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            offMessage("READY", handler);
            resolve();
          }
        }, 800);
        onMessage("READY", () => {
          clearTimeout(to);
          handler();
        });
      });

      // Extra guard: poll status until scene is ready
      try {
        const maxTries = 5;
        for (let i = 0; i < maxTries; i++) {
          const status: any = await getStatus().catch(() => null);
          if (
            status &&
            (status.gameState === "ready" || status.programStatus === "idle")
          ) {
            break;
          }
          await new Promise((r) => setTimeout(r, 250));
        }
      } catch {}

      // Use last built program from socket feed and run visible simulator
      const program = getLastProgram();
      if (program) {
        await runProgram(program);
      }
    } catch (_e) {
      // silently ignore
    } finally {
      // Re-enable auto-reset shortly after simulate sequence
      setTimeout(() => {
        suppressAutoResetRef.current = false;
      }, 300);
    }
  };

  // Handle next challenge navigation from victory modal
  const handlePlayNext = useCallback(async () => {
    try {
      const nav = getStoredNavigationData();
      const lessonId = nav?.lessonId;

      // Ensure we have lesson challenge list
      let items = ((lessonChallenges as any)?.items || []) as Array<any>;
      if (lessonId && (!items || items.length === 0)) {
        await fetchChallengesByLesson(lessonId, 1, 100);
        // small wait for Redux to update
        await new Promise((r) => setTimeout(r, 200));
        items = ((lessonChallenges as any)?.items || []) as Array<any>;
      }

      // Find current index and next
      const currentIndex = items.findIndex((c) => c.id === currentChallengeId);
      const next = currentIndex >= 0 ? items[currentIndex + 1] : null;

      if (next) {
        const url = generateStudioUrl(next.id, lessonId || undefined);
        navigate(url);
      }
    } finally {
      hideVictoryModal();
    }
  }, [
    lessonChallenges,
    currentChallengeId,
    fetchChallengesByLesson,
    navigate,
    hideVictoryModal,
  ]);

  // Debounced resize function to optimize performance
  // Simple iframe scaling theo iframe-resizer approach - không dùng transform phức tạp
  const sendResizeToPhaser = useCallback(
    (containerWidth: number, containerHeight: number) => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      // Đơn giản hóa: sử dụng CSS thuần túy
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.position = "relative";
      iframe.style.transform = "none";
      iframe.style.left = "auto";
      iframe.style.top = "auto";
      iframe.style.marginLeft = "0";
      iframe.style.marginTop = "0";
      // Gửi resize message đến Phaser để adjust game size
      try {
        iframe.contentWindow?.postMessage(
          {
            source: "parent-website",
            type: "RESIZE",
            data: {
              width: Math.round(containerWidth),
              height: Math.round(containerHeight),
            },
          },
          "*"
        );
      } catch (error) {
        // Silently ignore errors if iframe is not ready
      }
    },
    []
  );

  // Auto reset map when result modals are dismissed (physical mode only)
  useEffect(() => {
    const wasVictoryOpen = prevVictoryOpenRef.current;
    const wasDefeatOpen = prevDefeatOpenRef.current;
    const isPhysical = Number(currentChallenge?.challengeMode) === 1;

    // Update refs for next tick
    prevVictoryOpenRef.current = isVictoryModalOpen;
    prevDefeatOpenRef.current = isDefeatModalOpen;

    // Detect close event
    const victoryJustClosed = wasVictoryOpen && !isVictoryModalOpen;
    const defeatJustClosed = wasDefeatOpen && !isDefeatModalOpen;

    if (isPhysical && (victoryJustClosed || defeatJustClosed)) {
      // Reset the scene so the next simulate run starts clean
      if (!suppressAutoResetRef.current) {
        restartScene().catch(() => {});
      }
    }
  }, [
    isVictoryModalOpen,
    isDefeatModalOpen,
    currentChallenge?.challengeMode,
    restartScene,
  ]);

  // Handle iframe resize based on container size (debounced)
  const handleContainerResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
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
    },
    [sendResizeToPhaser]
  );

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
        connect().catch((_err) => {});
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

  return (
    <Box
      id="studio-simulator"
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
            Đang khởi tạo simulator... Nếu lỗi vẫn còn, vui lòng thử tải lại
            trang.
          </Typography>
        </Box>
      )}

      {/* Game state indicator */}
      {gameState && (
        <Box
          id="tour-game-status"
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
          onPlayNext={handlePlayNext}
          onReplay={handleReplay}
          showSimulateButton={Number(currentChallenge?.challengeMode) === 1}
          onSimulate={handleSimulate}
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
          showSimulateButton={Number(currentChallenge?.challengeMode) === 1}
          onSimulate={handleSimulate}
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
