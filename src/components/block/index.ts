/**
 * @license
 * Copyright 2024 Ottobit
 * SPDX-License-Identifier: Apache-2.0
 */

// Import all block modules
import * as ottobotEvents from "./ottobit_events";
import * as ottobotMovement from "./ottobit_movement";
import * as ottobotControl from "./ottobit_control";
import * as ottobotSensors from "./ottobit_sensors";
import * as ottobotActions from "./ottobit_actions";

// Export individual block modules
export {
  ottobotEvents,
  ottobotMovement,
  ottobotControl,
  ottobotSensors,
  ottobotActions,
};

// Export BlockToolbox component
export { default as BlockToolbox } from "./BlockToolbox";

// Export registration function
export { registerOttobotBlocks, BLOCK_TYPES, type BlockType } from "./register";

// Export toolbox configuration
export { OTTOBOT_TOOLBOX } from "./toolbox";

// Export generators
export * from "./generators";

/**
 * A dictionary of all block definitions provided by Ottobot
 */
export const blocks: { [key: string]: any } = Object.assign(
  {},
  ottobotEvents.eventBlocks,
  ottobotMovement.movementBlocks,
  ottobotControl.controlBlocks,
  ottobotSensors.sensorBlocks,
  ottobotActions.actionBlocks
);

/**
 * Legacy function names for backward compatibility
 */
import { registerOttobotBlocks as registerBlocks } from "./register";
export const defineBlocks = registerBlocks;

// Export legacy generator function names
export { generatePythonCode, generateJavaScriptCode } from "./generators";
