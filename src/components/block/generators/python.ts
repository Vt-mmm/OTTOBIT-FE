/**
 * @license
 * Copyright 2024 ottobit
 * SPDX-License-Identifier: Apache-2.0
 */

import { pythonGenerator, Order } from "blockly/python";

/**
 * Python (MicroPython-style) code generators for Ottobit blocks
 * Target style example:
 *   forward(3);
 *   turnRight();
 *   collect(2, "green");
 *   for _ in range(2): #repeat 2 times
 *       turnLeft();
 *       forward(1);
 *   if isGreen():
 *       collect(1, "red");
 *   elif isYellow():
 *       forward(1);
 *   else:
 *       turnBack();
 */

// Event blocks
pythonGenerator.forBlock["ottobit_start"] = function (_block: any): string {
  // MicroPython program may not need explicit startup header
  return "";
};

// Movement blocks
pythonGenerator.forBlock["ottobit_move_forward"] = function (block: any): string {
  const steps = pythonGenerator.valueToCode(block, "STEPS", Order.ATOMIC) || "1";
  return `forward(${steps});\n`;
};

pythonGenerator.forBlock["ottobit_move_backward"] = function (_block: any): string {
  return "backward();\n";
};

pythonGenerator.forBlock["ottobit_rotate"] = function (block: any): string {
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

pythonGenerator.forBlock["ottobit_turn_left"] = function (_block: any): string {
  return "turnLeft();\n";
};

pythonGenerator.forBlock["ottobit_turn_right"] = function (_block: any): string {
  return "turnRight();\n";
};

pythonGenerator.forBlock["ottobit_walk"] = function (block: any): string {
  const steps = block.getFieldValue("STEPS") || "3";
  return `walk(${steps});\n`;
};

pythonGenerator.forBlock["ottobit_dance"] = function (block: any): string {
  const pattern = block.getFieldValue("PATTERN") || "basic";
  return `dance("${pattern}");\n`;
};

// Control blocks
pythonGenerator.forBlock["ottobit_wait"] = function (block: any): string {
  const duration = block.getFieldValue("DURATION") || "1";
  return `wait(${duration});\n`;
};

pythonGenerator.forBlock["ottobit_repeat"] = function (block: any): string {
  const times = pythonGenerator.valueToCode(block, "TIMES", Order.ATOMIC) || "1";
  const statements = pythonGenerator.statementToCode(block, "DO");
  const indentedStatements = statements
    .split("\n")
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join("\n");
  // Chọn tên biến vòng lặp: nếu TIMES là biến (ottobit_variable/variables_get) thì dùng chính tên đó, ngược lại dùng '_'
  let iter = "_";
  try {
    const t = block.getInputTargetBlock && block.getInputTargetBlock("TIMES");
    if (t) {
      if (t.type === "ottobit_variable") {
        const name = t.getFieldValue("VAR") || "i";
        if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(String(name))) iter = name;
      } else if (t.type === "variables_get") {
        const field: any = t.getField && t.getField("VAR");
        const name = (field && typeof field.getText === "function" && field.getText()) || t.getFieldValue("VAR") || "i";
        if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(String(name))) iter = name;
      }
    }
  } catch {}
  return `for ${iter} in range(int(${times})):\n${indentedStatements || "    pass"}\n`;
};

pythonGenerator.forBlock["ottobit_repeat_range"] = function (block: any): string {
  // Support drag-drop values/variables for VAR, FROM, TO, BY
  let varName = pythonGenerator.valueToCode(block, "VAR", Order.NONE) || "i";
  const ident = String(varName).trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(ident)) {
    varName = "i";
  }
  const from = pythonGenerator.valueToCode(block, "FROM", Order.ATOMIC) || "1";
  const to = pythonGenerator.valueToCode(block, "TO", Order.ATOMIC) || "5";
  const by = pythonGenerator.valueToCode(block, "BY", Order.ATOMIC) || "1";
  const statements = pythonGenerator.statementToCode(block, "DO");
  const indentedStatements = statements
    .split("\n")
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join("\n");
  // Inclusive upper-bound -> add +1 for Python's exclusive range
  const header = `for ${varName} in range(int(${from}), int(${to}) + 1, int(${by})):`;
  return `${header} #repeat range by step ${by} from ${from} to ${to}\n${
    indentedStatements || "    pass"
  }\n`;
};

pythonGenerator.forBlock["ottobit_while"] = function (block: any): string {
  const condition = pythonGenerator.valueToCode(block, "CONDITION", Order.NONE) || "False";
  const statements = pythonGenerator.statementToCode(block, "DO");
  const indentedStatements = statements
    .split("\n")
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join("\n");
  return `while ${condition}:\n${indentedStatements || "    pass"}\n`;
};

// Simple IF (single condition)
pythonGenerator.forBlock["ottobit_if_condition"] = function (block: any): string {
  const condition = pythonGenerator.valueToCode(block, "CONDITION", Order.NONE) || "False";
  const statements = pythonGenerator.statementToCode(block, "DO");
  const indentedStatements = statements
    .split("\n")
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join("\n");
  return `if ${condition}:\n${indentedStatements || "    pass"}\n`;
};

// Sensor/value helpers








// Action/IO blocks
pythonGenerator.forBlock["ottobit_led_on"] = function (block: any): string {
  const color = block.getFieldValue("COLOR") || "red";
  return `ledOn("${color}");\n`;
};
pythonGenerator.forBlock["ottobit_led_off"] = function (_block: any): string {
  return "ledOff();\n";
};
pythonGenerator.forBlock["ottobit_buzzer_beep"] = function (block: any): string {
  const frequency = block.getFieldValue("FREQUENCY") || "1000";
  const duration = block.getFieldValue("DURATION") || "1";
  return `beep(${frequency}, ${duration});\n`;
};
pythonGenerator.forBlock["ottobit_speak"] = function (block: any): string {
  const text = block.getFieldValue("TEXT") || "Hello";
  return `speak("${text}");\n`;
};
pythonGenerator.forBlock["ottobit_display_text"] = function (block: any): string {
  const text = block.getFieldValue("TEXT") || "Hello";
  return `displayText("${text}");\n`;
};
pythonGenerator.forBlock["ottobit_send_message"] = function (block: any): string {
  const message = block.getFieldValue("MESSAGE") || "Hello";
  return `sendMessage("${message}");\n`;
};



// Expandable IF / ELIF* / ELSE
pythonGenerator.forBlock["ottobit_if_expandable"] = function (block: any): string {
  const condition = pythonGenerator.valueToCode(block, "IF0", Order.NONE) || "False";
  const doStatements = pythonGenerator.statementToCode(block, "DO0");
  let code = `if ${condition}:\n${doStatements || "    pass\n"}`;

  const elseifCount = block.elseifCount_ || 0;
  for (let i = 1; i <= elseifCount; i++) {
    const hasIfInput = block.getInput(`IF${i}`) !== null;
    const hasDoInput = block.getInput(`DO${i}`) !== null;
    if (hasIfInput && hasDoInput) {
      const elseifCondition = pythonGenerator.valueToCode(block, `IF${i}`, Order.NONE) || "False";
      const elseifStatements = pythonGenerator.statementToCode(block, `DO${i}`);
      code += `elif ${elseifCondition}:\n${elseifStatements || "    pass\n"}`;
    }
  }

  const hasElseInput = block.getInput("ELSE") !== null;
  if (hasElseInput) {
    const elseStatements = pythonGenerator.statementToCode(block, "ELSE");
    if (elseStatements) {
      code += `else:\n${elseStatements}`;
    }
  }
  return code;
};

// IF with two conditions and operator AND/OR
pythonGenerator.forBlock["ottobit_if"] = function (block: any): string {
  const condition1 = pythonGenerator.valueToCode(block, "CONDITION1", Order.LOGICAL_AND) || "False";
  const operator = block.getFieldValue("OPERATOR") || "AND";
  const condition2 = pythonGenerator.valueToCode(block, "CONDITION2", Order.LOGICAL_AND) || "False";
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

// Variables

pythonGenerator.forBlock["ottobit_variable"] = function (block: any): [string, number] {
  const varName = block.getFieldValue("VAR") || "i";
  return [varName, Order.ATOMIC];
};

// Logic compare (generic)
pythonGenerator.forBlock["ottobit_logic_compare"] = function (block: any): [string, number] {
  const leftValue = pythonGenerator.valueToCode(block, "LEFT", Order.RELATIONAL) || "0";
  const operator = block.getFieldValue("OPERATOR") || "EQ";
  const rightValue = pythonGenerator.valueToCode(block, "RIGHT", Order.RELATIONAL) || "0";
  const operators: Record<string, string> = { EQ: "==", NEQ: "!=", LT: "<", LTE: "<=", GT: ">", GTE: ">=" };
  const code = `${leftValue} ${operators[operator]} ${rightValue}`;
  return [code, Order.RELATIONAL];
};

// Number literal
pythonGenerator.forBlock["ottobit_number"] = function (block: any): [string, number] {
  const value = block.getFieldValue("NUM") || "0";
  return [value, Order.ATOMIC];
};

// Collect blocks -> collect(count, "color");
pythonGenerator.forBlock["ottobit_collect_green"] = function (block: any): string {
  const count = pythonGenerator.valueToCode(block, "COUNT", Order.ATOMIC) || "1";
  return `collect(${count}, "green");\n`;
};
pythonGenerator.forBlock["ottobit_collect_red"] = function (block: any): string {
  const count = pythonGenerator.valueToCode(block, "COUNT", Order.ATOMIC) || "1";
  return `collect(${count}, "red");\n`;
};
pythonGenerator.forBlock["ottobit_collect_yellow"] = function (block: any): string {
  const count = pythonGenerator.valueToCode(block, "COUNT", Order.ATOMIC) || "1";
  return `collect(${count}, "yellow");\n`;
};

// Bale handling blocks (compat with FE naming)
pythonGenerator.forBlock["ottobit_take_bale"] = function (_block: any): string {
  return "takeBall();\n";
};
pythonGenerator.forBlock["ottobit_put_bale"] = function (_block: any): string {
  return "putBall();\n";
};
pythonGenerator.forBlock["ottobit_bale_number"] = function (_block: any): [string, number] {
  return ["(getBaleNumber())", Order.FUNCTION_CALL];
};

// Boolean blocks
pythonGenerator.forBlock["ottobit_boolean"] = function (block: any): [string, number] {
  const value = block.getFieldValue("BOOL") || "TRUE";
  return [value === "TRUE" ? "True" : "False", Order.ATOMIC];
};
pythonGenerator.forBlock["ottobit_logic_operation"] = function (block: any): [string, number] {
  const leftValue = pythonGenerator.valueToCode(block, "LEFT", Order.LOGICAL_AND) || "False";
  const rightValue = pythonGenerator.valueToCode(block, "RIGHT", Order.LOGICAL_AND) || "False";
  const operator = block.getFieldValue("OP") || "AND";
  const code = operator === "AND" ? `(${leftValue}) and (${rightValue})` : `(${leftValue}) or (${rightValue})`;
  const order = operator === "AND" ? Order.LOGICAL_AND : Order.LOGICAL_OR;
  return [code, order];
};

// Battery color check blocks - return Boolean
pythonGenerator.forBlock["ottobit_is_green"] = function (_block: any): [string, number] {
  return ["isGreen()", Order.FUNCTION_CALL];
};
pythonGenerator.forBlock["ottobit_is_red"] = function (_block: any): [string, number] {
  return ["isRed()", Order.FUNCTION_CALL];
};
pythonGenerator.forBlock["ottobit_is_yellow"] = function (_block: any): [string, number] {
  return ["isYellow()", Order.FUNCTION_CALL];
};

// Simple pass-through condition
pythonGenerator.forBlock["ottobit_condition"] = function (block: any): [string, number] {
  const condition = pythonGenerator.valueToCode(block, "CONDITION", Order.NONE) || "False";
  return [condition, Order.NONE];
};

// Boolean equals block
pythonGenerator.forBlock["ottobit_boolean_equals"] = function (block: any): [string, number] {
  const leftValue = pythonGenerator.valueToCode(block, "LEFT", Order.RELATIONAL) || "False";
  const rightValue = pythonGenerator.valueToCode(block, "RIGHT", Order.RELATIONAL) || "False";
  const code = `${leftValue} == ${rightValue}`;
  return [code, Order.RELATIONAL];
};

// Custom function blocks
pythonGenerator.forBlock["ottobit_function_def"] = function (block: any): string {
  const functionName = block.getFieldValue("NAME") || "my_function";
  const statements = pythonGenerator.statementToCode(block, "STACK");
  const code = `def ${functionName}():\n${statements || "    pass\n"}\n`;
  return code;
};
pythonGenerator.forBlock["ottobit_function_call"] = function (block: any): string {
  const functionName = block.getFieldValue("NAME") || "my_function";
  return `${functionName}();\n`;
};

/**
 * Generate Python code from workspace
 */
export function generatePythonCode(workspace: any): string {
  if (!workspace) return "";
  try {
    return pythonGenerator.workspaceToCode(workspace);
  } catch (error) {
    return "# Error generating code";
  }
}
