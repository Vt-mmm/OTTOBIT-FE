import { Box } from "@mui/material";
import { useStudioWorkspace } from "../../hooks/useStudioWorkspace";
import { useCallback } from "react";
import TopBarSection from "./TopBarSection";
import BlocksWorkspaceContent from "./BlocksWorkspaceContent";
import CodeContent from "./CodeContent";

export default function StudioContainer() {
  const {
    pythonCode,
    javascriptCode,
    activeTab,
    updateWorkspace,
    handleTabChange,
  } = useStudioWorkspace();

  // Memoize callback to prevent re-creation
  const memoizedUpdateWorkspace = useCallback(updateWorkspace, [
    updateWorkspace,
  ]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "#f8fafc",
      }}
    >
      {/* Top Bar */}
      <TopBarSection activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Blockly Workspace - Always rendered but hidden/shown */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            visibility: activeTab === 0 ? "visible" : "hidden",
            zIndex: activeTab === 0 ? 1 : 0,
          }}
        >
          <BlocksWorkspaceContent onWorkspaceChange={memoizedUpdateWorkspace} />
        </Box>

        {/* Python Code View */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            visibility: activeTab === 1 ? "visible" : "hidden",
            zIndex: activeTab === 1 ? 1 : 0,
          }}
        >
          <CodeContent code={pythonCode} language="python" />
        </Box>

        {/* JavaScript Code View */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            visibility: activeTab === 2 ? "visible" : "hidden",
            zIndex: activeTab === 2 ? 1 : 0,
          }}
        >
          <CodeContent code={javascriptCode} language="javascript" />
        </Box>
      </Box>
    </Box>
  );
}
