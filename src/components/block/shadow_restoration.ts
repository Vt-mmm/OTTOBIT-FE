import * as Blockly from "blockly/core";

/**
 * Helper function to restore shadow blocks for repeat_range after block is created/pasted
 */
export function setupShadowBlockRestoration(workspace: any) {
  if (!workspace) return;
  
  // Helper to restore shadow blocks for repeat_range
  const restoreRepeatRangeShadows = (block: any) => {
    if (!block || block.type !== "ottobit_repeat_range") return;
    if (!block.workspace) return;
    
    // Use minimal setTimeout to ensure block is fully initialized
    // Reduce from 50ms to 0ms to minimize UI flicker
    setTimeout(() => {
      try {
        console.log("[Shadow Restoration] Restoring shadows for repeat_range:", block.id);
        
        // Helper to restore shadow on an input
        const restoreShadow = (input: any, blockType: string, fieldName: string, value: any) => {
          if (!input?.connection) {
            console.log(`[Shadow Restoration] No connection for input`);
            return;
          }
          
          const existingBlock = input.connection.targetBlock();
          console.log(`[Shadow Restoration] Existing block:`, existingBlock?.type, "isShadow:", existingBlock?.isShadow());
          
          // ALWAYS dispose and recreate shadow blocks to ensure proper rendering
          // This fixes the issue where shadows exist but don't display
          if (existingBlock) {
            console.log(`[Shadow Restoration] Disposing existing block:`, existingBlock.type, "isShadow:", existingBlock.isShadow());
            // Unplug first to avoid connection issues
            if (input.connection.targetConnection) {
              input.connection.disconnect();
            }
            existingBlock.dispose(true); // Heal connections
          }
          
          // Create new shadow block
          const shadowBlock = block.workspace.newBlock(blockType);
          shadowBlock.setShadow(true);
          try { 
            shadowBlock.setFieldValue(value, fieldName); 
            console.log(`[Shadow Restoration] Created shadow block with value:`, value);
          } catch (e) {
            console.warn(`[Shadow Restoration] Failed to set field value:`, e);
          }
          shadowBlock.initSvg();
          shadowBlock.render();
          input.connection.connect(shadowBlock.outputConnection);
        };
        
        // VAR: default ottobit_variable with i
        const varInput = block.getInput("VAR");
        restoreShadow(varInput, "ottobit_variable", "VAR", "i");
        
        // FROM: default number 1
        const fromInput = block.getInput("FROM");
        restoreShadow(fromInput, "ottobit_number", "NUM", 1);
        
        // TO: default number 5
        const toInput = block.getInput("TO");
        restoreShadow(toInput, "ottobit_number", "NUM", 5);
        
        // BY: default number 1
        const byInput = block.getInput("BY");
        restoreShadow(byInput, "ottobit_number", "NUM", 1);
        
        // Force re-render WITHOUT animations to prevent flicker
        console.log("[Shadow Restoration] Force re-rendering block (no animation)");
        block.render(false); // Render without animations
      } catch (e) {
        console.warn("[Shadow Restoration] Failed to restore repeat_range shadows:", e);
      }
    }, 0); // Minimal timeout - run on next tick
  };
  
  // Track if we're currently restoring to batch operations
  let isRestoring = false;
  
  // Listen to block create and finish loading events (including paste)
  workspace.addChangeListener((event: any) => {
    if (event.type === Blockly.Events.BLOCK_CREATE) {
      const block = workspace.getBlockById(event.blockId);
      if (block && block.type === "ottobit_repeat_range") {
        console.log("[Shadow Restoration] BLOCK_CREATE event for repeat_range");
        
        // Disable events temporarily to prevent flicker
        if (!isRestoring) {
          isRestoring = true;
          Blockly.Events.disable();
        }
        
        restoreRepeatRangeShadows(block);
        
        // Re-enable events after a short delay
        setTimeout(() => {
          if (isRestoring) {
            Blockly.Events.enable();
            isRestoring = false;
            workspace.render();
          }
        }, 10);
      }
    }
    
    // Handle FINISHED_LOADING event (triggered after paste completes)
    if (event.type === Blockly.Events.FINISHED_LOADING) {
      console.log("[Shadow Restoration] FINISHED_LOADING event");
      // Check all repeat_range blocks in workspace
      const allBlocks = workspace.getAllBlocks(false);
      allBlocks.forEach((block: any) => {
        if (block.type === "ottobit_repeat_range") {
          // Check if any inputs are empty and restore shadows
          const hasEmptyInputs = ["VAR", "FROM", "TO", "BY"].some((inputName) => {
            const input = block.getInput(inputName);
            return input?.connection && !input.connection.targetBlock();
          });
          
          if (hasEmptyInputs) {
            restoreRepeatRangeShadows(block);
          }
        }
      });
    }
    
    // Also handle BLOCK_CHANGE event for when block is finished loading
    if (event.type === Blockly.Events.BLOCK_CHANGE) {
      const block = workspace.getBlockById(event.blockId);
      if (block && block.type === "ottobit_repeat_range") {
        // Check if any inputs are empty and restore shadows
        const hasEmptyInputs = ["VAR", "FROM", "TO", "BY"].some((inputName) => {
          const input = block.getInput(inputName);
          return input?.connection && !input.connection.targetBlock();
        });
        
        if (hasEmptyInputs) {
          restoreRepeatRangeShadows(block);
        }
      }
    }
  });
}
