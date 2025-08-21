// Import all block types
import { defineMovementBlocks } from "./movement";
import { defineControlBlocks } from "./control";
import { defineSensorBlocks } from "./sensor";
import { defineActionBlocks } from "./action";

// Import generators
export {
  generatePythonCode,
  generateJavaScriptCode,
  definePythonGenerators,
  defineJavaScriptGenerators,
} from "./generators";

// Export individual block definition functions for flexibility
export {
  // Movement blocks
  startBlock,
  moveForwardBlock,
  moveBackwardBlock,
  turnLeftBlock,
  turnRightBlock,
  rotateBlock,
  stopBlock,
  defineMovementBlocks,
} from "./movement";

export {
  // Control blocks
  repeatBlock,
  ifElseBlock,
  waitBlock,
  defineControlBlocks,
} from "./control";

export {
  // Sensor blocks
  readSensorBlock,
  defineSensorBlocks,
} from "./sensor";

export {
  // Action blocks
  collectBlock,
  collectGreenBlock,
  defineActionBlocks,
} from "./action";

// Main function to define all blocks at once
export const defineBlocks = () => {
  defineMovementBlocks();
  defineControlBlocks();
  defineSensorBlocks();
  defineActionBlocks();
};
