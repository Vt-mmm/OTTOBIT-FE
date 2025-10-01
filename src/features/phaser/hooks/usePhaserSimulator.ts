/**
 * Phaser Simulator Hook
 * Main hook for managing Phaser game state and communication
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { PhaserCommunicationService } from "../services/phaserCommunicationService.js";
import { BlocklyToPhaserConverter } from "../services/blocklyToPhaserConverter.js";
import {
  GameState,
  PhaserConfig,
  ProgramData,
  VictoryData,
  ProgressData,
  ErrorData,
} from "../types/phaser.js";

interface UsePhaserSimulatorConfig {
  iframeId?: string;
  config?: Partial<PhaserConfig>;
}

export function usePhaserSimulator(
  config: UsePhaserSimulatorConfig = {},
  onVictoryProgress?: (victoryData: VictoryData) => Promise<void>
) {
  // Basic States
  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentProgram, setCurrentProgram] = useState<ProgramData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Victory State
  const [victoryData, setVictoryData] = useState<VictoryData | null>(null);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);

  // Defeat State
  const [defeatData, setDefeatData] = useState<ErrorData | null>(null);
  const [isDefeatModalOpen, setIsDefeatModalOpen] = useState(false);

  // Current Map State
  const [currentMapKey, setCurrentMapKey] = useState<string | null>(null);

  // Refs
  const communicationServiceRef = useRef<PhaserCommunicationService | null>(
    null
  );
  const iframeIdRef = useRef(config.iframeId || "robot-game-iframe");

  // Default configuration - use larger dimensions for better map visibility
  const defaultConfig: PhaserConfig = {
    url:
      import.meta.env.VITE_PHASER_URL || "https://phaser-map-three.vercel.app",
    width: 1200, // Larger width to ensure map is not scaled down
    height: 800, // Larger height to show full map
    allowFullscreen: true,
    ...config.config,
  };

  // Victory Actions
  const showVictoryModal = useCallback((data: VictoryData) => {
    setVictoryData(data);
    setIsVictoryModalOpen(true);
  }, []);

  const hideVictoryModal = useCallback(() => {
    setIsVictoryModalOpen(false);
  }, []);

  // Defeat Actions
  const showDefeatModal = useCallback(
    (data: ErrorData) => {
      setDefeatData(data);
      setIsDefeatModalOpen(true);
    },
    [isDefeatModalOpen, defeatData, isVictoryModalOpen]
  );

  const hideDefeatModal = useCallback(() => {
    setIsDefeatModalOpen(false);
  }, []);

  // Message handlers
  const handleReady = useCallback(() => {
    setIsReady(true);
  }, []);

  const handleVictory = useCallback(
    async (data: VictoryData) => {
      setGameState((prev) =>
        prev ? { ...prev, programStatus: "completed" } : null
      );

      // Handle lesson progress if callback provided
      if (onVictoryProgress) {
        try {
          await onVictoryProgress(data);
        } catch (error) {
          // Continue with victory modal even if progress handling fails
        }
      }

      showVictoryModal(data);
    },
    [showVictoryModal, onVictoryProgress]
  );

  const handleProgress = useCallback((data: ProgressData) => {
    setGameState((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  const handleError = useCallback(
    (data: ErrorData) => {
      setError(data.message);
      setGameState((prev) =>
        prev ? { ...prev, programStatus: "error" } : null
      );

      // Show defeat modal for errors
      if (
        data.type === "PROGRAM_ERROR" ||
        data.type === "MAP_ERROR" ||
        data.type === "VALIDATION_ERROR"
      ) {
        showDefeatModal(data);
      }
    },
    [showDefeatModal]
  );

  const handleLose = useCallback(
    (data?: any) => {
      // Prevent duplicate opens
      if (isDefeatModalOpen) {
        return;
      }

      // Map Phaser LOSE payload to our ErrorData shape
      const reason = data?.reason as string | undefined;
      const message =
        (data?.message as string) ||
        "Chương trình không hoàn thành được nhiệm vụ!";
      const step = (data?.failedStep ?? data?.step) as number | undefined;
      const details = {
        ...(data?.details || {}),
        reason,
        failedAction: data?.failedAction,
        executionTime: data?.executionTime,
        totalSteps: data?.totalSteps,
        robotPosition: data?.robotPosition,
        robotDirection: data?.robotDirection,
      };

      // Heuristic map reason -> type for nicer UI
      const mapReasonToType = (r?: string): ErrorData["type"] => {
        if (!r) return "PROGRAM_ERROR";
        const R = r.toUpperCase();
        if (
          R.includes("BOUND") ||
          R.includes("COLLISION") ||
          R.includes("WALL")
        )
          return "MAP_ERROR";
        if (R.includes("VALIDATION") || R.includes("STATEMENT"))
          return "VALIDATION_ERROR";
        return "PROGRAM_ERROR";
      };

      const errorData: ErrorData = {
        type: mapReasonToType(reason),
        message,
        details,
        step,
      };

      // Don't set global error alert; just reflect program status and show modal
      setGameState((prev) =>
        prev ? { ...prev, programStatus: "error" } : null
      );
      showDefeatModal(errorData);
    },
    [showDefeatModal, isDefeatModalOpen]
  );

  const handleStatus = useCallback((data: GameState) => {
    setGameState(data);
  }, []);

  const handleProgramStarted = useCallback(() => {
    setGameState((prev) =>
      prev ? { ...prev, programStatus: "running" } : null
    );
  }, []);

  const handleProgramPaused = useCallback(() => {
    setGameState((prev) =>
      prev ? { ...prev, programStatus: "paused" } : null
    );
  }, []);

  const handleProgramStopped = useCallback(() => {
    setGameState((prev) => (prev ? { ...prev, programStatus: "idle" } : null));
    setCurrentProgram(null);
  }, []);

  // Initialize communication service - ONLY ONCE
  useEffect(() => {
    const service = new PhaserCommunicationService();
    communicationServiceRef.current = service;

    // Setup message handlers
    service.onMessage("READY", handleReady);
    service.onMessage("VICTORY", handleVictory);
    service.onMessage("PROGRESS", handleProgress);
    service.onMessage("ERROR", handleError);
    service.onMessage("LOSE", handleLose);
    service.onMessage("STATUS", handleStatus);
    service.onMessage("PROGRAM_STARTED", handleProgramStarted);
    service.onMessage("PROGRAM_PAUSED", handleProgramPaused);
    service.onMessage("PROGRAM_STOPPED", handleProgramStopped);

    return () => {
      service.disconnect();
    };
  }, []); // Empty dependency array - setup only once

  // Initialize iframe connection
  const connect = useCallback(async () => {
    if (!communicationServiceRef.current) {
      setTimeout(() => {
        connect();
      }, 100);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      communicationServiceRef.current.initialize(iframeIdRef.current);
      setIsConnected(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect to Phaser";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh connection
  const refreshConnection = useCallback(() => {
    if (communicationServiceRef.current) {
      communicationServiceRef.current.refreshConnection();
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    if (communicationServiceRef.current) {
      communicationServiceRef.current.disconnect();
    }
    setIsConnected(false);
    setIsReady(false);
    setGameState(null);
    setCurrentProgram(null);
    setError(null);
  }, []);

  // Load map
  const loadMap = useCallback(async (mapKey: string) => {
    if (!communicationServiceRef.current) {
      throw new Error("Not connected to Phaser");
    }

    try {
      setIsLoading(true);
      setError(null);

      await communicationServiceRef.current.loadMap(mapKey);
      setCurrentMapKey(mapKey);

      // Reset game state
      setGameState((prev) => ({
        ...prev,
        mapKey: mapKey,
        robotPosition: { x: 0, y: 0 },
        robotDirection: 0,
        collectedBatteries: 0,
        collectedBatteryTypes: { red: 0, yellow: 0, green: 0 },
        programStatus: "idle",
        currentStep: 0,
        totalSteps: 0,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load map";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run program
  const runProgram = useCallback(async (program: ProgramData) => {
    if (!communicationServiceRef.current) {
      console.error("❌ [runProgram] No communication service available");
      throw new Error("Not connected to Phaser");
    }

    try {
      setIsLoading(true);
      setError(null);
      setCurrentProgram(program);

      const validation = BlocklyToPhaserConverter.validateProgram(program);

      if (!validation.isValid) {
        console.error(
          "❌ [runProgram] Program validation failed:",
          validation.errors
        );
        throw new Error(`Invalid program: ${validation.errors.join(", ")}`);
      }

      await communicationServiceRef.current.runProgram(program);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to run program";
      console.error("❌ [runProgram] Error occurred:", {
        error: err,
        errorMessage,
      });
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run program from workspace
  const runProgramFromWorkspace = useCallback(
    async (workspace: any) => {
      try {
        const program = BlocklyToPhaserConverter.convertWorkspace(workspace);

        console.log("📋 [usePhaserSimulator] Program structure:", {
          version: program.version,
          programName: program.programName,
          actionsCount: program.actions?.length || 0,
          functionsCount: program.functions?.length || 0,
        });

        console.log(JSON.stringify(program, null, 2));

        await runProgram(program);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to convert and run program";
        console.error(
          "❌ [usePhaserSimulator] Error in runProgramFromWorkspace:",
          {
            error: err,
            errorMessage,
          }
        );
        setError(errorMessage);
        throw err;
      }
    },
    [runProgram]
  );

  // Pause program
  const pauseProgram = useCallback(async () => {
    if (!communicationServiceRef.current) {
      throw new Error("Not connected to Phaser");
    }

    try {
      await communicationServiceRef.current.pauseProgram();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to pause program";
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Stop program
  const stopProgram = useCallback(async () => {
    if (!communicationServiceRef.current) {
      throw new Error("Not connected to Phaser");
    }

    try {
      await communicationServiceRef.current.stopProgram();
      setCurrentProgram(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to stop program";
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Get status
  const getStatus = useCallback(async (): Promise<GameState | null> => {
    if (!communicationServiceRef.current) {
      throw new Error("Not connected to Phaser");
    }

    try {
      const status = await communicationServiceRef.current.getStatus();
      setGameState(status);
      return status;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get status";
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Restart scene
  const restartScene = useCallback(async () => {
    if (!communicationServiceRef.current) {
      throw new Error("Not connected to Phaser");
    }

    try {
      await communicationServiceRef.current.restartScene();

      // Reset current program state
      setCurrentProgram(null);

      // Reset game state to initial values
      setGameState((prev) =>
        prev
          ? {
              ...prev,
              robotPosition: { x: 0, y: 0 },
              robotDirection: 0,
              collectedBatteries: 0,
              collectedBatteryTypes: { red: 0, yellow: 0, green: 0 },
              programStatus: "idle",
              currentStep: 0,
              totalSteps: 0,
            }
          : null
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to restart scene";
      console.error("❌ [usePhaserSimulator] Error restarting scene:", err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (message: any) => {
    if (!communicationServiceRef.current) {
      throw new Error("Not connected to Phaser");
    }
    await communicationServiceRef.current.sendMessage(message);
  }, []);

  // Message event handlers
  const onMessage = useCallback(
    (type: string, handler: (data: any) => void) => {
      if (communicationServiceRef.current) {
        communicationServiceRef.current.onMessage(type, handler);
      }
    },
    []
  );

  const offMessage = useCallback(
    (type: string, handler: (data: any) => void) => {
      if (communicationServiceRef.current) {
        communicationServiceRef.current.offMessage(type, handler);
      }
    },
    []
  );

  return {
    // State
    isConnected,
    isReady,
    gameState,
    currentProgram,
    error,
    isLoading,

    // Victory State
    victoryData,
    isVictoryModalOpen,

    // Defeat State
    defeatData,
    isDefeatModalOpen,

    // Current Map State
    currentMapKey,

    // Configuration
    config: defaultConfig,

    // Actions
    connect,
    disconnect,
    refreshConnection,
    loadMap,
    runProgram,
    runProgramFromWorkspace,
    pauseProgram,
    stopProgram,
    getStatus,
    clearError,
    restartScene,

    // Victory Actions
    showVictoryModal,
    hideVictoryModal,

    // Defeat Actions
    showDefeatModal,
    hideDefeatModal,

    // Communication
    sendMessage,
    onMessage,
    offMessage,

    // Manager instance
    communicationService: communicationServiceRef.current,
  };
}
