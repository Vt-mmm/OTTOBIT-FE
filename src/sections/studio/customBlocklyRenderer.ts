// src/blocks/renderer-ottobit.ts
import * as Blockly from "blockly/core";

export class CustomBlocklyRenderer extends Blockly.zelos.Renderer {
  constructor(name?: string) {
    super(name || "ottobit");
  }

  makeConstants_() {
    const c = super.makeConstants_();
    c.CORNER_RADIUS = 8; // Thu nhỏ bo góc
    c.NOTCH_WIDTH = 20; // Thu nhỏ notch
    c.NOTCH_HEIGHT = 12; // Thu nhỏ height
    c.MIN_BLOCK_HEIGHT = 40; // Thu nhỏ chiều cao tối thiểu
    c.FIELD_BORDER_RECT_RADIUS = 10; // Bo góc tròn cho input fields
    c.STATEMENT_INPUT_PADDING_LEFT = 16; // Thu nhỏ padding
    c.MIN_BLOCK_WIDTH = 10; // Thu nhỏ chiều rộng tối thiểu
    c.FIELD_TEXT_FONTSIZE = 12; // Thu nhỏ font size
    c.FIELD_TEXT_HEIGHT = 20; // Thu nhỏ text height

    // @ts-ignore
    return c;
  }
}
Blockly.blockRendering.register("ottobit", CustomBlocklyRenderer);
