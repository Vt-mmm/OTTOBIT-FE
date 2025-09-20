import * as Blockly from "blockly/core";

// Function Definition Block - thay thế cho procedures_defnoreturn
export const ottobit_function_def = {
  init: function (this: Blockly.Block) {
    // Trở về simple field không validation để cho phép edit bình thường
    this.appendDummyInput()
      .appendField("⚙️")
      .appendField(new Blockly.FieldTextInput("myFunction"), "NAME");
    this.appendStatementInput("STACK").setCheck(null);
    this.setColour("#40E0D0");
    this.setTooltip("Định nghĩa hàm");
    this.setHelpUrl("");
  },
};

// Function Call Block - thay thế cho procedures_callnoreturn
export const ottobit_function_call = {
  init: function (this: Blockly.Block) {
    // Trở về simple field không validation để cho phép edit bình thường
    this.appendDummyInput().appendField(
      new Blockly.FieldTextInput("myFunction"),
      "NAME"
    );
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#40E0D0");
    this.setTooltip("Gọi hàm");
    this.setHelpUrl("");
  },
};
