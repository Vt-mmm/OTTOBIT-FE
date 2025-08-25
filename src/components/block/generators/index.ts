// Enhanced code generation with better block traversal
export const generatePythonCode = (workspace: any): string => {
  if (!workspace) {
    return "# No workspace available\n# Drag blocks from the toolbox to create your program";
  }

  try {
    const blocks = workspace.getTopBlocks(true);
    if (!blocks || blocks.length === 0) {
      return "# No blocks in workspace\n# Drag blocks from the toolbox to create your program";
    }

    let code = "# Generated Python Code for OttoBit Robot\n";
    code += "# Import required libraries\n";
    code += "import robot\n";
    code += "import time\n\n";

    // Process each top-level block chain
    blocks.forEach((block: any) => {
      const blockCode = generatePythonForBlock(block, 0);
      if (blockCode.trim()) {
        code += blockCode;
      }
    });

    code += "\n# Program completed\nprint('Robot program finished!')\n";
    return code;
  } catch (error) {
    console.error("Python generation error:", error);
    return "# Error generating Python code\n# Please check your blocks configuration";
  }
};

export const generateJavaScriptCode = (workspace: any): string => {
  if (!workspace) {
    return "// No workspace available\n// Drag blocks from the toolbox to create your program";
  }

  try {
    const blocks = workspace.getTopBlocks(true);
    if (!blocks || blocks.length === 0) {
      return "// No blocks in workspace\n// Drag blocks from the toolbox to create your program";
    }

    let code = "// Generated JavaScript Code for OttoBit Robot\n";
    code += "// Import required modules\n";
    code += "const robot = require('./robot');\n\n";
    code += "// Helper function for delays\n";
    code +=
      "const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));\n\n";
    code += "// Main program function\n";
    code += "async function main() {\n";

    // Process each top-level block chain
    blocks.forEach((block: any) => {
      const blockCode = generateJavaScriptForBlock(block, 1);
      if (blockCode.trim()) {
        code += blockCode;
      }
    });

    code += "\n    console.log('Robot program finished!');\n";
    code += "}\n\n";
    code += "// Execute the main program\n";
    code += "main().catch(console.error);\n";
    return code;
  } catch (error) {
    console.error("JavaScript generation error:", error);
    return "// Error generating JavaScript code\n// Please check your blocks configuration";
  }
};

function generatePythonForBlock(block: any, indentLevel: number = 0): string {
  if (!block) return "";

  const type = block.type;
  const indent = "    ".repeat(indentLevel); // 4 spaces per indent level
  let code = "";

  try {
    switch (type) {
      case "start":
        code = `${indent}# Start program\n${indent}print("Starting OttoBit robot...")\n`;
        break;
      case "move_forward":
        const forwardSteps = block.getFieldValue("STEPS") || 1;
        code = `${indent}robot.move_forward(${forwardSteps})\n`;
        break;
      case "move_backward":
        const backwardSteps = block.getFieldValue("STEPS") || 1;
        code = `${indent}robot.move_backward(${backwardSteps})\n`;
        break;
      case "turn_left":
        code = `${indent}robot.turn_left()\n`;
        break;
      case "turn_right":
        code = `${indent}robot.turn_right()\n`;
        break;
      case "rotate":
        const direction = block.getFieldValue("DIRECTION") || "LEFT";
        code = `${indent}robot.rotate("${direction.toLowerCase()}")\n`;
        break;
      case "collect":
        const amount = block.getFieldValue("AMOUNT") || 1;
        code = `${indent}robot.collect(${amount})\n`;
        break;
      case "collect_green":
        code = `${indent}robot.collect_green()\n`;
        break;
      case "stop":
        code = `${indent}robot.stop()\n`;
        break;
      case "wait":
        const seconds = block.getFieldValue("SECONDS") || 1;
        code = `${indent}time.sleep(${seconds})\n`;
        break;
      case "repeat":
        const times = block.getFieldValue("TIMES") || 3;
        code = `${indent}for i in range(${times}):\n`;
        // Process child blocks with increased indentation
        const childConnection = block.getInput("DO")?.connection?.targetBlock();
        if (childConnection) {
          let childBlock = childConnection;
          while (childBlock) {
            code += generatePythonForBlock(childBlock, indentLevel + 1);
            childBlock = childBlock.getNextBlock();
          }
        }
        break;
      case "if_else":
        const condition = block.getFieldValue("CONDITION") || "sensor_detected";
        code = `${indent}if robot.${condition}():\n`;
        // Process IF blocks
        const ifConnection = block.getInput("IF")?.connection?.targetBlock();
        if (ifConnection) {
          let ifBlock = ifConnection;
          while (ifBlock) {
            code += generatePythonForBlock(ifBlock, indentLevel + 1);
            ifBlock = ifBlock.getNextBlock();
          }
        } else {
          code += `${indent}    pass\n`;
        }
        // Process ELSE blocks
        const elseConnection = block
          .getInput("ELSE")
          ?.connection?.targetBlock();
        if (elseConnection) {
          code += `${indent}else:\n`;
          let elseBlock = elseConnection;
          while (elseBlock) {
            code += generatePythonForBlock(elseBlock, indentLevel + 1);
            elseBlock = elseBlock.getNextBlock();
          }
        }
        break;
      case "read_sensor":
        const sensorType = block.getFieldValue("SENSOR") || "distance";
        code = `${indent}sensor_value = robot.read_${sensorType}_sensor()\n`;
        code += `${indent}print(f"${sensorType} sensor: {sensor_value}")\n`;
        break;
      default:
        code = `${indent}# Unknown block type: ${type}\n`;
    }
  } catch (error) {
    code = `${indent}# Error processing block: ${type}\n`;
  }

  // Process next block in the chain
  const nextBlock = block.getNextBlock();
  if (nextBlock) {
    code += generatePythonForBlock(nextBlock, indentLevel);
  }

  return code;
}

function generateJavaScriptForBlock(
  block: any,
  indentLevel: number = 0
): string {
  if (!block) return "";

  const type = block.type;
  const indent = "    ".repeat(indentLevel); // 4 spaces per indent level
  let code = "";

  try {
    switch (type) {
      case "start":
        code = `${indent}// Start program\n${indent}console.log("Starting OttoBit robot...");\n`;
        break;
      case "move_forward":
        const forwardSteps = block.getFieldValue("STEPS") || 1;
        code = `${indent}await robot.moveForward(${forwardSteps});\n`;
        break;
      case "move_backward":
        const backwardSteps = block.getFieldValue("STEPS") || 1;
        code = `${indent}await robot.moveBackward(${backwardSteps});\n`;
        break;
      case "turn_left":
        code = `${indent}await robot.turnLeft();\n`;
        break;
      case "turn_right":
        code = `${indent}await robot.turnRight();\n`;
        break;
      case "rotate":
        const direction = block.getFieldValue("DIRECTION") || "LEFT";
        code = `${indent}await robot.rotate("${direction.toLowerCase()}");\n`;
        break;
      case "collect":
        const amount = block.getFieldValue("AMOUNT") || 1;
        code = `${indent}await robot.collect(${amount});\n`;
        break;
      case "collect_green":
        code = `${indent}await robot.collectGreen();\n`;
        break;
      case "stop":
        code = `${indent}await robot.stop();\n`;
        break;
      case "wait":
        const seconds = block.getFieldValue("SECONDS") || 1;
        code = `${indent}await sleep(${seconds * 1000});\n`;
        break;
      case "repeat":
        const times = block.getFieldValue("TIMES") || 3;
        code = `${indent}for (let i = 0; i < ${times}; i++) {\n`;
        // Process child blocks with increased indentation
        const childConnection = block.getInput("DO")?.connection?.targetBlock();
        if (childConnection) {
          let childBlock = childConnection;
          while (childBlock) {
            code += generateJavaScriptForBlock(childBlock, indentLevel + 1);
            childBlock = childBlock.getNextBlock();
          }
        }
        code += `${indent}}\n`;
        break;
      case "if_else":
        const condition = block.getFieldValue("CONDITION") || "sensorDetected";
        code = `${indent}if (await robot.${condition}()) {\n`;
        // Process IF blocks
        const ifConnection = block.getInput("IF")?.connection?.targetBlock();
        if (ifConnection) {
          let ifBlock = ifConnection;
          while (ifBlock) {
            code += generateJavaScriptForBlock(ifBlock, indentLevel + 1);
            ifBlock = ifBlock.getNextBlock();
          }
        }
        code += `${indent}}\n`;
        // Process ELSE blocks
        const elseConnection = block
          .getInput("ELSE")
          ?.connection?.targetBlock();
        if (elseConnection) {
          code = code.slice(0, -1) + ` else {\n`; // Remove last } and add else
          let elseBlock = elseConnection;
          while (elseBlock) {
            code += generateJavaScriptForBlock(elseBlock, indentLevel + 1);
            elseBlock = elseBlock.getNextBlock();
          }
          code += `${indent}}\n`;
        }
        break;
      case "read_sensor":
        const sensorType = block.getFieldValue("SENSOR") || "distance";
        code = `${indent}const sensorValue = await robot.read${
          sensorType.charAt(0).toUpperCase() + sensorType.slice(1)
        }Sensor();\n`;
        code += `${indent}console.log(\`${sensorType} sensor: \${sensorValue}\`);\n`;
        break;
      default:
        code = `${indent}// Unknown block type: ${type}\n`;
    }
  } catch (error) {
    code = `${indent}// Error processing block: ${type}\n`;
  }

  // Process next block in the chain
  const nextBlock = block.getNextBlock();
  if (nextBlock) {
    code += generateJavaScriptForBlock(nextBlock, indentLevel);
  }

  return code;
}

// Legacy functions for compatibility (will not use Blockly generators)
export const definePythonGenerators = () => {
  console.log("Using custom Python code generation");
};

export const defineJavaScriptGenerators = () => {
  console.log("Using custom JavaScript code generation");
};
