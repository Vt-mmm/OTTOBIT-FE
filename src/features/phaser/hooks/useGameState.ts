/**
 * Hook for Game State management
 * Provides game state utilities and helpers
 */

import { useState, useCallback } from "react";
import {
  GameState,
  VictoryData,
  ProgressData,
  ErrorData,
} from "../types/phaser.js";

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGameState = useCallback((newState: Partial<GameState>) => {
    setGameState((prev) => (prev ? { ...prev, ...newState } : null));
  }, []);

  const setGameStateData = useCallback((state: GameState | null) => {
    setGameState(state);
  }, []);

  const handleVictory = useCallback((data: VictoryData) => {
    setGameState((prev) =>
      prev
        ? {
            ...prev,
            programStatus: "completed",
            collectedBatteries: data.collected.total,
            collectedBatteryTypes: data.collected.byType,
          }
        : null
    );
  }, []);

  const handleProgress = useCallback((data: ProgressData) => {
    setGameState((prev) =>
      prev
        ? {
            ...prev,
            collectedBatteries: data.collected.total,
            collectedBatteryTypes: data.collected.byType,
          }
        : null
    );
  }, []);

  const handleError = useCallback((data: ErrorData) => {
    setError(data.message);
    setGameState((prev) =>
      prev
        ? {
            ...prev,
            programStatus: "error",
          }
        : null
    );
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetGameState = useCallback(() => {
    setGameState(null);
    setError(null);
    setIsLoading(false);
  }, []);

  // Helper functions
  const getProgressPercentage = useCallback(() => {
    if (!gameState || gameState.totalSteps === 0) return 0;
    return (gameState.currentStep / gameState.totalSteps) * 100;
  }, [gameState]);

  const isProgramRunning = useCallback(() => {
    return gameState?.programStatus === "running";
  }, [gameState]);

  const isProgramCompleted = useCallback(() => {
    return gameState?.programStatus === "completed";
  }, [gameState]);

  const isProgramError = useCallback(() => {
    return gameState?.programStatus === "error";
  }, [gameState]);

  const getTotalBatteries = useCallback(() => {
    if (!gameState) return 0;
    return (
      gameState.collectedBatteryTypes.red +
      gameState.collectedBatteryTypes.yellow +
      gameState.collectedBatteryTypes.green
    );
  }, [gameState]);

  const getDirectionName = useCallback((direction: number) => {
    const directions = ["Bắc", "Đông", "Nam", "Tây"];
    return directions[direction] || "Không xác định";
  }, []);

  return {
    // State
    gameState,
    isLoading,
    error,

    // Actions
    updateGameState,
    setGameStateData,
    handleVictory,
    handleProgress,
    handleError,
    clearError,
    resetGameState,
    setIsLoading,

    // Helpers
    getProgressPercentage,
    isProgramRunning,
    isProgramCompleted,
    isProgramError,
    getTotalBatteries,
    getDirectionName,
  };
}
