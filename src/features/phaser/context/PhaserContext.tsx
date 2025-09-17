import { createContext, useContext, ReactNode } from "react";
import { usePhaserSimulator } from "../hooks/usePhaserSimulator";
import { useChallengeData } from "../hooks/useChallengeData";
import { useChallengeMapLoader } from "../hooks/useChallengeMapLoader";
import {
  GameState,
  PhaserConfig,
  ProgramData,
  VictoryData,
  ErrorData,
} from "../types/phaser";
import { ChallengeResult, GetChallengesRequest } from "../../../common/@types/challenge";
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

  // Current Challenge State
  currentChallengeId: string | null;
  currentChallenge: ChallengeResult | null;

  // Challenge State
  challenges: any;
  lessonChallenges: any;
  isLoadingChallenges: boolean;
  challengeError: string | null;

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

  // Challenge Actions
  loadChallenge: (challengeId: string) => Promise<ChallengeResult | null>;
  loadChallengeByDifficulty: (difficulty: number, index?: number) => Promise<ChallengeResult | null>;
  fetchChallenges: (params?: GetChallengesRequest) => Promise<void>;
  fetchChallengesByLesson: (lessonId: string, pageNumber?: number, pageSize?: number) => Promise<void>;
  clearChallengeError: () => void;

  // Challenge Helpers
  findChallengeById: (challengeId: string) => ChallengeResult | null;
  getChallengesByDifficulty: (difficulty: number) => ChallengeResult[];
  getMapJsonFromChallenge: (challengeId: string) => any | null;
  getChallengeNavigationInfo: () => {
    hasNext: boolean;
    hasPrevious: boolean;
    currentIndex: number;
    totalChallenges: number;
    difficulty: number | null;
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
  const challengeData = useChallengeData();
  
  // Victory progress handler - simplified for challenges
  const handleVictoryProgress = async (_victoryData: VictoryData) => {
    try {
      // For now, just log victory - can extend later for:
      // 1. Mark challenge as completed
      // 2. Update submission tracking  
      // 3. Unlock next challenges
      // Future implementation could include:
      // - Update submission/progress API calls
      // - Navigate to next challenge
      // - Show completion rewards
    } catch (error) {
      }
  };
  
  const phaserState = usePhaserSimulator(config, handleVictoryProgress);
  const challengeLoader = useChallengeMapLoader(phaserState.sendMessage, phaserState.clearError);

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

    // Current Challenge State
    currentChallengeId: challengeData.currentChallenge?.id || null,
    currentChallenge: challengeData.currentChallenge,

    // Challenge State
    challenges: challengeData.challenges,
    lessonChallenges: challengeData.lessonChallenges,
    isLoadingChallenges: challengeData.isLoading,
    challengeError: challengeData.hasError
      ? challengeData.challengesError || challengeData.lessonChallengesError || challengeData.currentChallengeError
      : challengeLoader.mapLoadError,

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

    // Challenge Actions
    loadChallenge: challengeLoader.loadChallengeMap,
    loadChallengeByDifficulty: challengeLoader.loadChallengeByDifficulty,
    fetchChallenges: async (params) => {
      await challengeData.fetchChallenges(params || {});
    },
    fetchChallengesByLesson: async (lessonId, pageNumber, pageSize) => {
      await challengeData.fetchChallengesByLesson(lessonId, pageNumber, pageSize);
    },
    clearChallengeError: () => {
      challengeData.clearErrors();
      challengeLoader.clearMapLoadError();
    },

    // Challenge Helpers
    findChallengeById: challengeData.findChallengeById,
    getChallengesByDifficulty: challengeData.getChallengesByDifficulty,
    getMapJsonFromChallenge: challengeData.getMapJsonFromChallenge,
    getChallengeNavigationInfo: challengeLoader.getChallengeNavigationInfo,

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
