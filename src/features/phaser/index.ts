// Components
export { default as PhaserSimulator } from "./components/PhaserSimulator.js";
export { PhaserControlPanel } from "./components/PhaserControlPanel.js";
export { PhaserStatusDisplay } from "./components/PhaserStatusDisplay.js";
export { default as LevelSelector } from "./components/LevelSelector.js";

// Services
export { PhaserCommunicationService } from "./services/phaserCommunicationService.js";
export { BlocklyToPhaserConverter } from "./services/blocklyToPhaserConverter.js";
export { GameStateManager } from "./services/gameStateManager.js";
export {
  levelConfigService,
  type Level,
  type LevelProgress,
} from "./services/levelConfigService.js";

// Hooks
export { usePhaserCommunication } from "./hooks/usePhaserCommunication.js";
export { useGameState } from "./hooks/useGameState.js";
export { usePhaserSimulator } from "./hooks/usePhaserSimulator.js";

// Context
export { PhaserProvider, usePhaserContext } from "./context/PhaserContext.js";

// Types
export * from "./types/phaser.js";
export * from "./types/game.js";
export * from "./types/communication.js";
