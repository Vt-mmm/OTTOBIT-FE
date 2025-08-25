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
  const blocklyWorkspaceRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const lastCallbackRef = useRef<typeof onWorkspaceChange>();

  // Effect to handle workspace resizing when becoming visible
  useEffect(() => {
    const handleResize = () => {
      if (blocklyWorkspaceRef.current) {
        // Use setTimeout to ensure DOM is fully updated
        setTimeout(() => {
          try {
            Blockly.svgResize(blocklyWorkspaceRef.current);
          } catch (error) {
            console.warn("Error resizing Blockly workspace:", error);
          }
        }, 100);
      }
    };

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    // Also create a mutation observer to watch for visibility changes
    let observer: MutationObserver | null = null;
    if (workspaceRef.current) {
      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const target = mutation.target as HTMLElement;
            const isVisible = target.style.visibility !== 'hidden' && 
                            target.offsetParent !== null;
            if (isVisible && blocklyWorkspaceRef.current) {
              handleResize();
            }
          }
        });
      });
      
      // Watch for style changes on parent containers
      let element = workspaceRef.current.parentElement;
      while (element) {
        observer.observe(element, { 
          attributes: true, 
          attributeFilter: ['style', 'class'] 
        });
        element = element.parentElement;
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (workspaceRef.current && !isInitializedRef.current) {
      // Mark as initialized to prevent re-initialization
      isInitializedRef.current = true;

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
              contents: [
                { kind: "block", type: "collect" },
                { kind: "block", type: "collect_green" },
              ],
            },
            {
              kind: "category",
              name: "📡 Sensors",
              categorystyle: "sensor_category",
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

      // Store workspace reference
      blocklyWorkspaceRef.current = blocklyWorkspace;
      
      // Notify parent component immediately
      console.log("Initial workspace creation with blocks:", blocklyWorkspace.getAllBlocks().length);
      if (onWorkspaceChange) {
        lastCallbackRef.current = onWorkspaceChange;
        onWorkspaceChange(blocklyWorkspace);
      }

      return () => {
        console.log("Disposing workspace");
        if (blocklyWorkspaceRef.current) {
          blocklyWorkspaceRef.current.dispose();
          blocklyWorkspaceRef.current = null;
        }
        isInitializedRef.current = false;
      };
    }
  }, []); // Empty dependency array to only run once

  // Separate effect for workspace change callback updates
  useEffect(() => {
    // Only call if callback changed and we have a workspace, but don't call on initial render
    if (blocklyWorkspaceRef.current && onWorkspaceChange && onWorkspaceChange !== lastCallbackRef.current) {
      console.log("Callback changed, notifying with blocks:", blocklyWorkspaceRef.current.getAllBlocks().length);
      lastCallbackRef.current = onWorkspaceChange;
      onWorkspaceChange(blocklyWorkspaceRef.current);
    }
  }, [onWorkspaceChange]);

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
