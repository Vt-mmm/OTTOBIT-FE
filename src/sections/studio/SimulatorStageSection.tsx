import { Box, Typography } from "@mui/material";

export default function SimulatorStageSection() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: "#94a3b8",
          fontSize: "18px",
          fontWeight: 500,
          mb: 1,
        }}
      >
        2.5D Phaser Canvas
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "#cbd5e1",
          fontSize: "14px",
          textAlign: "center",
        }}
      >
        Map rendering will be implemented with Phaser.js
      </Typography>
    </Box>
  );
}
