// src/blocks/renderer-ottobit.ts
import * as Blockly from "blockly/core";

export class CustomBlocklyRenderer extends Blockly.zelos.Renderer {
  constructor(name?: string) {
    super(name || "ottobit");
  }

  makeConstants_() {
    const c = super.makeConstants_();
    c.CORNER_RADIUS = 16; // Bo góc như trong hình
    c.NOTCH_WIDTH = 32; // Rộng hơn
    c.NOTCH_HEIGHT = 16; // Cao hơn
    c.MIN_BLOCK_HEIGHT = 56; // Blocks to hơn nhiều
    c.FIELD_BORDER_RECT_RADIUS = 12; // Field bo góc to hơn
    c.STATEMENT_INPUT_PADDING_LEFT = 32; // Padding lớn hơn
    c.MIN_BLOCK_WIDTH = 120; // Chiều rộng tối thiểu
    
    // @ts-ignore
    c.ADD_START_HATS = true; // **mũ cho block start**
    return c;
  }
}
Blockly.blockRendering.register("ottobit", CustomBlocklyRenderer);
