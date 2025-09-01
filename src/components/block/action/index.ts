import * as Blockly from "blockly";

/** ----------
 *  SVG helpers for action blocks
 *  ---------- */
const dataUri = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

// Battery icons for collect blocks
const BATTERY_YELLOW_SVG = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="6" width="14" height="12" rx="2" fill="#FFC107" stroke="#FF8F00" stroke-width="1"/>
  <rect x="18" y="9" width="2" height="6" rx="1" fill="#FF8F00"/>
  <rect x="6" y="8" width="10" height="8" fill="#FFD54F"/>
  <text x="11" y="14" text-anchor="middle" font-size="8" fill="#333">1</text>
</svg>`;

const BATTERY_GREEN_SVG = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="6" width="14" height="12" rx="2" fill="#4CAF50" stroke="#2E7D32" stroke-width="1"/>
  <rect x="18" y="9" width="2" height="6" rx="1" fill="#2E7D32"/>
  <rect x="6" y="8" width="10" height="8" fill="#81C784"/>
  <text x="11" y="14" text-anchor="middle" font-size="8" fill="#fff">1</text>
</svg>`;

// Collect Block with yellow battery (default)
export const collectBlock = () => {
  if (Blockly.Blocks["collect"]) return;

  Blockly.Blocks["collect"] = {
    init: function () {
      this.jsonInit({
        type: "collect",
        message0: "collect %1 %2",
        args0: [
          {
            type: "field_image",
            src: dataUri(BATTERY_YELLOW_SVG),
            width: 32,
            height: 32,
            alt: "battery",
          },
          {
            type: "field_number",
            name: "AMOUNT",
            value: 1,
            min: 1,
            max: 10,
            precision: 1,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: "#4285F4",
        tooltip: "Thu thập pin vàng",
      });
    },
  };
};

// Collect Green Block (alternative)
export const collectGreenBlock = () => {
  if (Blockly.Blocks["collect_green"]) return;

  Blockly.Blocks["collect_green"] = {
    init: function () {
      this.jsonInit({
        type: "collect_green",
        message0: "collect %1 %2",
        args0: [
          {
            type: "field_image",
            src: dataUri(BATTERY_GREEN_SVG),
            width: 32,
            height: 32,
            alt: "green_battery",
          },
          {
            type: "field_number",
            name: "AMOUNT",
            value: 1,
            min: 1,
            max: 10,
            precision: 1,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: "#4285F4",
        tooltip: "Thu thập pin xanh",
      });
    },
  };
};

// Define all action blocks
export const defineActionBlocks = () => {
  collectBlock();
  collectGreenBlock();
};
