import * as Blockly from "blockly";

// Simple Repeat Block (giống HP Robots)
export const repeatBlock = () => {
  if (Blockly.Blocks["repeat"]) return;

  Blockly.Blocks["repeat"] = {
    init: function () {
      this.jsonInit({
        type: "repeat",
        message0: "repeat 🔄 %1",
        args0: [
          {
            type: "field_number",
            name: "TIMES",
            value: 1,
            min: 1,
            precision: 1,
          },
        ],
        message1: "%1", // Statement input cho blocks bên trong
        args1: [
          {
            type: "input_statement",
            name: "DO",
            check: null, // Accept any statement blocks
          },
        ],
        previousStatement: null, // Có thể gắn với block phía trên
        nextStatement: null,     // Có thể gắn với block phía dưới  
        style: "ottobit_control", // Màu tím cho control
        tooltip: "Lặp lại các hành động",
      });
    },
  };
};

// Repeat with Range Block (From To By - giống HP Robots)
export const repeatRangeBlock = () => {
  if (Blockly.Blocks["repeat_range"]) return;

  Blockly.Blocks["repeat_range"] = {
    init: function () {
      this.jsonInit({
        type: "repeat_range", 
        message0: "repeat %1 From %2 To %3 By %4",
        args0: [
          {
            type: "field_dropdown",
            name: "VAR",
            options: [
              ["i", "i"],
              ["j", "j"], 
              ["k", "k"],
            ],
          },
          {
            type: "field_number",
            name: "FROM",
            value: 1,
            min: 0,
            precision: 1,
          },
          {
            type: "field_number", 
            name: "TO",
            value: 5,
            min: 1,
            precision: 1,
          },
          {
            type: "field_number",
            name: "BY", 
            value: 1,
            min: 1,
            precision: 1,
          },
        ],
        message1: "%1", // Statement input cho blocks bên trong
        args1: [
          {
            type: "input_statement",
            name: "DO",
            check: null, // Accept any statement blocks
          },
        ],
        previousStatement: null, // Có thể gắn với block phía trên
        nextStatement: null,     // Có thể gắn với block phía dưới
        style: "ottobit_control",
        tooltip: "Lặp với biến từ From đến To",
      });
    },
  };
};

// Comparison Block (toán tử so sánh - giống HP Robots)
export const comparisonBlock = () => {
  if (Blockly.Blocks["comparison"]) return;

  Blockly.Blocks["comparison"] = {
    init: function () {
      this.jsonInit({
        type: "comparison",
        message0: "%1 %2 %3",
        args0: [
          {
            type: "input_value",
            name: "A",
            check: "Number",
          },
          {
            type: "field_dropdown",
            name: "OP",
            options: [
              ["=", "EQ"],
              ["≠", "NEQ"], 
              ["<", "LT"],
              [">", "GT"],
              ["≤", "LTE"],
              ["≥", "GTE"],
            ],
          },
          {
            type: "input_value", 
            name: "B",
            check: "Number",
          },
        ],
        output: "Boolean",
        style: "ottobit_control",
        tooltip: "So sánh hai giá trị",
      });
    },
  };
};

// If Block (đơn giản hóa)
export const ifBlock = () => {
  if (Blockly.Blocks["if"]) return;

  Blockly.Blocks["if"] = {
    init: function () {
      this.jsonInit({
        type: "if",
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
        style: "ottobit_control",
        tooltip: "Điều kiện if/else",
      });
    },
  };
};

// Wait Block
/*
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
        style: "ottobit_wait", // Màu đỏ cho wait
        tooltip: "Chờ trong thời gian xác định",
      });
    },
  };
};
*/

// Define all control blocks
export const defineControlBlocks = () => {
  repeatBlock();
  repeatRangeBlock();
  comparisonBlock();
  ifBlock();
};
