/**
 * @license
 * Copyright 2024 Ottobot
 * SPDX-License-Identifier: Apache-2.0
 */

import { pythonGenerator, Order } from "blockly/python";

/**
 * Python code generators for Ottobot blocks
 */

// Event blocks
pythonGenerator.forBlock["ottobot_start"] = function (_block: any): string {
  return "from ottomotor import OttoMotor\nmotor = OttoMotor(14, 13)\n\n";
};

// Movement blocks
pythonGenerator.forBlock["ottobot_move_forward"] = function (
  block: any
): string {
  const steps = block.getFieldValue("STEPS") || "1";
  return `motor.Move(${steps}, 1, 2)\n`;
};

pythonGenerator.forBlock["ottobot_rotate"] = function (block: any): string {
  const direction = block.getFieldValue("DIRECTION") || "RIGHT";
  const dir = direction === "RIGHT" ? "1" : "-1";
  return `motor.Rotate(${dir})\n`;
};
pythonGenerator.forBlock["ottobot_move_backward"] = function (
  _block: any
): string {
  return "robot.move_backward()\n";
};

pythonGenerator.forBlock["ottobot_turn_left"] = function (_block: any): string {
  return "robot.turn_left()\n";
};

pythonGenerator.forBlock["ottobot_turn_right"] = function (
  _block: any
): string {
  return "robot.turn_right()\n";
};

pythonGenerator.forBlock["ottobot_walk"] = function (block: any): string {
  const steps = block.getFieldValue("STEPS") || "3";
  return `robot.walk(${steps})\n`;
};

pythonGenerator.forBlock["ottobot_dance"] = function (block: any): string {
  const pattern = block.getFieldValue("PATTERN") || "basic";
  return `robot.dance('${pattern}')\n`;
};

// Control blocks
pythonGenerator.forBlock["ottobot_wait"] = function (block: any): string {
  const duration = block.getFieldValue("DURATION") || "1";
  return `robot.wait(${duration})\n`;
};

pythonGenerator.forBlock["ottobot_repeat"] = function (block: any): string {
  const times = block.getFieldValue("TIMES") || "3";
  const statements = pythonGenerator.statementToCode(block, "DO");
  const varName = 'count' + (Math.floor(Math.random() * 1000));
  const indentedStatements = statements
    .split("\n")
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join("\n");
  return `for ${varName} in range(int(${times})):\n${indentedStatements || "    pass"}\n`;
};

pythonGenerator.forBlock["ottobot_repeat_range"] = function (block: any): string {
  // Với field_dropdown, lấy value đơn giản
  const varName = block.getFieldValue('VAR') || 'i';
  const from = block.getFieldValue('FROM') || '1';
  const to = block.getFieldValue('TO') || '5';
  const by = block.getFieldValue('BY') || '1';
  const statements = pythonGenerator.statementToCode(block, 'DO');
  const indentedStatements = statements
    .split('\n')
    .map(line => line.trim() ? `    ${line}` : line)
    .join('\n');
  return `for ${varName} in range(${from}, ${parseInt(to) + 1}, ${by}):\n${indentedStatements || '    pass'}\n`;
};

pythonGenerator.forBlock["ottobot_while"] = function (block: any): string {
  const condition =
    pythonGenerator.valueToCode(block, "CONDITION", Order.NONE) || "False";
  const statements = pythonGenerator.statementToCode(block, "DO");
  const indentedStatements = statements
    .split("\n")
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join("\n");
  return `while ${condition}:\n${indentedStatements || "    pass"}\n`;
};

pythonGenerator.forBlock["ottobot_if"] = function (block: any): string {
  const condition =
    pythonGenerator.valueToCode(block, "CONDITION", Order.NONE) || "False";
  const statements = pythonGenerator.statementToCode(block, "DO");
  const indentedStatements = statements
    .split("\n")
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join("\n");
  return `if ${condition}:\n${indentedStatements || "    pass"}\n`;
};

pythonGenerator.forBlock["ottobot_if_condition"] = function (
  block: any
): string {
  const condition =
    pythonGenerator.valueToCode(block, "CONDITION", Order.NONE) || "False";
  const statements = pythonGenerator.statementToCode(block, "DO");
  const indentedStatements = statements
    .split("\n")
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join("\n");
  return `if ${condition}:\n${indentedStatements || "    pass"}\n`;
};

// Sensor blocks
pythonGenerator.forBlock['ottobot_read_sensor'] = function(block: any): [string, number] {
  const sensorType = block.getFieldValue('SENSOR_TYPE') || 'DISTANCE';
  return [`motor.read_sensor('${sensorType}')`, Order.FUNCTION_CALL];
};

pythonGenerator.forBlock['ottobot_comparison'] = function(block: any): [string, number] {
  const valueA = pythonGenerator.valueToCode(block, 'A', Order.RELATIONAL) || '0';
  const op = block.getFieldValue('OP') || 'EQ';
  const valueB = block.getFieldValue('B') || '0';
  
  const operators: {[key: string]: string} = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  
  const code = `${valueA} ${operators[op]} ${valueB}`;
  return [code, Order.RELATIONAL];
};

pythonGenerator.forBlock["ottobot_touch_sensor"] = function (
  _block: any
): [string, number] {
  return ["robot.get_touch_sensor()", Order.FUNCTION_CALL];
};

pythonGenerator.forBlock["ottobot_light_sensor"] = function (
  _block: any
): [string, number] {
  return ["robot.get_light_level()", Order.FUNCTION_CALL];
};

pythonGenerator.forBlock["ottobot_sound_sensor"] = function (
  _block: any
): [string, number] {
  return ["robot.get_sound_level()", Order.FUNCTION_CALL];
};

// Action blocks
pythonGenerator.forBlock["ottobot_led_on"] = function (block: any): string {
  const color = block.getFieldValue("COLOR") || "red";
  return `robot.led_on('${color}')\n`;
};

pythonGenerator.forBlock["ottobot_led_off"] = function (_block: any): string {
  return "robot.led_off()\n";
};

pythonGenerator.forBlock["ottobot_buzzer_beep"] = function (
  block: any
): string {
  const frequency = block.getFieldValue("FREQUENCY") || "1000";
  const duration = block.getFieldValue("DURATION") || "1";
  return `robot.beep(${frequency}, ${duration})\n`;
};

pythonGenerator.forBlock["ottobot_speak"] = function (block: any): string {
  const text = block.getFieldValue("TEXT") || "Hello";
  return `robot.speak('${text}')\n`;
};

pythonGenerator.forBlock["ottobot_display_text"] = function (
  block: any
): string {
  const text = block.getFieldValue("TEXT") || "Hello";
  return `robot.display_text('${text}')\n`;
};

pythonGenerator.forBlock["ottobot_send_message"] = function (
  block: any
): string {
  const message = block.getFieldValue("MESSAGE") || "Hello";
  return `robot.send_message('${message}')\n`;
};

/**
 * Generate Python code from workspace
 */
export function generatePythonCode(workspace: any): string {
  if (!workspace) return "";

  try {
    return pythonGenerator.workspaceToCode(workspace);
  } catch (error) {
    console.error("Error generating Python code:", error);
    return "# Error generating code";
  }
}
