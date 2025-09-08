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
    message0: "%1 collect %2 green batteries",
    args0: [
      {
        type: "field_image",
        src: PIN_GREEN_IMAGE,
        width: 32,
        height: 32,
        alt: "collect green",
      },
      {
        type: "field_number",
        name: "COUNT",
        value: 1,
        min: 1,
        max: 10,
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    colour: "#4CAF50",
    tooltip: "Thu thập pin màu xanh lá",
    helpUrl: "",
  },
  {
    type: "ottobit_collect_red",
    message0: "%1 collect %2 red batteries",
    args0: [
      {
        type: "field_image",
        src: PIN_RED_IMAGE,
        width: 32,
        height: 32,
        alt: "collect red",
      },
      {
        type: "field_number",
        name: "COUNT",
        value: 1,
        min: 1,
        max: 10,
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    colour: "#F44336",
    tooltip: "Thu thập pin màu đỏ",
    helpUrl: "",
  },
  {
    type: "ottobit_collect_yellow",
    message0: "%1 collect %2 yellow batteries",
    args0: [
      {
        type: "field_image",
        src: PIN_YELLOW_IMAGE,
        width: 32,
        height: 32,
        alt: "collect yellow",
      },
      {
        type: "field_number",
        name: "COUNT",
        value: 1,
        min: 1,
        max: 10,
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    colour: "#FFC107",
    tooltip: "Thu thập pin màu vàng",
    helpUrl: "",
  },
]);

/**
 * All action block definitions
 */
export const blocks = actionBlocks;
