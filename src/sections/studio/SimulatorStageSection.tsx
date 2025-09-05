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
        gap: 1,
        p: 1,
      }}
    >
      {/* Phaser Simulator */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0, // Important for flex child to shrink
        }}
      >
        <PhaserSimulator />
      </Box>

      {/* Control Panel */}
      <Box sx={{ height: "auto", maxHeight: 120 }}>
        <PhaserControlPanel workspace={workspace} />
      </Box>
    </Box>
  );
}
