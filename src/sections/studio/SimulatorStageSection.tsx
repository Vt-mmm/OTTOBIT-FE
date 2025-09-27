import { Box } from "@mui/material";
import { PhaserSimulator } from "../../features/phaser";

interface SimulatorStageSectionProps {
  workspace?: any;
}

export default function SimulatorStageSection({}: // workspace parameter removed as it's unused
SimulatorStageSectionProps) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        border: "1px solid #e9ecef",
        borderRadius: 1,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Simplified Phaser Simulator Container */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          minHeight: 0,
          position: "relative",
          backgroundColor: "#f8f9fa",
          overflow: "hidden",
        }}
      >
        <PhaserSimulator />
      </Box>
    </Box>
  );
}
