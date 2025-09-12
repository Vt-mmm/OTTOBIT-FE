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
      functions: [], // Thêm functions array để hỗ trợ function definitions
    };

    try {
      // Get all blocks from workspace
      const blocks = workspace.getAllBlocks();

      // Find function definition blocks first
      const functionBlocks = blocks.filter(
        (block: any) =>
          block.type === "procedures_defnoreturn" ||
          block.type === "ottobit_function_def"
      );

      if (functionBlocks.length > 0) {
        program.functions = this.parseFunctionDefinitions(functionBlocks);
      }

      // Find start block
      const startBlock = blocks.find(
        (block: any) => block.type === "ottobit_start"
      );

      if (startBlock) {
        program.actions = this.parseBlocksToActions(startBlock);
      }

      // Debug logging
      console.log("🗺️ Generated Program:", JSON.stringify(program, null, 2));
      console.log("🤖 Actions:", program.actions);
      program.actions.forEach((action, index) => {
        if (action.type === "while") {
          console.log(`🔄 Action ${index} (while):`, {
            type: action.type,
            cond: action.cond,
            body: action.body,
          });
        }
      });

      return program;
    } catch (error) {
      console.error("❌ Error converting workspace:", error);
      throw new Error(`Failed to convert workspace: ${error}`);
    }
  }

  /**
   * Parse function definition blocks
   */
  private static parseFunctionDefinitions(functionBlocks: any[]): any[] {
    const functions: any[] = [];

    for (const block of functionBlocks) {
      const functionName =
        block.getFieldValue("NAME") || `function_${functions.length}`;
      const bodyBlock = block.getInputTargetBlock("STACK");

      const functionDef = {
        name: functionName,
        body: bodyBlock ? this.parseBlocksToActionsFromBlock(bodyBlock) : [],
      };

      functions.push(functionDef);
    }

    return functions;
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
      const convertedActions = this.convertBlockToActions(currentBlock);
      if (convertedActions && convertedActions.length > 0) {
        actions.push(...convertedActions);
      }

      // Move to next connected block
      currentBlock = currentBlock.getNextBlock();
    }

    return actions;
  }

  /**
   * Parse blocks starting from a specific block (for function bodies, control structures)
   */
  private static parseBlocksToActionsFromBlock(
    startBlock: any
  ): ProgramAction[] {
    const actions: ProgramAction[] = [];
    let currentBlock = startBlock;

    // Traverse through connected blocks
    while (currentBlock) {
      const convertedActions = this.convertBlockToActions(currentBlock);
      if (convertedActions && convertedActions.length > 0) {
        actions.push(...convertedActions);
      }

      // Move to next connected block
      currentBlock = currentBlock.getNextBlock();
    }

    return actions;
  }

  /**
   * Convert individual block to action(s) - can return multiple actions
   */
  private static convertBlockToActions(block: any): ProgramAction[] | null {
    const blockType = block.type;

    try {
      switch (blockType) {
        case "ottobit_move_forward":
          return [this.convertMoveForward(block)];

        case "ottobit_rotate":
          return [this.convertRotate(block)];

        // Collect blocks
        case "ottobit_collect_green":
        case "ottobit_collect_red":
        case "ottobit_collect_yellow":
          return [this.convertCollect(block)];

        // Bale handling blocks
        case "ottobit_take_bale":
          return [this.convertTakeBale(block)];

        case "ottobit_put_bale":
          return [this.convertPutBale(block)];

        // Control structures
        case "ottobit_repeat":
          return [this.convertRepeat(block)];

        case "ottobit_repeat_range":
          return [this.convertRepeatRange(block)];

        case "ottobit_while":
        case "ottobit_while_compare":
          return [this.convertWhile(block)];

        case "ottobit_if":
        case "ottobit_if_condition":
          return [this.convertIf(block)];

        // Function calls
        case "procedures_callnoreturn":
        case "ottobit_function_call":
          return [this.convertFunctionCall(block)];

        // Skip start block
        case "ottobit_start":
          return null;

        // Sensor blocks (now supported)
        case "ottobit_bale_number":
          // This is handled in condition parsing, not as standalone action
          console.log(`📊 Bale number sensor block found: ${blockType}`);
          return null;

        // Unsupported blocks
        case "ottobit_read_sensor":
        case "ottobit_comparison":
        case "ottobit_touch_sensor":
        case "ottobit_light_sensor":
        case "ottobit_sound_sensor":
          console.warn(`⚠️ Sensor block not supported by Phaser: ${blockType}`);
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
    let actionType: "turnRight" | "turnLeft" | "turnBack";

    switch (direction) {
      case "RIGHT":
        actionType = "turnRight";
        break;
      case "LEFT":
        actionType = "turnLeft";
        break;
      case "BACK":
        actionType = "turnBack";
        break;
      default:
        actionType = "turnRight";
    }

    return {
      type: actionType,
    };
  }

  /**
   * Convert collect blocks - specific color variants only
   */
  private static convertCollect(block: any): ProgramAction {
    const blockType = block.type;
    let count = "1";
    let color = "green"; // default

    // Get count field
    if (block.getFieldValue("COUNT")) {
      count = block.getFieldValue("COUNT");
    }

    // Determine color based on block type
    switch (blockType) {
      case "ottobit_collect_green":
        color = "green";
        break;
      case "ottobit_collect_red":
        color = "red";
        break;
      case "ottobit_collect_yellow":
        color = "yellow";
        break;
      default:
        color = "green";
    }

    return {
      type: "collect",
      count: parseInt(count),
      color: color,
    };
  }

  /**
   * Convert take bale block
   */
  private static convertTakeBale(_block: any): ProgramAction {
    return {
      type: "takeBox",
      count: 1, // Take bale blocks don't have count field, default to 1
    };
  }

  /**
   * Convert put bale block
   */
  private static convertPutBale(_block: any): ProgramAction {
    return {
      type: "putBox",
      count: 1, // Put bale blocks don't have count field, default to 1
    };
  }

  /**
   * Convert repeat block
   */
  private static convertRepeat(block: any): ProgramAction {
    const times = block.getFieldValue("TIMES") || "3";
    const doBlock = block.getInputTargetBlock("DO");

    const bodyActions = doBlock
      ? this.parseBlocksToActionsFromBlock(doBlock)
      : [];

    return {
      type: "repeat",
      count: parseInt(times),
      body: bodyActions,
    };
  }

  /**
   * Convert repeat range block (for loops)
   */
  private static convertRepeatRange(block: any): ProgramAction {
    const varName = block.getFieldValue("VAR") || "i";
    const from = block.getFieldValue("FROM") || "1";
    const to = block.getFieldValue("TO") || "5";
    const by = block.getFieldValue("BY") || "1";
    const doBlock = block.getInputTargetBlock("DO");

    const bodyActions = doBlock
      ? this.parseBlocksToActionsFromBlock(doBlock)
      : [];

    return {
      type: "repeatRange",
      variable: varName,
      from: parseInt(from),
      to: parseInt(to),
      step: parseInt(by),
      body: bodyActions,
    };
  }

  /**
   * Convert while block
   */
  private static convertWhile(block: any): ProgramAction {
    const conditionInput = block.getInputTargetBlock("CONDITION");
    const doBlock = block.getInputTargetBlock("DO");

    const condition = conditionInput
      ? this.parseCondition(conditionInput)
      : null;
    const bodyActions = doBlock
      ? this.parseBlocksToActionsFromBlock(doBlock)
      : [];

    return {
      type: "while",
      cond: condition, // Use 'cond' to match validation
      body: bodyActions,
    };
  }

  /**
   * Convert if block
   */
  private static convertIf(block: any): ProgramAction {
    const conditionInput =
      block.getInputTargetBlock("CONDITION") ||
      block.getInputTargetBlock("CONDITION1"); // Support different if block formats
    const doBlock = block.getInputTargetBlock("DO");

    const condition = conditionInput
      ? this.parseCondition(conditionInput)
      : null;
    const thenActions = doBlock
      ? this.parseBlocksToActionsFromBlock(doBlock)
      : [];

    return {
      type: "if",
      cond: condition,
      then: thenActions,
    };
  }

  /**
   * Convert function call block
   */
  private static convertFunctionCall(block: any): ProgramAction {
    const functionName =
      block.getFieldValue("NAME") ||
      block.getFieldValue("FUNCTION_NAME") ||
      "unknown_function";

    return {
      type: "callFunction",
      functionName: functionName,
    };
  }

  /**
   * Parse condition from condition blocks
   */
  private static parseCondition(conditionBlock: any): any {
    if (!conditionBlock) return null;

    const blockType = conditionBlock.type;

    switch (blockType) {
      case "ottobit_logic_compare":
      case "logic_compare": {
        const leftValue =
          conditionBlock.getInputTargetBlock("A") ||
          conditionBlock.getInputTargetBlock("LEFT");
        const operator =
          conditionBlock.getFieldValue("OP") ||
          conditionBlock.getFieldValue("OPERATOR") ||
          "EQ";
        const rightValue =
          conditionBlock.getInputTargetBlock("B") ||
          conditionBlock.getInputTargetBlock("RIGHT");

        // Convert operator
        const operatorMap: { [key: string]: string } = {
          EQ: "==",
          NEQ: "!=",
          LT: "<",
          LTE: "<=",
          GT: ">",
          GTE: ">=",
        };

        return {
          type: "variableComparison",
          variable: this.extractVariableOrValue(leftValue),
          operator: operatorMap[operator] || "==",
          value: this.extractVariableOrValue(rightValue),
        };
      }

      case "ottobit_comparison": {
        // Handle ottobit_comparison block: A OP B format
        const leftValue = conditionBlock.getInputTargetBlock("A");
        const operator = conditionBlock.getFieldValue("OP") || "EQ";
        const rightValue = conditionBlock.getFieldValue("B") || "0"; // B is a field, not input

        // Convert operator
        const operatorMap: { [key: string]: string } = {
          EQ: "==",
          NEQ: "!=",
          LT: "<",
          LTE: "<=",
          GT: ">",
          GTE: ">=",
        };

        const leftVal = this.extractVariableOrValue(leftValue);

        // If left value is a function call (like warehouseCount), use condition type
        if (typeof leftVal === "object" && leftVal.type === "function") {
          return {
            type: "condition",
            functionName: leftVal.name,
            operator: operatorMap[operator] || "==",
            value: parseInt(rightValue) || 0,
            check: true,
          };
        }

        return {
          type: "variableComparison",
          variable: leftVal,
          operator: operatorMap[operator] || "==",
          value: parseInt(rightValue) || 0,
        };
      }

      // Sensor conditions (màu pin)
      case "ottobit_is_green":
        return { type: "condition", function: "isGreen", check: true };
      case "ottobit_is_red":
        return { type: "condition", function: "isRed", check: true };
      case "ottobit_is_yellow":
        return { type: "condition", function: "isYellow", check: true };

      // Warehouse/Bale number condition - used in while loops
      case "ottobit_bale_number":
        return {
          type: "condition",
          functionName: "warehouseCount",
          check: true,
        };

      default:
        console.warn(`⚠️ Unknown condition block type: ${blockType}`);
        return null;
    }
  }

  /**
   * Extract variable name or value from blocks
   */
  private static extractVariableOrValue(block: any): any {
    if (!block) return 0;

    switch (block.type) {
      case "ottobit_variable_i":
      case "variables_get":
        return block.getFieldValue("VAR") || "i";
      case "ottobit_number":
      case "math_number":
        return parseInt(block.getFieldValue("NUM")) || 0;
      case "ottobit_bale_number":
        // When used in comparison, should return special function name
        return { type: "function", name: "warehouseCount" };
      case "text":
        return block.getFieldValue("TEXT") || "";
      default:
        return 0;
    }
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

      // Validate control structures
      if (action.type === "repeat" && (!action.count || action.count < 1)) {
        errors.push(`Action ${index}: repeat action requires count >= 1`);
      }

      if (action.type === "repeatRange") {
        if (!action.variable) {
          errors.push(`Action ${index}: repeatRange requires variable name`);
        }
        if (action.from === undefined || action.to === undefined) {
          errors.push(
            `Action ${index}: repeatRange requires from and to values`
          );
        }
      }

      if (
        (action.type === "if" || action.type === "while") &&
        !action.cond &&
        !action.condition
      ) {
        errors.push(`Action ${index}: ${action.type} requires condition`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
