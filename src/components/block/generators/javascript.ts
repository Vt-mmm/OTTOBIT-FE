import { javascriptGenerator, Order } from "blockly/javascript";

/**
 * JavaScript code generators for ottobit blocks
 */

// Event blocks
javascriptGenerator.forBlock["ottobit_start"] = function (_block: any): string {
  return "start();\n";
};

// Movement blocks
javascriptGenerator.forBlock["ottobit_move_forward"] = function (
  block: any
): string {
  const steps = block.getFieldValue("STEPS") || "1";
  return `moveForward(${steps});\n`;
};

javascriptGenerator.forBlock["ottobit_rotate"] = function (block: any): string {
  const direction = block.getFieldValue("DIRECTION") || "RIGHT";
  let action = "";
  switch (direction) {
    case "RIGHT":
      action = "turnRight()";
      break;
    case "LEFT":
      action = "turnLeft()";
      break;
    case "BACK":
      action = "turnBack()";
      break;
    default:
      action = "turnRight()";
  }
  return `${action};\n`;
};

javascriptGenerator.forBlock["ottobit_move_backward"] = function (
  _block: any
): string {
  return "robot.moveBackward();\n";
};

javascriptGenerator.forBlock["ottobit_turn_left"] = function (
  _block: any
): string {
  return "robot.turnLeft();\n";
};

javascriptGenerator.forBlock["ottobit_turn_right"] = function (
  _block: any
): string {
  return "robot.turnRight();\n";
};

javascriptGenerator.forBlock["ottobit_walk"] = function (block: any): string {
  const steps = block.getFieldValue("STEPS") || "3";
  return `robot.walk(${steps});\n`;
};

javascriptGenerator.forBlock["ottobit_dance"] = function (block: any): string {
  const pattern = block.getFieldValue("PATTERN") || "basic";
  return `robot.dance('${pattern}');\n`;
};

// Control blocks
javascriptGenerator.forBlock["ottobit_wait"] = function (block: any): string {
  const duration = block.getFieldValue("DURATION") || "1";
  return `robot.wait(${duration});\n`;
};

javascriptGenerator.forBlock["ottobit_repeat"] = function (block: any): string {
  const times = block.getFieldValue("TIMES") || "3";
  const statements = javascriptGenerator.statementToCode(block, "DO");
  const varName = "count" + Math.floor(Math.random() * 1000);
  return `for (var ${varName} = 0; ${varName} < ${times}; ${varName}++) {loopstep();\n${statements}}\nloopend();\n`;
};

javascriptGenerator.forBlock["ottobit_repeat_range"] = function (
  block: any
): string {
  // Với field_dropdown, lấy value đơn giản
  const varName = block.getFieldValue("VAR") || "i";
  const from = block.getFieldValue("FROM") || "1";
  const to = block.getFieldValue("TO") || "5";
  const by = block.getFieldValue("BY") || "1";
  const statements = javascriptGenerator.statementToCode(block, "DO");
  return `var ${varName};\nfor (${varName} = ${from}; ${varName} <= ${to}; ${varName} += ${by}) {loopstep();\n${statements}}\nloopend();\n`;
};

javascriptGenerator.forBlock["ottobit_while"] = function (block: any): string {
  const condition =
    javascriptGenerator.valueToCode(block, "CONDITION", Order.NONE) || "false";
  const statements = javascriptGenerator.statementToCode(block, "DO");
  return `while (${condition}) {\n${statements}}\n`;
};

javascriptGenerator.forBlock["ottobit_if"] = function (block: any): string {
  const condition =
    javascriptGenerator.valueToCode(block, "CONDITION", Order.NONE) || "false";
  const statements = javascriptGenerator.statementToCode(block, "DO");
  return `if (${condition}) {\n${statements}}\n`;
};

javascriptGenerator.forBlock["ottobit_if_condition"] = function (
  block: any
): string {
  const condition =
    javascriptGenerator.valueToCode(block, "CONDITION", Order.NONE) || "false";
  const statements = javascriptGenerator.statementToCode(block, "DO");
  return `if (${condition}) {\n${statements}}\n`;
};

// Sensor blocks
javascriptGenerator.forBlock["ottobit_read_sensor"] = function (
  block: any
): [string, number] {
  const sensorType = block.getFieldValue("SENSOR_TYPE") || "DISTANCE";
  return [`readSensor('${sensorType}')`, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock["ottobit_comparison"] = function (
  block: any
): [string, number] {
  const valueA =
    javascriptGenerator.valueToCode(block, "A", Order.RELATIONAL) || "0";
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

javascriptGenerator.forBlock["ottobit_touch_sensor"] = function (
  _block: any
): [string, number] {
  return ["robot.getTouchSensor()", Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock["ottobit_light_sensor"] = function (
  _block: any
): [string, number] {
  return ["robot.getLightLevel()", Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock["ottobit_sound_sensor"] = function (
  _block: any
): [string, number] {
  return ["robot.getSoundLevel()", Order.FUNCTION_CALL];
};

// Action blocks
javascriptGenerator.forBlock["ottobit_led_on"] = function (block: any): string {
  const color = block.getFieldValue("COLOR") || "red";
  return `robot.ledOn('${color}');\n`;
};

javascriptGenerator.forBlock["ottobit_led_off"] = function (
  _block: any
): string {
  return "robot.ledOff();\n";
};

javascriptGenerator.forBlock["ottobit_buzzer_beep"] = function (
  block: any
): string {
  const frequency = block.getFieldValue("FREQUENCY") || "1000";
  const duration = block.getFieldValue("DURATION") || "1";
  return `robot.beep(${frequency}, ${duration});\n`;
};

javascriptGenerator.forBlock["ottobit_speak"] = function (block: any): string {
  const text = block.getFieldValue("TEXT") || "Hello";
  return `robot.speak('${text}');\n`;
};

javascriptGenerator.forBlock["ottobit_display_text"] = function (
  block: any
): string {
  const text = block.getFieldValue("TEXT") || "Hello";
  return `robot.displayText('${text}');\n`;
};

javascriptGenerator.forBlock["ottobit_send_message"] = function (
  block: any
): string {
  const message = block.getFieldValue("MESSAGE") || "Hello";
  return `robot.sendMessage('${message}');\n`;
};

// Collect blocks
javascriptGenerator.forBlock["ottobit_collect_green"] = function (
  block: any
): string {
  const count = block.getFieldValue("COUNT") || "1";
  return `robot.collect(${count}, 'green');\n`;
};

javascriptGenerator.forBlock["ottobit_collect_red"] = function (
  block: any
): string {
  const count = block.getFieldValue("COUNT") || "1";
  return `robot.collect(${count}, 'red');\n`;
};

javascriptGenerator.forBlock["ottobit_collect_yellow"] = function (
  block: any
): string {
  const count = block.getFieldValue("COUNT") || "1";
  return `robot.collect(${count}, 'yellow');\n`;
};

// New control blocks generators
javascriptGenerator.forBlock["ottobit_while_compare"] = function (
  block: any
): string {
  const leftValue =
    javascriptGenerator.valueToCode(block, "LEFT", Order.RELATIONAL) || "0";
  const operator = block.getFieldValue("OPERATOR") || "EQ";
  const rightValue =
    javascriptGenerator.valueToCode(block, "RIGHT", Order.RELATIONAL) || "0";
  const statements = javascriptGenerator.statementToCode(block, "DO");

  const operators: { [key: string]: string } = {
    EQ: "==",
    NEQ: "!=",
    LT: "<",
    LTE: "<=",
    GT: ">",
    GTE: ">=",
  };

  const condition = `${leftValue} ${operators[operator]} ${rightValue}`;
  return `while (${condition}) {\n${statements}}\n`;
};

javascriptGenerator.forBlock["ottobit_if"] = function (block: any): string {
  const condition1 =
    javascriptGenerator.valueToCode(block, "CONDITION1", Order.LOGICAL_AND) ||
    "false";
  const operator = block.getFieldValue("OPERATOR") || "AND";
  const condition2 =
    javascriptGenerator.valueToCode(block, "CONDITION2", Order.LOGICAL_AND) ||
    "false";
  const doStatements = javascriptGenerator.statementToCode(block, "DO");
  const elseStatements = javascriptGenerator.statementToCode(block, "ELSE");

  const logicOperator = operator === "AND" ? "&&" : "||";
  const combinedCondition = `(${condition1}) ${logicOperator} (${condition2})`;

  let code = `if (${combinedCondition}) {\n${doStatements}}`;
  if (elseStatements) {
    code += ` else {\n${elseStatements}}`;
  }
  code += "\n";

  return code;
};

// Variable block
javascriptGenerator.forBlock["ottobit_variable_i"] = function (
  _block: any
): [string, number] {
  return ["i", Order.ATOMIC];
};

// Logic compare block
javascriptGenerator.forBlock["ottobit_logic_compare"] = function (
  block: any
): [string, number] {
  const leftValue =
    javascriptGenerator.valueToCode(block, "LEFT", Order.RELATIONAL) || "0";
  const operator = block.getFieldValue("OPERATOR") || "EQ";
  const rightValue =
    javascriptGenerator.valueToCode(block, "RIGHT", Order.RELATIONAL) || "0";

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
javascriptGenerator.forBlock["ottobit_number"] = function (
  block: any
): [string, number] {
  const value = block.getFieldValue("NUM") || "0";
  return [value, Order.ATOMIC];
};

/**
 * Generate JavaScript code from workspace
 */
export function generateJavaScriptCode(workspace: any): string {
  if (!workspace) return "";

  try {
    return javascriptGenerator.workspaceToCode(workspace);
  } catch (error) {
    console.error("Error generating JavaScript code:", error);
    return "// Error generating code";
  }
}
