import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  Skeleton,
} from "@mui/material";
import { Memory as ComponentIcon } from "@mui/icons-material";
import { AppDispatch } from "store/config";
import { getRobotComponentsThunk } from "store/robotComponent/robotComponentThunks";

interface RobotBOMSectionProps {
  robotId: string;
  robotName?: string;
}

/**
 * Component hiển thị Bill of Materials (BOM) cho User
 * Dùng trong trang Robot Detail để user xem danh sách linh kiện cần thiết
 */
export default function RobotBOMSection({
  robotId,
}: RobotBOMSectionProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { robotComponents, isLoading } = useSelector(
    (state: any) => state.robotComponent
  );

  useEffect(() => {
    if (robotId) {
      dispatch(
        getRobotComponentsThunk({
          robotId,
          pageSize: 100,
        })
      );
    }
  }, [robotId]);

  // robotComponents is already an array from Redux state
  const components = Array.isArray(robotComponents) ? robotComponents : [];
  const totalComponents = components.reduce(
    (sum: number, rc: any) => sum + rc.quantity,
    0
  );

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  if (components.length === 0) {
    return (
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          📦 Danh sách linh kiện (BOM)
        </Typography>
        <Paper 
          elevation={0} 
          sx={{ 
            border: '1px solid', 
            borderColor: 'divider',
            p: 6,
            textAlign: 'center'
          }}
        >
          <ComponentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Chưa có thông tin linh kiện cho robot này
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          📦 Danh sách linh kiện (BOM)
        </Typography>
        <Chip
          label={`${components.length} loại • ${totalComponents} cái`}
          size="small"
          color="primary"
          sx={{ fontWeight: 600 }}
        />
      </Stack>

      {/* Components List - Vertical */}
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <Stack divider={<Divider />}>
          {components.map((rc: any, index: number) => (
            <Box
              key={rc.id}
              sx={{
                p: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "background-color 0.2s",
                "&:hover": {
                  bgcolor: "action.hover",
                },
                bgcolor: index % 2 === 0 ? "transparent" : "grey.50",
              }}
            >
              {/* Left: Component Name with Icon */}
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ flex: 1 }}
              >
                <ComponentIcon color="primary" sx={{ fontSize: 22 }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {rc.componentName}
                </Typography>
              </Stack>

              {/* Right: Quantity */}
              <Chip
                label={`${rc.quantity} cái`}
                size="medium"
                color="info"
                variant="outlined"
                sx={{ fontWeight: 600, minWidth: 80 }}
              />
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
