// For JSON block definitions
const createBlockDefinitionsFromJsonArray = (definitions: any[]) => {
  const blocks: { [key: string]: any } = {};
  definitions.forEach((def) => {
    blocks[def.type] = def;
  });
  return blocks;
};

/**
 * Sensor blocks for ottobit
 */
export const sensorBlocks = createBlockDefinitionsFromJsonArray([
  {
    type: "ottobit_read_sensor",
    message0: "read %1 sensor",
    args0: [
      {
        type: "field_dropdown",
        name: "SENSOR_TYPE",
        options: [
          ["distance", "DISTANCE"],
          ["light", "LIGHT"],
          ["temperature", "TEMPERATURE"],
        ],
      },
    ],
    output: "Number",
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_sensor",
    tooltip: "Đọc giá trị từ cảm biến",
    helpUrl: "",
  },
  {
    type: "ottobit_comparison",
    message0: "%1 %2 %3",
    args0: [
      {
        type: "input_value",
        name: "A",
      },
      {
        type: "field_dropdown",
        name: "OP",
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
        type: "field_number",
        name: "B",
        value: 0,
      },
    ],
    output: "Boolean",
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_sensor",
    tooltip: "So sánh hai giá trị",
    helpUrl: "",
  },
  {
    type: "ottobit_bale_number",
    message0: "%1 number",
    args0: [
      {
        type: "field_image",
        src: "/pin/bale.png", // Icon kiện hàng
        width: 24,
        height: 24,
        alt: "bale number",
      },
    ],
    output: "Number",
    deletable: true,
    movable: true,
    editable: true,
    colour: "#795548",
    tooltip: "Lấy số lượng kiện hàng hiện tại",
    helpUrl: "",
  },
]);

/**
 * All sensor block definitions
 */
export const blocks = sensorBlocks;
