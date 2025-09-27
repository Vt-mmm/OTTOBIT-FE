// For JSON block definitions
const createBlockDefinitionsFromJsonArray = (definitions: any[]) => {
  const blocks: { [key: string]: any } = {};
  definitions.forEach((def) => {
    blocks[def.type] = def;
  });
  return blocks;
};

// Pin image paths from public/pin folder
const PIN_GREEN_IMAGE = "/pin/pin_green.png";
const PIN_RED_IMAGE = "/pin/pin_red.png";
const PIN_YELLOW_IMAGE = "/pin/pin_yellow.png";

/**
 * Action blocks for ottobit
 */
export const actionBlocks = createBlockDefinitionsFromJsonArray([
  {
    type: "ottobit_collect_green",
    message0: "%1 collect %2 ",
    args0: [
      {
        type: "field_image",
        src: PIN_GREEN_IMAGE,
        width: 32,
        height: 32,
        alt: "collect green",
      },
      {
        type: "input_value",
        name: "COUNT",
        check: "Number",
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_action_green",
    tooltip: "Thu thập pin màu xanh lá",
    helpUrl: "",
  },
  {
    type: "ottobit_collect_red",
    message0: "%1 collect %2 ",
    args0: [
      {
        type: "field_image",
        src: PIN_RED_IMAGE,
        width: 32,
        height: 32,
        alt: "collect red",
      },
      {
        type: "input_value",
        name: "COUNT",
        check: "Number",
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_action_red",
    tooltip: "Thu thập pin màu đỏ",
    helpUrl: "",
  },
  {
    type: "ottobit_collect_yellow",
    message0: "%1 collect %2",
    args0: [
      {
        type: "field_image",
        src: PIN_YELLOW_IMAGE,
        width: 32,
        height: 32,
        alt: "collect yellow",
      },
      {
        type: "input_value",
        name: "COUNT",
        check: "Number",
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_action_yellow",
    tooltip: "Thu thập pin màu vàng",
    helpUrl: "",
  },
  {
    type: "ottobit_take_bale",
    message0: "%1 take box",
    args0: [
      {
        type: "field_image",
        src: "/pin/bale.png", // Icon kiện hàng
        width: 32,
        height: 32,
        alt: "take box",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_action_orange",
    tooltip: "Lấy kiện hàng",
    helpUrl: "",
  },
  {
    type: "ottobit_put_bale",
    message0: "%1 put box",
    args0: [
      {
        type: "field_image",
        src: "/pin/bale.png", // Icon kiện hàng
        width: 32,
        height: 32,
        alt: "put box",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: "ottobit_action_salmon",
    tooltip: "Đặt kiện hàng",
    helpUrl: "",
  },
]);

/**
 * All action block definitions
 */
export const blocks = actionBlocks;
