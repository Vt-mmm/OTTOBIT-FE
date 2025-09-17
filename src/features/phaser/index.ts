// Components
export { default as PhaserSimulator } from "./components/PhaserSimulator";
export { PhaserControlPanel } from "./components/PhaserControlPanel";
export { default as LevelSelector } from "./components/LevelSelector";

// Services
export { PhaserCommunicationService } from "./services/phaserCommunicationService";
export { BlocklyToPhaserConverter } from "./services/blocklyToPhaserConverter";
export { GameStateManager } from "./services/gameStateManager";
export {
  levelConfigService,
  type Level,
  type LevelProgress,
} from "./services/levelConfigService";

// Hooks
export { usePhaserCommunication } from "./hooks/usePhaserCommunication";
export { usePhaserSimulator } from "./hooks/usePhaserSimulator";
export { useChallengeData } from "./hooks/useChallengeData";
export { useChallengeMapLoader } from "./hooks/useChallengeMapLoader";
// Converters
export * from "./converters";

// Context
export { PhaserProvider, usePhaserContext } from "./context/PhaserContext";

// Types
export * from "./types/phaser";
export * from "./types/game";
export * from "./types/communication";
export * from "./types/map";
