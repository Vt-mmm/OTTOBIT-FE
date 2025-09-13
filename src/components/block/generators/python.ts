/**
 * @license
 * Copyright 2024 ottobit
 * SPDX-License-Identifier: Apache-2.0
 */

import { pythonGenerator, Order } from "blockly/python";

/**
 * Python code generators for ottobit blocks
 */

// Event blocks
pythonGenerator.forBlock["ottobit_start"] = function (_block: any): string {
  return "from ottomotor import OttoMotor\nmotor = OttoMotor(14, 13)\n\n";
};

// Movement blocks
pythonGenerator.forBlock["ottobit_move_forward"] = function (
  block: any
): string {
  const steps = block.getFieldValue("STEPS") || "1";
  return `motor.Move(${steps}, 1, 2)\n`;
};

pythonGenerator.forBlock["ottobit_rotate"] = function (block: any): string {
  const direction = block.getFieldValue("DIRECTION") || "RIGHT";
  let action = "";
  switch (direction) {
    case "RIGHT":
      action = "robot.turn_right()";
      break;
    case "LEFT":
      action = "robot.turn_left()";
      break;
    case "BACK":
      action = "robot.turn_back()";
      break;
    default:
      action = "robot.turn_right()";
  }
  return `${action}\n`;
};
pythonGenerator.forBlock["ottobit_move_backward"] = function (
  _block: any
): string {
  return "robot.move_backward()\n";
};

pythonGenerator.forBlock["ottobit_turn_left"] = function (_block: any): string {
  return "robot.turn_left()\n";
};

pythonGenerator.forBlock["ottobit_turn_right"] = function (
  _block: any
): string {
  return "robot.turn_right()\n";
};

pythonGenerator.forBlock["ottobit_walk"] = function (block: any): string {
  const steps = block.getFieldValue("STEPS") || "3";
  return `robot.walk(${steps})\n`;
};

pythonGenerator.forBlock["ottobit_dance"] = function (block: any): string {
  const pattern = block.getFieldValue("PATTERN") || "basic";
  return `robot.dance('${pattern}')\n`;
};

// Control blocks
pythonGenerator.forBlock["ottobit_wait"] = function (block: any): string {
  const duration = block.getFieldValue("DURATION") || "1";
  return `robot.wait(${duration})\n`;
};

pythonGenerator.forBlock["ottobit_repeat"] = function (block: any): string {
  const times = block.getFieldValue("TIMES") || "3";
  const statements = pythonGenerator.statementToCode(block, "DO");
  const varName = "count" + Math.floor(Math.random() * 1000);
  const indentedStatements = statements
    .split("\n")
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join("\n");
  return `for ${varName} in range(int(${times})):\n${
    indentedStatements || "    pass"
  }\n`;
};

pythonGenerator.forBlock["ottobit_repeat_range"] = function (
  block: any
): string {
  // Với field_dropdown, lấy value đơn giản
  const varName = block.getFieldValue("VAR") || "i";
  const from = block.getFieldValue("FROM") || "1";
  const to = block.getFieldValue("TO") || "5";
  const by = block.getFieldValue("BY") || "1";
  const statements = pythonGenerator.statementToCode(block, "DO");
  const indentedStatements = statements
    .split("\n")
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join("\n");
  return `for ${varName} in range(${from}, ${parseInt(to) + 1}, ${by}):\n${
    indentedStatements || "    pass"
  }\n`;
};

pythonGenerator.forBlock["ottobit_while"] = function (block: any): string {
  const condition =
    pythonGenerator.valueToCode(block, "CONDITION", Order.NONE) || "False";
  const statements = pythonGenerator.statementToCode(block, "DO");
  const indentedStatements = statements
    .split("\n")
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join("\n");
  return `while ${condition}:\n${indentedStatements || "    pass"}\n`;
};

pythonGenerator.forBlock["ottobit_if"] = function (block: any): string {
  const condition =
    pythonGenerator.valueToCode(block, "CONDITION", Order.NONE) || "False";
  const statements = pythonGenerator.statementToCode(block, "DO");
  const indentedStatements = statements
    .split("\n")
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join("\n");
  return `if ${condition}:\n${indentedStatements || "    pass"}\n`;
};

pythonGenerator.forBlock["ottobit_if_condition"] = function (
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
pythonGenerator.forBlock["ottobit_read_sensor"] = function (
  block: any
): [string, number] {
  const sensorType = block.getFieldValue("SENSOR_TYPE") || "DISTANCE";
  return [`motor.read_sensor('${sensorType}')`, Order.FUNCTION_CALL];
};

pythonGenerator.forBlock["ottobit_comparison"] = function (
  block: any
): [string, number] {
  const valueA =
    pythonGenerator.valueToCode(block, "A", Order.RELATIONAL) || "0";
  const op = block.getFieldValue("OP") || "EQ";
  const valueB = block.getFieldValue("B") || "0";

  const operators: { [key: string]: string } = {
    EQ: "==",
    NEQ: "!=",
    LT: "<",
    LTE: "<=",
    GT: ">",
    GTE: ">=",
  };

  const code = `${valueA} ${operators[op]} ${valueB}`;
  return [code, Order.RELATIONAL];
};

pythonGenerator.forBlock["ottobit_touch_sensor"] = function (
  _block: any
): [string, number] {
  return ["robot.get_touch_sensor()", Order.FUNCTION_CALL];
};

pythonGenerator.forBlock["ottobit_light_sensor"] = function (
  _block: any
): [string, number] {
  return ["robot.get_light_level()", Order.FUNCTION_CALL];
};

pythonGenerator.forBlock["ottobit_sound_sensor"] = function (
  _block: any
): [string, number] {
  return ["robot.get_sound_level()", Order.FUNCTION_CALL];
};

// Action blocks
pythonGenerator.forBlock["ottobit_led_on"] = function (block: any): string {
  const color = block.getFieldValue("COLOR") || "red";
  return `robot.led_on('${color}')\n`;
};

pythonGenerator.forBlock["ottobit_led_off"] = function (_block: any): string {
  return "robot.led_off()\n";
};

pythonGenerator.forBlock["ottobit_buzzer_beep"] = function (
  block: any
): string {
  const frequency = block.getFieldValue("FREQUENCY") || "1000";
  const duration = block.getFieldValue("DURATION") || "1";
  return `robot.beep(${frequency}, ${duration})\n`;
};

pythonGenerator.forBlock["ottobit_speak"] = function (block: any): string {
  const text = block.getFieldValue("TEXT") || "Hello";
  return `robot.speak('${text}')\n`;
};

pythonGenerator.forBlock["ottobit_display_text"] = function (
  block: any
): string {
  const text = block.getFieldValue("TEXT") || "Hello";
  return `robot.display_text('${text}')\n`;
};

pythonGenerator.forBlock["ottobit_send_message"] = function (
  block: any
): string {
  const message = block.getFieldValue("MESSAGE") || "Hello";
  return `robot.send_message('${message}')\n`;
};

// New control blocks generators
pythonGenerator.forBlock["ottobit_while_compare"] = function (
  block: any
): string {
  const leftValue =
    pythonGenerator.valueToCode(block, "LEFT", Order.RELATIONAL) || "0";
  const operator = block.getFieldValue("OPERATOR") || "EQ";
  const rightValue =
    pythonGenerator.valueToCode(block, "RIGHT", Order.RELATIONAL) || "0";
  const statements = pythonGenerator.statementToCode(block, "DO");

  const operators: { [key: string]: string } = {
    EQ: "==",
    NEQ: "!=",
    LT: "<",
    LTE: "<=",
    GT: ">",
    GTE: ">=",
  };

  const condition = `${leftValue} ${operators[operator]} ${rightValue}`;
  return `while ${condition}:\n${statements || "    pass\n"}`;
};

pythonGenerator.forBlock["ottobit_if"] = function (block: any): string {
  const condition1 =
    pythonGenerator.valueToCode(block, "CONDITION1", Order.LOGICAL_AND) ||
    "False";
  const operator = block.getFieldValue("OPERATOR") || "AND";
  const condition2 =
    pythonGenerator.valueToCode(block, "CONDITION2", Order.LOGICAL_AND) ||
    "False";
  const doStatements = pythonGenerator.statementToCode(block, "DO");
  const elseStatements = pythonGenerator.statementToCode(block, "ELSE");

  const logicOperator = operator === "AND" ? "and" : "or";
  const combinedCondition = `(${condition1}) ${logicOperator} (${condition2})`;

  let code = `if ${combinedCondition}:\n${doStatements || "    pass\n"}`;
  if (elseStatements) {
    code += `else:\n${elseStatements}`;
  }

  return code;
};

// Variable block
pythonGenerator.forBlock["ottobit_variable_i"] = function (
  _block: any
): [string, number] {
  return ["i", Order.ATOMIC];
};

// Logic compare block
pythonGenerator.forBlock["ottobit_logic_compare"] = function (
  block: any
): [string, number] {
  const leftValue =
    pythonGenerator.valueToCode(block, "LEFT", Order.RELATIONAL) || "0";
  const operator = block.getFieldValue("OPERATOR") || "EQ";
  const rightValue =
    pythonGenerator.valueToCode(block, "RIGHT", Order.RELATIONAL) || "0";

  const operators: Record<string, string> = {
    EQ: "==",
    NEQ: "!=",
    LT: "<",
    LTE: "<=",
    GT: ">",
    GTE: ">=",
  };

  const code = `${leftValue} ${operators[operator]} ${rightValue}`;
  return [code, Order.RELATIONAL];
};

// Number block
pythonGenerator.forBlock["ottobit_number"] = function (
  block: any
): [string, number] {
  const value = block.getFieldValue("NUM") || "0";
  return [value, Order.ATOMIC];
};

// Collect blocks
pythonGenerator.forBlock["ottobit_collect_green"] = function (
  block: any
): string {
  const count = block.getFieldValue("COUNT") || "1";
  return `robot.collect(${count}, 'green')\n`;
};

pythonGenerator.forBlock["ottobit_collect_red"] = function (
  block: any
): string {
  const count = block.getFieldValue("COUNT") || "1";
  return `robot.collect(${count}, 'red')\n`;
};

pythonGenerator.forBlock["ottobit_collect_yellow"] = function (
  block: any
): string {
  const count = block.getFieldValue("COUNT") || "1";
  return `robot.collect(${count}, 'yellow')\n`;
};

// Bale handling blocks
pythonGenerator.forBlock["ottobit_take_bale"] = function (
  _block: any
): string {
  return "robot.take_bale()\n";
};

pythonGenerator.forBlock["ottobit_put_bale"] = function (
  _block: any
): string {
  return "robot.put_bale()\n";
};

// Bale number sensor
pythonGenerator.forBlock["ottobit_bale_number"] = function (
  _block: any
): [string, number] {
  return ["robot.get_bale_number()", Order.FUNCTION_CALL];
};

// New Python generators for improved blocks
// Boolean dropdown block
pythonGenerator.forBlock["ottobit_boolean"] = function (
  block: any
): [string, number] {
  const value = block.getFieldValue("BOOL") || "TRUE";
  return [value === "TRUE" ? "True" : "False", Order.ATOMIC];
};

// Logic operation block with dropdown
pythonGenerator.forBlock["ottobit_logic_operation"] = function (
  block: any
): [string, number] {
  const leftValue =
    pythonGenerator.valueToCode(block, "LEFT", Order.LOGICAL_AND) || "False";
  const rightValue =
    pythonGenerator.valueToCode(block, "RIGHT", Order.LOGICAL_AND) || "False";
  const operator = block.getFieldValue("OP") || "AND";
  
  const code = operator === "AND" 
    ? `(${leftValue}) and (${rightValue})`
    : `(${leftValue}) or (${rightValue})`;
  
  const order = operator === "AND" ? Order.LOGICAL_AND : Order.LOGICAL_OR;
  return [code, order];
};

// Sensor condition block (tích hợp sensor và comparison)
pythonGenerator.forBlock["ottobit_sensor_condition"] = function (
  block: any
): [string, number] {
  const sensorType = block.getFieldValue("SENSOR_TYPE") || "DISTANCE";
  const operator = block.getFieldValue("OP") || "EQ";
  const value = block.getFieldValue("VALUE") || "0";
  
  const operators: { [key: string]: string } = {
    EQ: "==",
    NEQ: "!=",
    LT: "<",
    LTE: "<=",
    GT: ">",
    GTE: ">=",
  };
  
  let sensorCall = "";
  switch (sensorType) {
    case "DISTANCE":
      sensorCall = "motor.read_sensor('DISTANCE')";
      break;
    case "LIGHT":
      sensorCall = "motor.read_sensor('LIGHT')";
      break;
    case "TEMPERATURE":
      sensorCall = "motor.read_sensor('TEMPERATURE')";
      break;
    case "BALE_NUMBER":
      sensorCall = "motor.get_bale_number()";
      break;
    default:
      sensorCall = "motor.read_sensor('DISTANCE')";
  }
  
  const code = `${sensorCall} ${operators[operator]} ${value}`;
  return [code, Order.RELATIONAL];
};

// Enhanced comparison block with input values
pythonGenerator.forBlock["ottobit_comparison"] = function (
  block: any
): [string, number] {
  const valueA =
    pythonGenerator.valueToCode(block, "A", Order.RELATIONAL) || "0";
  const op = block.getFieldValue("OP") || "EQ";
  const valueB =
    pythonGenerator.valueToCode(block, "B", Order.RELATIONAL) || "0";

  const operators: { [key: string]: string } = {
    EQ: "==",
    NEQ: "!=",
    LT: "<",
    LTE: "<=",
    GT: ">",
    GTE: ">=",
  };

  const code = `${valueA} ${operators[op]} ${valueB}`;
  return [code, Order.RELATIONAL];
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
