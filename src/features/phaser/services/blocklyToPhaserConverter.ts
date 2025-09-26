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
      } else {
      }

      return program;
    } catch (error) {
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
        block.getFieldValue("NAME") ||
        block.getFieldValue("FUNC_NAME") ||
        block.getFieldValue("TITLE") ||
        `function_${functions.length}`;

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

        case "ottobit_if_expandable":
          return [this.convertIfExpandable(block)];

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
          return null;

        // Unsupported blocks
        case "ottobit_read_sensor":
        case "ottobit_comparison":
        case "ottobit_touch_sensor":
        case "ottobit_light_sensor":
        case "ottobit_sound_sensor":
          return null;

        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Convert move forward block
   */
  private static convertMoveForward(block: any): ProgramAction {
    // Lấy giá trị từ input value (có thể là số hoặc biến)
    let steps = "1";
    
    // Thử lấy input target block (khối được gắn vào)
    const inputBlock = block.getInputTargetBlock("STEPS");
    if (inputBlock) {
      // Nếu có khối gắn vào (số hoặc biến)
      if (inputBlock.type === "ottobit_number") {
        steps = inputBlock.getFieldValue("NUM") || "1";
      } else if (inputBlock.type === "ottobit_variable_i") {
        // Nếu là biến i, giữ nguyên string "i" để xử lý sau
        steps = "i";
      }
    }
    
    // Convert sang số nếu không phải biến
    const count = steps === "i" ? -1 : parseInt(steps); // Dùng -1 để đánh dấu biến i
    
    return {
      type: "forward",
      count: count > 0 ? count : 1, // Default to 1 if invalid
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
    let countToken: string = "1"; // giữ ở dạng string để có thể mang placeholder biến
    let color = "green"; // default

    // Lấy giá trị từ input value (có thể là số hoặc biến)
    const inputBlock = block.getInputTargetBlock("COUNT");
    if (inputBlock) {
      // Nếu có khối gắn vào (số hoặc biến)
      if (inputBlock.type === "ottobit_number") {
        countToken = inputBlock.getFieldValue("NUM") || "1";
      } else if (inputBlock.type === "ottobit_variable_i") {
        // Nếu là biến i, dùng placeholder để ProgramExecutor thay thế theo vòng lặp
        // ProgramExecutor.replaceVariableInAction() sẽ tìm mẫu {{i}} và thay bằng giá trị thực
        countToken = "{{i}}";
      }
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

    // Không ép kiểu sang number ở đây để tránh làm mất placeholder của biến
    // ProgramExecutor (JS) sẽ giữ nguyên string và thay thế khi mở rộng repeatRange
    const countValue: any = countToken.match(/^\{\{.*\}\}$/)
      ? countToken
      : parseInt(countToken) || 1;

    return {
      type: "collect",
      // Cho phép giữ string placeholder hoặc số đã parse
      count: countValue as any,
      color: color,
    } as any;
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
   * Convert expandable if block (với else if và else)
   */
  private static convertIfExpandable(block: any): ProgramAction {
    // Main IF condition và statement - sử dụng IF0 và DO0
    const mainConditionInput = block.getInputTargetBlock("IF0");
    const mainDoBlock = block.getInputTargetBlock("DO0");

    const mainCondition = mainConditionInput
      ? this.parseCondition(mainConditionInput)
      : null;
    const mainThenActions = mainDoBlock
      ? this.parseBlocksToActionsFromBlock(mainDoBlock)
      : [];

    const result: any = {
      type: "if",
      cond: mainCondition,
      then: mainThenActions,
    };

    // Get số lượng ELSE IF từ block state
    const elseifCount = block.elseifCount_ || 0;

    // Nếu có else if, tạo elseIf array
    if (elseifCount > 0) {
      result.elseIf = [];

      for (let i = 1; i <= elseifCount; i++) {
        // Kiểm tra input tồn tại trước khi truy cập
        const hasIfInput = block.getInput(`IF${i}`) !== null;
        const hasDoInput = block.getInput(`DO${i}`) !== null;

        if (hasIfInput && hasDoInput) {
          const elseifConditionInput = block.getInputTargetBlock(`IF${i}`);
          const elseifDoBlock = block.getInputTargetBlock(`DO${i}`);

          const elseifCondition = elseifConditionInput
            ? this.parseCondition(elseifConditionInput)
            : null;
          const elseifThenActions = elseifDoBlock
            ? this.parseBlocksToActionsFromBlock(elseifDoBlock)
            : [];

          result.elseIf.push({
            cond: elseifCondition,
            then: elseifThenActions,
          });
        }
      }
    }

    // Kiểm tra ELSE block - kiểm tra input tồn tại trước
    const hasElseInput = block.getInput("ELSE") !== null;
    if (hasElseInput) {
      const elseDoBlock = block.getInputTargetBlock("ELSE");
      if (elseDoBlock) {
        const elseActions = this.parseBlocksToActionsFromBlock(elseDoBlock);
        if (elseActions.length > 0) {
          result.else = elseActions;
        }
      }
    }

    return result;
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
      case "ottobit_boolean":
      case "logic_boolean": {
        const val = this.getBooleanValue(conditionBlock);
        return { type: "boolean", value: val };
      }
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

      // Boolean equals block - xử lý đặc biệt cho pin checks
      case "ottobit_boolean_equals": {
        const leftValue = conditionBlock.getInputTargetBlock("LEFT");
        const rightValue = conditionBlock.getInputTargetBlock("RIGHT");

        // Kiểm tra nếu một trong hai là pin check block
        if (
          leftValue &&
          (leftValue.type === "ottobit_is_green" ||
            leftValue.type === "ottobit_is_red" ||
            leftValue.type === "ottobit_is_yellow")
        ) {
          const pinType = leftValue.type.replace("ottobit_is_", "");
          const checkValue = this.getBooleanValue(rightValue);
          return {
            type: "condition",
            function: `is${pinType.charAt(0).toUpperCase() + pinType.slice(1)}`,
            check: checkValue,
          };
        }

        if (
          rightValue &&
          (rightValue.type === "ottobit_is_green" ||
            rightValue.type === "ottobit_is_red" ||
            rightValue.type === "ottobit_is_yellow")
        ) {
          const pinType = rightValue.type.replace("ottobit_is_", "");
          const checkValue = this.getBooleanValue(leftValue);
          return {
            type: "condition",
            function: `is${pinType.charAt(0).toUpperCase() + pinType.slice(1)}`,
            check: checkValue,
          };
        }

        // Fallback to normal boolean comparison
        return {
          type: "variableComparison",
          variable: this.extractVariableOrValue(leftValue),
          operator: "==",
          value: this.extractVariableOrValue(rightValue),
        };
      }

      // Condition wrapper block
      case "ottobit_condition": {
        const conditionInput = conditionBlock.getInputTargetBlock("CONDITION");
        return conditionInput ? this.parseCondition(conditionInput) : null;
      }

      // Warehouse/Bale number condition - used in while loops
      case "ottobit_bale_number":
        return {
          type: "condition",
          functionName: "warehouseCount",
          check: true,
        };

      default:
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
   * Get boolean value from boolean blocks
   */
  private static getBooleanValue(block: any): boolean {
    if (!block) return false;

    switch (block.type) {
      case "ottobit_boolean":
        const boolValue = block.getFieldValue("BOOL");
        return boolValue === "TRUE";
      case "logic_boolean":
        const logicValue = block.getFieldValue("BOOL");
        return logicValue === "TRUE";
      default:
        return false;
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

    // Relax non-critical validations
    if (!program.version) {
      program.version = "1.0.0";
    }

    if (!program.programName) {
      program.programName = "user_program";
    }

    if (!Array.isArray(program.actions)) {
      errors.push("Program actions must be an array");
    }

    // Validate each action
    program.actions?.forEach((action, index) => {
      if (!action.type) {
        errors.push(`Action ${index}: type is required`);
      }

      if (
        action.type === "forward" &&
        (action.count === undefined || (typeof action.count === "number" && action.count < 1))
      ) {
        errors.push(`Action ${index}: forward action requires count >= 1`);
      }

      if (
        action.type === "collect" &&
        (action.count === undefined ||
          (typeof action.count === "number" && action.count < 1) ||
          (typeof action.count === "string" && action.count.trim() === ""))
      ) {
        errors.push(`Action ${index}: collect action requires valid count`);
      }

      // Validate control structures
      if (
        action.type === "repeat" &&
        (action.count === undefined ||
          (typeof action.count === "number" && action.count < 1))
      ) {
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

      // Allow saving IF/WHILE even if condition is currently null (placeholder will be added)
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
