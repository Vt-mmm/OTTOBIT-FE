import { useState } from "react";
import { Box } from "@mui/material";
import TopBarSection from "sections/studio/TopBarSection";
import LeftPanelSection from "sections/studio/LeftPanelSection";
import SimulatorStageSection from "sections/studio/SimulatorStageSection";
import { PhaserProvider } from "../../features/phaser";
import LevelSelector from "../../features/phaser/components/LevelSelector";
import {
  levelConfigService,
  Level,
} from "../../features/phaser/services/levelConfigService";

const RobotStudioPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [workspace, setWorkspace] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [showLevelSelector, setShowLevelSelector] = useState(true);

  const levels = levelConfigService.getAllLevels();

  const handleLevelSelect = (level: Level) => {
    setSelectedLevel(level);
    setShowLevelSelector(false);
  };

  const handleBackToLevels = () => {
    setSelectedLevel(null);
    setShowLevelSelector(true);
  };

  // Show level selector if no level is selected
  if (showLevelSelector) {
    return (
      <PhaserProvider>
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            bgcolor: "#ffffff",
          }}
        >
          <TopBarSection
            activeTab={activeTab}
            onTabChange={setActiveTab}
            workspace={workspace}
          />
          <LevelSelector levels={levels} onLevelSelect={handleLevelSelect} />
        </Box>
      </PhaserProvider>
    );
  }

  return (
    <PhaserProvider>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#ffffff", // Pure white background
        }}
      >
        {/* Top Bar - Fixed height */}
        <TopBarSection
          activeTab={activeTab}
          onTabChange={setActiveTab}
          workspace={workspace}
        />

        {/* Main Content Area - Split into 2 columns */}
        <Box
          sx={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "900px 1fr", // Thu hẹp cột trái để workspace không quá rộng
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
          <SimulatorStageSection workspace={workspace} />
        </Box>
      </Box>
    </PhaserProvider>
  );
};

export default RobotStudioPage;
