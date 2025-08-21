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
    <linearGradient id="g" x1="0" x2="1">
      <stop offset="0" stop-color="#41D38A"/><stop offset="1" stop-color="#16AB65"/>
    </linearGradient>
  </defs>
  <circle cx="20" cy="20" r="18" fill="url(#g)" />
  <polygon points="16,12 30,20 16,28" fill="#fff"/>
</svg>`;

const CIRCLE_ICON = (inner: string) => `
<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <circle cx="10" cy="10" r="9" fill="#3B82F6"/>
  ${inner}
</svg>`;

// arrow up (forward)
const ARROW_UP_SVG = CIRCLE_ICON(
  `<path d="M10 4 L16 10 L10 16 Z" fill="white" transform="rotate(-90 10 10)"/>`
);
// arrow down (backward)
const ARROW_DOWN_SVG = CIRCLE_ICON(
  `<path d="M10 4 L16 10 L10 16 Z" fill="white" transform="rotate(90 10 10)"/>`
);
// turn left ↺
const TURN_LEFT_SVG = CIRCLE_ICON(
  `<path d="M10 5 A5 5 0 1 1 9.8 5" stroke="white" stroke-width="2" fill="none"/>
   <polygon points="6,7 10,7 8,10" fill="white"/>`
);
// turn right ↻
const TURN_RIGHT_SVG = CIRCLE_ICON(
  `<path d="M10 5 A5 5 0 1 1 9.8 5" stroke="white" stroke-width="2" fill="none" transform="scale(-1,1) translate(-20,0)"/>
   <polygon points="14,7 10,7 12,10" fill="white"/>`
);
// rotate icon
const ROTATE_SVG = CIRCLE_ICON(
  `<path d="M10 5 A5 5 0 1 1 9.8 5" stroke="white" stroke-width="2" fill="none"/>
   <polygon points="13,6 17,6 15,9" fill="white"/>`
);

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
            width: 32, // To hơn
            height: 32, // To hơn
            alt: "run",
          },
        ],
        hat: "cap",
        nextStatement: null,
        style: "ottobit_event",
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
            width: 24, // To hơn
            height: 24, // To hơn
            alt: "up",
          },
          {
            type: "field_number",
            name: "STEPS",
            value: 1,
            min: 1,
            precision: 1,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "ottobit_motion",
        tooltip: "Di chuyển về phía trước",
      });
    },
  };
};

/** ----------
 *  MOVE BACKWARD
 *  ---------- */
export const moveBackwardBlock = () => {
  if (Blockly.Blocks["move_backward"]) return;

  Blockly.Blocks["move_backward"] = {
    init: function () {
      this.jsonInit({
        type: "move_backward",
        message0: "%1 move backward %2",
        args0: [
          {
            type: "field_image",
            src: dataUri(ARROW_DOWN_SVG),
            width: 24, // To hơn
            height: 24, // To hơn
            alt: "down",
          },
          {
            type: "field_number",
            name: "STEPS",
            value: 1,
            min: 1,
            precision: 1,
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "ottobit_motion",
        tooltip: "Di chuyển về phía sau",
      });
    },
  };
};

/** ----------
 *  TURN LEFT
 *  ---------- */
export const turnLeftBlock = () => {
  if (Blockly.Blocks["turn_left"]) return;

  Blockly.Blocks["turn_left"] = {
    init: function () {
      this.jsonInit({
        type: "turn_left",
        message0: "%1 turn left",
        args0: [
          {
            type: "field_image",
            src: dataUri(TURN_LEFT_SVG),
            width: 24, // To hơn
            height: 24, // To hơn
            alt: "↺",
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "ottobit_motion",
        tooltip: "Quay trái 90°",
      });
    },
  };
};

/** ----------
 *  TURN RIGHT
 *  ---------- */
export const turnRightBlock = () => {
  if (Blockly.Blocks["turn_right"]) return;

  Blockly.Blocks["turn_right"] = {
    init: function () {
      this.jsonInit({
        type: "turn_right",
        message0: "%1 turn right",
        args0: [
          {
            type: "field_image",
            src: dataUri(TURN_RIGHT_SVG),
            width: 24, // To hơn
            height: 24, // To hơn
            alt: "↻",
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "ottobit_motion",
        tooltip: "Quay phải 90°",
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
            width: 24, // To hơn
            height: 24, // To hơn
            alt: "rot",
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
        style: "ottobit_motion",
        tooltip: "Xoay trái/phải",
      });
    },
  };
};

/** ----------
 *  STOP
 *  ---------- */
export const stopBlock = () => {
  if (Blockly.Blocks["stop"]) return;

  Blockly.Blocks["stop"] = {
    init: function () {
      this.jsonInit({
        type: "stop",
        message0: "⏹️ stop",
        previousStatement: null,
        style: "ottobit_var", // màu đỏ từ theme
        tooltip: "Dừng robot",
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
  moveBackwardBlock();
  turnLeftBlock();
  turnRightBlock();
  rotateBlock();
  stopBlock();
};
