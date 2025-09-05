/**
 * Blockly to Phaser Converter Service
 * Converts Blockly workspace to Phaser-compatible program format
 */

import { ProgramData, ProgramAction } from "../types/phaser.js";

export class BlocklyToPhaserConverter {
  /**
   * Convert Blockly workspace to Phaser program
   */
  static convertWorkspace(workspace: any): ProgramData {
    if (!workspace) {
      throw new Error("Workspace is required");
    }

    const program: ProgramData = {
      version: "1.0.0",
      programName: "user_program",
      actions: [],
    };

    try {
      // Get all blocks from workspace
      const blocks = workspace.getAllBlocks();
      const startBlock = blocks.find(
        (block: any) => block.type === "ottobit_start"
      );

      if (startBlock) {
        program.actions = this.parseBlocksToActions(startBlock);
      }

      console.log(
        `📋 Converted workspace to program: ${program.actions.length} actions`
      );
      console.log(
        "📋 Generated program JSON:",
        JSON.stringify(program, null, 2)
      );
      return program;
    } catch (error) {
      console.error("❌ Error converting workspace:", error);
      throw new Error(`Failed to convert workspace: ${error}`);
    }
  }

  /**
   * Parse blocks starting from start block
   */
  private static parseBlocksToActions(startBlock: any): ProgramAction[] {
    const actions: ProgramAction[] = [];
    let currentBlock = startBlock;

    // Get next block (connected to start block)
    const nextBlock = startBlock.getNextBlock();
    if (nextBlock) {
      currentBlock = nextBlock;
    }

    // Traverse through connected blocks
    while (currentBlock) {
      const action = this.convertBlockToAction(currentBlock);
      if (action) {
        actions.push(action);
      }

      // Move to next connected block
      currentBlock = currentBlock.getNextBlock();
    }

    return actions;
  }

  /**
   * Convert individual block to action
   */
  private static convertBlockToAction(block: any): ProgramAction | null {
    const blockType = block.type;

    try {
      switch (blockType) {
        case "ottobit_move_forward":
          return this.convertMoveForward(block);

        case "ottobit_rotate":
          return this.convertRotate(block);

        case "ottobit_turn_back":
          return this.convertTurnBack(block);

        case "ottobit_collect":
        case "ottobit_collect_green":
          return this.convertCollect(block);

        case "ottobit_collect_once":
          return this.convertCollectOnce(block);

        case "ottobit_repeat":
          return this.convertRepeat(block);

        case "ottobit_repeat_range":
          return this.convertRepeatRange(block);

        case "ottobit_while":
          return this.convertWhile(block);

        case "ottobit_if":
          return this.convertIf(block);

        // Sensor blocks - not supported by Phaser
        case "ottobit_read_sensor":
        case "ottobit_comparison":
          console.warn(`⚠️ Sensor block not supported by Phaser: ${blockType}`);
          return null;

        // Logic blocks - not supported by Phaser
        case "ottobit_while_compare":
        case "ottobit_if_else_logic":
        case "ottobit_variable_i":
        case "ottobit_logic_compare":
        case "ottobit_number":
          console.warn(`⚠️ Logic block not supported by Phaser: ${blockType}`);
          return null;

        // Start block - just entry point, no conversion needed
        case "ottobit_start":
          return null;

        default:
          console.warn(`⚠️ Unknown block type: ${blockType}`);
          return null;
      }
    } catch (error) {
      console.error(`❌ Error converting block ${blockType}:`, error);
      return null;
    }
  }

  /**
   * Convert move forward block
   */
  private static convertMoveForward(block: any): ProgramAction {
    const steps = block.getFieldValue("STEPS") || "1";
    return {
      type: "forward",
      count: parseInt(steps),
    };
  }

  /**
   * Convert rotate block
   */
  private static convertRotate(block: any): ProgramAction {
    const direction = block.getFieldValue("DIRECTION") || "RIGHT";
    return {
      type: direction === "RIGHT" ? "turnRight" : "turnLeft",
    };
  }

  /**
   * Convert turn back block
   */
  private static convertTurnBack(_block: any): ProgramAction {
    return {
      type: "turnBack",
    };
  }

  /**
   * Convert collect block
   */
  private static convertCollect(block: any): ProgramAction {
    const count = block.getFieldValue("COUNT") || "1";
    const color = block.getFieldValue("COLOR") || "green";

    return {
      type: "collect",
      count: parseInt(count),
      colors: [color], // Phaser expects colors array, not color string
    };
  }

  /**
   * Convert collect once block (single collection)
   */
  private static convertCollectOnce(block: any): ProgramAction {
    const count = block.getFieldValue("COUNT") || "1";
    const color = block.getFieldValue("COLOR") || "green";

    return {
      type: "collectOnce", // Phaser supports collectOnce action
      count: parseInt(count),
      color: color, // collectOnce uses color, not colors
    };
  }

  /**
   * Convert repeat block (simplified - just repeat the inner blocks)
   */
  private static convertRepeat(block: any): ProgramAction | null {
    const times = block.getFieldValue("TIMES") || "3";
    const doStatements = block.getInputTargetBlock("DO");

    if (!doStatements) {
      return null;
    }

    // For now, just return the inner blocks
    // In a more complex implementation, you might want to expand the loop
    console.log(`🔄 Repeat block: ${times} times`);
    return null; // Skip for now, could be expanded later
  }

  /**
   * Convert repeat range block
   */
  private static convertRepeatRange(block: any): ProgramAction | null {
    const from = block.getFieldValue("FROM") || "1";
    const to = block.getFieldValue("TO") || "5";
    const by = block.getFieldValue("BY") || "1";

    console.log(`🔄 Repeat range: ${from} to ${to} by ${by}`);
    return null; // Skip for now, could be expanded later
  }

  /**
   * Convert while block
   */
  private static convertWhile(_block: any): ProgramAction | null {
    console.log("🔄 While block detected");
    return null; // Skip for now, could be expanded later
  }

  /**
   * Convert if block
   */
  private static convertIf(_block: any): ProgramAction | null {
    console.log("🔄 If block detected");
    return null; // Skip for now, could be expanded later
  }

  /**
   * Validate program structure
   */
  static validateProgram(program: ProgramData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!program.version) {
      errors.push("Program version is required");
    }

    if (!program.programName) {
      errors.push("Program name is required");
    }

    if (!Array.isArray(program.actions)) {
      errors.push("Program actions must be an array");
    }

    // Validate each action
    program.actions?.forEach((action, index) => {
      if (!action.type) {
        errors.push(`Action ${index}: type is required`);
      }

      if (action.type === "forward" && (!action.count || action.count < 1)) {
        errors.push(`Action ${index}: forward action requires count >= 1`);
      }

      if (action.type === "collect" && (!action.count || action.count < 1)) {
        errors.push(`Action ${index}: collect action requires count >= 1`);
      }

      if (
        action.type === "collectOnce" &&
        (!action.count || action.count < 1)
      ) {
        errors.push(`Action ${index}: collectOnce action requires count >= 1`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
