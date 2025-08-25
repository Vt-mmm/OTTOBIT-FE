import { useState, useCallback, useRef, useEffect } from "react";
import {
  generatePythonCode,
  generateJavaScriptCode,
} from "../components/block/generators";

export interface StudioWorkspaceState {
  workspace: any;
  pythonCode: string;
  javascriptCode: string;
  activeTab: number;
}

export const useStudioWorkspace = () => {
  const [workspace, setWorkspace] = useState<any>(null);
  const [pythonCode, setPythonCode] = useState<string>(
    "# No blocks in workspace\n# Drag blocks from the toolbox to create your program"
  );
  const [javascriptCode, setJavaScriptCode] = useState<string>(
    "// No blocks in workspace\n// Drag blocks from the toolbox to create your program"
  );
  const [activeTab, setActiveTab] = useState<number>(0);

  // Use ref to store timeout for debouncing and workspace reference
  const timeoutRef = useRef<NodeJS.Timeout>();
  const workspaceRef = useRef<any>(null);
  const isUpdatingRef = useRef(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Stable updateWorkspace function
  const updateWorkspace = useCallback((newWorkspace: any) => {
    console.log("updateWorkspace called with:", newWorkspace ? "workspace object" : "null");
    
    // Prevent recursive updates
    if (isUpdatingRef.current) {
      console.log("Update in progress, skipping");
      return;
    }
    
    // Only update if workspace actually changed
    if (workspaceRef.current === newWorkspace) {
      console.log("Workspace unchanged, skipping update");
      return;
    }

    isUpdatingRef.current = true;

    // Store workspace reference
    const previousWorkspace = workspaceRef.current;
    workspaceRef.current = newWorkspace;
    setWorkspace(newWorkspace);

    if (newWorkspace) {
      const currentBlocks = newWorkspace.getAllBlocks().length;
      console.log("Setting up new workspace with blocks:", currentBlocks);
      
      // If we had a previous workspace and current has no blocks, 
      // it might be a reset - let's skip this update
      if (previousWorkspace && currentBlocks === 0 && previousWorkspace.getAllBlocks().length > 0) {
        console.log("Potential workspace reset detected, restoring previous workspace");
        workspaceRef.current = previousWorkspace;
        setWorkspace(previousWorkspace);
        isUpdatingRef.current = false;
        return;
      }
      
      // Function to update code with debouncing
      const updateCode = () => {
        // Clear previous timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Set new timeout for debouncing
        timeoutRef.current = setTimeout(() => {
          try {
            const currentWorkspace = workspaceRef.current;
            const blockCount = currentWorkspace.getAllBlocks().length;
            console.log("Generating code for", blockCount, "blocks");
            
            const newPythonCode = generatePythonCode(currentWorkspace);
            const newJavaScriptCode = generateJavaScriptCode(currentWorkspace);

            setPythonCode(newPythonCode);
            setJavaScriptCode(newJavaScriptCode);
            
            isUpdatingRef.current = false;
          } catch (error) {
            console.error("Error generating code:", error);
            setPythonCode(
              "# Error generating Python code\n# Please check your blocks"
            );
            setJavaScriptCode(
              "// Error generating JavaScript code\n// Please check your blocks"
            );
            isUpdatingRef.current = false;
          }
        }, 300); // 300ms debounce
      };

      // Update code immediately for first time
      updateCode();

      // Remove any existing change listeners to avoid duplicates
      if (newWorkspace.changeListeners_) {
        newWorkspace.changeListeners_ = newWorkspace.changeListeners_.filter(
          (listener: any) => !listener.isStudioWorkspaceListener
        );
      }

      // Listen for workspace changes
      const changeListener = (event: any) => {
        // Only update code for relevant events
        if (
          event.type === "create" ||
          event.type === "delete" ||
          event.type === "change" ||
          event.type === "move"
        ) {
          updateCode();
        }
      };
      
      // Mark the listener so we can identify it later
      changeListener.isStudioWorkspaceListener = true;
      newWorkspace.addChangeListener(changeListener);
    } else {
      isUpdatingRef.current = false;
    }
  }, []);

  const handleTabChange = useCallback((tab: number) => {
    setActiveTab(tab);
    
    // Force update code when switching to code tabs
    if ((tab === 1 || tab === 2) && workspaceRef.current) {
      try {
        const newPythonCode = generatePythonCode(workspaceRef.current);
        const newJavaScriptCode = generateJavaScriptCode(workspaceRef.current);
        
        setPythonCode(newPythonCode);
        setJavaScriptCode(newJavaScriptCode);
      } catch (error) {
        console.error("Error generating code on tab change:", error);
      }
    }
    
    // Force resize Blockly workspace when switching back to Blockly tab
    if (tab === 0 && workspaceRef.current) {
      setTimeout(() => {
        try {
          // Import Blockly dynamically to avoid SSR issues
          import('blockly').then((Blockly) => {
            if (workspaceRef.current) {
              Blockly.svgResize(workspaceRef.current);
            }
          });
        } catch (error) {
          console.warn("Error resizing workspace:", error);
        }
      }, 150);
    }
  }, []);

  // Force refresh code function
  const refreshCode = useCallback(() => {
    if (workspaceRef.current) {
      try {
        const newPythonCode = generatePythonCode(workspaceRef.current);
        const newJavaScriptCode = generateJavaScriptCode(workspaceRef.current);
        
        setPythonCode(newPythonCode);
        setJavaScriptCode(newJavaScriptCode);
      } catch (error) {
        console.error("Error refreshing code:", error);
      }
    }
  }, []);

  return {
    workspace,
    pythonCode,
    javascriptCode,
    activeTab,
    updateWorkspace,
    handleTabChange,
    refreshCode,
  };
};
