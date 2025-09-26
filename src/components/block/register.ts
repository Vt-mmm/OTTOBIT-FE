import * as Blockly from "blockly/core";

// Import block definitions
import { eventBlocks } from "./ottobit_events";
import { movementBlocks } from "./ottobit_movement";
import { controlBlocks } from "./ottobit_control";
import { sensorBlocks } from "./ottobit_sensors";
import { actionBlocks } from "./ottobit_actions";
import { functionBlocks } from "./ottobit_functions";
import {
  ottobit_function_def,
  ottobit_function_call,
} from "./blocks/functionBlocks";

// Import generators to register them automatically
import "./generators/javascript";
import "./generators/python";

// Import extensions
import { registerIfElseMutator } from "./extensions/if_else_mutator";

// Prevent duplicate mutator registration across multiple mounts/usages
let isMutatorRegistered = false;

/**
 * Register all ottobit block definitions following Google Blockly standards
 */
export function registerottobitBlocks(): void {
  // Register mutators and extensions first (guard against double registration)
  if (!isMutatorRegistered) {
    try {
      registerIfElseMutator();
    } catch (e) {
      // Ignore if already registered by another workspace
    }
    isMutatorRegistered = true;
  }

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
    functionBlocks,
  ];

  blockModules.forEach((blockModule) => {
    Object.keys(blockModule).forEach((blockType) => {
      const blockDef = blockModule[blockType];
      Blockly.Blocks[blockType] = {
        init: function () {
          this.jsonInit(blockDef);

          // Thêm shadow blocks cho các input value của movement và actions
          if (blockType === "ottobit_move_forward") {
            // Chỉ apply compact style nếu block đã sẵn sàng
            if (this.inputList) {
            }
            const input = this.getInput("STEPS");
            if (input && input.connection && this.workspace) {
              const shadowBlock = this.workspace.newBlock("ottobit_number");
              shadowBlock.setShadow(true);
              shadowBlock.setFieldValue(1, "NUM");
              shadowBlock.initSvg();
              shadowBlock.render();
              input.connection.connect(shadowBlock.outputConnection);
            }
          }

          if (
            blockType === "ottobit_collect_green" ||
            blockType === "ottobit_collect_red" ||
            blockType === "ottobit_collect_yellow"
          ) {
            // Chỉ apply compact style nếu block đã sẵn sàng
            if (this.inputList) {
            }
            const input = this.getInput("COUNT");
            if (input && input.connection && this.workspace) {
              const shadowBlock = this.workspace.newBlock("ottobit_number");
              shadowBlock.setShadow(true);
              shadowBlock.setFieldValue(1, "NUM");
              shadowBlock.initSvg();
              shadowBlock.render();
              input.connection.connect(shadowBlock.outputConnection);
            }
          }
        },
      };
    });
  });

  // Register custom function blocks
  Blockly.Blocks["ottobit_function_def"] = ottobit_function_def;
  Blockly.Blocks["ottobit_function_call"] = ottobit_function_call;

  // Blocks registered successfully

  // Blocks and mutators registered successfully
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
  ottobit_if_expandable: "ottobit_if_expandable",
  ottobit_variable_i: "ottobit_variable_i",
  ottobit_logic_compare: "ottobit_logic_compare",
  ottobit_number: "ottobit_number",
  ottobit_condition: "ottobit_condition",
  ottobit_boolean_equals: "ottobit_boolean_equals",

  // Logic blocks (cập nhật - đã thu gọn)
  ottobit_boolean: "ottobit_boolean",
  ottobit_logic_operation: "ottobit_logic_operation",

  // Sensors (cập nhật)
  ottobit_read_sensor: "ottobit_read_sensor",
  ottobit_sensor_condition: "ottobit_sensor_condition",
  ottobit_comparison: "ottobit_comparison",

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
  ottobit_take_bale: "ottobit_take_bale",
  ottobit_put_bale: "ottobit_put_bale",

  // Sensors (additional)
  ottobit_bale_number: "ottobit_bale_number",

  // Battery color checks
  ottobit_is_green: "ottobit_is_green",
  ottobit_is_red: "ottobit_is_red",
  ottobit_is_yellow: "ottobit_is_yellow",

  // Function blocks (sử dụng custom blocks)
  ottobit_function_def: "ottobit_function_def",
  ottobit_function_call: "ottobit_function_call",
} as const;

export type BlockType = keyof typeof BLOCK_TYPES;
