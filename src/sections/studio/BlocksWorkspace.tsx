import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import * as Blockly from "blockly/core";
import {
  registerottobitBlocks,
  setupShadowBlockRestoration,
} from "../../components/block";
import { CustomBlocklyRenderer } from "./customBlocklyRenderer";
import { ThemeOttobit } from "../../theme/block/theme-ottobit";
import {
  injectOttobitkFieldStyles,
  refreshBlockColors,
} from "../../theme/block/renderer-ottobit";
import BlockToolbox from "../../components/block/BlockToolbox";
import { fieldInputManager } from "../../components/block/services/FieldInputManager";

interface BlocksWorkspaceProps {
  onWorkspaceChange?: (workspace: any) => void;
  initialProgramActionsJson?: any; // optional structured program to load
  detectionsFromExecute?: any[]; // optional detections array to render blocks after Execute
  allowedBlocks?: string[]; // optional list of allowed block types from challenge
  readOnly?: boolean; // if true, disable editing/dragging/deleting blocks
}

export default function BlocksWorkspace({
  onWorkspaceChange,
  initialProgramActionsJson,
  detectionsFromExecute,
  readOnly = false,
}: // allowedBlocks, // Unused parameter
BlocksWorkspaceProps) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [blocklyWorkspace, setBlocklyWorkspace] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const selectedCategoryRef = useRef<string>("");

  // Helper: safely create a number block with output and set value
  const createNumberBlock = (ws: any, value: number) => {
    const numberBlockTypes = [
      "ottobit_number",
      "ottobit_math_number",
      "ottobit_value",
      "math_number",
      "number",
    ];
    const fieldCandidates = ["NUM", "VALUE", "TEXT"];
    for (const t of numberBlockTypes) {
      try {
        const b = ws.newBlock(t);
        if (!b) continue;
        // Must have output to connect into ValueInput
        if (!b.outputConnection) {
          try {
            b.dispose?.();
          } catch {}
          continue;
        }
        b.initSvg?.();
        b.render?.();
        let set = false;
        for (const fname of fieldCandidates) {
          try {
            if (b.getField && b.getField(fname)) {
              b.setFieldValue(String(value), fname);
              set = true;
              break;
            }
          } catch {}
        }
        // Best effort default
        if (!set) {
          try {
            b.setFieldValue(String(value), "NUM");
          } catch {}
        }
        return b;
      } catch {}
    }
    return null;
  };

  // Category blocks mapping - sử dụng block types từ cấu trúc mới
  const categoryBlocks = {
    basics: [
      { kind: "block", type: "ottobit_start" },
      { kind: "block", type: "ottobit_move_forward" },
      { kind: "block", type: "ottobit_rotate" },
    ],
    loops: [
      { kind: "block", type: "ottobit_repeat" },
      { kind: "block", type: "ottobit_repeat_range" },
      { kind: "block", type: "ottobit_variable" },
      { kind: "block", type: "ottobit_number" },
    ],
    conditions: [
      { kind: "block", type: "ottobit_while" },
      { kind: "block", type: "ottobit_if_expandable" },
    ],
    logic: [
      { kind: "block", type: "ottobit_boolean" },
      { kind: "block", type: "ottobit_logic_operation" },
      { kind: "block", type: "ottobit_logic_compare" },
      { kind: "block", type: "ottobit_boolean_equals" },
      { kind: "block", type: "ottobit_is_green" },
      { kind: "block", type: "ottobit_is_red" },
      { kind: "block", type: "ottobit_is_yellow" },
      { kind: "block", type: "ottobit_bale_number" },
      { kind: "block", type: "ottobit_pin_number" },
    ],
    actions: [
      { kind: "block", type: "ottobit_collect_green" },
      { kind: "block", type: "ottobit_collect_red" },
      { kind: "block", type: "ottobit_collect_yellow" },
      { kind: "block", type: "ottobit_take_bale" },
      { kind: "block", type: "ottobit_put_bale" },
    ],
    functions: [
      { kind: "block", type: "ottobit_function_def" },
      { kind: "block", type: "ottobit_function_call" },
    ],
  };

  // Initialize workspace
  useEffect(() => {
    if (workspaceRef.current && !blocklyWorkspace) {
      // Inject field styles TRƯỚC KHI tạo workspace
      injectOttobitkFieldStyles();

      // Register custom Ottobit renderer
      new CustomBlocklyRenderer();

      // Register custom blocks using new pattern
      registerottobitBlocks();

      // Get screen size for responsive configuration
      const screenWidth = window.innerWidth;
      const isMobile = screenWidth < 600;
      const isTablet = screenWidth >= 600 && screenWidth < 900;

      // Initialize Blockly workspace with responsive configuration
      const workspace = Blockly.inject(workspaceRef.current, {
        toolbox: {
          kind: "flyoutToolbox",
          contents: [], // Bắt đầu với toolbox rỗng
        },
        grid: {
          spacing: isMobile ? 20 : 25, // Smaller grid on mobile
          length: 1,
          colour: "rgba(200,200,200,0.1)",
          snap: true,
        },
        zoom: {
          controls: false,
          wheel: false,
          startScale: isMobile ? 0.8 : isTablet ? 0.9 : 1.0, // Smaller scale on mobile
          maxScale: isMobile ? 1.2 : 1.5,
          minScale: isMobile ? 0.6 : 0.8,
          scaleSpeed: 1.0,
        },
        move: {
          scrollbars: {
            horizontal: true,
            vertical: true,
          },
          drag: !readOnly, // Disable dragging canvas in readOnly mode
          wheel: false,
        },
        trashcan: !readOnly, // Hide trashcan in readOnly mode
        sounds: false,
        media: "https://unpkg.com/blockly/media/",
        renderer: "ottobit",
        theme: ThemeOttobit,
        // Thêm cấu hình để tránh blocks bị stuck
        oneBasedIndex: false,
        horizontalLayout: false,
        toolboxPosition: "start",
        css: true,
        rtl: false,
        readOnly: readOnly, // Disable all editing in readOnly mode
      });

      // Thêm event listeners để xử lý drag behavior
      workspace.addChangeListener((event: any) => {
        if (event.type === Blockly.Events.BLOCK_DRAG) {
          if (event.isStart === false) {
            // Khi kết thúc drag, reset trạng thái
            setTimeout(() => {
              workspace.getToolbox()?.clearSelection();
            }, 50);
          }
        }

        // Tự động ĐÓNG toolbox khi thả block thành công từ flyout vào workspace
        if (event.type === Blockly.Events.BLOCK_CREATE) {
          // Chỉ đóng nếu hiện tại đang mở một category (tránh can thiệp lúc init)
          if (
            selectedCategoryRef.current &&
            selectedCategoryRef.current !== ""
          ) {
            // Delay nhẹ để tránh ảnh hưởng quá trình tạo block
            setTimeout(() => {
              try {
                // Đóng bằng cả 2 cách: state + cập nhật toolbox rỗng ngay lập tức
                setSelectedCategory("");
                selectedCategoryRef.current = "";
                if (!readOnly) {
                  const emptyToolbox = {
                    kind: "flyoutToolbox",
                    contents: [] as any[],
                  };
                  workspace.updateToolbox(emptyToolbox);
                  const flyout = workspace.getFlyout();
                  if (flyout) flyout.setVisible(false);
                }
              } catch {}
            }, 30);
          }
        }
      });

      // Đơn giản hóa xử lý click events
      const handleMouseUp = () => {
        // Chỉ reset khi cần thiết
        setTimeout(() => {
          const blocks = workspace.getAllBlocks();
          blocks.forEach((block: any) => {
            if (block.isDragInProgress && block.isDragInProgress()) {
              // Chỉ reset nếu thực sự bị stuck
              block.setDragStrategy && block.setDragStrategy(null);
            }
          });
        }, 100);
      };

      // Thêm event listener đơn giản
      if (workspaceRef.current) {
        workspaceRef.current.addEventListener("mouseup", handleMouseUp);
      }

      setBlocklyWorkspace(workspace);
      onWorkspaceChange?.(workspace);

      // Setup shadow block restoration for copy-paste
      setupShadowBlockRestoration(workspace);

      // Initialize FieldInputManager để giải quyết lỗi UI input bị ghim
      fieldInputManager.initialize(workspace);

      // Force refresh block colors để đảm bảo hiển thị đúng
      refreshBlockColors();

      // Add responsive resize handler
      const handleResize = () => {
        const newScreenWidth = window.innerWidth;

        // Auto-close flyout on resize to prevent overlap/resizing over blocks
        try {
          // Always close toolbox/flyout on resize to avoid overlap issues
          if (!readOnly) {
            const toolbox = workspace.getToolbox && workspace.getToolbox();
            toolbox?.clearSelection?.();
            const flyout = workspace.getFlyout && workspace.getFlyout();

            setSelectedCategory("");
            selectedCategoryRef.current = "";
            const emptyToolbox = {
              kind: "flyoutToolbox",
              contents: [] as any[],
            };
            workspace.updateToolbox(emptyToolbox);
            if (flyout) flyout.setVisible(false);
          }
        } catch {}

        // Update flyout width on resize
        const flyoutBg = document.querySelector(
          ".blocklyFlyoutBackground"
        ) as HTMLElement;
        if (flyoutBg) {
          if (newScreenWidth < 600) {
            flyoutBg.style.maxWidth = "150px";
          } else if (newScreenWidth < 900) {
            flyoutBg.style.maxWidth = "200px";
          } else {
            flyoutBg.style.maxWidth = "250px";
          }
        }

        // Update block sizes
        const blocks = document.querySelectorAll(
          ".blocklyFlyout .blocklyDraggable"
        );
        blocks.forEach((block) => {
          const blockEl = block as HTMLElement;
          if (newScreenWidth < 600) {
            blockEl.style.maxWidth = "120px";
            blockEl.style.transform = "scale(0.7)";
          } else if (newScreenWidth < 900) {
            blockEl.style.maxWidth = "160px";
            blockEl.style.transform = "scale(0.8)";
          } else {
            blockEl.style.maxWidth = "200px";
            blockEl.style.transform = "scale(0.9)";
          }
        });
      };

      window.addEventListener("resize", handleResize);
      // Also react to orientation changes (mobile/tablet)
      window.addEventListener("orientationchange", handleResize as any);

      // Helper: render program actions into workspace starting from a new start block
      // ONLY if initialProgramActionsJson is NOT provided (solution mode will handle its own start block)
      setTimeout(() => {
        // Defer program rendering to the dedicated effect to avoid double-render
        if (initialProgramActionsJson) {
          console.log(
            "⏭️ [BlocksWorkspace] Skipping initial start block - solution mode will create it"
          );
          return;
        }

        const moveDistance = isMobile ? 30 : 50;
        // Always ensure a start block exists for normal editing mode
        console.log(
          "🟢 [BlocksWorkspace] Creating initial start block for editing mode"
        );
        const startBlock = workspace.newBlock("ottobit_start");
        startBlock.initSvg();
        startBlock.render();
        startBlock.moveBy(moveDistance, moveDistance);

        try {
          const program = initialProgramActionsJson;
          const actions = program?.actions;

          // Helper: create block from action type
          const createBlockFromAction = (act: any, index: number) => {
            let blockType: string | null = null;
            // Normalize common aliases
            const type = String(act?.type || "").toLowerCase();
            if (type === "repeat") blockType = "ottobit_repeat";
            else if (type === "repeatrange") blockType = "ottobit_repeat_range";
            else if (type === "forward" || type === "move_forward")
              blockType = "ottobit_move_forward";
            else if (type === "turnright" || type === "rotate")
              blockType = "ottobit_rotate";
            else if (type === "if") blockType = "ottobit_if_expandable";
            else if (type === "while") blockType = "ottobit_while";
            else if (type === "callfunction" || type === "call_function")
              blockType = "ottobit_function_call";
            else if (type === "callfunction" || type === "call_function")
              blockType = "ottobit_function_call";
            else if (type === "takebox") blockType = "ottobit_take_bale";
            else if (type === "putbox") blockType = "ottobit_put_bale";
            else if (type === "collect") {
              const color = String(act?.color || "yellow").toLowerCase();
              if (color === "red") blockType = "ottobit_collect_red";
              else if (color === "green") blockType = "ottobit_collect_green";
              else blockType = "ottobit_collect_yellow";
            }

            if (!blockType) return null;

            const block: any = workspace.newBlock(blockType);
            block.initSvg();
            block.render();
            block.moveBy(moveDistance + 200, moveDistance + index * 70);
            try {
              block.setEditable && block.setEditable(true);
              block.setDisabled && block.setDisabled(false);
            } catch {}
            // Function call: set function name field
            try {
              if (
                (type === "callfunction" || type === "call_function") &&
                act?.functionName
              ) {
                const nameFieldIds = [
                  "NAME",
                  "FUNCTION_NAME",
                  "FUNC_NAME",
                  "TITLE",
                ];
                for (const fid of nameFieldIds) {
                  if (block.getField && block.getField(fid)) {
                    block.setFieldValue(String(act.functionName), fid);
                    break;
                  }
                }
              }
            } catch {}
            // Function call name mapping
            try {
              if (
                (type === "callfunction" || type === "call_function") &&
                act?.functionName
              ) {
                const nameFieldIds = [
                  "NAME",
                  "FUNCTION_NAME",
                  "FUNC_NAME",
                  "TITLE",
                ];
                for (const fid of nameFieldIds) {
                  if (block.getField && block.getField(fid)) {
                    block.setFieldValue(String(act.functionName), fid);
                    break;
                  }
                }
              }
            } catch {}
            // Preserve bodies for IF/WHILE by ensuring a placeholder condition exists
            try {
              if (
                blockType === "ottobit_while" ||
                blockType === "ottobit_if_expandable"
              ) {
                const condInput =
                  (block.getInput && block.getInput("CONDITION")) ||
                  (block.getInput && block.getInput("COND")) ||
                  (block.getInput && block.getInput("IF0"));
                const hasCond = !!condInput?.connection?.targetBlock();
                if (condInput && !hasCond) {
                  const boolBlock = workspace.newBlock("ottobit_boolean");
                  boolBlock.initSvg();
                  boolBlock.render();
                  try {
                    boolBlock.setFieldValue &&
                      boolBlock.setFieldValue("TRUE", "BOOL");
                    boolBlock.setDeletable && boolBlock.setDeletable(false);
                    boolBlock.setMovable && boolBlock.setMovable(false);
                  } catch {}
                  condInput.connection.connect(boolBlock.outputConnection);
                }
              }
            } catch {}

            // Try set common fields if exist
            try {
              // Set counts by connecting number inputs or setting fields depending on block type
              if (typeof (act.value ?? act.count) === "number") {
                // Repeat: TIMES is a field_number
                if (blockType === "ottobit_repeat" && block.setFieldValue) {
                  if (block.getField && block.getField("TIMES")) {
                    block.setFieldValue(
                      String(act.value ?? act.count),
                      "TIMES"
                    );
                  }
                }
                // Move forward: input_value STEPS
                else if (blockType === "ottobit_move_forward") {
                  const input = block.getInput && block.getInput("STEPS");
                  if (input?.connection) {
                    const num = createNumberBlock(
                      workspace,
                      (act.value ?? act.count) as number
                    );
                    if (num?.outputConnection) {
                      input.connection.connect(num.outputConnection);
                    }
                  }
                }
                // Collect blocks: input_value COUNT
                else if (
                  blockType === "ottobit_collect_green" ||
                  blockType === "ottobit_collect_red" ||
                  blockType === "ottobit_collect_yellow"
                ) {
                  const input = block.getInput && block.getInput("COUNT");
                  if (input?.connection) {
                    const num = createNumberBlock(
                      workspace,
                      (act.value ?? act.count) as number
                    );
                    if (num?.outputConnection) {
                      input.connection.connect(num.outputConnection);
                    }
                  }
                }
              }
              // Set rotate direction from either explicit property or action type
              {
                let dir: string | null = null;
                if (typeof act.direction === "string") {
                  dir = act.direction;
                } else if (blockType === "ottobit_rotate") {
                  // Infer from action type
                  const t = String(act?.type || "").toLowerCase();
                  if (t === "turnright") dir = "RIGHT";
                  else if (t === "turnleft") dir = "LEFT";
                  else if (t === "turnback") dir = "BACK";
                }
                if (dir && block.setFieldValue) {
                  const dirField =
                    block.getField &&
                    (block.getField("DIRECTION")
                      ? "DIRECTION"
                      : block.getField("DIR")
                      ? "DIR"
                      : null);
                  if (dirField) block.setFieldValue(dir, dirField);
                }
              }
              // Attach condition for IF/WHILE from JSON program if provided
              const attachCondition = (targetBlock: any, cond: any) => {
                try {
                  if (!cond || !targetBlock) return;
                  const makeNumber = (n: any) => {
                    const num = workspace.newBlock("ottobit_number");
                    num.initSvg();
                    num.render();
                    try {
                      num.setFieldValue(String(Number(n) || 0), "NUM");
                    } catch {}
                    return num;
                  };
                  const makeBoolean = (val: boolean) => {
                    const b = workspace.newBlock("logic_boolean");
                    b.initSvg();
                    b.render();
                    try {
                      b.setFieldValue(val ? "TRUE" : "FALSE", "BOOL");
                    } catch {}
                    return b;
                  };
                  const makeSensor = (fn: string) => {
                    const map: any = {
                      isgreen: "ottobit_is_green",
                      isred: "ottobit_is_red",
                      isyellow: "ottobit_is_yellow",
                    };
                    const key = String(fn || "").toLowerCase();
                    const t = map[key];
                    if (!t) return null;
                    const s = workspace.newBlock(t);
                    s.initSvg();
                    s.render();
                    return s;
                  };
                  const connectTo = (
                    inputNameGuess: string[],
                    outBlock: any
                  ) => {
                    for (const nm of inputNameGuess) {
                      const input =
                        targetBlock.getInput && targetBlock.getInput(nm);
                      if (
                        input &&
                        input.connection &&
                        outBlock &&
                        outBlock.outputConnection
                      ) {
                        input.connection.connect(outBlock.outputConnection);
                        return true;
                      }
                    }
                    return false;
                  };

                  const condType = String(
                    cond?.type || cond?.Type || ""
                  ).toLowerCase();
                  if (condType === "condition") {
                    const fn = cond.function || cond.functionName;
                    const sensor = makeSensor(fn);
                    if (sensor) {
                      if (cond.check === false) {
                        const eq = workspace.newBlock("ottobit_boolean_equals");
                        eq.initSvg();
                        eq.render();
                        const left = eq.getInput && eq.getInput("LEFT");
                        const right = eq.getInput && eq.getInput("RIGHT");
                        if (left?.connection)
                          left.connection.connect(sensor.outputConnection);
                        if (right?.connection)
                          right.connection.connect(
                            makeBoolean(false).outputConnection
                          );
                        connectTo(["CONDITION", "COND", "IF0"], eq);
                      } else {
                        connectTo(["CONDITION", "COND", "IF0"], sensor);
                      }
                    }
                  } else if (condType === "variablecomparison") {
                    const cmp = workspace.newBlock("ottobit_logic_compare");
                    cmp.initSvg();
                    cmp.render();
                    try {
                      const opMap: any = {
                        "==": "EQ",
                        "!=": "NEQ",
                        "<": "LT",
                        "<=": "LTE",
                        ">": "GT",
                        ">=": "GTE",
                      };
                      const code = opMap[String(cond.operator) as string];
                      if (code) cmp.setFieldValue(code, "OPERATOR");
                    } catch {}

                    // Helper: create variable or function block for left side
                    const makeVariableOrFunction = (varObj: any) => {
                      if (varObj === null || varObj === undefined) return null;

                      // If it's a simple string, treat as variable name
                      if (typeof varObj === "string") {
                        const varBlock = workspace.newBlock("ottobit_variable");
                        varBlock.initSvg();
                        varBlock.render();
                        try {
                          varBlock.setFieldValue(varObj, "VAR");
                        } catch {}
                        return varBlock;
                      }

                      // If it's a number, create number block
                      if (typeof varObj === "number") {
                        return makeNumber(varObj);
                      }

                      // If it's an object with type
                      if (typeof varObj === "object" && varObj.type) {
                        const varType = String(varObj.type).toLowerCase();

                        // Handle function type: {type: "function", name: "warehouseCount"}
                        if (varType === "function") {
                          const funcName = varObj.name || varObj.functionName;
                          // Map function names to block types
                          const funcMap: any = {
                            warehousecount: "ottobit_bale_number",
                            boxcount: "ottobit_bale_number",
                            balenumber: "ottobit_bale_number",
                            pinnumber: "ottobit_pin_number",
                            isgreen: "ottobit_is_green",
                            isred: "ottobit_is_red",
                            isyellow: "ottobit_is_yellow",
                          };
                          const key = String(funcName || "").toLowerCase();
                          const blockType = funcMap[key];

                          if (blockType) {
                            const funcBlock = workspace.newBlock(blockType);
                            funcBlock.initSvg();
                            funcBlock.render();
                            return funcBlock;
                          }
                        }

                        // Handle variable type: {type: "variable", name: "i"}
                        if (varType === "variable") {
                          const varName = varObj.name || varObj.variableName;
                          const varBlock =
                            workspace.newBlock("ottobit_variable");
                          varBlock.initSvg();
                          varBlock.render();
                          try {
                            varBlock.setFieldValue(varName, "VAR");
                          } catch {}
                          return varBlock;
                        }
                      }

                      // Fallback: try to convert to number
                      return makeNumber(varObj);
                    };

                    const a = cmp.getInput && cmp.getInput("LEFT");
                    const b = cmp.getInput && cmp.getInput("RIGHT");

                    // Connect left side (variable or function)
                    if (a?.connection) {
                      const leftBlock = makeVariableOrFunction(cond.variable);
                      if (leftBlock?.outputConnection) {
                        a.connection.connect(leftBlock.outputConnection);
                      }
                    }

                    // Connect right side (value - usually a number)
                    if (b?.connection) {
                      const rightBlock = makeVariableOrFunction(cond.value);
                      if (rightBlock?.outputConnection) {
                        b.connection.connect(rightBlock.outputConnection);
                      }
                    }

                    connectTo(["CONDITION", "COND", "IF0"], cmp);
                  }
                } catch {}
              };
              if (blockType === "ottobit_if_expandable" && act?.cond) {
                attachCondition(block, act.cond);
              }
              if (blockType === "ottobit_while" && act?.cond) {
                attachCondition(block, act.cond);
              }

              if (blockType === "ottobit_repeat_range") {
                const varField =
                  block.getField && (block.getField("VAR") ? "VAR" : null);
                if (varField && typeof act.variable === "string")
                  block.setFieldValue(act.variable, varField);
                const fromField =
                  block.getField && (block.getField("FROM") ? "FROM" : null);
                const toField =
                  block.getField && (block.getField("TO") ? "TO" : null);
                const stepField =
                  block.getField && (block.getField("STEP") ? "STEP" : null);
                if (fromField && typeof act.from === "number")
                  block.setFieldValue(String(act.from), fromField);
                if (toField && typeof act.to === "number")
                  block.setFieldValue(String(act.to), toField);
                if (stepField && typeof act.step === "number")
                  block.setFieldValue(String(act.step), stepField);
              }
            } catch {}

            // Handle nested bodies: connect first body/then block chain to first statement input
            try {
              const body = Array.isArray(act.body)
                ? act.body
                : Array.isArray(act.then)
                ? act.then
                : [];
              if (body.length > 0) {
                // Pick correct statement input per block type (with fallbacks)
                let stmtInput: any = null;
                const tryInputs = (names: string[]) => {
                  for (const nm of names) {
                    const inp = block.getInput && block.getInput(nm);
                    if (inp && inp.connection) return inp;
                  }
                  return null;
                };
                if (blockType === "ottobit_if_expandable") {
                  stmtInput =
                    tryInputs(["DO0", "DO", "STACK"]) ||
                    (block.inputList || []).find(
                      (inp: any) => inp && inp.type === 3 && inp.connection
                    );
                } else if (blockType === "ottobit_while") {
                  stmtInput =
                    tryInputs(["DO", "STACK"]) ||
                    (block.inputList || []).find(
                      (inp: any) => inp && inp.type === 3 && inp.connection
                    );
                } else {
                  stmtInput = (block.inputList || []).find(
                    (inp: any) => inp && inp.type === 3 && inp.connection
                  );
                }
                if (stmtInput && stmtInput.connection) {
                  // Recursively create body block chain
                  let prevInner: any = null;
                  body.forEach((childAct: any, childIdx: number) => {
                    const childBlock = createBlockFromAction(
                      childAct,
                      index * 10 + childIdx + 1
                    );
                    if (!childBlock) return;
                    if (
                      prevInner &&
                      prevInner.nextConnection &&
                      childBlock.previousConnection &&
                      !prevInner.nextConnection.isConnected()
                    ) {
                      prevInner.nextConnection.connect(
                        childBlock.previousConnection
                      );
                    } else if (!prevInner && childBlock.previousConnection) {
                      stmtInput.connection.connect(
                        childBlock.previousConnection
                      );
                    }
                    prevInner = childBlock;
                  });
                }
              }

              // Handle ELSE IF and ELSE for IF blocks
              if (blockType === "ottobit_if_expandable") {
                // Ensure mutator inputs exist by applying mutation from JSON counts
                try {
                  const elseIfLen = Array.isArray(act.elseIf)
                    ? act.elseIf.length
                    : 0;
                  const hasElse =
                    Array.isArray(act.else) && act.else.length > 0;
                  if (elseIfLen > 0 || hasElse) {
                    if (
                      typeof (Blockly as any)?.utils?.xml?.textToDom ===
                      "function"
                    ) {
                      const mutationXmlStr = `<mutation elseif="${elseIfLen}" else="${
                        hasElse ? 1 : 0
                      }"></mutation>`;
                      const mutationDom = (Blockly as any).utils.xml.textToDom(
                        mutationXmlStr
                      );
                      if (typeof (block as any).domToMutation === "function") {
                        (block as any).domToMutation(mutationDom);
                        try {
                          block.initSvg();
                          block.render(false);
                        } catch {}
                      }
                    } else if (
                      typeof (block as any).updateShape_ === "function"
                    ) {
                      // Fallback: set internal counts and trigger shape update
                      try {
                        (block as any).elseifCount_ = elseIfLen;
                        (block as any).elseCount_ = hasElse ? 1 : 0;
                        (block as any).updateShape_();
                        block.initSvg();
                        block.render(false);
                      } catch {}
                    }
                  }
                } catch {}
                // Define tryInputs function for ELSE IF and ELSE
                const tryInputs = (names: string[]) => {
                  for (const nm of names) {
                    const inp = block.getInput && block.getInput(nm);
                    if (inp && inp.connection) return inp;
                  }
                  return null;
                };

                // Helper functions
                const makeBoolean = (value: boolean) => {
                  const boolBlock =
                    blocklyWorkspace.newBlock("ottobit_boolean");
                  boolBlock.initSvg();
                  boolBlock.render();
                  boolBlock.moveBy(0, 0);
                  if (boolBlock.getField && boolBlock.getField("BOOL")) {
                    boolBlock.setFieldValue(value ? "TRUE" : "FALSE", "BOOL");
                  }
                  return boolBlock;
                };

                const makeNumber = (value: number) => {
                  const numBlock = blocklyWorkspace.newBlock(
                    "ottobit_math_number"
                  );
                  numBlock.initSvg();
                  numBlock.render();
                  numBlock.moveBy(0, 0);
                  if (numBlock.getField && numBlock.getField("NUM")) {
                    numBlock.setFieldValue(String(value), "NUM");
                  }
                  return numBlock;
                };

                // Helper: create variable or function block for comparison
                const makeVariableOrFunction = (varObj: any) => {
                  if (varObj === null || varObj === undefined) return null;

                  // If it's a simple string, treat as variable name
                  if (typeof varObj === "string") {
                    const varBlock =
                      blocklyWorkspace.newBlock("ottobit_variable");
                    varBlock.initSvg();
                    varBlock.render();
                    varBlock.moveBy(0, 0);
                    try {
                      varBlock.setFieldValue(varObj, "VAR");
                    } catch {}
                    return varBlock;
                  }

                  // If it's a number, create number block
                  if (typeof varObj === "number") {
                    return makeNumber(varObj);
                  }

                  // If it's an object with type
                  if (typeof varObj === "object" && varObj.type) {
                    const varType = String(varObj.type).toLowerCase();

                    // Handle function type: {type: "function", name: "warehouseCount"}
                    if (varType === "function") {
                      const funcName = varObj.name || varObj.functionName;
                      // Map function names to block types
                      const funcMap: any = {
                        warehousecount: "ottobit_bale_number",
                        boxcount: "ottobit_bale_number",
                        balenumber: "ottobit_bale_number",
                        pinnumber: "ottobit_pin_number",
                        isgreen: "ottobit_is_green",
                        isred: "ottobit_is_red",
                        isyellow: "ottobit_is_yellow",
                      };
                      const key = String(funcName || "").toLowerCase();
                      const blockType = funcMap[key];

                      if (blockType) {
                        const funcBlock = blocklyWorkspace.newBlock(blockType);
                        funcBlock.initSvg();
                        funcBlock.render();
                        funcBlock.moveBy(0, 0);
                        return funcBlock;
                      }
                    }

                    // Handle variable type: {type: "variable", name: "i"}
                    if (varType === "variable") {
                      const varName = varObj.name || varObj.variableName;
                      const varBlock =
                        blocklyWorkspace.newBlock("ottobit_variable");
                      varBlock.initSvg();
                      varBlock.render();
                      varBlock.moveBy(0, 0);
                      try {
                        varBlock.setFieldValue(varName, "VAR");
                      } catch {}
                      return varBlock;
                    }
                  }

                  // Fallback: try to convert to number
                  return makeNumber(varObj);
                };

                // Handle ELSE IF
                if (Array.isArray(act.elseIf) && act.elseIf.length > 0) {
                  act.elseIf.forEach((elseIfItem: any, elseIfIdx: number) => {
                    try {
                      // Find ELSE IF input
                      const elseIfInput =
                        tryInputs(["ELSEIF", "ELSE_IF", "IF1", "IF2"]) ||
                        (block.inputList || []).find(
                          (inp: any) => inp && inp.type === 3 && inp.connection
                        );

                      if (elseIfInput && elseIfInput.connection) {
                        // Create condition for ELSE IF
                        if (elseIfItem.cond) {
                          const cond = elseIfItem.cond;
                          let condBlock: any = null;

                          if (cond.type === "condition") {
                            // Create sensor block
                            const sensorType = `ottobit_is_${cond.function
                              ?.replace("is", "")
                              .toLowerCase()}`;
                            const sensor =
                              blocklyWorkspace.newBlock(sensorType);
                            sensor.initSvg();
                            sensor.render();
                            sensor.moveBy(0, 0);

                            if (cond.check === false) {
                              const eq = blocklyWorkspace.newBlock(
                                "ottobit_boolean_equals"
                              );
                              eq.initSvg();
                              eq.render();
                              const left = eq.getInput && eq.getInput("LEFT");
                              const right = eq.getInput && eq.getInput("RIGHT");
                              if (left?.connection)
                                left.connection.connect(
                                  sensor.outputConnection
                                );
                              if (right?.connection)
                                right.connection.connect(
                                  makeBoolean(false).outputConnection
                                );
                              condBlock = eq;
                            } else {
                              condBlock = sensor;
                            }
                          } else if (cond.type === "variableComparison") {
                            // Create logic compare block
                            const compare = blocklyWorkspace.newBlock(
                              "ottobit_logic_compare"
                            );
                            compare.initSvg();
                            compare.render();
                            compare.moveBy(0, 0);

                            if (
                              compare.getField &&
                              compare.getField("OPERATOR")
                            ) {
                              compare.setFieldValue(
                                cond.operator || "=",
                                "OPERATOR"
                              );
                            }

                            const leftInput =
                              compare.getInput && compare.getInput("LEFT");
                            const rightInput =
                              compare.getInput && compare.getInput("RIGHT");

                            if (
                              leftInput?.connection &&
                              cond.variable !== undefined
                            ) {
                              const varBlock = makeVariableOrFunction(
                                cond.variable
                              );
                              if (varBlock?.outputConnection) {
                                leftInput.connection.connect(
                                  varBlock.outputConnection
                                );
                              }
                            }
                            if (
                              rightInput?.connection &&
                              cond.value !== undefined
                            ) {
                              const valBlock = makeVariableOrFunction(
                                cond.value
                              );
                              if (valBlock?.outputConnection) {
                                rightInput.connection.connect(
                                  valBlock.outputConnection
                                );
                              }
                            }

                            condBlock = compare;
                          }

                          if (condBlock && condBlock.outputConnection) {
                            // Connect condition to ELSE IF input
                            elseIfInput.connection.connect(
                              condBlock.outputConnection
                            );
                          }
                        }

                        // Create body for ELSE IF
                        if (
                          Array.isArray(elseIfItem.then) &&
                          elseIfItem.then.length > 0
                        ) {
                          const elseIfBodyInput =
                            tryInputs(["DO1", "DO2", "ELSE_DO"]) ||
                            (block.inputList || []).find(
                              (inp: any) =>
                                inp && inp.type === 3 && inp.connection
                            );

                          if (elseIfBodyInput && elseIfBodyInput.connection) {
                            let prevElseIf: any = null;
                            elseIfItem.then.forEach(
                              (childAct: any, childIdx: number) => {
                                const childBlock = createBlockFromAction(
                                  childAct,
                                  index * 100 + elseIfIdx * 10 + childIdx + 1
                                );
                                if (!childBlock) return;
                                if (
                                  prevElseIf &&
                                  prevElseIf.nextConnection &&
                                  childBlock.previousConnection &&
                                  !prevElseIf.nextConnection.isConnected()
                                ) {
                                  prevElseIf.nextConnection.connect(
                                    childBlock.previousConnection
                                  );
                                } else if (
                                  !prevElseIf &&
                                  childBlock.previousConnection
                                ) {
                                  elseIfBodyInput.connection.connect(
                                    childBlock.previousConnection
                                  );
                                }
                                prevElseIf = childBlock;
                              }
                            );
                          }
                        }
                      }
                    } catch {}
                  });
                }

                // Handle ELSE
                if (Array.isArray(act.else) && act.else.length > 0) {
                  try {
                    const elseInput =
                      tryInputs(["ELSE", "ELSE_DO", "DO2"]) ||
                      (block.inputList || []).find(
                        (inp: any) => inp && inp.type === 3 && inp.connection
                      );

                    if (elseInput && elseInput.connection) {
                      let prevElse: any = null;
                      act.else.forEach((childAct: any, childIdx: number) => {
                        const childBlock = createBlockFromAction(
                          childAct,
                          index * 1000 + childIdx + 1
                        );
                        if (!childBlock) return;
                        if (
                          prevElse &&
                          prevElse.nextConnection &&
                          childBlock.previousConnection &&
                          !prevElse.nextConnection.isConnected()
                        ) {
                          prevElse.nextConnection.connect(
                            childBlock.previousConnection
                          );
                        } else if (!prevElse && childBlock.previousConnection) {
                          elseInput.connection.connect(
                            childBlock.previousConnection
                          );
                        }
                        prevElse = childBlock;
                      });
                    }
                  } catch {}
                }
              }
            } catch {}

            return block;
          };

          if (Array.isArray(actions) && actions.length > 0) {
            let prev: any = startBlock as any;
            actions.forEach((act: any, idx: number) => {
              const b = createBlockFromAction(act, idx);
              if (!b) return;
              // Chain sequentially after previous
              try {
                if (
                  prev &&
                  prev.nextConnection &&
                  b.previousConnection &&
                  !prev.nextConnection.isConnected()
                ) {
                  prev.nextConnection.connect(b.previousConnection);
                }
              } catch {}
              prev = b;
            });
          }
        } catch {}

        // Refresh colors
        refreshBlockColors();
      }, 80);

      // Expose global loader: window.StudioBlocks.loadDetections(detections)
      // detections format example: [{class_name: 'start'}, {class_name:'repeat_start', value:2, actions:[...]}]
      (window as any).StudioBlocks = (window as any).StudioBlocks || {};
      (window as any).StudioBlocks.loadDetections = (detections: any[]) => {
        try {
          // Clear existing blocks
          workspace.clear();
          // Build actions array compatible with existing renderer
          const mapDetectionToAction = (det: any): any | null => {
            const name = String(det?.class_name || "").toLowerCase();

            if (name === "start") return { type: "start" };
            if (name === "move_forward") {
              const value = Number(det?.value);

              return Number.isFinite(value)
                ? { type: "move_forward", value }
                : { type: "move_forward" };
            }
            if (name === "collect") {
              const value = Number(det?.value);

              return Number.isFinite(value)
                ? { type: "collect", value }
                : { type: "collect" };
            }
            if (name === "repeat_start") {
              const body = Array.isArray(det?.actions)
                ? det.actions.map(mapDetectionToAction).filter(Boolean)
                : [];
              const value = Number(det?.value);

              return Number.isFinite(value)
                ? { type: "repeat", value, body }
                : { type: "repeat", body };
            }
            if (name === "turn_right")
              return { type: "turnRight", direction: "right" };
            if (name === "turn_left")
              return { type: "turnRight", direction: "left" };
            if (name === "turn_back")
              return { type: "turnRight", direction: "back" };
            return null;
          };

          const actions = Array.isArray(detections)
            ? detections.map(mapDetectionToAction).filter(Boolean)
            : [];

          // Always prepend a start block
          const program = { actions };

          // Reuse the same rendering path by setting initialProgramActionsJson temporarily
          // Render program now
          const moveDistance = 50;
          const startBlock = workspace.newBlock("ottobit_start");
          startBlock.initSvg();
          startBlock.render();
          startBlock.moveBy(moveDistance, moveDistance);

          const createBlockFromAction = (act: any, index: number): any => {
            let blockType: string | null = null;
            // Handle both class_name (from detection API) and type (from program JSON)
            const type = String(
              act?.class_name || act?.type || ""
            ).toLowerCase();
            if (type === "repeat" || type === "repeat_start")
              blockType = "ottobit_repeat";
            else if (type === "repeatrange") blockType = "ottobit_repeat_range";
            else if (type === "forward" || type === "move_forward")
              blockType = "ottobit_move_forward";
            else if (
              type === "turnright" ||
              type === "rotate" ||
              type === "turn_right"
            )
              blockType = "ottobit_rotate";
            else if (type === "if") blockType = "ottobit_if_expandable";
            else if (type === "while") blockType = "ottobit_while";
            else if (type === "callfunction" || type === "call_function")
              blockType = "ottobit_function_call";
            else if (type === "takebox") blockType = "ottobit_take_bale";
            else if (type === "putbox") blockType = "ottobit_put_bale";
            else if (type === "collect") blockType = "ottobit_collect_yellow";
            else if (type === "turn_left") blockType = "ottobit_rotate";
            else if (type === "turn_back") blockType = "ottobit_rotate";
            if (!blockType) return null;
            const block: any = workspace.newBlock(blockType);
            block.initSvg();
            block.render();
            block.moveBy(moveDistance + 200, moveDistance + index * 70);
            try {
              block.setEditable && block.setEditable(true);
              block.setDisabled && block.setDisabled(false);
            } catch {}
            // Preserve bodies for IF/WHILE by ensuring a placeholder condition exists
            try {
              if (
                blockType === "ottobit_while" ||
                blockType === "ottobit_if_expandable"
              ) {
                const condInput =
                  (block.getInput && block.getInput("CONDITION")) ||
                  (block.getInput && block.getInput("COND")) ||
                  (block.getInput && block.getInput("IF0"));
                const hasCond = !!condInput?.connection?.targetBlock();
                if (condInput && !hasCond) {
                  const boolBlock =
                    blocklyWorkspace.newBlock("ottobit_boolean");
                  boolBlock.initSvg();
                  boolBlock.render();
                  try {
                    boolBlock.setFieldValue &&
                      boolBlock.setFieldValue("TRUE", "BOOL");
                    boolBlock.setDeletable && boolBlock.setDeletable(false);
                    boolBlock.setMovable && boolBlock.setMovable(false);
                  } catch {}
                  condInput.connection.connect(boolBlock.outputConnection);
                }
              }
            } catch {}
            // Function call: set function name field
            try {
              if (
                (type === "callfunction" || type === "call_function") &&
                act?.functionName
              ) {
                const nameFieldIds = [
                  "NAME",
                  "FUNCTION_NAME",
                  "FUNC_NAME",
                  "TITLE",
                ];
                for (const fid of nameFieldIds) {
                  if (block.getField && block.getField(fid)) {
                    block.setFieldValue(String(act.functionName), fid);
                    break;
                  }
                }
              }
            } catch {}
            try {
              const value = act.value ?? act.count;

              if (typeof value === "number") {
                // Try to set value directly to field first
                const fieldNames = [
                  "TIMES",
                  "COUNT",
                  "VALUE",
                  "N",
                  "NUM",
                  "STEPS",
                ];
                let fieldSet = false;
                for (const fieldName of fieldNames) {
                  try {
                    if (block.getField && block.getField(fieldName)) {
                      block.setFieldValue(String(value), fieldName);

                      fieldSet = true;
                      break;
                    }
                  } catch (e) {}
                }

                if (fieldSet) {
                  return;
                }

                // Find ValueInput in the block
                const valueInput = block.inputList?.find(
                  (inp: any) => inp.type === 1
                ); // ValueInput type
                if (valueInput && valueInput.connection) {
                  const numBlock = createNumberBlock(workspace, value);
                  if (!numBlock) {
                    return;
                  }
                  try {
                    valueInput.connection.connect(numBlock.outputConnection);
                  } catch (e) {}
                } else {
                }
              }

              // Handle direction for turn blocks
              let direction = act.direction;
              if (
                !direction &&
                (type === "turn_left" ||
                  type === "turn_right" ||
                  type === "turn_back")
              ) {
                // Map class_name to direction
                if (type === "turn_left") direction = "left";
                else if (type === "turn_right") direction = "right";
                else if (type === "turn_back") direction = "back";
              }

              if (typeof direction === "string" && block.setFieldValue) {
                const dirFieldIds = [
                  "DIRECTION",
                  "DIR",
                  "ROTATE_DIRECTION",
                  "ROTATION",
                  "TURN",
                  "TURN_DIR",
                ];
                const dirValue = direction;
                const dirUpper = dirValue.toUpperCase();
                let set = false;
                for (const fid of dirFieldIds) {
                  if (block.getField && block.getField(fid)) {
                    const field: any = block.getField(fid);
                    // If dropdown with options, try to match an option
                    try {
                      if (field && typeof field.getOptions === "function") {
                        const options = field.getOptions();
                        const findMatch = (needle: string) => {
                          return (
                            options.find((opt: any) =>
                              String(opt?.[0] ?? opt?.text ?? "")
                                .toLowerCase()
                                .includes(needle)
                            ) ||
                            options.find((opt: any) =>
                              String(opt?.[1] ?? opt?.value ?? "")
                                .toLowerCase()
                                .includes(needle)
                            )
                          );
                        };
                        const needle = dirValue.toLowerCase();
                        const match =
                          findMatch(needle) ||
                          (needle === "back" ? findMatch("back") : null) ||
                          (needle === "left" ? findMatch("left") : null) ||
                          (needle === "right" ? findMatch("right") : null);
                        if (match) {
                          const optionValue = match[1] ?? match.value;
                          field.setValue(String(optionValue));
                          set = true;
                          break;
                        }
                      }
                    } catch {}
                    if (!set) {
                      // Try lowercase then uppercase direct set
                      try {
                        block.setFieldValue(dirValue, fid);
                        set = true;
                      } catch {}
                      if (!set) {
                        try {
                          block.setFieldValue(dirUpper, fid);
                          set = true;
                        } catch {}
                      }
                    }
                    if (set) break;
                  }
                }
                if (!set) {
                  const angleFieldIds = ["ANGLE", "DEG", "ROTATE"];
                  const angle =
                    dirValue === "right" ? 90 : dirValue === "left" ? -90 : 180;
                  for (const fid of angleFieldIds) {
                    if (block.getField && block.getField(fid)) {
                      block.setFieldValue(String(angle), fid);
                      set = true;
                      break;
                    }
                  }
                }
              }
            } catch {}
            try {
              const body = Array.isArray(act.body) ? act.body : [];
              if (body.length > 0) {
                // Pick correct statement input for repeat (prefer known names)
                const pickStatementInput = (): any => {
                  const tryInputs = (names: string[]) => {
                    for (const nm of names) {
                      const inp = block.getInput && block.getInput(nm);
                      if (inp && inp.connection) return inp;
                    }
                    return null;
                  };
                  if (blockType === "ottobit_repeat") {
                    return (
                      tryInputs(["DO", "BODY", "STACK"]) ||
                      (block.inputList || []).find(
                        (inp: any) => inp && inp.type === 3 && inp.connection
                      )
                    );
                  }
                  return (block.inputList || []).find(
                    (inp: any) => inp && inp.type === 3 && inp.connection
                  );
                };
                const stmtInput = pickStatementInput();
                if (stmtInput && stmtInput.connection) {
                  let prevInner: any = null;
                  body.forEach((childAct: any, childIdx: number) => {
                    const childBlock = createBlockFromAction(
                      childAct,
                      index * 10 + childIdx + 1
                    );
                    if (!childBlock) return;
                    if (
                      prevInner &&
                      prevInner.nextConnection &&
                      childBlock.previousConnection &&
                      !prevInner.nextConnection.isConnected()
                    ) {
                      prevInner.nextConnection.connect(
                        childBlock.previousConnection
                      );
                    } else if (!prevInner && childBlock.previousConnection) {
                      stmtInput.connection.connect(
                        childBlock.previousConnection
                      );
                    }
                    prevInner = childBlock;
                  });
                }
              }
            } catch {}

            // Handle ELSE IF and ELSE for IF blocks
            if (blockType === "ottobit_if_expandable") {
              // Ensure mutator inputs exist by applying mutation from JSON counts
              try {
                const elseIfLen = Array.isArray(act.elseIf)
                  ? act.elseIf.length
                  : 0;
                const hasElse = Array.isArray(act.else) && act.else.length > 0;
                if (elseIfLen > 0 || hasElse) {
                  if (
                    typeof (Blockly as any)?.utils?.xml?.textToDom ===
                    "function"
                  ) {
                    const mutationXmlStr = `<mutation elseif="${elseIfLen}" else="${
                      hasElse ? 1 : 0
                    }"></mutation>`;
                    const mutationDom = (Blockly as any).utils.xml.textToDom(
                      mutationXmlStr
                    );
                    if (typeof (block as any).domToMutation === "function") {
                      (block as any).domToMutation(mutationDom);
                      try {
                        block.initSvg();
                        block.render(false);
                      } catch {}
                    }
                  } else if (
                    typeof (block as any).updateShape_ === "function"
                  ) {
                    // Fallback: set internal counts and trigger shape update
                    try {
                      (block as any).elseifCount_ = elseIfLen;
                      (block as any).elseCount_ = hasElse ? 1 : 0;
                      (block as any).updateShape_();
                      block.initSvg();
                      block.render(false);
                    } catch {}
                  }
                }
              } catch {}
              // Define tryInputs function for ELSE IF and ELSE
              const tryInputs = (names: string[]) => {
                for (const nm of names) {
                  const inp = block.getInput && block.getInput(nm);
                  if (inp && inp.connection) return inp;
                }
                return null;
              };

              // Helper functions
              const makeBoolean = (value: boolean) => {
                const boolBlock = blocklyWorkspace.newBlock("ottobit_boolean");
                boolBlock.initSvg();
                boolBlock.render();
                boolBlock.moveBy(0, 0);
                if (boolBlock.getField && boolBlock.getField("BOOL")) {
                  boolBlock.setFieldValue(value ? "TRUE" : "FALSE", "BOOL");
                }
                return boolBlock;
              };

              const makeNumber = (value: number) => {
                const numBlock = blocklyWorkspace.newBlock(
                  "ottobit_math_number"
                );
                numBlock.initSvg();
                numBlock.render();
                numBlock.moveBy(0, 0);
                if (numBlock.getField && numBlock.getField("NUM")) {
                  numBlock.setFieldValue(String(value), "NUM");
                }
                return numBlock;
              };

              // Helper: create variable or function block for comparison
              const makeVariableOrFunction = (varObj: any) => {
                if (varObj === null || varObj === undefined) return null;

                // If it's a simple string, treat as variable name
                if (typeof varObj === "string") {
                  const varBlock =
                    blocklyWorkspace.newBlock("ottobit_variable");
                  varBlock.initSvg();
                  varBlock.render();
                  varBlock.moveBy(0, 0);
                  try {
                    varBlock.setFieldValue(varObj, "VAR");
                  } catch {}
                  return varBlock;
                }

                // If it's a number, create number block
                if (typeof varObj === "number") {
                  return makeNumber(varObj);
                }

                // If it's an object with type
                if (typeof varObj === "object" && varObj.type) {
                  const varType = String(varObj.type).toLowerCase();

                  // Handle function type: {type: "function", name: "warehouseCount"}
                  if (varType === "function") {
                    const funcName = varObj.name || varObj.functionName;
                    // Map function names to block types
                    const funcMap: any = {
                      warehousecount: "ottobit_bale_number",
                      boxcount: "ottobit_bale_number",
                      balenumber: "ottobit_bale_number",
                      pinnumber: "ottobit_pin_number",
                      isgreen: "ottobit_is_green",
                      isred: "ottobit_is_red",
                      isyellow: "ottobit_is_yellow",
                    };
                    const key = String(funcName || "").toLowerCase();
                    const blockType = funcMap[key];

                    if (blockType) {
                      const funcBlock = blocklyWorkspace.newBlock(blockType);
                      funcBlock.initSvg();
                      funcBlock.render();
                      funcBlock.moveBy(0, 0);
                      return funcBlock;
                    }
                  }

                  // Handle variable type: {type: "variable", name: "i"}
                  if (varType === "variable") {
                    const varName = varObj.name || varObj.variableName;
                    const varBlock =
                      blocklyWorkspace.newBlock("ottobit_variable");
                    varBlock.initSvg();
                    varBlock.render();
                    varBlock.moveBy(0, 0);
                    try {
                      varBlock.setFieldValue(varName, "VAR");
                    } catch {}
                    return varBlock;
                  }
                }

                // Fallback: try to convert to number
                return makeNumber(varObj);
              };

              // Handle ELSE IF
              if (Array.isArray(act.elseIf) && act.elseIf.length > 0) {
                act.elseIf.forEach((elseIfItem: any, elseIfIdx: number) => {
                  try {
                    // Find ELSE IF input
                    const elseIfInput =
                      tryInputs(["ELSEIF", "ELSE_IF", "IF1", "IF2"]) ||
                      (block.inputList || []).find(
                        (inp: any) => inp && inp.type === 3 && inp.connection
                      );

                    if (elseIfInput && elseIfInput.connection) {
                      // Create condition for ELSE IF
                      if (elseIfItem.cond) {
                        const cond = elseIfItem.cond;
                        let condBlock: any = null;

                        if (cond.type === "condition") {
                          // Create sensor block
                          const sensorType = `ottobit_is_${cond.function
                            ?.replace("is", "")
                            .toLowerCase()}`;
                          const sensor = blocklyWorkspace.newBlock(sensorType);
                          sensor.initSvg();
                          sensor.render();
                          sensor.moveBy(0, 0);

                          if (cond.check === false) {
                            const eq = blocklyWorkspace.newBlock(
                              "ottobit_boolean_equals"
                            );
                            eq.initSvg();
                            eq.render();
                            const left = eq.getInput && eq.getInput("LEFT");
                            const right = eq.getInput && eq.getInput("RIGHT");
                            if (left?.connection)
                              left.connection.connect(sensor.outputConnection);
                            if (right?.connection)
                              right.connection.connect(
                                makeBoolean(false).outputConnection
                              );
                            condBlock = eq;
                          } else {
                            condBlock = sensor;
                          }
                        } else if (cond.type === "variableComparison") {
                          // Create logic compare block
                          const compare = blocklyWorkspace.newBlock(
                            "ottobit_logic_compare"
                          );
                          compare.initSvg();
                          compare.render();
                          compare.moveBy(0, 0);

                          if (
                            compare.getField &&
                            compare.getField("OPERATOR")
                          ) {
                            compare.setFieldValue(
                              cond.operator || "=",
                              "OPERATOR"
                            );
                          }

                          const leftInput =
                            compare.getInput && compare.getInput("LEFT");
                          const rightInput =
                            compare.getInput && compare.getInput("RIGHT");

                          if (
                            leftInput?.connection &&
                            cond.variable !== undefined
                          ) {
                            const varBlock = makeVariableOrFunction(
                              cond.variable
                            );
                            if (varBlock?.outputConnection) {
                              leftInput.connection.connect(
                                varBlock.outputConnection
                              );
                            }
                          }
                          if (
                            rightInput?.connection &&
                            cond.value !== undefined
                          ) {
                            const valBlock = makeVariableOrFunction(cond.value);
                            if (valBlock?.outputConnection) {
                              rightInput.connection.connect(
                                valBlock.outputConnection
                              );
                            }
                          }

                          condBlock = compare;
                        }

                        if (condBlock && condBlock.outputConnection) {
                          // Connect condition to ELSE IF input
                          elseIfInput.connection.connect(
                            condBlock.outputConnection
                          );
                        }
                      }

                      // Create body for ELSE IF
                      if (
                        Array.isArray(elseIfItem.then) &&
                        elseIfItem.then.length > 0
                      ) {
                        const elseIfBodyInput =
                          tryInputs(["DO1", "DO2", "ELSE_DO"]) ||
                          (block.inputList || []).find(
                            (inp: any) =>
                              inp && inp.type === 3 && inp.connection
                          );

                        if (elseIfBodyInput && elseIfBodyInput.connection) {
                          let prevElseIf: any = null;
                          elseIfItem.then.forEach(
                            (childAct: any, childIdx: number) => {
                              const childBlock = createBlockFromAction(
                                childAct,
                                index * 100 + elseIfIdx * 10 + childIdx + 1
                              );
                              if (!childBlock) return;
                              if (
                                prevElseIf &&
                                prevElseIf.nextConnection &&
                                childBlock.previousConnection &&
                                !prevElseIf.nextConnection.isConnected()
                              ) {
                                prevElseIf.nextConnection.connect(
                                  childBlock.previousConnection
                                );
                              } else if (
                                !prevElseIf &&
                                childBlock.previousConnection
                              ) {
                                elseIfBodyInput.connection.connect(
                                  childBlock.previousConnection
                                );
                              }
                              prevElseIf = childBlock;
                            }
                          );
                        }
                      }
                    }
                  } catch {}
                });
              }

              // Handle ELSE
              if (Array.isArray(act.else) && act.else.length > 0) {
                try {
                  const elseInput =
                    tryInputs(["ELSE", "ELSE_DO", "DO2"]) ||
                    (block.inputList || []).find(
                      (inp: any) => inp && inp.type === 3 && inp.connection
                    );

                  if (elseInput && elseInput.connection) {
                    let prevElse: any = null;
                    act.else.forEach((childAct: any, childIdx: number) => {
                      const childBlock = createBlockFromAction(
                        childAct,
                        index * 1000 + childIdx + 1
                      );
                      if (!childBlock) return;
                      if (
                        prevElse &&
                        prevElse.nextConnection &&
                        childBlock.previousConnection &&
                        !prevElse.nextConnection.isConnected()
                      ) {
                        prevElse.nextConnection.connect(
                          childBlock.previousConnection
                        );
                      } else if (!prevElse && childBlock.previousConnection) {
                        elseInput.connection.connect(
                          childBlock.previousConnection
                        );
                      }
                      prevElse = childBlock;
                    });
                  }
                } catch {}
              }
            }

            return block;
          };

          if (Array.isArray(program.actions) && program.actions.length > 0) {
            let prev: any = startBlock as any;
            program.actions.forEach((act: any, idx: number) => {
              const b = createBlockFromAction(act, idx);
              if (!b) return;
              try {
                if (
                  prev &&
                  prev.nextConnection &&
                  b.previousConnection &&
                  !prev.nextConnection.isConnected()
                ) {
                  prev.nextConnection.connect(b.previousConnection);
                }
              } catch {}
              prev = b;
            });
          }

          refreshBlockColors();
        } catch {}
      };

      // Style workspace với nền trắng và sửa lỗi tràn + autosave, giữ thân IF/WHILE
      setTimeout(() => {
        const workspaceEl = document.querySelector(
          ".blocklyWorkspace"
        ) as HTMLElement;
        if (workspaceEl) {
          workspaceEl.style.backgroundColor = "#ffffff";
          workspaceEl.style.backgroundImage = "none";
          workspaceEl.style.overflow = "hidden"; // Không cho tràn
        }

        const mainBackground = document.querySelector(
          ".blocklyMainBackground"
        ) as HTMLElement;
        if (mainBackground) {
          mainBackground.style.stroke = "none";
          mainBackground.style.fill = "#ffffff";
        }

        const flyoutBg = document.querySelector(
          ".blocklyFlyoutBackground"
        ) as HTMLElement;
        if (flyoutBg) {
          flyoutBg.style.fill = "#ffffff";
          flyoutBg.style.fillOpacity = "1";
          // Responsive flyout width based on screen size
          const screenWidth = window.innerWidth;
          if (screenWidth < 600) {
            flyoutBg.style.maxWidth = "150px"; // Mobile
          } else if (screenWidth < 900) {
            flyoutBg.style.maxWidth = "200px"; // Tablet
          } else {
            flyoutBg.style.maxWidth = "250px"; // Desktop
          }
        }

        // Responsive blocks trong flyout
        const blocks = document.querySelectorAll(
          ".blocklyFlyout .blocklyDraggable"
        );
        blocks.forEach((block) => {
          const blockEl = block as HTMLElement;
          const screenWidth = window.innerWidth;
          if (screenWidth < 600) {
            blockEl.style.maxWidth = "120px";
            blockEl.style.transform = "scale(0.7)"; // Smaller on mobile
          } else if (screenWidth < 900) {
            blockEl.style.maxWidth = "160px";
            blockEl.style.transform = "scale(0.8)"; // Medium on tablet
          } else {
            blockEl.style.maxWidth = "200px";
            blockEl.style.transform = "scale(0.9)"; // Normal on desktop
          }
        });
      }, 500);

      // Autosave + bảo toàn phần thân IF/WHILE khi chưa có điều kiện
      try {
        const AUTOSAVE_KEY = "studio.solution.autosave";
        let saveTimer: any = null;
        const ensureIfWhileCondition = () => {
          try {
            const blocks = workspace.getAllBlocks(false) || [];
            blocks.forEach((blk: any) => {
              if (
                blk?.type !== "ottobit_if_expandable" &&
                blk?.type !== "ottobit_while"
              )
                return;
              const hasBody = (blk.inputList || []).some(
                (inp: any) =>
                  inp &&
                  inp.type === Blockly.NEXT_STATEMENT &&
                  inp.connection &&
                  inp.connection.targetBlock()
              );
              const condInput =
                (blk.getInput && blk.getInput("CONDITION")) ||
                (blk.getInput && blk.getInput("COND")) ||
                (blk.getInput && blk.getInput("IF0"));
              const hasCond = !!condInput?.connection?.targetBlock();
              if (hasBody && condInput && !hasCond) {
                const boolBlock = workspace.newBlock("ottobit_boolean");
                boolBlock.initSvg();
                boolBlock.render();
                try {
                  boolBlock.setFieldValue &&
                    boolBlock.setFieldValue("TRUE", "BOOL");
                } catch {}
                condInput.connection.connect(boolBlock.outputConnection);
              }
            });
          } catch {}
        };
        const saveXml = () => {
          try {
            ensureIfWhileCondition();
            const xml = Blockly.Xml.workspaceToDom(workspace);
            const text = Blockly.Xml.domToText(xml);
            localStorage.setItem(AUTOSAVE_KEY, text);
          } catch {}
        };
        const debouncedSave = () => {
          if (saveTimer) clearTimeout(saveTimer);
          saveTimer = setTimeout(saveXml, 250);
        };
        workspace.addChangeListener(debouncedSave);
      } catch {}
    }

    return () => {
      // Cleanup FieldInputManager trước khi dispose workspace
      fieldInputManager.dispose();

      if (blocklyWorkspace) {
        blocklyWorkspace.dispose();
      }
      // Cleanup event listeners
      if (workspaceRef.current) {
        workspaceRef.current.removeEventListener("mouseup", () => {});
      }
      // Remove resize event listener
      window.removeEventListener("resize", () => {});
    };
  }, []);

  // Auto-render blocks when detections are provided by Execute flow
  useEffect(() => {
    if (!blocklyWorkspace) return;
    if (!Array.isArray(detectionsFromExecute)) return;

    // Force cleanup field inputs trước khi load detections từ Execute
    fieldInputManager.forceCleanupAll();

    try {
      if ((window as any).StudioBlocks?.loadDetections) {
        (window as any).StudioBlocks.loadDetections(detectionsFromExecute);
      }
    } catch {}
  }, [detectionsFromExecute, blocklyWorkspace]);

  // Render from provided program (solutionJson parsed) when it changes in edit mode
  useEffect(() => {
    if (!blocklyWorkspace) return;
    if (!initialProgramActionsJson) return;

    // Force cleanup field inputs trước khi render program
    fieldInputManager.forceCleanupAll();

    try {
      const program = initialProgramActionsJson;
      const actions = Array.isArray(program?.actions) ? program.actions : [];
      if (actions.length === 0) {
        return;
      }

      // Clear and rebuild
      blocklyWorkspace.clear();

      const moveDistance = 50;
      const startBlock = blocklyWorkspace.newBlock("ottobit_start");
      startBlock.initSvg();
      startBlock.render();
      startBlock.moveBy(moveDistance, moveDistance);

      const createBlockFromAction = (
        act: any,
        index: number,
        isTopLevel: boolean = true
      ): any => {
        let blockType: string | null = null;
        const type = String(act?.type || "").toLowerCase();
        console.log(
          `    🎨 [BlocksWorkspace] Creating block for action type: "${type}"`,
          act
        );

        if (type === "repeat") blockType = "ottobit_repeat";
        else if (type === "repeatrange") blockType = "ottobit_repeat_range";
        else if (type === "forward" || type === "move_forward")
          blockType = "ottobit_move_forward";
        else if (
          type === "turnright" ||
          type === "turnleft" ||
          type === "turnback" ||
          type === "rotate"
        )
          blockType = "ottobit_rotate";
        else if (type === "if") blockType = "ottobit_if_expandable";
        else if (type === "while") blockType = "ottobit_while";
        else if (type === "callfunction" || type === "call_function")
          blockType = "ottobit_function_call";
        else if (type === "takebox") blockType = "ottobit_take_bale";
        else if (type === "putbox") blockType = "ottobit_put_bale";
        else if (type === "collect") {
          const color = String(act?.color || "yellow").toLowerCase();
          if (color === "red") blockType = "ottobit_collect_red";
          else if (color === "green") blockType = "ottobit_collect_green";
          else blockType = "ottobit_collect_yellow";
        }

        if (!blockType) {
          console.error(
            `    ❌ [BlocksWorkspace] Unknown block type: "${type}"`,
            act
          );
          return null;
        }

        console.log(
          `    ✅ [BlocksWorkspace] Mapped to blockType: "${blockType}"`
        );

        const block: any = blocklyWorkspace.newBlock(blockType);
        block.initSvg();
        block.render();

        // Only set position for top-level blocks (not nested blocks inside function/repeat bodies)
        if (isTopLevel) {
          block.moveBy(moveDistance + 200, moveDistance + index * 70);
          console.log(
            `    📍 [BlocksWorkspace] Positioned block at (${
              moveDistance + 200
            }, ${moveDistance + index * 70})`
          );
        } else {
          console.log(
            `    📍 [BlocksWorkspace] Skipping position for nested block (will auto-position on connect)`
          );
        }

        try {
          block.setEditable && block.setEditable(true);
          block.setDisabled && block.setDisabled(false);
        } catch {}
        // Function call: set function name field
        try {
          if (
            (type === "callfunction" || type === "call_function") &&
            act?.functionName
          ) {
            const nameFieldIds = [
              "NAME",
              "FUNCTION_NAME",
              "FUNC_NAME",
              "TITLE",
            ];
            for (const fid of nameFieldIds) {
              if (block.getField && block.getField(fid)) {
                block.setFieldValue(String(act.functionName), fid);
                break;
              }
            }
          }
        } catch {}

        // Helper function to create number or variable block based on count value
        // Moved outside try block so it can be used by repeatRange logic too
        const createCountBlock = (countValue: any) => {
          // Case 1: Variable template string like "{{i}}" or "{{count}}"
          if (typeof countValue === "string") {
            const varMatch = countValue.match(/^\{\{\s*(\w+)\s*\}\}$/);
            if (varMatch) {
              const varName = varMatch[1];
              console.log(
                `      🔤 [BlocksWorkspace] Detected variable template: ${varName}`
              );
              const varBlock = blocklyWorkspace.newBlock("ottobit_variable");
              varBlock.setShadow(false); // Mark as real block, not shadow
              varBlock.initSvg();
              varBlock.render();
              try {
                varBlock.setFieldValue(varName, "VAR");
              } catch {}
              return varBlock;
            }
            // Try to parse as number
            const numVal = Number(countValue);
            if (!isNaN(numVal)) {
              const num = blocklyWorkspace.newBlock("ottobit_number");
              num.setShadow(false); // Mark as real block, not shadow
              num.initSvg();
              num.render();
              try {
                num.setFieldValue(String(numVal), "NUM");
              } catch {}
              return num;
            }
          }
          // Case 2: Number literal
          else if (typeof countValue === "number") {
            const num = blocklyWorkspace.newBlock("ottobit_number");
            num.setShadow(false); // Mark as real block, not shadow
            num.initSvg();
            num.render();
            try {
              num.setFieldValue(String(countValue), "NUM");
            } catch {}
            return num;
          }
          // Case 3: Variable object {type: "variable", name: "i"}
          else if (
            typeof countValue === "object" &&
            countValue?.type === "variable"
          ) {
            const varName = countValue.name || countValue.variableName;
            console.log(
              `      🔤 [BlocksWorkspace] Detected variable object: ${varName}`
            );
            const varBlock = blocklyWorkspace.newBlock("ottobit_variable");
            varBlock.setShadow(false); // Mark as real block, not shadow
            varBlock.initSvg();
            varBlock.render();
            try {
              varBlock.setFieldValue(varName, "VAR");
            } catch {}
            return varBlock;
          }
          return null;
        };

        // Set counts by connecting number/variable inputs or setting fields depending on block type
        try {
          if (act.count !== undefined && act.count !== null) {
            console.log(
              `    🔢 [BlocksWorkspace] Setting count for ${blockType}:`,
              act.count,
              typeof act.count
            );
            // Repeat: TIMES is an input_value (not field), need to connect number/variable block
            if (blockType === "ottobit_repeat") {
              const input = block.getInput && block.getInput("TIMES");
              if (input?.connection) {
                const countBlock = createCountBlock(act.count);
                if (countBlock?.outputConnection) {
                  input.connection.connect(countBlock.outputConnection);
                  console.log(
                    `      ✅ [BlocksWorkspace] Connected count block:`,
                    act.count
                  );
                } else {
                  console.warn(
                    `      ⚠️ [BlocksWorkspace] Failed to create count block`
                  );
                }
              } else {
                console.warn(
                  `      ⚠️ [BlocksWorkspace] TIMES input not found on repeat block`
                );
              }
            }
            // Move forward: input_value STEPS
            else if (blockType === "ottobit_move_forward") {
              const input = block.getInput && block.getInput("STEPS");
              if (input?.connection) {
                const countBlock = createCountBlock(act.count);
                if (countBlock?.outputConnection) {
                  input.connection.connect(countBlock.outputConnection);
                }
              }
            }
            // Collect blocks: input_value COUNT
            else if (
              blockType === "ottobit_collect_green" ||
              blockType === "ottobit_collect_red" ||
              blockType === "ottobit_collect_yellow"
            ) {
              console.log(
                `      📦 [BlocksWorkspace] Processing collect block with count:`,
                act.count,
                `(type: ${typeof act.count})`
              );
              const input = block.getInput && block.getInput("COUNT");
              if (input?.connection) {
                console.log(
                  `      🔌 [BlocksWorkspace] Found COUNT input, creating count block...`
                );
                const countBlock = createCountBlock(act.count);
                if (countBlock) {
                  console.log(
                    `      🎯 [BlocksWorkspace] Count block created successfully:`,
                    countBlock.type
                  );
                  if (countBlock.outputConnection) {
                    input.connection.connect(countBlock.outputConnection);
                    console.log(
                      `      ✅ [BlocksWorkspace] Connected collect count block:`,
                      act.count
                    );
                  } else {
                    console.error(
                      `      ❌ [BlocksWorkspace] Count block has no output connection!`
                    );
                  }
                } else {
                  console.error(
                    `      ❌ [BlocksWorkspace] Failed to create count block for:`,
                    act.count
                  );
                }
              } else {
                console.error(
                  `      ❌ [BlocksWorkspace] COUNT input not found on collect block!`
                );
              }
            }
          }
        } catch (err) {
          console.error(`    ❌ [BlocksWorkspace] Error setting count:`, err);
        }
        // Handle repeatRange fields: variable, from, to, step
        try {
          if (blockType === "ottobit_repeat_range") {
            console.log(
              `    🔁 [BlocksWorkspace] Setting repeatRange fields:`,
              {
                variable: act.variable,
                from: act.from,
                to: act.to,
                step: act.step,
              }
            );

            // Set variable name - VAR is an input_value, not a field
            if (act.variable !== undefined) {
              try {
                const varInput = block.getInput && block.getInput("VAR");
                if (varInput?.connection) {
                  // Create a variable block for the loop variable
                  const varBlock =
                    blocklyWorkspace.newBlock("ottobit_variable");
                  varBlock.setShadow(false); // Mark as real block, not shadow
                  varBlock.initSvg();
                  varBlock.render();
                  try {
                    varBlock.setFieldValue(String(act.variable), "VAR");
                  } catch {}
                  varInput.connection.connect(varBlock.outputConnection);
                  console.log(
                    `      ✅ [BlocksWorkspace] Set variable: ${act.variable}`
                  );
                } else {
                  console.warn(
                    `      ⚠️ [BlocksWorkspace] VAR input not found on repeat_range block`
                  );
                }
              } catch (err) {
                console.error(
                  `      ❌ [BlocksWorkspace] Error setting variable:`,
                  err
                );
              }
            }

            // Set FROM value
            if (act.from !== undefined && act.from !== null) {
              const fromInput = block.getInput && block.getInput("FROM");
              if (fromInput?.connection) {
                const fromBlock = createCountBlock(act.from);
                if (fromBlock?.outputConnection) {
                  fromInput.connection.connect(fromBlock.outputConnection);
                  console.log(
                    `      ✅ [BlocksWorkspace] Connected FROM block:`,
                    act.from
                  );
                }
              }
            }

            // Set TO value
            if (act.to !== undefined && act.to !== null) {
              console.log(
                `      🔵 [BlocksWorkspace] Setting TO value:`,
                act.to,
                `(type: ${typeof act.to})`
              );
              const toInput = block.getInput && block.getInput("TO");
              if (toInput?.connection) {
                const toBlock = createCountBlock(act.to);
                if (toBlock) {
                  console.log(
                    `      🔵 [BlocksWorkspace] TO block created:`,
                    toBlock.type
                  );
                  // Check the actual value in the number block
                  if (toBlock.type === "ottobit_number") {
                    const numField =
                      toBlock.getField && toBlock.getField("NUM");
                    if (numField) {
                      console.log(
                        `      🔵 [BlocksWorkspace] TO number block value:`,
                        numField.getValue()
                      );
                    }
                  }
                  if (toBlock.outputConnection) {
                    toInput.connection.connect(toBlock.outputConnection);
                    console.log(
                      `      ✅ [BlocksWorkspace] Connected TO block:`,
                      act.to
                    );
                  }
                }
              }
            }

            // Set BY (step) value
            if (act.step !== undefined && act.step !== null) {
              const byInput = block.getInput && block.getInput("BY");
              if (byInput?.connection) {
                const byBlock = createCountBlock(act.step);
                if (byBlock?.outputConnection) {
                  byInput.connection.connect(byBlock.outputConnection);
                  console.log(
                    `      ✅ [BlocksWorkspace] Connected BY (step) block:`,
                    act.step
                  );
                }
              }
            }
          }
        } catch (err) {
          console.error(
            `    ❌ [BlocksWorkspace] Error setting repeatRange fields:`,
            err
          );
        }
        // Set rotate direction from either explicit property or action type
        try {
          let dir: string | null = null;
          if (typeof (act as any).direction === "string") {
            dir = (act as any).direction;
          } else if (blockType === "ottobit_rotate") {
            const t = String(act?.type || "").toLowerCase();
            if (t === "turnright") dir = "RIGHT";
            else if (t === "turnleft") dir = "LEFT";
            else if (t === "turnback") dir = "BACK";
          }
          if (dir && block.setFieldValue) {
            const dirField =
              block.getField &&
              (block.getField("DIRECTION")
                ? "DIRECTION"
                : block.getField("DIR")
                ? "DIR"
                : null);
            if (dirField) block.setFieldValue(dir, dirField);
          }
        } catch {}
        // Attach condition for IF/WHILE from JSON program if provided
        const attachCondition = (targetBlock: any, cond: any) => {
          try {
            if (!cond || !targetBlock) return;

            const makeNumber = (n: any) => {
              const num = blocklyWorkspace.newBlock("ottobit_number");
              num.initSvg();
              num.render();
              try {
                num.setFieldValue(String(Number(n) || 0), "NUM");
              } catch {}
              return num;
            };

            // Helper: create variable or function block for comparison
            const makeVariableOrFunction = (varObj: any) => {
              if (varObj === null || varObj === undefined) return null;

              // If it's a simple string, treat as variable name
              if (typeof varObj === "string") {
                // Special case: "batteryCount" should use ottobit_pin_number sensor
                if (varObj.toLowerCase() === "batterycount") {
                  const pinBlock =
                    blocklyWorkspace.newBlock("ottobit_pin_number");
                  pinBlock.initSvg();
                  pinBlock.render();
                  return pinBlock;
                }

                const varBlock = blocklyWorkspace.newBlock("ottobit_variable");
                varBlock.initSvg();
                varBlock.render();
                try {
                  varBlock.setFieldValue(varObj, "VAR");
                } catch {}
                return varBlock;
              }

              // If it's a number, create number block
              if (typeof varObj === "number") {
                return makeNumber(varObj);
              }

              // If it's an object with type
              if (typeof varObj === "object" && varObj.type) {
                const varType = String(varObj.type).toLowerCase();

                // Handle function type: {type: "function", name: "warehouseCount"}
                if (varType === "function") {
                  const funcName = varObj.name || varObj.functionName;
                  // Map function names to block types
                  const funcMap: any = {
                    warehousecount: "ottobit_bale_number",
                    boxcount: "ottobit_bale_number",
                    balenumber: "ottobit_bale_number",
                    pinnumber: "ottobit_pin_number",
                    isgreen: "ottobit_is_green",
                    isred: "ottobit_is_red",
                    isyellow: "ottobit_is_yellow",
                  };
                  const key = String(funcName || "").toLowerCase();
                  const blockType = funcMap[key];

                  if (blockType) {
                    const funcBlock = blocklyWorkspace.newBlock(blockType);
                    funcBlock.initSvg();
                    funcBlock.render();
                    return funcBlock;
                  }
                }

                // Handle variable type: {type: "variable", name: "i"}
                if (varType === "variable") {
                  const varName = varObj.name || varObj.variableName;
                  const varBlock =
                    blocklyWorkspace.newBlock("ottobit_variable");
                  varBlock.initSvg();
                  varBlock.render();
                  try {
                    varBlock.setFieldValue(varName, "VAR");
                  } catch {}
                  return varBlock;
                }
              }

              // Fallback: try to convert to number
              return makeNumber(varObj);
            };

            const makeBoolean = (val: boolean) => {
              // Try ottobit_boolean first, fallback to logic_boolean
              let b: any = null;
              try {
                b = blocklyWorkspace.newBlock("ottobit_boolean");
              } catch {
                b = blocklyWorkspace.newBlock("logic_boolean");
              }
              b.initSvg();
              b.render();
              try {
                b.setFieldValue(val ? "TRUE" : "FALSE", "BOOL");
              } catch {}
              return b;
            };
            const makeSensor = (fn: string) => {
              const map: any = {
                isgreen: "ottobit_is_green",
                isred: "ottobit_is_red",
                isyellow: "ottobit_is_yellow",
              };
              const key = String(fn || "").toLowerCase();
              const t = map[key];
              if (!t) return null;
              const s = blocklyWorkspace.newBlock(t);
              s.initSvg();
              s.render();
              return s;
            };
            const connectTo = (names: string[], out: any) => {
              for (const nm of names) {
                const input = targetBlock.getInput && targetBlock.getInput(nm);
                if (input && input.connection && out && out.outputConnection) {
                  input.connection.connect(out.outputConnection);
                  return true;
                }
              }
              return false;
            };

            // Recursive helper to create condition blocks
            const createConditionBlock = (condObj: any): any => {
              if (!condObj) return null;

              const type = String(condObj?.type || "").toLowerCase();
              console.log("🔧 [createConditionBlock] Creating condition:", {
                type,
                condObj: JSON.stringify(condObj, null, 2),
              });

              // Handle AND/OR recursively
              if (type === "and" || type === "or") {
                const logicOp = blocklyWorkspace.newBlock(
                  "ottobit_logic_operation"
                );
                logicOp.initSvg();
                logicOp.render();
                try {
                  logicOp.setFieldValue(type.toUpperCase(), "OP");
                } catch {}

                const conditions = condObj.conditions || [];
                if (conditions.length >= 2) {
                  const leftInput =
                    logicOp.getInput && logicOp.getInput("LEFT");
                  const rightInput =
                    logicOp.getInput && logicOp.getInput("RIGHT");

                  if (leftInput?.connection) {
                    const leftBlock = createConditionBlock(conditions[0]);
                    if (leftBlock?.outputConnection) {
                      leftInput.connection.connect(leftBlock.outputConnection);
                    }
                  }

                  if (rightInput?.connection) {
                    const rightBlock = createConditionBlock(conditions[1]);
                    if (rightBlock?.outputConnection) {
                      rightInput.connection.connect(
                        rightBlock.outputConnection
                      );
                    }
                  }
                }

                return logicOp;
              }

              // Handle sensor conditions (isGreen, isRed, etc.)
              if (type === "condition") {
                const fn = condObj.function || condObj.functionName;
                const sensor = makeSensor(fn);
                if (sensor) {
                  // Always wrap in boolean equals to show the comparison explicitly
                  const eq = blocklyWorkspace.newBlock(
                    "ottobit_boolean_equals"
                  );
                  eq.initSvg();
                  eq.render();
                  const left = eq.getInput && eq.getInput("LEFT");
                  const right = eq.getInput && eq.getInput("RIGHT");

                  if (left?.connection) {
                    left.connection.connect(sensor.outputConnection);
                  }
                  if (right?.connection) {
                    const boolValue = condObj.check !== false; // true by default
                    right.connection.connect(
                      makeBoolean(boolValue).outputConnection
                    );
                  }

                  return eq;
                }
              }

              // Handle variable comparison (number == 2, i < 5, etc.)
              if (type === "variablecomparison") {
                const cmp = blocklyWorkspace.newBlock("ottobit_logic_compare");
                cmp.initSvg();
                cmp.render();
                try {
                  const opMap: any = {
                    "==": "EQ",
                    "!=": "NEQ",
                    "<": "LT",
                    "<=": "LTE",
                    ">": "GT",
                    ">=": "GTE",
                  };
                  const code = opMap[String(condObj.operator)];
                  if (code) cmp.setFieldValue(code, "OPERATOR");
                } catch {}

                const leftInput = cmp.getInput && cmp.getInput("LEFT");
                const rightInput = cmp.getInput && cmp.getInput("RIGHT");

                if (leftInput?.connection) {
                  const leftBlock = makeVariableOrFunction(condObj.variable);
                  if (leftBlock?.outputConnection) {
                    leftInput.connection.connect(leftBlock.outputConnection);
                  }
                }

                if (rightInput?.connection) {
                  const rightBlock = makeVariableOrFunction(condObj.value);
                  if (rightBlock?.outputConnection) {
                    rightInput.connection.connect(rightBlock.outputConnection);
                  }
                }

                return cmp;
              }

              // Handle boolean values
              if (type === "boolean") {
                return makeBoolean(condObj.value === true);
              }

              return null;
            };
            // Use the recursive helper to create the full condition tree
            const conditionBlock = createConditionBlock(cond);
            if (conditionBlock) {
              connectTo(["CONDITION", "COND", "IF0"], conditionBlock);
            }
          } catch {}
        };
        if (blockType === "ottobit_if_expandable" && act?.cond)
          attachCondition(block, act.cond);
        if (blockType === "ottobit_while" && act?.cond)
          attachCondition(block, act.cond);

        try {
          const body = Array.isArray(act.body)
            ? act.body
            : Array.isArray(act.then)
            ? act.then
            : [];
          if (body.length > 0) {
            // Pick correct statement input per block type (with fallbacks)
            let stmtInput: any = null;
            const tryInputs = (names: string[]) => {
              for (const nm of names) {
                const inp = block.getInput && block.getInput(nm);
                if (inp && inp.connection) return inp;
              }
              return null;
            };
            if (blockType === "ottobit_if_expandable") {
              stmtInput =
                tryInputs(["DO0", "DO", "STACK"]) ||
                (block.inputList || []).find(
                  (inp: any) => inp && inp.type === 3 && inp.connection
                );
            } else if (blockType === "ottobit_while") {
              stmtInput =
                tryInputs(["DO", "STACK"]) ||
                (block.inputList || []).find(
                  (inp: any) => inp && inp.type === 3 && inp.connection
                );
            } else {
              stmtInput = (block.inputList || []).find(
                (inp: any) => inp && inp.type === 3 && inp.connection
              );
            }
            if (stmtInput && stmtInput.connection) {
              let prevInner: any = null;
              body.forEach((childAct: any, childIdx: number) => {
                const childBlock = createBlockFromAction(
                  childAct,
                  index * 10 + childIdx + 1,
                  false // nested block inside repeat/if/while body
                );
                if (!childBlock) return;
                if (
                  prevInner &&
                  prevInner.nextConnection &&
                  childBlock.previousConnection &&
                  !prevInner.nextConnection.isConnected()
                ) {
                  prevInner.nextConnection.connect(
                    childBlock.previousConnection
                  );
                } else if (!prevInner && childBlock.previousConnection) {
                  stmtInput.connection.connect(childBlock.previousConnection);
                }
                prevInner = childBlock;
              });
            }
          }
        } catch {}

        // Handle ELSE IF and ELSE for IF blocks
        if (blockType === "ottobit_if_expandable") {
          // Ensure mutator inputs exist by applying mutation from JSON counts
          try {
            const elseIfLen = Array.isArray(act.elseIf) ? act.elseIf.length : 0;
            const hasElse = Array.isArray(act.else) && act.else.length > 0;
            if (elseIfLen > 0 || hasElse) {
              if (
                typeof (Blockly as any)?.utils?.xml?.textToDom === "function"
              ) {
                const mutationXmlStr = `<mutation elseif="${elseIfLen}" else="${
                  hasElse ? 1 : 0
                }"></mutation>`;
                const mutationDom = (Blockly as any).utils.xml.textToDom(
                  mutationXmlStr
                );
                if (typeof (block as any).domToMutation === "function") {
                  (block as any).domToMutation(mutationDom);
                  try {
                    block.initSvg();
                    block.render(false);
                  } catch {}
                }
              } else if (typeof (block as any).updateShape_ === "function") {
                // Fallback: set internal counts and trigger shape update
                try {
                  (block as any).elseifCount_ = elseIfLen;
                  (block as any).elseCount_ = hasElse ? 1 : 0;
                  (block as any).updateShape_();
                  block.initSvg();
                  block.render(false);
                } catch {}
              }
            }
          } catch {}
          // Define tryInputs function for ELSE IF and ELSE
          const tryInputs = (names: string[]) => {
            for (const nm of names) {
              const inp = block.getInput && block.getInput(nm);
              if (inp && inp.connection) return inp;
            }
            return null;
          };

          // Helper functions
          const makeBoolean = (value: boolean) => {
            const boolBlock = blocklyWorkspace.newBlock("ottobit_boolean");
            boolBlock.initSvg();
            boolBlock.render();
            boolBlock.moveBy(0, 0);
            if (boolBlock.getField && boolBlock.getField("BOOL")) {
              boolBlock.setFieldValue(value ? "TRUE" : "FALSE", "BOOL");
            }
            return boolBlock;
          };

          const makeNumber = (value: number) => {
            const numBlock = blocklyWorkspace.newBlock("ottobit_math_number");
            numBlock.initSvg();
            numBlock.render();
            numBlock.moveBy(0, 0);
            if (numBlock.getField && numBlock.getField("NUM")) {
              numBlock.setFieldValue(String(value), "NUM");
            }
            return numBlock;
          };

          // Helper: create variable or function block for comparison
          const makeVariableOrFunction = (varObj: any) => {
            if (varObj === null || varObj === undefined) return null;

            // If it's a simple string, treat as variable name
            if (typeof varObj === "string") {
              const varBlock = blocklyWorkspace.newBlock("ottobit_variable");
              varBlock.initSvg();
              varBlock.render();
              varBlock.moveBy(0, 0);
              try {
                varBlock.setFieldValue(varObj, "VAR");
              } catch {}
              return varBlock;
            }

            // If it's a number, create number block
            if (typeof varObj === "number") {
              return makeNumber(varObj);
            }

            // If it's an object with type
            if (typeof varObj === "object" && varObj.type) {
              const varType = String(varObj.type).toLowerCase();

              // Handle function type: {type: "function", name: "warehouseCount"}
              if (varType === "function") {
                const funcName = varObj.name || varObj.functionName;
                // Map function names to block types
                const funcMap: any = {
                  warehousecount: "ottobit_bale_number",
                  boxcount: "ottobit_bale_number",
                  balenumber: "ottobit_bale_number",
                  pinnumber: "ottobit_pin_number",
                  isgreen: "ottobit_is_green",
                  isred: "ottobit_is_red",
                  isyellow: "ottobit_is_yellow",
                };
                const key = String(funcName || "").toLowerCase();
                const blockType = funcMap[key];

                if (blockType) {
                  const funcBlock = blocklyWorkspace.newBlock(blockType);
                  funcBlock.initSvg();
                  funcBlock.render();
                  funcBlock.moveBy(0, 0);
                  return funcBlock;
                }
              }

              // Handle variable type: {type: "variable", name: "i"}
              if (varType === "variable") {
                const varName = varObj.name || varObj.variableName;
                const varBlock = blocklyWorkspace.newBlock("ottobit_variable");
                varBlock.initSvg();
                varBlock.render();
                varBlock.moveBy(0, 0);
                try {
                  varBlock.setFieldValue(varName, "VAR");
                } catch {}
                return varBlock;
              }
            }

            // Fallback: try to convert to number
            return makeNumber(varObj);
          };

          // Handle ELSE IF
          if (Array.isArray(act.elseIf) && act.elseIf.length > 0) {
            act.elseIf.forEach((elseIfItem: any, elseIfIdx: number) => {
              try {
                // Find ELSE IF input
                const elseIfInput =
                  tryInputs(["ELSEIF", "ELSE_IF", "IF1", "IF2"]) ||
                  (block.inputList || []).find(
                    (inp: any) => inp && inp.type === 3 && inp.connection
                  );

                if (elseIfInput && elseIfInput.connection) {
                  // Create condition for ELSE IF
                  if (elseIfItem.cond) {
                    const cond = elseIfItem.cond;
                    let condBlock: any = null;

                    if (cond.type === "condition") {
                      // Create sensor block
                      const sensorType = `ottobit_is_${cond.function
                        ?.replace("is", "")
                        .toLowerCase()}`;
                      const sensor = blocklyWorkspace.newBlock(sensorType);
                      sensor.initSvg();
                      sensor.render();
                      sensor.moveBy(0, 0);

                      if (cond.check === false) {
                        const eq = blocklyWorkspace.newBlock(
                          "ottobit_boolean_equals"
                        );
                        eq.initSvg();
                        eq.render();
                        const left = eq.getInput && eq.getInput("LEFT");
                        const right = eq.getInput && eq.getInput("RIGHT");
                        if (left?.connection)
                          left.connection.connect(sensor.outputConnection);
                        if (right?.connection)
                          right.connection.connect(
                            makeBoolean(false).outputConnection
                          );
                        condBlock = eq;
                      } else {
                        condBlock = sensor;
                      }
                    } else if (cond.type === "variableComparison") {
                      // Create logic compare block
                      const compare = blocklyWorkspace.newBlock(
                        "ottobit_logic_compare"
                      );
                      compare.initSvg();
                      compare.render();
                      compare.moveBy(0, 0);

                      if (compare.getField && compare.getField("OPERATOR")) {
                        compare.setFieldValue(cond.operator || "=", "OPERATOR");
                      }

                      const leftInput =
                        compare.getInput && compare.getInput("LEFT");
                      const rightInput =
                        compare.getInput && compare.getInput("RIGHT");

                      if (
                        leftInput?.connection &&
                        cond.variable !== undefined
                      ) {
                        const varBlock = makeVariableOrFunction(cond.variable);
                        if (varBlock?.outputConnection) {
                          leftInput.connection.connect(
                            varBlock.outputConnection
                          );
                        }
                      }
                      if (rightInput?.connection && cond.value !== undefined) {
                        const valBlock = makeVariableOrFunction(cond.value);
                        if (valBlock?.outputConnection) {
                          rightInput.connection.connect(
                            valBlock.outputConnection
                          );
                        }
                      }

                      condBlock = compare;
                    }

                    if (condBlock && condBlock.outputConnection) {
                      // Connect condition to ELSE IF input
                      elseIfInput.connection.connect(
                        condBlock.outputConnection
                      );
                    }
                  }

                  // Create body for ELSE IF
                  if (
                    Array.isArray(elseIfItem.then) &&
                    elseIfItem.then.length > 0
                  ) {
                    const elseIfBodyInput =
                      tryInputs(["DO1", "DO2", "ELSE_DO"]) ||
                      (block.inputList || []).find(
                        (inp: any) => inp && inp.type === 3 && inp.connection
                      );

                    if (elseIfBodyInput && elseIfBodyInput.connection) {
                      let prevElseIf: any = null;
                      elseIfItem.then.forEach(
                        (childAct: any, childIdx: number) => {
                          const childBlock = createBlockFromAction(
                            childAct,
                            index * 100 + elseIfIdx * 10 + childIdx + 1,
                            false // nested block inside ELSE IF body
                          );
                          if (!childBlock) return;
                          if (
                            prevElseIf &&
                            prevElseIf.nextConnection &&
                            childBlock.previousConnection &&
                            !prevElseIf.nextConnection.isConnected()
                          ) {
                            prevElseIf.nextConnection.connect(
                              childBlock.previousConnection
                            );
                          } else if (
                            !prevElseIf &&
                            childBlock.previousConnection
                          ) {
                            elseIfBodyInput.connection.connect(
                              childBlock.previousConnection
                            );
                          }
                          prevElseIf = childBlock;
                        }
                      );
                    }
                  }
                }
              } catch {}
            });
          }

          // Handle ELSE
          if (Array.isArray(act.else) && act.else.length > 0) {
            try {
              const elseInput =
                tryInputs(["ELSE", "ELSE_DO", "DO2"]) ||
                (block.inputList || []).find(
                  (inp: any) => inp && inp.type === 3 && inp.connection
                );

              if (elseInput && elseInput.connection) {
                let prevElse: any = null;
                act.else.forEach((childAct: any, childIdx: number) => {
                  const childBlock = createBlockFromAction(
                    childAct,
                    index * 1000 + childIdx + 1,
                    false // nested block inside ELSE body
                  );
                  if (!childBlock) return;
                  if (
                    prevElse &&
                    prevElse.nextConnection &&
                    childBlock.previousConnection &&
                    !prevElse.nextConnection.isConnected()
                  ) {
                    prevElse.nextConnection.connect(
                      childBlock.previousConnection
                    );
                  } else if (!prevElse && childBlock.previousConnection) {
                    elseInput.connection.connect(childBlock.previousConnection);
                  }
                  prevElse = childBlock;
                });
              }
            } catch {}
          }
        }

        return block;
      };

      let prev: any = startBlock as any;
      actions.forEach((act: any, idx: number) => {
        const b = createBlockFromAction(act, idx, true); // top-level action
        if (!b) return;
        try {
          if (
            prev &&
            prev.nextConnection &&
            b.previousConnection &&
            !prev.nextConnection.isConnected()
          ) {
            prev.nextConnection.connect(b.previousConnection);
          }
        } catch {}
        prev = b;
      });

      // Render function definitions if provided in initial program JSON
      try {
        const programObj = (() => {
          try {
            return typeof initialProgramActionsJson === "string"
              ? JSON.parse(initialProgramActionsJson)
              : initialProgramActionsJson;
          } catch {
            return null;
          }
        })();
        const functionsArr: any[] = Array.isArray(programObj?.functions)
          ? programObj.functions
          : [];

        const createFunctionDef = (fn: any, fnIndex: number) => {
          const name: string =
            String(fn?.name || fn?.title || `func_${fnIndex + 1}`) ||
            `func_${fnIndex + 1}`;

          // Prefer custom function block if available, fallback to standard procedures
          const typePref = ["ottobit_function_def", "procedures_defnoreturn"];
          let defBlock: any = null;
          for (const t of typePref) {
            try {
              defBlock = blocklyWorkspace.newBlock(t);
              if (defBlock) break;
            } catch {}
          }
          if (!defBlock) return null;

          defBlock.initSvg();
          defBlock.render();
          // Set function name
          try {
            const nameFieldIds = ["NAME", "FUNC_NAME", "TITLE", "NAME_FIELD"];
            for (const fid of nameFieldIds) {
              if (defBlock.getField && defBlock.getField(fid)) {
                defBlock.setFieldValue(name, fid);
                break;
              }
            }
          } catch {}

          // Connect function body
          try {
            const body: any[] = Array.isArray(fn?.body) ? fn.body : [];
            console.log(
              `  📦 [BlocksWorkspace] Function body for ${fn?.name}:`,
              {
                bodyLength: body.length,
                body: JSON.stringify(body, null, 2),
              }
            );
            if (body.length > 0) {
              // Find statement input for function body
              const stmtInput =
                (defBlock.getInput && defBlock.getInput("STACK")) ||
                (defBlock.inputList || []).find(
                  (inp: any) => inp && inp.type === 3 && inp.connection
                );
              console.log(
                `  🔌 [BlocksWorkspace] Statement input found:`,
                !!stmtInput
              );
              if (stmtInput && stmtInput.connection) {
                let prevInner: any = null;
                body.forEach((childAct: any, childIdx: number) => {
                  const childBlock = createBlockFromAction(
                    childAct,
                    10000 + fnIndex * 100 + childIdx + 1,
                    false // nested block inside function body
                  );
                  if (!childBlock) {
                    return;
                  }
                  if (
                    prevInner &&
                    prevInner.nextConnection &&
                    childBlock.previousConnection &&
                    !prevInner.nextConnection.isConnected()
                  ) {
                    prevInner.nextConnection.connect(
                      childBlock.previousConnection
                    );
                  } else if (!prevInner && childBlock.previousConnection) {
                    stmtInput.connection.connect(childBlock.previousConnection);
                  }
                  prevInner = childBlock;
                });
              }
            }
          } catch (err) {
            console.error(
              `  ❌ [BlocksWorkspace] Error rendering function body:`,
              err
            );
          }

          // Place it nicely
          try {
            defBlock.moveBy(40 + fnIndex * 40, 220 + fnIndex * 30);
          } catch {}

          try {
            defBlock.setEditable && defBlock.setEditable(true);
            defBlock.setDisabled && defBlock.setDisabled(false);
          } catch {}

          return defBlock;
        };

        functionsArr.forEach((fn, idx) => {
          try {
            createFunctionDef(fn, idx);
          } catch {}
        });
      } catch {}

      refreshBlockColors();
    } catch {}
  }, [initialProgramActionsJson, blocklyWorkspace]);

  // Update toolbox when category changes (skip in readOnly mode)
  useEffect(() => {
    if (blocklyWorkspace && !readOnly) {
      if (selectedCategory && selectedCategory !== "") {
        // Mở toolbox với category được chọn
        const newToolbox = {
          kind: "flyoutToolbox",
          contents:
            categoryBlocks[selectedCategory as keyof typeof categoryBlocks] ||
            [],
        };

        blocklyWorkspace.updateToolbox(newToolbox);

        // Force workspace to refresh
        setTimeout(() => {
          const flyout = blocklyWorkspace.getFlyout();
          if (flyout) {
            flyout.setVisible(true);
          }
          // Refresh colors cho blocks trong flyout
          refreshBlockColors();
        }, 100);
      } else {
        // Đóng toolbox
        const emptyToolbox = {
          kind: "flyoutToolbox",
          contents: [],
        };

        blocklyWorkspace.updateToolbox(emptyToolbox);

        // Ẩn flyout
        setTimeout(() => {
          const flyout = blocklyWorkspace.getFlyout();
          if (flyout) {
            flyout.setVisible(false);
          }
        }, 100);
      }
    }
  }, [selectedCategory, blocklyWorkspace, readOnly]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    selectedCategoryRef.current = categoryId;
  };

  return (
    <Box
      id="studio-blocks"
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "450px",
        position: "relative",
        display: "flex",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Custom Toolbox với UI đẹp - Hide in readOnly mode */}
      {!readOnly && (
        <Box id="studio-toolbox" sx={{ display: "flex" }}>
          <BlockToolbox onCategorySelect={handleCategorySelect} />
        </Box>
      )}

      {/* Blockly Workspace */}
      <Box
        id="studio-workspace-canvas"
        ref={workspaceRef}
        sx={{
          flex: 1,
          height: "100%",
          backgroundColor: "#ffffff",
        }}
      />
    </Box>
  );
}
