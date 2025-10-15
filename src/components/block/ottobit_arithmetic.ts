// Helper function to create block definitions from JSON array
const createBlockDefinitionsFromJsonArray = (definitions: any[]) => {
  const blocks: { [key: string]: any } = {};
  definitions.forEach((def) => {
    blocks[def.type] = def;
  });
  return blocks;
};

/**
 * Arithmetic block for ottobit - Single block with dropdown operator
 * Block toán tử số học: +, -, ×, ÷ (theo chuẩn HP Robots)
 */
export const arithmeticBlocks = createBlockDefinitionsFromJsonArray([
  // Unified arithmetic operator block with dropdown
  {
    type: "ottobit_arithmetic",
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
          ["+", "ADD"],
          ["-", "MINUS"],
          ["×", "MULTIPLY"],
          ["÷", "DIVIDE"],
          ["^", "POWER"],
        ],
      },
      {
        type: "input_value",
        name: "B",
        check: "Number",
      },
    ],
    inputsInline: true,
    output: "Number",
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_arithmetic",
    tooltip: "Thực hiện phép toán số học giữa hai số hoặc biến",
    helpUrl: "",
  },
]);
