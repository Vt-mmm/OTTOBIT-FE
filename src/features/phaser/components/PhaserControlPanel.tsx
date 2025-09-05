import { Box, Typography, Chip } from "@mui/material";
import { usePhaserContext } from "../context/PhaserContext.js";

interface PhaserControlPanelProps {
  className?: string;
  workspace?: any;
  onMapSelect?: (mapKey: string) => void;
}

export function PhaserControlPanel({ className }: PhaserControlPanelProps) {
  const { isConnected, isReady, gameState } = usePhaserContext();

  return (
    <Box
      className={className}
      sx={{
        p: 2,
        backgroundColor: "background.paper",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      {/* Simple Status Display */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Robot Simulator
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 2 }}>
          <Chip
            label={isConnected ? "Connected" : "Disconnected"}
            color={isConnected ? "success" : "default"}
            size="small"
          />
          <Chip
            label={isReady ? "Ready" : "Not Ready"}
            color={isReady ? "success" : "warning"}
            size="small"
          />
        </Box>

        {gameState && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              Current Map: <strong>{gameState.mapKey || "None"}</strong>
            </Typography>
            {gameState.collectedBatteries !== undefined && (
              <Typography variant="body2" color="text.secondary">
                Pins Collected: <strong>{gameState.collectedBatteries}</strong>
              </Typography>
            )}
            {gameState.programStatus && (
              <Typography variant="body2" color="text.secondary">
                Status: <strong>{gameState.programStatus}</strong>
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontStyle: "italic" }}
      >
        Use the Run button in the top bar to execute your program
      </Typography>
    </Box>
  );
}
