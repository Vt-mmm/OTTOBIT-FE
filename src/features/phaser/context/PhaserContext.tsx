import { createContext, useContext, useEffect, ReactNode } from "react";
import { usePhaserSimulator } from "../hooks/usePhaserSimulator";
import { useMapData } from "../hooks/useMapData";
import { useMapLoader } from "../hooks/useMapLoader";
import { useLessonProgress } from "../hooks/useLessonProgress";
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

  // Lesson Progress State
  completedMapIds: string[];
  isProgressLoading: boolean;
  progressError: string | null;
  progressStats: any;

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

  // Lesson Progress Actions
  fetchCompletedMaps: () => Promise<void>;
  markMapCompleted: (mapId: string) => Promise<void>;
  isMapCompleted: (mapId: string) => boolean;
  getCategoryProgress: (allMaps: MapResult[], categoryName: string) => {
    total: number;
    completed: number;
    percentage: number;
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
  const mapData = useMapData();
  const lessonProgress = useLessonProgress();
  
  // Auto-fetch lesson maps on mount to ensure data is available for victory progress
  useEffect(() => {
    if (!mapData.lessonMaps?.mapsByType && !mapData.isLoading) {
      mapData.fetchLessonMapsData().catch(() => {
        // Silently handle errors - authentication issues will be handled elsewhere
      });
    }
  }, []); // Only run once on mount
  
  // Auto-fetch completed maps on mount, with proper error handling
  useEffect(() => {
    let isMounted = true;
    
    const fetchInitialCompletedMaps = async () => {
      // Only fetch if we don't have data and we're not already loading
      if (lessonProgress.completedMapIds.length === 0 && 
          !lessonProgress.isLoading && 
          !lessonProgress.hasError) {
        try {
          await lessonProgress.fetchCompletedMaps();
        } catch (error) {
          // Silently handle errors - 401 will be handled by auth interceptors
          // Don't retry to avoid infinite loops
        }
      }
    };
    
    if (isMounted) {
      fetchInitialCompletedMaps();
    }
    
    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount
  
  // Victory progress handler
  const handleVictoryProgress = async (victoryData: VictoryData) => {
    let currentMapData = mapData.currentMap.mapData;
    let mapKeyToUse = victoryData.mapKey || phaserState.currentMapKey || mapData.currentMap.mapKey;
    
    // Last resort: check localStorage for current level
    if (!mapKeyToUse) {
      try {
        const savedLevel = localStorage.getItem('studio-current-level');
        if (savedLevel) {
          const levelData = JSON.parse(savedLevel);
          if (levelData?.mapKey) {
            mapKeyToUse = levelData.mapKey;
          }
        }
      } catch (error) {
        // Silently handle localStorage errors
      }
    }
    
    // Final fallback: check URL params
    if (!mapKeyToUse) {
      const urlParams = window.location.pathname.match(/\/studio\/([^/]+)/);
      if (urlParams?.[1]) {
        mapKeyToUse = urlParams[1];
      }
    }
    
    // Ensure lesson maps are loaded BEFORE trying to find map
    if (!mapData.lessonMaps?.mapsByType) {
      try {
        await mapData.fetchLessonMapsData();
        // Wait a bit for state to update
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        return; // Exit early if can't fetch maps
      }
    }
    
    // Check if lesson maps data is actually empty
    const hasLessonMapsData = mapData.lessonMaps?.mapsByType && 
      Object.keys(mapData.lessonMaps.mapsByType).length > 0;
    
    if (!hasLessonMapsData) {
      return; // Exit early - don't proceed without real data
    }
    
    // If no currentMapData but we have a mapKey, try to find it
    if (!currentMapData && mapKeyToUse) {
      currentMapData = mapData.findMapByKey(mapKeyToUse);
      
      // If still not found, try refreshing map data
      if (!currentMapData) {
        try {
          await mapData.refreshLessonMapsData();
          await new Promise(resolve => setTimeout(resolve, 200));
          currentMapData = mapData.findMapByKey(mapKeyToUse);
        } catch (error) {
          // Silently handle refresh errors
        }
      }
      
      // DON'T create mock data - this causes backend Guid validation errors
      if (!currentMapData && mapKeyToUse) {
        // Try one more time with a longer wait
        try {
          await mapData.refreshLessonMapsData();
          // Wait longer for Redux state to update
          await new Promise(resolve => setTimeout(resolve, 500));
          currentMapData = mapData.findMapByKey(mapKeyToUse);
        } catch (error) {
          // Silently handle final attempt errors
        }
        
        // If still no real map data, exit early to prevent backend error
        if (!currentMapData) {
          return; // Exit early - don't call handleVictoryProgress with fake data
        }
      }
    }
    
    // Create enhanced victoryData with mapKey if missing
    const enhancedVictoryData = {
      ...victoryData,
      mapKey: mapKeyToUse || victoryData.mapKey
    };
    
    await lessonProgress.handleVictoryProgress(enhancedVictoryData, currentMapData || undefined);
  };
  
  const phaserState = usePhaserSimulator(config, handleVictoryProgress);
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

    // Lesson Progress State
    completedMapIds: lessonProgress.completedMapIds,
    isProgressLoading: lessonProgress.isLoading,
    progressError: lessonProgress.errorMessage,
    progressStats: lessonProgress.progressStats,

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

    // Lesson Progress Actions
    fetchCompletedMaps: async () => {
      await lessonProgress.fetchCompletedMaps();
    },
    markMapCompleted: async (mapId: string) => {
      await lessonProgress.markMapCompleted(mapId);
    },
    isMapCompleted: lessonProgress.isMapCompleted,
    getCategoryProgress: lessonProgress.getCategoryProgress,

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
