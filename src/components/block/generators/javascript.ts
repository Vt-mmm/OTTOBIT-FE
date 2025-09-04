import { javascriptGenerator, Order } from 'blockly/javascript';

/**
 * JavaScript code generators for Ottobot blocks
 */

// Event blocks
javascriptGenerator.forBlock['ottobot_start'] = function(_block: any): string {
  return 'start();\n';
};

// Movement blocks  
javascriptGenerator.forBlock['ottobot_move_forward'] = function(block: any): string {
  const steps = block.getFieldValue('STEPS') || '1';
  return `moveForward(${steps});\n`;
};

javascriptGenerator.forBlock['ottobot_rotate'] = function(block: any): string {
  const direction = block.getFieldValue('DIRECTION') || 'RIGHT';
  const angle = direction === 'RIGHT' ? '90' : '-90';
  return `turn(${angle});\n`;
};

javascriptGenerator.forBlock['ottobot_move_backward'] = function(_block: any): string {
  return 'robot.moveBackward();\n';
};

javascriptGenerator.forBlock['ottobot_turn_left'] = function(_block: any): string {
  return 'robot.turnLeft();\n';
};

javascriptGenerator.forBlock['ottobot_turn_right'] = function(_block: any): string {
  return 'robot.turnRight();\n';
};

javascriptGenerator.forBlock['ottobot_walk'] = function(block: any): string {
  const steps = block.getFieldValue('STEPS') || '3';
  return `robot.walk(${steps});\n`;
};

javascriptGenerator.forBlock['ottobot_dance'] = function(block: any): string {
  const pattern = block.getFieldValue('PATTERN') || 'basic';
  return `robot.dance('${pattern}');\n`;
};

// Control blocks
javascriptGenerator.forBlock['ottobot_wait'] = function(block: any): string {
  const duration = block.getFieldValue('DURATION') || '1';
  return `robot.wait(${duration});\n`;
};

javascriptGenerator.forBlock['ottobot_repeat'] = function(block: any): string {
  const times = block.getFieldValue('TIMES') || '3';
  const statements = javascriptGenerator.statementToCode(block, 'DO');
  const varName = 'count' + (Math.floor(Math.random() * 1000));
  return `for (var ${varName} = 0; ${varName} < ${times}; ${varName}++) {loopstep();\n${statements}}\nloopend();\n`;
};

javascriptGenerator.forBlock['ottobot_repeat_range'] = function(block: any): string {
  // Với field_dropdown, lấy value đơn giản
  const varName = block.getFieldValue('VAR') || 'i';
  const from = block.getFieldValue('FROM') || '1';
  const to = block.getFieldValue('TO') || '5';
  const by = block.getFieldValue('BY') || '1';
  const statements = javascriptGenerator.statementToCode(block, 'DO');
  return `var ${varName};\nfor (${varName} = ${from}; ${varName} <= ${to}; ${varName} += ${by}) {loopstep();\n${statements}}\nloopend();\n`;
};

javascriptGenerator.forBlock['ottobot_while'] = function(block: any): string {
  const condition = javascriptGenerator.valueToCode(block, 'CONDITION', Order.NONE) || 'false';
  const statements = javascriptGenerator.statementToCode(block, 'DO');
  return `while (${condition}) {\n${statements}}\n`;
};

javascriptGenerator.forBlock['ottobot_if'] = function(block: any): string {
  const condition = javascriptGenerator.valueToCode(block, 'CONDITION', Order.NONE) || 'false';
  const statements = javascriptGenerator.statementToCode(block, 'DO');
  return `if (${condition}) {\n${statements}}\n`;
};

javascriptGenerator.forBlock['ottobot_if_condition'] = function(block: any): string {
  const condition = javascriptGenerator.valueToCode(block, 'CONDITION', Order.NONE) || 'false';
  const statements = javascriptGenerator.statementToCode(block, 'DO');
  return `if (${condition}) {\n${statements}}\n`;
};

// Sensor blocks
javascriptGenerator.forBlock['ottobot_read_sensor'] = function(block: any): [string, number] {
  const sensorType = block.getFieldValue('SENSOR_TYPE') || 'DISTANCE';
  return [`readSensor('${sensorType}')`, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['ottobot_comparison'] = function(block: any): [string, number] {
  const valueA = javascriptGenerator.valueToCode(block, 'A', Order.RELATIONAL) || '0';
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

javascriptGenerator.forBlock['ottobot_touch_sensor'] = function(_block: any): [string, number] {
  return ['robot.getTouchSensor()', Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['ottobot_light_sensor'] = function(_block: any): [string, number] {
  return ['robot.getLightLevel()', Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['ottobot_sound_sensor'] = function(_block: any): [string, number] {
  return ['robot.getSoundLevel()', Order.FUNCTION_CALL];
};

// Action blocks
javascriptGenerator.forBlock['ottobot_led_on'] = function(block: any): string {
  const color = block.getFieldValue('COLOR') || 'red';
  return `robot.ledOn('${color}');\n`;
};

javascriptGenerator.forBlock['ottobot_led_off'] = function(_block: any): string {
  return 'robot.ledOff();\n';
};

javascriptGenerator.forBlock['ottobot_buzzer_beep'] = function(block: any): string {
  const frequency = block.getFieldValue('FREQUENCY') || '1000';
  const duration = block.getFieldValue('DURATION') || '1';
  return `robot.beep(${frequency}, ${duration});\n`;
};

javascriptGenerator.forBlock['ottobot_speak'] = function(block: any): string {
  const text = block.getFieldValue('TEXT') || 'Hello';
  return `robot.speak('${text}');\n`;
};

javascriptGenerator.forBlock['ottobot_display_text'] = function(block: any): string {
  const text = block.getFieldValue('TEXT') || 'Hello';
  return `robot.displayText('${text}');\n`;
};

javascriptGenerator.forBlock['ottobot_send_message'] = function(block: any): string {
  const message = block.getFieldValue('MESSAGE') || 'Hello';
  return `robot.sendMessage('${message}');\n`;
};

/**
 * Generate JavaScript code from workspace
 */
export function generateJavaScriptCode(workspace: any): string {
  if (!workspace) return '';
  
  try {
    return javascriptGenerator.workspaceToCode(workspace);
  } catch (error) {
    console.error('Error generating JavaScript code:', error);
    return '// Error generating code';
  }
}
