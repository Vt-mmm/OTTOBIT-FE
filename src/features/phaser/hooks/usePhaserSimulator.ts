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

  // Default configuration
  const defaultConfig: PhaserConfig = {
    url: import.meta.env.VITE_PHASER_URL || "http://localhost:5174",
    width: 800,
    height: 600,
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

  const handleLose = useCallback(() => {
    // Prevent duplicate opens
    if (isDefeatModalOpen) {
      return;
    }

    // Simple generic error data for DefeatModal
    const errorData: ErrorData = {
      type: "PROGRAM_ERROR",
      message: "Chương trình không hoàn thành được nhiệm vụ!",
      details: "Hãy kiểm tra lại logic chương trình của bạn",
      step: undefined,
    };

    // Don't set error state to avoid conflict with DefeatModal
    // setError("Thất bại!"); // Commented out to prevent error alert
    setGameState((prev) => (prev ? { ...prev, programStatus: "error" } : null));

    showDefeatModal(errorData);
  }, [showDefeatModal, isDefeatModalOpen]);

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
      throw new Error("Not connected to Phaser");
    }

    try {
      setIsLoading(true);
      setError(null);
      setCurrentProgram(program);

      const validation = BlocklyToPhaserConverter.validateProgram(program);
      if (!validation.isValid) {
        throw new Error(`Invalid program: ${validation.errors.join(", ")}`);
      }

      await communicationServiceRef.current.runProgram(program);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to run program";
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
        await runProgram(program);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to convert and run program";
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
