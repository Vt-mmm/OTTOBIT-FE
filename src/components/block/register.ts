import * as Blockly from "blockly/core";

// Import block definitions
import { eventBlocks } from "./ottobit_events";
import { movementBlocks } from "./ottobit_movement";
import { controlBlocks } from "./ottobit_control";
import { sensorBlocks } from "./ottobit_sensors";
import { actionBlocks } from "./ottobit_actions";

// Import generators to register them automatically
import "./generators/javascript";
import "./generators/python";

/**
 * Register all Ottobot block definitions following Google Blockly standards
 */
export function registerOttobotBlocks(): void {
  // Register blocks manually using jsonInit
  const blockModules = [
    eventBlocks,
    movementBlocks,
    controlBlocks,
    sensorBlocks,
    actionBlocks,
  ];

  blockModules.forEach((blockModule) => {
    Object.keys(blockModule).forEach((blockType) => {
      const blockDef = blockModule[blockType];
      Blockly.Blocks[blockType] = {
        init: function () {
          this.jsonInit(blockDef);
        },
      };
    });
  });
}

/**
 * Legacy block types for backward compatibility
 */
export const BLOCK_TYPES = {
  // Events
  ottobot_start: "ottobot_start",
  ottobot_button_pressed: "ottobot_button_pressed",
  ottobot_receive_message: "ottobot_receive_message",

  // Movement
  ottobot_move_forward: "ottobot_move_forward",
  ottobot_move_backward: "ottobot_move_backward",
  ottobot_turn_left: "ottobot_turn_left",
  ottobot_turn_right: "ottobot_turn_right",
  ottobot_stop_movement: "ottobot_stop_movement",
  ottobot_walk: "ottobot_walk",
  ottobot_dance: "ottobot_dance",

  // Control
  ottobot_wait: "ottobot_wait",
  ottobot_repeat: "ottobot_repeat",
  ottobot_if_condition: "ottobot_if_condition",

  // Sensors
  ottobot_distance_sensor: "ottobot_distance_sensor",
  ottobot_touch_sensor: "ottobot_touch_sensor",
  ottobot_light_sensor: "ottobot_light_sensor",
  ottobot_sound_sensor: "ottobot_sound_sensor",

  // Actions
  ottobot_led_on: "ottobot_led_on",
  ottobot_led_off: "ottobot_led_off",
  ottobot_buzzer_beep: "ottobot_buzzer_beep",
  ottobot_speak: "ottobot_speak",
  ottobot_display_text: "ottobot_display_text",
  ottobot_send_message: "ottobot_send_message",
} as const;

export type BlockType = keyof typeof BLOCK_TYPES;
