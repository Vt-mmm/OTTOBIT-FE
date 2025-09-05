import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
} from "@mui/material";
import { BatteryFull } from "@mui/icons-material";
import { usePhaserContext } from "../context/PhaserContext.js";

interface PhaserStatusDisplayProps {
  className?: string;
}

export function PhaserStatusDisplay({ className }: PhaserStatusDisplayProps) {
  const { gameState, isConnected, isReady } = usePhaserContext();

  if (!isConnected || !gameState) {
    return (
      <Card className={className}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Trạng thái Simulator
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chưa kết nối đến Phaser simulator
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "success";
      case "paused":
        return "warning";
      case "completed":
        return "info";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const getProgressValue = () => {
    if (gameState.totalSteps === 0) return 0;
    return (gameState.currentStep / gameState.totalSteps) * 100;
  };

  return (
    <Card className={className}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Trạng thái Simulator
        </Typography>

        <Grid container spacing={2}>
          {/* Connection Status */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">Kết nối:</Typography>
              <Chip
                label={isReady ? "Sẵn sàng" : "Đang kết nối"}
                color={isReady ? "success" : "warning"}
                size="small"
              />
            </Box>
          </Grid>

          {/* Map Info */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">Map:</Typography>
              <Chip label={gameState.mapKey} variant="outlined" size="small" />
            </Box>
          </Grid>

          {/* Program Status */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">Trạng thái chương trình:</Typography>
              <Chip
                label={gameState.programStatus}
                color={getStatusColor(gameState.programStatus) as any}
                size="small"
              />
            </Box>
          </Grid>

          {/* Progress */}
          {gameState.totalSteps > 0 && (
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Tiến độ thực thi:
              </Typography>
              <LinearProgress
                variant="determinate"
                value={getProgressValue()}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                Bước {gameState.currentStep}/{gameState.totalSteps} (
                {Math.round(getProgressValue())}%)
              </Typography>
            </Grid>
          )}

          {/* Robot Position */}
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Vị trí Robot:
            </Typography>
            <Typography variant="body1">
              ({gameState.robotPosition.x}, {gameState.robotPosition.y})
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Hướng:
            </Typography>
            <Typography variant="body1">
              {["Bắc", "Đông", "Nam", "Tây"][gameState.robotDirection]}
            </Typography>
          </Grid>

          {/* Battery Collection */}
          <Grid item xs={12}>
            <Typography variant="body2" gutterBottom>
              Pin đã thu thập:
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BatteryFull color="error" />
                <Typography variant="body2">
                  Đỏ: {gameState.collectedBatteryTypes.red}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BatteryFull color="warning" />
                <Typography variant="body2">
                  Vàng: {gameState.collectedBatteryTypes.yellow}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BatteryFull color="success" />
                <Typography variant="body2">
                  Xanh: {gameState.collectedBatteryTypes.green}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Tổng: {gameState.collectedBatteries} pin
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
