// src/blocks/movement.ts
import * as Blockly from "blockly";

/** ----------
 *  SVG helpers
 *  ---------- */
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

// Arrow up icon for move forward
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

// Rotate icon  
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

/** ----------
 *  START (event) block with cap & play button
 *  ---------- */
export const startBlock = () => {
  // Kiểm tra xem block đã được định nghĩa chưa
  if (Blockly.Blocks["start"]) {
    return;
  }

  Blockly.Blocks["start"] = {
    init: function () {
      this.jsonInit({
        type: "start",
        message0: "%1 start",
        args0: [
          {
            type: "field_image",
            src: dataUri(PLAY_SVG),
            width: 40,
            height: 40,
            alt: "start",
          },
        ],
        nextStatement: null, // Chỉ có next, không có previous để làm block khởi đầu
        style: "ottobit_event", // Sử dụng style thay vì colour trực tiếp
        tooltip: "Bắt đầu chương trình",
      });
    },
  };

  // Optional: click vào nút play để phát sự kiện custom "ottobit_run"
  if (!Blockly.Extensions.isRegistered("ottobit_start_click")) {
    Blockly.Extensions.register("ottobit_start_click", function (this: any) {
      const img = this.inputList?.[0]?.fieldRow?.[0];
      if (img && typeof (img as any).setOnClick === "function") {
        (img as any).setOnClick(() => {
          const ws = this.workspace || Blockly.getMainWorkspace();
          ws && ws.fireChangeListener?.({ type: "ottobit_run" } as any);
        });
      }
    });
    (Blockly.Extensions as any).apply("ottobit_start_click", "start", false);
  }
};

/** ----------
 *  MOVE FORWARD
 *  ---------- */
export const moveForwardBlock = () => {
  if (Blockly.Blocks["move_forward"]) return;

  Blockly.Blocks["move_forward"] = {
    init: function () {
      this.jsonInit({
        type: "move_forward",
        message0: "%1 move forward %2",
        args0: [
          {
            type: "field_image",
            src: dataUri(ARROW_UP_SVG),
            width: 32,
            height: 32,
            alt: "move forward",
          },
          {
            type: "field_number",
            name: "STEPS",
            value: 1,
            min: 1,
            max: 10,
            precision: 1,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "ottobit_motion", // Sử dụng style
        tooltip: "Di chuyển robot về phía trước",
      });
    },
  };
};

/** ----------
 *  ROTATE with dropdown (left/right)
 *  ---------- */
export const rotateBlock = () => {
  if (Blockly.Blocks["rotate"]) return;

  Blockly.Blocks["rotate"] = {
    init: function () {
      this.jsonInit({
        type: "rotate",
        message0: "%1 rotate %2",
        args0: [
          {
            type: "field_image",
            src: dataUri(ROTATE_SVG),
            width: 32,
            height: 32,
            alt: "rotate",
          },
          {
            type: "field_dropdown",
            name: "DIRECTION",
            options: [
              ["right", "RIGHT"],
              ["left", "LEFT"],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "ottobit_motion", // Sử dụng style
        tooltip: "Xoay robot trái hoặc phải",
      });
    },
  };
};

/** ----------
 *  Register all movement blocks
 *  ---------- */
export const defineMovementBlocks = () => {
  startBlock();
  moveForwardBlock();
  rotateBlock();
};
