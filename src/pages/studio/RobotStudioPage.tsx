import { useState } from "react";
import { Box } from "@mui/material";
import TopBarSection from "sections/studio/TopBarSection";
import LeftPanelSection from "sections/studio/LeftPanelSection";
import SimulatorStageSection from "sections/studio/SimulatorStageSection";

const RobotStudioPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [workspace, setWorkspace] = useState<any>(null);
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f1f5f9",
      }}
    >
      {/* Top Bar - Fixed height */}
      <TopBarSection activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area - Split into 2 columns */}
      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1049px 1fr",
          gap: 2,
          pl: 0,
          pr: 2,
          pt: 0,
          pb: 2,
          overflow: "hidden",
        }}
      >
        {/* Left Panel - Content based on active tab */}
        <LeftPanelSection
          activeTab={activeTab}
          workspace={workspace}
          onWorkspaceChange={setWorkspace}
        />

        {/* Right Panel - Robot Simulator */}
        <SimulatorStageSection />
      </Box>
    </Box>
  );
};

export default RobotStudioPage;
