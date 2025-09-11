import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import * as Blockly from "blockly/core";
import { registerottobitBlocks } from "../../components/block";
import { CustomBlocklyRenderer } from "./customBlocklyRenderer";
import { ThemeOttobit } from "../../theme/block/theme-ottobit";
import {
  injectOttobitkFieldStyles,
  refreshBlockColors,
} from "../../theme/block/renderer-ottobit";
import BlockToolbox from "../../components/block/BlockToolbox";

interface BlocksWorkspaceProps {
  onWorkspaceChange?: (workspace: any) => void;
}

export default function BlocksWorkspace({
  onWorkspaceChange,
}: BlocksWorkspaceProps) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [blocklyWorkspace, setBlocklyWorkspace] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

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
    ],
    conditions: [
      { kind: "block", type: "ottobit_while" },
      { kind: "block", type: "ottobit_if" },
      { kind: "block", type: "ottobit_variable_i" },
    ],
    sensors: [
      { kind: "block", type: "ottobit_read_sensor" },
      { kind: "block", type: "ottobit_comparison" },
    ],
    actions: [
      { kind: "block", type: "ottobit_collect_green" },
      { kind: "block", type: "ottobit_collect_red" },
      { kind: "block", type: "ottobit_collect_yellow" },
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

      // Initialize Blockly workspace with flyout toolbox (empty initially)
      const workspace = Blockly.inject(workspaceRef.current, {
        toolbox: {
          kind: "flyoutToolbox",
          contents: [], // Bắt đầu với toolbox rỗng
        },
        grid: {
          spacing: 25,
          length: 1,
          colour: "rgba(200,200,200,0.1)",
          snap: true,
        },
        zoom: {
          controls: false,
          wheel: false,
          startScale: 1.0,
          maxScale: 1.0,
          minScale: 1.0,
          scaleSpeed: 1.0,
        },
        move: {
          scrollbars: {
            horizontal: true,
            vertical: true,
          },
          drag: true,
          wheel: false,
        },
        trashcan: true,
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

      // Force refresh block colors để đảm bảo hiển thị đúng
      refreshBlockColors();

      // Thêm block "ottobit_start" vào workspace ngay khi khởi tạo
      setTimeout(() => {
        const startBlock = workspace.newBlock("ottobit_start");
        startBlock.initSvg();
        startBlock.render();
        startBlock.moveBy(50, 50); // Đặt vị trí cách top-left 50px

        // Refresh colors sau khi thêm block
        refreshBlockColors();
      }, 50);

      // Style workspace with pure white background
      setTimeout(() => {
        const workspaceEl = document.querySelector(
          ".blocklyWorkspace"
        ) as HTMLElement;
        if (workspaceEl) {
          workspaceEl.style.backgroundColor = "#ffffff";
          workspaceEl.style.backgroundImage = "none";
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
        }
      }, 500);
    }

    return () => {
      if (blocklyWorkspace) {
        blocklyWorkspace.dispose();
      }
      // Cleanup event listeners
      if (workspaceRef.current) {
        workspaceRef.current.removeEventListener("mouseup", () => {});
      }
    };
  }, []);

  // Update toolbox when category changes
  useEffect(() => {
    if (blocklyWorkspace) {
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
  }, [selectedCategory, blocklyWorkspace]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Custom Toolbox với UI đẹp */}
      <BlockToolbox onCategorySelect={handleCategorySelect} />

      {/* Blockly Workspace */}
      <Box
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
