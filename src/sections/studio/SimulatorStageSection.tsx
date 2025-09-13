import { Box } from "@mui/material";
import { PhaserSimulator, PhaserControlPanel } from "../../features/phaser";

interface SimulatorStageSectionProps {
  workspace?: any;
}

export default function SimulatorStageSection({
  workspace,
}: SimulatorStageSectionProps) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 0.5, sm: 1 }, // Smaller gap on mobile
        p: { xs: 0.5, sm: 1 }, // Smaller padding on mobile
        minHeight: 0,
        // Mobile-specific adjustments
        "@media (max-width: 900px)": {
          height: "100%",
          minHeight: "300px",
        },
      }}
    >
      {/* Phaser Simulator - Match Phaser's 1400x800 ratio (7:4) */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: { md: "1400px" }, // Don't exceed Phaser's native width
          position: "relative",
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "#242424", // Match Phaser default background
          // Maintain Phaser's aspect ratio: 1400:800 = 1.75:1
          aspectRatio: {
            xs: "1.5/1", // Mobile: slightly more square
            sm: "1.6/1", // Tablet: closer to desktop
            md: "1.75/1", // Desktop: exact Phaser ratio
          },
          // Center the simulator when max-width is applied
          mx: "auto",
          "& iframe": {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }
        }}
      >
        <PhaserSimulator />
      </Box>

      {/* Control Panel - Mobile Optimized */}
      <Box 
        sx={{ 
          height: "auto", 
          maxHeight: { xs: 80, sm: 100, md: 120 }, // Smaller on mobile
          minHeight: { xs: 50, sm: 60 }, // Smaller minimum on mobile
          flexShrink: 0,
          // Hide on very small screens if needed
          display: { xs: "block", sm: "block" },
        }}
      >
        <PhaserControlPanel workspace={workspace} />
      </Box>
    </Box>
  );
}
