import { createContext, useContext, ReactNode } from "react";
import { usePhaserSimulator } from "../hooks/usePhaserSimulator";
import { useMapData } from "../hooks/useMapData";
import { useMapLoader } from "../hooks/useMapLoader";
import {
  GameState,
  PhaserConfig,
  ProgramData,
  VictoryData,
  ErrorData,
} from "../types/phaser";
import { MapType, MapResult, MapsQuery } from "../types/map";
import { PhaserCommunicationService } from "../services/phaserCommunicationService";

interface PhaserContextType {
  // Phaser State
  isConnected: boolean;
  isReady: boolean;
  gameState: GameState | null;
  currentProgram: ProgramData | null;
  error: string | null;
  isLoading: boolean;

  // Victory State
  victoryData: VictoryData | null;
  isVictoryModalOpen: boolean;
  showVictoryModal: (data: VictoryData) => void;
  hideVictoryModal: () => void;

  // Defeat State
  defeatData: ErrorData | null;
  isDefeatModalOpen: boolean;
  showDefeatModal: (data: ErrorData) => void;
  hideDefeatModal: () => void;

  // Current Map State
  currentMapKey: string | null;

  // Map State
  currentMap: { mapKey: string | null; mapData: MapResult | null };
  allMaps: any;
  lessonMaps: any;
  isLoadingMaps: boolean;
  mapError: string | null;

  // Configuration
  config: PhaserConfig;

  // Phaser Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshConnection: () => void;
  runProgram: (program: ProgramData) => Promise<void>;
  runProgramFromWorkspace: (workspace: any) => Promise<void>;
  pauseProgram: () => Promise<void>;
  stopProgram: () => Promise<void>;
  getStatus: () => Promise<GameState | null>;
  clearError: () => void;

  // Map Actions
  loadMap: (mapKey: string) => Promise<MapResult | null>;
  loadLessonMap: (
    mapType: MapType,
    index?: number
  ) => Promise<MapResult | null>;
  loadNextMap: () => Promise<MapResult | null>;
  loadPreviousMap: () => Promise<MapResult | null>;
  fetchLessonMaps: () => Promise<void>;
  fetchAllMaps: (query?: MapsQuery) => Promise<void>;
  refreshLessonMaps: () => Promise<void>;
  clearMapError: () => void;

  // Map Helpers
  findMapByKey: (mapKey: string) => MapResult | null;
  getMapsByType: (mapType: MapType) => MapResult[];
  getLessonMapsByType: (mapType: MapType) => MapResult[];
  getMapNavigationInfo: () => {
    hasNext: boolean;
    hasPrevious: boolean;
    currentIndex: number;
    totalMaps: number;
    mapType: MapType | null;
  };

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
  const mapData = useMapData();
  const mapLoader = useMapLoader(phaserState.sendMessage);

  // Combine all the state and actions
  const contextValue: PhaserContextType = {
    // Phaser State
    isConnected: phaserState.isConnected,
    isReady: phaserState.isReady,
    gameState: phaserState.gameState,
    currentProgram: phaserState.currentProgram,
    error: phaserState.error,
    isLoading: phaserState.isLoading,

    // Victory State
    victoryData: phaserState.victoryData,
    isVictoryModalOpen: phaserState.isVictoryModalOpen,
    showVictoryModal: phaserState.showVictoryModal,
    hideVictoryModal: phaserState.hideVictoryModal,

    // Defeat State
    defeatData: phaserState.defeatData,
    isDefeatModalOpen: phaserState.isDefeatModalOpen,
    showDefeatModal: phaserState.showDefeatModal,
    hideDefeatModal: phaserState.hideDefeatModal,

    // Current Map State
    currentMapKey: phaserState.currentMapKey,

    // Map State
    currentMap: mapData.currentMap,
    allMaps: mapData.allMaps,
    lessonMaps: mapData.lessonMaps,
    isLoadingMaps: mapData.isLoading,
    mapError: mapData.hasError
      ? mapData.allMapsError || mapData.lessonMapsError
      : mapLoader.mapLoadError,

    // Configuration
    config: phaserState.config,

    // Phaser Actions
    connect: phaserState.connect,
    disconnect: phaserState.disconnect,
    refreshConnection: phaserState.refreshConnection,
    runProgram: phaserState.runProgram,
    runProgramFromWorkspace: phaserState.runProgramFromWorkspace,
    pauseProgram: phaserState.pauseProgram,
    stopProgram: phaserState.stopProgram,
    getStatus: phaserState.getStatus,
    clearError: phaserState.clearError,

    // Map Actions
    loadMap: mapLoader.loadMap,
    loadLessonMap: mapLoader.loadLessonMap,
    loadNextMap: mapLoader.loadNextMap,
    loadPreviousMap: mapLoader.loadPreviousMap,
    fetchLessonMaps: async () => {
      await mapData.fetchLessonMapsData();
    },
    fetchAllMaps: async (query) => {
      await mapData.fetchAllMapsData(query || {});
    },
    refreshLessonMaps: async () => {
      await mapData.refreshLessonMapsData();
    },
    clearMapError: () => {
      mapData.clearErrors();
      mapLoader.clearMapLoadError();
    },

    // Map Helpers
    findMapByKey: mapData.findMapByKey,
    getMapsByType: mapData.getMapsByType,
    getLessonMapsByType: mapData.getLessonMapsByType,
    getMapNavigationInfo: mapLoader.getMapNavigationInfo,

    // Communication
    sendMessage: phaserState.sendMessage,
    onMessage: phaserState.onMessage,
    offMessage: phaserState.offMessage,

    // Manager instance
    communicationService: phaserState.communicationService,
  };

  return (
    <PhaserContext.Provider value={contextValue}>
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
