// Simple code generation without relying on Blockly generators
export const generatePythonCode = (workspace: any): string => {
  if (!workspace) {
    return "# No workspace available\n# Drag blocks from the toolbox to create your program";
  }

  try {
    const blocks = workspace.getTopBlocks(true);
    if (!blocks || blocks.length === 0) {
      return "# No blocks in workspace\n# Drag blocks from the toolbox to create your program";
    }

    let code = "# Generated Python Code\n";
    code += "# Import robot functions\n";
    code += "import robot\n";
    code += "import time\n\n";

    blocks.forEach((block: any) => {
      code += generatePythonForBlock(block);
    });

    return code;
  } catch (error) {
    return "# Error generating Python code\n# Please check your blocks";
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

    let code = "// Generated JavaScript Code\n";
    code += "// Import robot functions\n\n";

    blocks.forEach((block: any) => {
      code += generateJavaScriptForBlock(block);
    });

    return code;
  } catch (error) {
    return "// Error generating JavaScript code\n// Please check your blocks";
  }
};

function generatePythonForBlock(block: any): string {
  if (!block) return "";

  const type = block.type;
  let code = "";

  switch (type) {
    case "start":
      code = '# Start program\nprint("Starting robot...")\n\n';
      break;
    case "move_forward":
      const forwardSteps = block.getFieldValue("STEPS") || 1;
      code = `robot.move_forward(${forwardSteps})\n`;
      break;
    case "move_backward":
      const backwardSteps = block.getFieldValue("STEPS") || 1;
      code = `robot.move_backward(${backwardSteps})\n`;
      break;
    case "turn_left":
      code = "robot.turn_left()\n";
      break;
    case "turn_right":
      code = "robot.turn_right()\n";
      break;
    case "rotate":
      const direction = block.getFieldValue("DIRECTION") || "LEFT";
      code = `robot.rotate("${direction.toLowerCase()}")\n`;
      break;
    case "collect":
      const amount = block.getFieldValue("AMOUNT") || 1;
      code = `robot.collect(${amount})\n`;
      break;
    case "stop":
      code = "robot.stop()\n";
      break;
    case "wait":
      const seconds = block.getFieldValue("SECONDS") || 1;
      code = `time.sleep(${seconds})\n`;
      break;
    case "repeat":
      const times = block.getFieldValue("TIMES") || 3;
      code = `for i in range(${times}):\n`;
      const childBlocks = block.getChildren();
      childBlocks.forEach((child: any) => {
        const childCode = generatePythonForBlock(child);
        code += `    ${childCode.replace(/\n/g, "\n    ")}`;
      });
      code += "\n";
      break;
    default:
      code = `# Unknown block type: ${type}\n`;
  }

  // Process next block
  const nextBlock = block.getNextBlock();
  if (nextBlock) {
    code += generatePythonForBlock(nextBlock);
  }

  return code;
}

function generateJavaScriptForBlock(block: any): string {
  if (!block) return "";

  const type = block.type;
  let code = "";

  switch (type) {
    case "start":
      code = '// Start program\nconsole.log("Starting robot...");\n\n';
      break;
    case "move_forward":
      const forwardSteps = block.getFieldValue("STEPS") || 1;
      code = `robot.moveForward(${forwardSteps});\n`;
      break;
    case "move_backward":
      const backwardSteps = block.getFieldValue("STEPS") || 1;
      code = `robot.moveBackward(${backwardSteps});\n`;
      break;
    case "turn_left":
      code = "robot.turnLeft();\n";
      break;
    case "turn_right":
      code = "robot.turnRight();\n";
      break;
    case "rotate":
      const direction = block.getFieldValue("DIRECTION") || "LEFT";
      code = `robot.rotate("${direction.toLowerCase()}");\n`;
      break;
    case "collect":
      const amount = block.getFieldValue("AMOUNT") || 1;
      code = `robot.collect(${amount});\n`;
      break;
    case "stop":
      code = "robot.stop();\n";
      break;
    case "wait":
      const seconds = block.getFieldValue("SECONDS") || 1;
      code = `await sleep(${seconds * 1000});\n`;
      break;
    case "repeat":
      const times = block.getFieldValue("TIMES") || 3;
      code = `for (let i = 0; i < ${times}; i++) {\n`;
      const childBlocks = block.getChildren();
      childBlocks.forEach((child: any) => {
        const childCode = generateJavaScriptForBlock(child);
        code += `    ${childCode.replace(/\n/g, "\n    ")}`;
      });
      code += "}\n";
      break;
    default:
      code = `// Unknown block type: ${type}\n`;
  }

  // Process next block
  const nextBlock = block.getNextBlock();
  if (nextBlock) {
    code += generateJavaScriptForBlock(nextBlock);
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




