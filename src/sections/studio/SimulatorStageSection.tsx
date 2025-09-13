import { Box } from "@mui/material";
import { PhaserSimulator } from "../../features/phaser";

interface SimulatorStageSectionProps {
  workspace?: any;
}

export default function SimulatorStageSection({
  // workspace parameter removed as it's unused
}: SimulatorStageSectionProps) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f9fa", // Light background để phân biệt với workspace
        border: "2px solid #e9ecef", // Border để tạo khung rõ ràng
        borderRadius: 2, // Bo góc nhẹ
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Simulator Header */}
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
          🎮 Robot Simulator
        </Box>
      </Box>

      {/* Phaser Simulator Container */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          position: "relative",
          backgroundColor: "#f8f9fa", // Match outer container background
          display: "flex",
          flexDirection: "column",
          minHeight: "300px",
          // Remove padding to maximize space
          p: 0,
        }}
      >
        {/* Full-width simulator - Fully responsive */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            position: "relative",
            overflow: "hidden",
            backgroundColor: "#f8f9fa", // Match background to eliminate black areas
            flex: 1,
            // Ensure minimum size for mobile
            minWidth: { xs: "280px", sm: "320px" },
            minHeight: { xs: "180px", sm: "240px" },
            // Mobile optimizations
            "@media (max-width: 768px)": {
              minHeight: "200px",
            },
            "@media (max-width: 480px)": {
              minHeight: "160px",
            },
          }}
        >
          <PhaserSimulator />
        </Box>
      </Box>
    </Box>
  );
}
