// For JSON block definitions
const createBlockDefinitionsFromJsonArray = (definitions: any[]) => {
  const blocks: { [key: string]: any } = {};
  definitions.forEach((def) => {
    blocks[def.type] = def;
  });
  return blocks;
};

/**
 * Control blocks for ottobit
 */
export const controlBlocks = createBlockDefinitionsFromJsonArray([
  {
    type: "ottobit_repeat",
    message0: "repeat %1 times %2 %3",
    args0: [
      {
        type: "field_number",
        name: "TIMES",
        value: 10,
        min: 1,
        max: 100,
      },
      {
        type: "input_dummy",
      },
      {
        type: "input_statement",
        name: "DO",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_control",
    tooltip: "Lặp lại các lệnh một số lần nhất định",
    helpUrl: "",
  },
  {
    type: "ottobit_repeat_range",
    message0: "repeat %1 From %2 To %3 By %4 %5 %6",
    args0: [
      {
        type: "field_dropdown",
        name: "VAR",
        options: [
          ["i", "i"],
          ["j", "j"],
          ["k", "k"],
          ["count", "count"],
          ["index", "index"],
        ],
      },
      {
        type: "field_number",
        name: "FROM",
        value: 1,
      },
      {
        type: "field_number",
        name: "TO",
        value: 5,
      },
      {
        type: "field_number",
        name: "BY",
        value: 1,
      },
      {
        type: "input_dummy",
      },
      {
        type: "input_statement",
        name: "DO",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_control",
    tooltip: "Lặp với biến từ giá trị đầu đến giá trị cuối",
    helpUrl: "",
  },
  {
    type: "ottobit_while",
    message0: "while %1 %2 %3",
    args0: [
      {
        type: "input_value",
        name: "CONDITION",
      },
      {
        type: "input_dummy",
      },
      {
        type: "input_statement",
        name: "DO",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_control",
    tooltip: "Lặp lại các lệnh khi điều kiện còn đúng",
    helpUrl: "",
  },
  {
    type: "ottobit_while_compare",
    message0: "while %1 %2 %3 %4 %5",
    args0: [
      {
        type: "input_value",
        name: "LEFT",
        check: "Number",
      },
      {
        type: "field_dropdown",
        name: "OPERATOR",
        options: [
          ["=", "EQ"],
          ["≠", "NEQ"],
          ["<", "LT"],
          ["≤", "LTE"],
          [">", "GT"],
          ["≥", "GTE"],
        ],
      },
      {
        type: "input_value",
        name: "RIGHT",
        check: "Number",
      },
      {
        type: "input_dummy",
      },
      {
        type: "input_statement",
        name: "DO",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_control",
    tooltip: "Lặp lại khi điều kiện so sánh còn đúng",
    helpUrl: "",
  },
  {
    type: "ottobit_if_expandable",
    message0: "if %1",
    args0: [
      {
        type: "input_value",
        name: "IF0",
        check: "Boolean",
      },
    ],
    message1: "%1",
    args1: [
      {
        type: "input_statement",
        name: "DO0",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_control_blue",
    tooltip: "Khối IF có thể mở rộng. Click vào biểu tượng bánh răng để thêm else if hoặc else",
    helpUrl: "",
    mutator: "ottobit_if_mutator"
  },
  // Boolean value block with dropdown
  {
    type: "ottobit_boolean",
    message0: "%1",
    args0: [
      {
        type: "field_dropdown",
        name: "BOOL",
        options: [
          ["true", "TRUE"],
          ["false", "FALSE"],
        ],
      },
    ],
    output: "Boolean",
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_logic",
    tooltip: "Chọn giá trị logic true hoặc false",
    helpUrl: "",
  },
  // Logic operators with dropdown - layout ngang (horizontal)
  {
    type: "ottobit_logic_operation",
    message0: "%1 %2 %3",
    args0: [
      {
        type: "input_value",
        name: "LEFT",
        check: "Boolean",
      },
      {
        type: "field_dropdown",
        name: "OP",
        options: [
          ["and", "AND"],
          ["or", "OR"],
        ],
      },
      {
        type: "input_value",
        name: "RIGHT",
        check: "Boolean",
      },
    ],
    inputsInline: true, // 🔥 Kích hoạt layout ngang
    output: "Boolean",
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_logic",
    tooltip: "Kết hợp hai điều kiện với toán tử AND hoặc OR - layout ngang",
    helpUrl: "",
  },
  // Variable block đơn giản với style compact
  {
    type: "ottobit_variable_i",
    message0: "i",
    output: "Number",
    style: "ottobit_variable",
    tooltip: "Biến i",
    helpUrl: "",
    // Thêm custom CSS class để style nhỏ gọn
    customContextMenu: false,
  },
  {
    type: "ottobit_logic_compare",
    message0: "%1 %2 %3",
    args0: [
      {
        type: "input_value",
        name: "LEFT",
        check: ["Number", "Boolean"],
      },
      {
        type: "field_dropdown",
        name: "OPERATOR",
        options: [
          ["=", "EQ"],
          ["≠", "NEQ"],
          ["<", "LT"],
          ["≤", "LTE"],
          [">", "GT"],
          ["≥", "GTE"],
        ],
      },
      {
        type: "input_value",
        name: "RIGHT",
        check: ["Number", "Boolean"],
      },
    ],
    inputsInline: true, // 🔥 Layout ngang cho comparison
    output: "Boolean",
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_control",
    tooltip: "So sánh hai giá trị hoặc logic - layout ngang",
    helpUrl: "",
  },
  {
    type: "ottobit_number",
    message0: "%1",
    args0: [
      {
        type: "field_number",
        name: "NUM",
        value: 0,
        precision: 1,
      },
    ],
    output: "Number",
    deletable: true,
    movable: true,
    editable: true,
    style: "field_blocks",
    tooltip: "Một số",
    helpUrl: "",
    customContextMenu: false,
  },
  // Simple condition block - chỉ để chứa giá trị Boolean
  {
    type: "ottobit_condition",
    message0: "%1",
    args0: [
      {
        type: "input_value",
        name: "CONDITION",
        check: "Boolean",
      },
    ],
    output: "Boolean",
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_logic",
    tooltip: "Block điều kiện đơn giản để chứa giá trị true/false hoặc kết quả kiểm tra",
    helpUrl: "",
  },
  // Boolean equals block - so sánh 2 giá trị Boolean
  {
    type: "ottobit_boolean_equals",
    message0: "%1 = %2",
    args0: [
      {
        type: "input_value",
        name: "LEFT",
        check: "Boolean",
      },
      {
        type: "input_value",
        name: "RIGHT",
        check: "Boolean",
      },
    ],
    inputsInline: true,
    output: "Boolean",
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_control",
    tooltip: "So sánh hai giá trị Boolean (true/false) - tương tự block = nhưng chỉ cho Boolean",
    helpUrl: "",
  },
]);

/**
 * All control block definitions
 */
export const blocks = controlBlocks;
