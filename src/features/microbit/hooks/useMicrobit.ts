/**
 * @license
 * Copyright 2024 Ottobot
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from "react";
import { MicrobitConnectionManager } from "../services/microbitConnectionManager.js";
import { ConnectionType } from "../types/connection.js";

interface MicrobitState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  device: any | null;
  connectionType: ConnectionType | null;
  capabilities: {
    supportsUSB: boolean;
    supportsBluetooth: boolean;
  };
}

/**
 * Simple React hook for micro:bit connection state
 */
export function useMicrobit() {
  const [state, setState] = useState<MicrobitState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    device: null,
    connectionType: null,
    capabilities: {
      supportsUSB: true,
      supportsBluetooth: false,
    },
  });

  const [connectionManager] = useState(() => {
    const manager = new MicrobitConnectionManager();
    // Make connection manager globally accessible if needed
    (window as any).microbitConnectionManager = manager;
    return manager;
  });

  // Connect to micro:bit
  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      await connectionManager.connect();
      setState((prev) => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        connectionType: ConnectionType.USB,
        device: { name: "micro:bit" }, // Mock device object
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message,
        isConnecting: false,
      }));
    }
  }, [connectionManager]);

  // Disconnect from micro:bit
  const disconnect = useCallback(async () => {
    try {
      await connectionManager.disconnect();
      setState((prev) => ({
        ...prev,
        isConnected: false,
        error: null,
        device: null,
        connectionType: null,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message,
      }));
    }
  }, [connectionManager]);

  // Check connection status
  const checkConnection = useCallback(async () => {
    try {
      const connected = await connectionManager.isConnected();
      setState((prev) => ({
        ...prev,
        isConnected: connected,
      }));
      return connected;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message,
      }));
      return false;
    }
  }, [connectionManager]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Dummy functions for compatibility
  const connectUSB = useCallback(async () => {
    return connect();
  }, [connect]);

  const connectBluetooth = useCallback(async () => {
    throw new Error("Bluetooth connection not supported in simplified version");
  }, []);

  const getAvailableConnectionTypes = useCallback(() => {
    return [ConnectionType.USB]; // Only USB supported
  }, []);

  return {
    // State
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
    device: state.device,
    connectionType: state.connectionType,
    capabilities: state.capabilities,

    // Actions
    connect,
    connectUSB,
    connectBluetooth,
    disconnect,
    checkConnection,
    clearError,
    getAvailableConnectionTypes,

    // Manager instance (if needed)
    connectionManager,
  };
}
