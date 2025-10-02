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
  // Lấy giá trị từ input value (có thể là số hoặc biến)
  const steps =
    javascriptGenerator.valueToCode(block, "STEPS", Order.ATOMIC) || "1";
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
  const times =
    javascriptGenerator.valueToCode(block, "TIMES", Order.ATOMIC) || "1";
  const statements = javascriptGenerator.statementToCode(block, "DO");
  const iter = "_i"; // fixed iterator name for clarity
  return `for (let ${iter} = 0; ${iter} < ${times}; ${iter}++) {loopstep();\n${statements}}\nloopend();\n`;
};

javascriptGenerator.forBlock["ottobit_repeat_range"] = function (
  block: any
): string {
  // Hỗ trợ kéo-thả biến/số cho VAR, FROM, TO, BY
  let varName =
    javascriptGenerator.valueToCode(block, "VAR", Order.NONE) || "i";
  const ident = String(varName).trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(ident)) {
    varName = "i";
  }
  const from =
    javascriptGenerator.valueToCode(block, "FROM", Order.ATOMIC) || "1";
  const to = javascriptGenerator.valueToCode(block, "TO", Order.ATOMIC) || "5";
  const by = javascriptGenerator.valueToCode(block, "BY", Order.ATOMIC) || "1";
  const statements = javascriptGenerator.statementToCode(block, "DO");
  return `var ${varName};\nfor (${varName} = ${from}; ${varName} <= ${to}; ${varName} += ${by}) {loopstep();\n${statements}}\nloopend();\n`;
};

javascriptGenerator.forBlock["ottobit_while"] = function (block: any): string {
  const condition =
    javascriptGenerator.valueToCode(block, "CONDITION", Order.NONE) || "false";
  const statements = javascriptGenerator.statementToCode(block, "DO");
  return `while (${condition}) {loopstep();\n${statements}}\nloopend();\n`;
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
  // Lấy giá trị từ input value (có thể là số hoặc biến)
  const count =
    javascriptGenerator.valueToCode(block, "COUNT", Order.ATOMIC) || "1";
  return `collectGreen(${count});\n`;
};

javascriptGenerator.forBlock["ottobit_collect_red"] = function (
  block: any
): string {
  // Lấy giá trị từ input value (có thể là số hoặc biến)
  const count =
    javascriptGenerator.valueToCode(block, "COUNT", Order.ATOMIC) || "1";
  return `collectRed(${count});\n`;
};

javascriptGenerator.forBlock["ottobit_collect_yellow"] = function (
  block: any
): string {
  // Lấy giá trị từ input value (có thể là số hoặc biến)
  const count =
    javascriptGenerator.valueToCode(block, "COUNT", Order.ATOMIC) || "1";
  return `collectYellow(${count});\n`;
};
// Bale handling blocks
javascriptGenerator.forBlock["ottobit_take_bale"] = function (
  _block: any
): string {
  return "takeBall();\n"; // Frontend sử dụng takeBall() -> Backend tự động map sang takeBox()
};

javascriptGenerator.forBlock["ottobit_put_bale"] = function (
  _block: any
): string {
  return "putBall();\n"; // Frontend sử dụng putBall() -> Backend tự động map sang putBox()
};

// New control blocks generators

// ottobit_if_expandable generator - Khối IF có thể mở rộng vô hạn
javascriptGenerator.forBlock["ottobit_if_expandable"] = function (
  block: any
): string {
  // Main IF condition - sử dụng IF0 thay vì CONDITION
  const condition =
    javascriptGenerator.valueToCode(block, "IF0", Order.NONE) || "false";
  const doStatements = javascriptGenerator.statementToCode(block, "DO0");

  let code = `if (${condition}) {\n${doStatements}}`;

  // Get number of ELSE IF branches from block state
  const elseifCount = block.elseifCount_ || 0;

  // Add ELSE IF branches - kiểm tra input tồn tại
  for (let i = 1; i <= elseifCount; i++) {
    const hasIfInput = block.getInput(`IF${i}`) !== null;
    const hasDoInput = block.getInput(`DO${i}`) !== null;

    if (hasIfInput && hasDoInput) {
      const elseifCondition =
        javascriptGenerator.valueToCode(block, `IF${i}`, Order.NONE) || "false";
      const elseifStatements = javascriptGenerator.statementToCode(
        block,
        `DO${i}`
      );

      code += ` else if (${elseifCondition}) {\n${elseifStatements}}`;
    }
  }

  // Add ELSE branch if exists - kiểm tra input tồn tại trước
  const hasElseInput = block.getInput("ELSE") !== null;
  if (hasElseInput) {
    const elseStatements = javascriptGenerator.statementToCode(block, "ELSE");
    if (elseStatements) {
      code += ` else {\n${elseStatements}}`;
    }
  }

  return code + "\n";
};

// Boolean blocks generators
javascriptGenerator.forBlock["ottobit_boolean"] = function (
  block: any
): [string, number] {
  const value = block.getFieldValue("BOOL") || "TRUE";
  return [value === "TRUE" ? "true" : "false", Order.ATOMIC];
};

javascriptGenerator.forBlock["ottobit_logic_operation"] = function (
  block: any
): [string, number] {
  const leftValue =
    javascriptGenerator.valueToCode(block, "LEFT", Order.LOGICAL_AND) ||
    "false";
  const rightValue =
    javascriptGenerator.valueToCode(block, "RIGHT", Order.LOGICAL_AND) ||
    "false";
  const operator = block.getFieldValue("OP") || "AND";

  const code =
    operator === "AND"
      ? `(${leftValue}) && (${rightValue})`
      : `(${leftValue}) || (${rightValue})`;

  const order = operator === "AND" ? Order.LOGICAL_AND : Order.LOGICAL_OR;
  return [code, order];
};

// ottobit_if generator - chỉ IF không có ELSE
javascriptGenerator.forBlock["ottobit_if"] = function (block: any): string {
  const condition =
    javascriptGenerator.valueToCode(block, "CONDITION", Order.NONE) || "false";
  const doStatements = javascriptGenerator.statementToCode(block, "DO");

  const code = `if (${condition}) {\n${doStatements}}\n`;
  return code;
};

// ottobit_if_else generator - IF với ELSE cố định
javascriptGenerator.forBlock["ottobit_if_else"] = function (
  block: any
): string {
  const condition =
    javascriptGenerator.valueToCode(block, "CONDITION", Order.NONE) || "false";
  const doStatements = javascriptGenerator.statementToCode(block, "DO");
  const elseStatements = javascriptGenerator.statementToCode(block, "ELSE");

  const code = `if (${condition}) {\n${doStatements}} else {\n${elseStatements}}\n`;
  return code;
};

// ottobit_if_elseif_else generator - IF-ELSEIF-ELSE
javascriptGenerator.forBlock["ottobit_if_elseif_else"] = function (
  block: any
): string {
  const condition1 =
    javascriptGenerator.valueToCode(block, "CONDITION1", Order.NONE) || "false";
  const do1Statements = javascriptGenerator.statementToCode(block, "DO1");
  const condition2 =
    javascriptGenerator.valueToCode(block, "CONDITION2", Order.NONE) || "false";
  const do2Statements = javascriptGenerator.statementToCode(block, "DO2");
  const elseStatements = javascriptGenerator.statementToCode(block, "ELSE");

  const code = `if (${condition1}) {\n${do1Statements}} else if (${condition2}) {\n${do2Statements}} else {\n${elseStatements}}\n`;
  return code;
};

// Variable blocks

javascriptGenerator.forBlock["ottobit_variable"] = function (
  block: any
): [string, Order] {
  const varName = block.getFieldValue("VAR") || "i";
  return [varName, Order.ATOMIC];
};

// Number block
javascriptGenerator.forBlock["ottobit_number"] = function (
  block: any
): [string, Order] {
  const num = block.getFieldValue("NUM") || "0";
  return [num, Order.ATOMIC];
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

// Logic blocks đã được thay thế bằng ottobit_boolean và ottobit_logic_operation

javascriptGenerator.forBlock["ottobit_logic_not"] = function (
  block: any
): [string, number] {
  const value =
    javascriptGenerator.valueToCode(block, "BOOL", Order.LOGICAL_NOT) ||
    "false";
  const code = `!(${value})`;
  return [code, Order.LOGICAL_NOT];
};

// Bale number sensor
javascriptGenerator.forBlock["ottobit_bale_number"] = function (
  _block: any
): [string, number] {
  return ["(getBaleNumber())", Order.FUNCTION_CALL]; // Frontend s? d?ng getBaleNumber() -> Backend t? d?ng map sang checkWarehouse()
};

// Pin number sensor
javascriptGenerator.forBlock["ottobit_pin_number"] = function (
  _block: any
): [string, number] {
  return ["(getPinNumber())", Order.FUNCTION_CALL];
};
// New blocks generators
// Boolean dropdown block
javascriptGenerator.forBlock["ottobit_boolean"] = function (
  block: any
): [string, number] {
  const value = block.getFieldValue("BOOL") || "TRUE";
  return [value === "TRUE" ? "true" : "false", Order.ATOMIC];
};

// Logic operation block with dropdown
javascriptGenerator.forBlock["ottobit_logic_operation"] = function (
  block: any
): [string, number] {
  const leftValue =
    javascriptGenerator.valueToCode(block, "LEFT", Order.LOGICAL_AND) ||
    "false";
  const rightValue =
    javascriptGenerator.valueToCode(block, "RIGHT", Order.LOGICAL_AND) ||
    "false";
  const operator = block.getFieldValue("OP") || "AND";

  const code =
    operator === "AND"
      ? `(${leftValue}) && (${rightValue})`
      : `(${leftValue}) || (${rightValue})`;

  const order = operator === "AND" ? Order.LOGICAL_AND : Order.LOGICAL_OR;
  return [code, order];
};

// Sensor condition block (tích hợp sensor và comparison)
javascriptGenerator.forBlock["ottobit_sensor_condition"] = function (
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
      sensorCall = "readSensor('DISTANCE')";
      break;
    case "LIGHT":
      sensorCall = "readSensor('LIGHT')";
      break;
    case "TEMPERATURE":
      sensorCall = "readSensor('TEMPERATURE')";
      break;
    case "BALE_NUMBER":
      sensorCall = "getBaleNumber()";
      break;
    default:
      sensorCall = "readSensor('DISTANCE')";
  }

  const code = `${sensorCall} ${operators[operator]} ${value}`;
  return [code, Order.RELATIONAL];
};

// Battery color check blocks - trả về Boolean
javascriptGenerator.forBlock["ottobit_is_green"] = function (
  _block: any
): [string, number] {
  return ["isGreen()", Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock["ottobit_is_red"] = function (
  _block: any
): [string, number] {
  return ["isRed()", Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock["ottobit_is_yellow"] = function (
  _block: any
): [string, number] {
  return ["isYellow()", Order.FUNCTION_CALL];
};

// Simple condition block - chỉ chuyển tiếp giá trị Boolean
javascriptGenerator.forBlock["ottobit_condition"] = function (
  block: any
): [string, number] {
  const condition =
    javascriptGenerator.valueToCode(block, "CONDITION", Order.NONE) || "false";
  return [condition, Order.NONE];
};

// Boolean equals block - so sánh 2 giá trị Boolean
javascriptGenerator.forBlock["ottobit_boolean_equals"] = function (
  block: any
): [string, number] {
  const leftValue =
    javascriptGenerator.valueToCode(block, "LEFT", Order.EQUALITY) || "false";
  const rightValue =
    javascriptGenerator.valueToCode(block, "RIGHT", Order.EQUALITY) || "false";
  const code = `${leftValue} === ${rightValue}`;
  return [code, Order.EQUALITY];
};

// === CUSTOM FUNCTION BLOCKS ===
// Custom Function Definition Block
javascriptGenerator.forBlock["ottobit_function_def"] = function (
  block: any
): string {
  const functionName = block.getFieldValue("NAME") || "myFunction";
  const statements = javascriptGenerator.statementToCode(block, "STACK");
  const code = `function ${functionName}() {\n${statements}}\n`;
  return code;
};

// Custom Function Call Block
javascriptGenerator.forBlock["ottobit_function_call"] = function (
  block: any
): string {
  const functionName = block.getFieldValue("NAME") || "myFunction";
  const code = `${functionName}();\n`;
  return code;
};

// === PROCEDURES BLOCKS (không sử dụng nữa) ===
// Đã thay thế bằng custom function blocks
/**
 * Generate JavaScript code from workspace
 */
export function generateJavaScriptCode(workspace: any): string {
  if (!workspace) return "";

  try {
    return javascriptGenerator.workspaceToCode(workspace);
  } catch (error) {
    return "// Error generating code";
  }
}
