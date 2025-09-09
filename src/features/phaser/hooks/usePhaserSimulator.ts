/**
 * Main hook for Phaser Simulator functionality
 * Combines communication, state management, and game logic
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

export function usePhaserSimulator(config: UsePhaserSimulatorConfig = {}) {
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentProgram, setCurrentProgram] = useState<ProgramData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const communicationServiceRef = useRef<PhaserCommunicationService | null>(
    null
  );
  const iframeIdRef = useRef(config.iframeId || "robot-game-iframe");

  // Default configuration
  const defaultConfig: PhaserConfig = {
    url:
      import.meta.env.VITE_PHASER_URL || "https://phaser-map-three.vercel.app",
    width: 800,
    height: 600,
    allowFullscreen: true,
    ...config.config,
  };

  // Message handlers
  const handleReady = useCallback(() => {
    setIsReady(true);
  }, []);

  const handleVictory = useCallback((data: VictoryData) => {
    console.log("🏆 Victory achieved:", data);
    setGameState((prev) =>
      prev ? { ...prev, programStatus: "completed" } : null
    );
  }, []);

  const handleProgress = useCallback((data: ProgressData) => {
    setGameState((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  const handleError = useCallback((data: ErrorData) => {
    console.error("❌ Phaser error:", data);
    setError(data.message);
    setGameState((prev) => (prev ? { ...prev, programStatus: "error" } : null));
  }, []);

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

  // Initialize communication service
  useEffect(() => {
    const service = new PhaserCommunicationService();
    communicationServiceRef.current = service;

    // Setup message handlers
    service.onMessage("READY", handleReady);
    service.onMessage("VICTORY", handleVictory);
    service.onMessage("PROGRESS", handleProgress);
    service.onMessage("ERROR", handleError);
    service.onMessage("STATUS", handleStatus);
    service.onMessage("PROGRAM_STARTED", handleProgramStarted);
    service.onMessage("PROGRAM_PAUSED", handleProgramPaused);
    service.onMessage("PROGRAM_STOPPED", handleProgramStopped);

    return () => {
      service.disconnect();
    };
  }, [
    handleReady,
    handleVictory,
    handleProgress,
    handleError,
    handleStatus,
    handleProgramStarted,
    handleProgramPaused,
    handleProgramStopped,
  ]);

  // Initialize iframe connection
  const connect = useCallback(async () => {
    // Wait for communication service to be ready
    if (!communicationServiceRef.current) {
      // Retry after a short delay
      setTimeout(() => {
        connect();
      }, 100);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Initialize iframe connection
      communicationServiceRef.current.initialize(iframeIdRef.current);
      setIsConnected(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect to Phaser";
      setError(errorMessage);
      console.error("❌ Connection error:", err);
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

      // Validate program
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

  // Run program from Blockly workspace
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

    // Communication
    sendMessage,
    onMessage,
    offMessage,

    // Manager instance
    communicationService: communicationServiceRef.current,
  };
}
