import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import * as Blockly from "blockly";
import {
  defineBlocks,
  definePythonGenerators,
  defineJavaScriptGenerators,
} from "../../components/block";
import { CustomBlocklyRenderer } from "./customBlocklyRenderer";
import { ThemeOttobit } from "../../theme/block/theme-ottobit";
// Import to register the renderer
import "./customBlocklyRenderer";
// Import CSS styles
import "../../theme/block/style.css";

interface BlocksWorkspaceContentProps {
  onWorkspaceChange?: (workspace: any) => void;
}

export default function BlocksWorkspaceContent({
  onWorkspaceChange,
}: BlocksWorkspaceContentProps) {
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (workspaceRef.current) {
      // Register custom Ottobit renderer
      new CustomBlocklyRenderer();

      // Force clear any existing blocks first
      Object.keys(Blockly.Blocks).forEach((key) => {
        if (
          key.startsWith("start") ||
          key.startsWith("move_") ||
          key.startsWith("turn_") ||
          key.startsWith("rotate") ||
          key.startsWith("stop") ||
          key.startsWith("repeat") ||
          key.startsWith("if_") ||
          key.startsWith("wait") ||
          key.startsWith("collect") ||
          key.startsWith("read_")
        ) {
          delete Blockly.Blocks[key];
        }
      });

      // Define custom blocks
      defineBlocks();

      // Initialize generators
      definePythonGenerators();
      defineJavaScriptGenerators();

      // Initialize Blockly workspace với toolbox thực tế
      const blocklyWorkspace = Blockly.inject(workspaceRef.current, {
        toolbox: {
          kind: "categoryToolbox",
          contents: [
            {
              kind: "category",
              name: "🚗 Car",
              categorystyle: "car_category",
              colour: "#5C9DFF",
              contents: [
                { kind: "block", type: "start" },
                { kind: "block", type: "move_forward" },
                { kind: "block", type: "move_backward" },
                { kind: "block", type: "turn_left" },
                { kind: "block", type: "turn_right" },
                { kind: "block", type: "rotate" },
                { kind: "block", type: "stop" },
              ],
            },
            {
              kind: "category",
              name: "🔄 Control",
              categorystyle: "control_category",
              colour: "#10B981",
              contents: [
                { kind: "block", type: "repeat" },
                { kind: "block", type: "if_else" },
                { kind: "block", type: "wait" },
              ],
            },
            {
              kind: "category",
              name: "⚡ Actions",
              categorystyle: "action_category",
              colour: "#8E44AD",
              contents: [
                { kind: "block", type: "collect" },
                { kind: "block", type: "collect_green" },
              ],
            },
            {
              kind: "category",
              name: "📡 Sensors",
              categorystyle: "sensor_category",
              colour: "#F59E0B",
              contents: [{ kind: "block", type: "read_sensor" }],
            },
          ],
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

      onWorkspaceChange?.(blocklyWorkspace);

      return () => {
        blocklyWorkspace.dispose();
      };
    }
  }, []);

  return (
    <Box
      ref={workspaceRef}
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    />
  );
}
