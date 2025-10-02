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
    style: "ottobit_sensor",
    tooltip: "Lấy số lượng kiện hàng hiện tại",
    helpUrl: "",
  },
  // Battery color check blocks - trả về Boolean
  {
    type: "ottobit_is_green",
    message0: "%1",
    args0: [
      {
        type: "field_image",
        src: "/pin/pin_green.png", // Sử dụng cùng asset với collect blocks
        width: 32,
        height: 32,
        alt: "green battery",
      },
    ],
    output: "Boolean",
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_sensor",
    tooltip: "Kiểm tra có pin xanh không - trả về true/false",
    helpUrl: "",
  },
  {
    type: "ottobit_is_red",
    message0: "%1",
    args0: [
      {
        type: "field_image",
        src: "/pin/pin_red.png", // Sử dụng cùng asset với collect blocks
        width: 32,
        height: 32,
        alt: "red battery",
      },
    ],
    output: "Boolean",
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_sensor",
    tooltip: "Kiểm tra có pin đỏ không - trả về true/false",
    helpUrl: "",
  },
  {
    type: "ottobit_is_yellow",
    message0: "%1",
    args0: [
      {
        type: "field_image",
        src: "/pin/pin_yellow.png", // Sử dụng cùng asset với collect blocks
        width: 32,
        height: 32,
        alt: "yellow battery",
      },
    ],
    output: "Boolean",
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_sensor",
    tooltip: "Kiểm tra có pin vàng không - trả về true/false",
    helpUrl: "",
  },
  {
    type: "ottobit_pin_number",
    message0: "🔋 number",
    args0: [],
    output: "Number",
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_sensor",
    tooltip: "Lấy số lượng pin hiện tại tại ô hiện tại",
    helpUrl: "",
  },
]);

/**
 * All sensor block definitions
 */
export const blocks = sensorBlocks;
