import * as Blockly from "blockly";

// Repeat Block
export const repeatBlock = () => {
  if (Blockly.Blocks["repeat"]) return;

  Blockly.Blocks["repeat"] = {
    init: function () {
      this.jsonInit({
        type: "repeat",
        message0: "🔄 repeat %1 times",
        args0: [
          {
            type: "field_number",
            name: "TIMES",
            value: 3,
            min: 1,
            precision: 1,
          },
        ],
        message1: "do %1",
        args1: [
          {
            type: "input_statement",
            name: "DO",
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "ottobit_action", // Use green color for control
        tooltip: "Lặp lại các hành động",
      });
    },
  };
};

// If/Else Block
export const ifElseBlock = () => {
  if (Blockly.Blocks["if_else"]) return;

  Blockly.Blocks["if_else"] = {
    init: function () {
      this.jsonInit({
        type: "if_else",
        message0: "🤔 if %1",
        args0: [
          {
            type: "input_value",
            name: "CONDITION",
            check: "Boolean",
          },
        ],
        message1: "do %1",
        args1: [
          {
            type: "input_statement",
            name: "DO",
          },
        ],
        message2: "else %1",
        args2: [
          {
            type: "input_statement",
            name: "ELSE",
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "ottobit_action",
        tooltip: "Điều kiện if/else",
      });
    },
  };
};

// Wait Block
export const waitBlock = () => {
  if (Blockly.Blocks["wait"]) return;

  Blockly.Blocks["wait"] = {
    init: function () {
      this.jsonInit({
        type: "wait",
        message0: "⏱️ wait %1 seconds",
        args0: [
          {
            type: "field_number",
            name: "SECONDS",
            value: 1,
            min: 0.1,
            precision: 0.1,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "ottobit_var", // Use yellow/orange for wait
        tooltip: "Chờ trong thời gian xác định",
      });
    },
  };
};

// Define all control blocks
export const defineControlBlocks = () => {
  repeatBlock();
  ifElseBlock();
  waitBlock();
};
