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
 * Register all ottobit block definitions following Google Blockly standards
 */
export function registerottobitBlocks(): void {
  // Clear existing blocks first to ensure fresh registration
  Object.keys(Blockly.Blocks).forEach((blockType) => {
    if (blockType.startsWith("ottobit_")) {
      delete Blockly.Blocks[blockType];
    }
  });

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

  console.log("🔧 Ottobit blocks registered successfully");
}

/**
 * Legacy block types for backward compatibility
 */
export const BLOCK_TYPES = {
  // Events
  ottobit_start: "ottobit_start",
  ottobit_button_pressed: "ottobit_button_pressed",
  ottobit_receive_message: "ottobit_receive_message",

  // Movement
  ottobit_move_forward: "ottobit_move_forward",
  ottobit_move_backward: "ottobit_move_backward",
  ottobit_turn_left: "ottobit_turn_left",
  ottobit_turn_right: "ottobit_turn_right",
  ottobit_stop_movement: "ottobit_stop_movement",
  ottobit_walk: "ottobit_walk",
  ottobit_dance: "ottobit_dance",

  // Control
  ottobit_wait: "ottobit_wait",
  ottobit_repeat: "ottobit_repeat",
  ottobit_repeat_range: "ottobit_repeat_range",
  ottobit_while: "ottobit_while",
  ottobit_while_compare: "ottobit_while_compare",
  ottobit_if: "ottobit_if",
  ottobit_variable_i: "ottobit_variable_i",
  ottobit_logic_compare: "ottobit_logic_compare",
  ottobit_number: "ottobit_number",

  // Sensors
  ottobit_distance_sensor: "ottobit_distance_sensor",
  ottobit_touch_sensor: "ottobit_touch_sensor",
  ottobit_light_sensor: "ottobit_light_sensor",
  ottobit_sound_sensor: "ottobit_sound_sensor",

  // Actions
  ottobit_led_on: "ottobit_led_on",
  ottobit_led_off: "ottobit_led_off",
  ottobit_buzzer_beep: "ottobit_buzzer_beep",
  ottobit_speak: "ottobit_speak",
  ottobit_display_text: "ottobit_display_text",
  ottobit_send_message: "ottobit_send_message",
  ottobit_collect_green: "ottobit_collect_green",
  ottobit_collect_red: "ottobit_collect_red",
  ottobit_collect_yellow: "ottobit_collect_yellow",
} as const;

export type BlockType = keyof typeof BLOCK_TYPES;
