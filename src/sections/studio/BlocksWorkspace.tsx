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
      { kind: "block", type: "ottobit_if_expandable" },
      { kind: "block", type: "ottobit_variable_i" },
      { kind: "block", type: "ottobit_number" },
    ],
    logic: [
      { kind: "block", type: "ottobit_boolean" },
      { kind: "block", type: "ottobit_logic_operation" },
      { kind: "block", type: "ottobit_comparison" },
      { kind: "block", type: "ottobit_bale_number" },
    ],
    actions: [
      { kind: "block", type: "ottobit_collect_green" },
      { kind: "block", type: "ottobit_collect_red" },
      { kind: "block", type: "ottobit_collect_yellow" },
      { kind: "block", type: "ottobit_take_bale" },
      { kind: "block", type: "ottobit_put_bale" },
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

      // Add responsive resize handler
      const handleResize = () => {
        const newScreenWidth = window.innerWidth;
        
        // Update flyout width on resize
        const flyoutBg = document.querySelector(".blocklyFlyoutBackground") as HTMLElement;
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
        const blocks = document.querySelectorAll(".blocklyFlyout .blocklyDraggable");
        blocks.forEach(block => {
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
      
      window.addEventListener('resize', handleResize);

      // Thêm block "ottobit_start" vào workspace ngay khi khởi tạo
      setTimeout(() => {
        const startBlock = workspace.newBlock("ottobit_start");
        startBlock.initSvg();
        startBlock.render();
        const moveDistance = isMobile ? 30 : 50; // Smaller move distance on mobile
        startBlock.moveBy(moveDistance, moveDistance);

        // Refresh colors sau khi thêm block
        refreshBlockColors();
      }, 50);

      // Style workspace with pure white background và sửa lỗi tràn
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
        const blocks = document.querySelectorAll(".blocklyFlyout .blocklyDraggable");
        blocks.forEach(block => {
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
    }

    return () => {
      if (blocklyWorkspace) {
        blocklyWorkspace.dispose();
      }
      // Cleanup event listeners
      if (workspaceRef.current) {
        workspaceRef.current.removeEventListener("mouseup", () => {});
      }
      // Remove resize event listener
      window.removeEventListener('resize', () => {});
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
