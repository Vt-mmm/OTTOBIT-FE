import { Box } from "@mui/material";
import {
  generatePythonCode,
  generateJavaScriptCode,
} from "../../components/block";

// Import các components con
import BlocksWorkspace from "sections/studio/BlocksWorkspace";
import CodeContent from "sections/studio/CodeContent";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      id={`left-panel-tabpanel-${index}`}
      aria-labelledby={`left-panel-tab-${index}`}
      {...other}
      style={{
        height: "100%",
        flex: 1,
        overflow: "hidden",
        display: value === index ? "block" : "none",
      }}
    >
      <div style={{ height: "100%" }}>{children}</div>
    </div>
  );
}

interface LeftPanelSectionProps {
  activeTab: number;
  workspace?: any; // Blockly workspace
  onWorkspaceChange?: (workspace: any) => void;
}

export default function LeftPanelSection({
  activeTab,
  workspace,
  onWorkspaceChange,
}: LeftPanelSectionProps) {
  // Code samples - use imported functions
  const pythonCode = generatePythonCode(workspace);
  const jsCode = generateJavaScriptCode(workspace);

  // Get tab names for header
  const tabNames = ["Blocks Workspace", "Python Code", "JavaScript Code"];

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f9fa", // Light background to differentiate from simulator
        border: "2px solid #e9ecef", // Border to create clear frame
        borderRadius: 2, // Subtle rounded corners
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Workspace Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #dee2e6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 48,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "#495057",
            fontWeight: 600,
            fontSize: "0.95rem",
          }}
        >
           {tabNames[activeTab]}
        </Box>
      </Box>

      {/* Workspace Content Container */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: "#ffffff", // White content area
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Tab Content */}
        <TabPanel value={activeTab} index={0}>
          <BlocksWorkspace onWorkspaceChange={onWorkspaceChange} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <CodeContent code={pythonCode} language="python" />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <CodeContent code={jsCode} language="javascript" />
        </TabPanel>
      </Box>
    </Box>
  );
}
