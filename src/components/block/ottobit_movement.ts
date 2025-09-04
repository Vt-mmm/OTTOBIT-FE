/** SVG helpers */
const dataUri = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const ARROW_UP_SVG = `
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="arrowGradient" x1="0" x2="1">
      <stop offset="0" stop-color="#2196F3"/><stop offset="1" stop-color="#1976D2"/>
    </linearGradient>
  </defs>
  <circle cx="16" cy="16" r="14" fill="url(#arrowGradient)"/>
  <polygon points="16,6 24,18 8,18" fill="white"/>
</svg>`;

const ROTATE_SVG = `
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="rotateGradient" x1="0" x2="1">
      <stop offset="0" stop-color="#2196F3"/><stop offset="1" stop-color="#1976D2"/>
    </linearGradient>
  </defs>
  <circle cx="16" cy="16" r="14" fill="url(#rotateGradient)"/>
  <path d="M16 8 A8 8 0 1 1 15.8 8" stroke="white" stroke-width="2.5" fill="none"/>
  <polygon points="22,10 26,10 24,13" fill="white"/>
</svg>`;

// For JSON block definitions
const createBlockDefinitionsFromJsonArray = (definitions: any[]) => {
  const blocks: {[key: string]: any} = {};
  definitions.forEach(def => {
    blocks[def.type] = def;
  });
  return blocks;
};

/**
 * Movement blocks for Ottobot
 */
export const movementBlocks = createBlockDefinitionsFromJsonArray([
  {
    type: 'ottobot_move_forward',
    message0: '%1 move forward %2',
    args0: [
      {
        type: 'field_image',
        src: dataUri(ARROW_UP_SVG),
        width: 32,
        height: 32,
        alt: 'move forward',
      },
      {
        type: 'field_number',
        name: 'STEPS',
        value: 1,
        min: 1,
        max: 100,
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: 'ottobit_movement',
    tooltip: 'Di chuyển robot về phía trước với số bước nhất định',
    helpUrl: '',
  },
  {
    type: 'ottobot_rotate',
    message0: '%1 rotate %2',
    args0: [
      {
        type: 'field_image',
        src: dataUri(ROTATE_SVG),
        width: 32,
        height: 32,
        alt: 'rotate',
      },
      {
        type: 'field_dropdown',
        name: 'DIRECTION',
        options: [
          ['right', 'RIGHT'],
          ['left', 'LEFT'],
        ],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: 'ottobit_movement',
    tooltip: 'Xoay robot sang trái hoặc phải',
    helpUrl: '',
  },
]);

/**
 * All movement block definitions
 */
export const blocks = movementBlocks;
