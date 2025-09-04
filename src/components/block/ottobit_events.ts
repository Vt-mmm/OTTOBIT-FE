// For JSON block definitions
const createBlockDefinitionsFromJsonArray = (definitions: any[]) => {
  const blocks: {[key: string]: any} = {};
  definitions.forEach(def => {
    blocks[def.type] = def;
  });
  return blocks;
};

/** SVG helpers */
const dataUri = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const PLAY_SVG = `
<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="playGradient" x1="0" x2="1">
      <stop offset="0" stop-color="#4CAF50"/><stop offset="1" stop-color="#2E7D32"/>
    </linearGradient>
  </defs>
  <circle cx="20" cy="20" r="18" fill="url(#playGradient)" stroke="white" stroke-width="2"/>
  <polygon points="15,10 15,30 30,20" fill="white"/>
</svg>`;

/**
 * Event blocks for Ottobot
 */
export const eventBlocks = createBlockDefinitionsFromJsonArray([
  {
    type: 'ottobot_start',
    message0: '%1 start',
    args0: [
      {
        type: 'field_image',
        src: dataUri(PLAY_SVG),
        width: 40,
        height: 40,
        alt: 'start',
      },
    ],
    nextStatement: null,
    deletable: true,
    movable: true,
    editable: true,
    style: 'ottobit_event',
    tooltip: 'Bắt đầu chương trình robot',
    helpUrl: '',
  },
]);

/**
 * All event block definitions
 */
export const blocks = eventBlocks;
