// For JSON block definitions
const createBlockDefinitionsFromJsonArray = (definitions: any[]) => {
  const blocks: {[key: string]: any} = {};
  definitions.forEach(def => {
    blocks[def.type] = def;
  });
  return blocks;
};

/**
 * Control blocks for Ottobot
 */
export const controlBlocks = createBlockDefinitionsFromJsonArray([
  {
    type: 'ottobot_repeat',
    message0: 'repeat %1 times %2 %3',
    args0: [
      {
        type: 'field_number',
        name: 'TIMES',
        value: 10,
        min: 1,
        max: 100,
      },
      {
        type: 'input_dummy',
      },
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: 'ottobit_control',
    tooltip: 'Lặp lại các lệnh một số lần nhất định',
    helpUrl: '',
  },
  {
    type: 'ottobot_repeat_range',
    message0: 'repeat %1 From %2 To %3 By %4 %5 %6',
    args0: [
      {
        type: 'field_dropdown',
        name: 'VAR',
        options: [
          ['i', 'i'],
          ['j', 'j'],
          ['k', 'k'],
          ['count', 'count'],
          ['index', 'index']
        ],
      },
      {
        type: 'field_number',
        name: 'FROM',
        value: 1,
      },
      {
        type: 'field_number',
        name: 'TO',
        value: 5,
      },
      {
        type: 'field_number',
        name: 'BY',
        value: 1,
      },
      {
        type: 'input_dummy',
      },
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: 'ottobit_control',
    tooltip: 'Lặp với biến từ giá trị đầu đến giá trị cuối',
    helpUrl: '',
  },
  {
    type: 'ottobot_while',
    message0: 'while %1 %2 %3',
    args0: [
      {
        type: 'input_value',
        name: 'CONDITION',
        check: 'Boolean',
      },
      {
        type: 'input_dummy',
      },
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: 'ottobit_control',
    tooltip: 'Lặp lại các lệnh khi điều kiện còn đúng',
    helpUrl: '',
  },
  {
    type: 'ottobot_if',
    message0: 'if %1 %2 %3',
    args0: [
      {
        type: 'input_value',
        name: 'CONDITION',
        check: 'Boolean',
      },
      {
        type: 'input_dummy',
      },
      {
        type: 'input_statement',
        name: 'DO',
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: 'ottobit_control',
    tooltip: 'Thực hiện lệnh nếu điều kiện đúng',
    helpUrl: '',
  },
]);

/**
 * All control block definitions
 */
export const blocks = controlBlocks;
