import { Box, Tooltip, IconButton } from "@mui/material";
import {
  Delete as TrashIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  generatePythonCode,
  generateJavaScriptCode,
} from "../../components/block/generators";

// Import các components con
import BlocksWorkspaceContent from "sections/studio/BlocksWorkspaceContent";
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

  return (
    <Box
      sx={{
        height: "633px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "#ffffff",
        borderRadius: "0 0 12px 12px",
        border: "1px solid #e2e8f0",
        borderTop: "none",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header with Actions */}
      <Box
        sx={{
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          bgcolor: "#f8fafc",
          p: 1,
          minHeight: 48,
        }}
      >
        {}
      </Box>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        <BlocksWorkspaceContent onWorkspaceChange={onWorkspaceChange} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <CodeContent code={pythonCode} language="python" />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <CodeContent code={jsCode} language="javascript" />
      </TabPanel>
    </Box>
  );
}
