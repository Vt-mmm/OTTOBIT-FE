import { createContext, useContext, ReactNode } from "react";
import { useMicrobit } from "../hooks/useMicrobit.js";
import { ConnectionType } from "../types/connection.js";
import { MicrobitConnectionManager } from "../services/microbitConnectionManager.js";

interface MicrobitContextType {
  // State
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  device: any | null;
  connectionType: ConnectionType | null;
  capabilities: {
    supportsUSB: boolean;
    supportsBluetooth: boolean;
  };

  // Actions
  connect: () => Promise<void>;
  connectUSB: () => Promise<void>;
  connectBluetooth: () => Promise<void>;
  disconnect: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  clearError: () => void;
  getAvailableConnectionTypes: () => ConnectionType[];

  // Manager instance
  connectionManager: MicrobitConnectionManager;
}

const MicrobitContext = createContext<MicrobitContextType | undefined>(
  undefined
);

interface MicrobitProviderProps {
  children: ReactNode;
}

export function MicrobitProvider({ children }: MicrobitProviderProps) {
  const microbitState = useMicrobit();

  return (
    <MicrobitContext.Provider value={microbitState}>
      {children}
    </MicrobitContext.Provider>
  );
}

export function useMicrobitContext(): MicrobitContextType {
  const context = useContext(MicrobitContext);
  if (context === undefined) {
    throw new Error(
      "useMicrobitContext must be used within a MicrobitProvider"
    );
  }
  return context;
}
