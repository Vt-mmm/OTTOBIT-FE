/**
 * @license
 * Copyright 2024 Ottobit
 * SPDX-License-Identifier: Apache-2.0
 */

// Import all block modules
import * as ottobitEvents from "./ottobit_events";
import * as ottobitMovement from "./ottobit_movement";
import * as ottobitControl from "./ottobit_control";
import * as ottobitSensors from "./ottobit_sensors";
import * as ottobitActions from "./ottobit_actions";

// Export individual block modules
export {
  ottobitEvents,
  ottobitMovement,
  ottobitControl,
  ottobitSensors,
  ottobitActions,
};

// Export BlockToolbox component
export { default as BlockToolbox } from "./BlockToolbox";

// Export registration function
export { registerottobitBlocks, setupShadowBlockRestoration, BLOCK_TYPES, type BlockType } from "./register";

// Export toolbox configuration
export { ottobit_TOOLBOX } from "./toolbox";

// Export generators
export * from "./generators";

/**
 * A dictionary of all block definitions provided by ottobit
 */
export const blocks: { [key: string]: any } = Object.assign(
  {},
  ottobitEvents.eventBlocks,
  ottobitMovement.movementBlocks,
  ottobitControl.controlBlocks,
  ottobitSensors.sensorBlocks,
  ottobitActions.actionBlocks
);

/**
 * Legacy function names for backward compatibility
 */
import { registerottobitBlocks as registerBlocks } from "./register";
export const defineBlocks = registerBlocks;

// Export legacy generator function names
export { generatePythonCode, generateJavaScriptCode } from "./generators";
