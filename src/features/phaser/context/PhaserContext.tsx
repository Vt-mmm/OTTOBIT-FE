import { createContext, useContext, ReactNode } from "react";
import { usePhaserSimulator } from "../hooks/usePhaserSimulator.js";
import { GameState, PhaserConfig, ProgramData } from "../types/phaser.js";
import { PhaserCommunicationService } from "../services/phaserCommunicationService.js";

interface PhaserContextType {
  // State
  isConnected: boolean;
  isReady: boolean;
  gameState: GameState | null;
  currentProgram: ProgramData | null;
  error: string | null;
  isLoading: boolean;

  // Configuration
  config: PhaserConfig;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshConnection: () => void;
  loadMap: (mapKey: string) => Promise<void>;
  runProgram: (program: ProgramData) => Promise<void>;
  runProgramFromWorkspace: (workspace: any) => Promise<void>;
  pauseProgram: () => Promise<void>;
  stopProgram: () => Promise<void>;
  getStatus: () => Promise<GameState | null>;
  clearError: () => void;

  // Communication
  sendMessage: (message: any) => Promise<void>;
  onMessage: (type: string, handler: (data: any) => void) => void;
  offMessage: (type: string, handler: (data: any) => void) => void;

  // Manager instance
  communicationService: PhaserCommunicationService | null;
}

const PhaserContext = createContext<PhaserContextType | undefined>(undefined);

interface PhaserProviderProps {
  children: ReactNode;
  config?: {
    iframeId?: string;
    config?: Partial<PhaserConfig>;
  };
}

export function PhaserProvider({ children, config }: PhaserProviderProps) {
  const phaserState = usePhaserSimulator(config);

  return (
    <PhaserContext.Provider value={phaserState}>
      {children}
    </PhaserContext.Provider>
  );
}

export function usePhaserContext(): PhaserContextType {
  const context = useContext(PhaserContext);
  if (context === undefined) {
    throw new Error("usePhaserContext must be used within a PhaserProvider");
  }
  return context;
}
