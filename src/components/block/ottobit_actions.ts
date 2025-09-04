// For JSON block definitions
const createBlockDefinitionsFromJsonArray = (definitions: any[]) => {
  const blocks: { [key: string]: any } = {};
  definitions.forEach((def) => {
    blocks[def.type] = def;
  });
  return blocks;
};

/**
 * Action blocks for ottobit
 */
export const actionBlocks = createBlockDefinitionsFromJsonArray([
  {
    type: "ottobit_collect",
    message0: "collect item",
    previousStatement: null,
    nextStatement: null,
    style: "ottobit_action",
    tooltip: "Thu thập vật phẩm",
    helpUrl: "",
  },
  {
    type: "ottobit_collect_green",
    message0: "collect green item",
    previousStatement: null,
    nextStatement: null,
    style: "ottobit_action",
    tooltip: "Thu thập vật phẩm màu xanh",
    helpUrl: "",
  },
]);

/**
 * All action block definitions
 */
export const blocks = actionBlocks;
