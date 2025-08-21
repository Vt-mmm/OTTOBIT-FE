import * as Blockly from "blockly";

// Sensor Read Block
export const readSensorBlock = () => {
  if (Blockly.Blocks["read_sensor"]) return;

  Blockly.Blocks["read_sensor"] = {
    init: function () {
      this.jsonInit({
        type: "read_sensor",
        message0: "👁️ read %1",
        args0: [
          {
            type: "field_dropdown",
            name: "SENSOR",
            options: [
              ["ultrasonic", "ULTRASONIC"],
              ["light", "LIGHT"],
              ["temperature", "TEMPERATURE"],
            ],
          },
        ],
        output: "Number",
        style: "ottobit_motion", // Use sensor color
        tooltip: "Đọc giá trị từ cảm biến",
      });
    },
  };
};

// Define all sensor blocks
export const defineSensorBlocks = () => {
  readSensorBlock();
};
