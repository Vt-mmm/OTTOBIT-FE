import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import * as Blockly from "blockly";
import {
  defineBlocks,
  definePythonGenerators,
  defineJavaScriptGenerators,
} from "../../components/block";
import { CustomBlocklyRenderer } from "./customBlocklyRenderer";
import { ThemeOttobit } from "../../theme/block/theme-ottobit";
import BlockToolbox from "../../components/block/BlockToolbox";
// Import to register the renderer
import "./customBlocklyRenderer";
// Import CSS styles
import "../../theme/block/style.css";

interface BlocksWorkspaceProps {
  onWorkspaceChange?: (workspace: any) => void;
}

export default function BlocksWorkspace({
  onWorkspaceChange,
}: BlocksWorkspaceProps) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [blocklyWorkspace, setBlocklyWorkspace] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Bắt đầu với toolbox đóng

  // Category blocks mapping
  const categoryBlocks = {
    car: [
      { kind: "block", type: "start" },
      { kind: "block", type: "move_forward" },
      { kind: "block", type: "rotate" },
      { kind: "block", type: "collect" },
      { kind: "block", type: "collect_green" },
    ],
    control: [
      { kind: "block", type: "repeat" },
      { kind: "block", type: "repeat_range" },
      { kind: "block", type: "if" },
      { kind: "block", type: "comparison" },
    ],
    actions: [
      { kind: "block", type: "collect" },
      { kind: "block", type: "collect_green" },
    ],
    sensors: [
      { kind: "block", type: "read_sensor" }
    ],
    loops: [
      { kind: "block", type: "repeat_forever" },
      { kind: "block", type: "repeat_times" },
    ],
    functions: [
      { kind: "block", type: "function_def" },
      { kind: "block", type: "function_call" },
    ]
  };

  // Initialize workspace
  useEffect(() => {
    if (workspaceRef.current && !blocklyWorkspace) {
      // Register custom Ottobit renderer
      new CustomBlocklyRenderer();

      // Define custom blocks
      defineBlocks();
      definePythonGenerators();
      defineJavaScriptGenerators();

      // Initialize Blockly workspace with flyout only
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
      });

      setBlocklyWorkspace(workspace);
      onWorkspaceChange?.(workspace);

      // Thêm block "start" vào workspace ngay khi khởi tạo
      setTimeout(() => {
        const startBlock = workspace.newBlock('start');
        startBlock.initSvg();
        startBlock.render();
        startBlock.moveBy(50, 50); // Đặt vị trí cách top-left 50px
      }, 100);

      // Style workspace with pure white background
      setTimeout(() => {
        const workspaceEl = document.querySelector('.blocklyWorkspace') as HTMLElement;
        if (workspaceEl) {
          workspaceEl.style.backgroundColor = '#ffffff';
          workspaceEl.style.backgroundImage = 'none';
        }
        
        const mainBackground = document.querySelector('.blocklyMainBackground') as HTMLElement;
        if (mainBackground) {
          mainBackground.style.stroke = 'none';
          mainBackground.style.fill = '#ffffff';
        }
        
        const flyoutBg = document.querySelector('.blocklyFlyoutBackground') as HTMLElement;
        if (flyoutBg) {
          flyoutBg.style.fill = '#ffffff';
          flyoutBg.style.fillOpacity = '1';
        }
      }, 500);
    }

    return () => {
      if (blocklyWorkspace) {
        blocklyWorkspace.dispose();
      }
    };
  }, []);

  // Update toolbox when category changes
  useEffect(() => {
    if (blocklyWorkspace) {
      if (selectedCategory && selectedCategory !== '') {
        // Mở toolbox với category được chọn
        const newToolbox = {
          kind: "flyoutToolbox",
          contents: categoryBlocks[selectedCategory as keyof typeof categoryBlocks] || [],
        };
        
        blocklyWorkspace.updateToolbox(newToolbox);
        
        // Force workspace to refresh
        setTimeout(() => {
          const flyout = blocklyWorkspace.getFlyout();
          if (flyout) {
            flyout.setVisible(true);
          }
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
    console.log('Category selected:', categoryId); // Debug log
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
      {/* Custom TypeScript Toolbox */}
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
};
