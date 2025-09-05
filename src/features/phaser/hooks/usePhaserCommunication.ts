/**
 * Hook for Phaser Communication functionality
 * Provides low-level communication methods
 */

import { useCallback, useRef, useEffect } from "react";
import { PhaserCommunicationService } from "../services/phaserCommunicationService.js";
import { PhaserMessage } from "../types/phaser.js";
import { MessageHandler } from "../types/communication.js";

export function usePhaserCommunication() {
  const serviceRef = useRef<PhaserCommunicationService | null>(null);

  // Initialize service
  useEffect(() => {
    serviceRef.current = new PhaserCommunicationService();
    return () => {
      serviceRef.current?.disconnect();
    };
  }, []);

  const sendMessage = useCallback(async (message: PhaserMessage) => {
    if (!serviceRef.current) {
      throw new Error("Communication service not initialized");
    }
    return serviceRef.current.sendMessage(message);
  }, []);

  const onMessage = useCallback((type: string, handler: MessageHandler) => {
    if (serviceRef.current) {
      serviceRef.current.onMessage(type, handler);
    }
  }, []);

  const offMessage = useCallback((type: string, handler: MessageHandler) => {
    if (serviceRef.current) {
      serviceRef.current.offMessage(type, handler);
    }
  }, []);

  const initialize = useCallback((iframeId: string) => {
    if (!serviceRef.current) {
      throw new Error("Communication service not initialized");
    }
    serviceRef.current.initialize(iframeId);
  }, []);

  const getConnectionStatus = useCallback(() => {
    if (!serviceRef.current) {
      return { isConnected: false, isReady: false };
    }
    return serviceRef.current.getConnectionStatus();
  }, []);

  return {
    sendMessage,
    onMessage,
    offMessage,
    initialize,
    getConnectionStatus,
    service: serviceRef.current,
  };
}
