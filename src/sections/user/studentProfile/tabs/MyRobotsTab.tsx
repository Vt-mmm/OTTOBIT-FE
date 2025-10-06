import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Skeleton,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  SmartToy as RobotIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { getRobotsThunk } from "store/robot/robotThunks";
import ActivateRobotDialog from "components/robot/ActivateRobotDialog";

interface MyRobotsTabProps {
  loading?: boolean;
}

export default function MyRobotsTab({
  loading: externalLoading,
}: MyRobotsTabProps) {
  const dispatch = useAppDispatch();
  const { robots } = useAppSelector((state) => state.robot);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);

  useEffect(() => {
    // TODO: Implement proper robot ownership checking
    // For now, just fetch all robots for demo purposes
    dispatch(getRobotsThunk({ pageNumber: 1, pageSize: 100 }));
  }, [dispatch]);

  const handleActivateSuccess = () => {
    // TODO: Refresh robot list after activation
    dispatch(getRobotsThunk({ pageNumber: 1, pageSize: 100 }));
  };

  // TODO: Replace with proper ownership logic
  // Temporarily show all robots for demo
  const myRobots = useMemo(() => {
    return robots.data?.items || [];
  }, [robots.data]);

  const isLoading = robots.isLoading || externalLoading;
  const error = robots.error;

  if (isLoading && myRobots.length === 0) {
    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 0 },
            mb: 3,
          }}
        >
          <Skeleton
            variant="text"
            width={200}
            height={40}
            sx={{ width: { xs: "100%", sm: 200 } }}
          />
          <Skeleton
            variant="rectangular"
            width={180}
            height={36}
            sx={{ width: { xs: "100%", sm: 180 }, height: { xs: 48, sm: 36 } }}
          />
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" width="80%" height={32} />
                <Skeleton variant="text" width="60%" />
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
          mb: 3,
        }}
      >
        <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
          <Typography
            variant="h5"
            fontWeight={600}
            gutterBottom
            sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
          >
            Robots của tôi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý các robot bạn đã kích hoạt
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RobotIcon />}
          onClick={() => setActivateDialogOpen(true)}
          size="medium"
          fullWidth={{ xs: true, sm: false } as any}
          sx={{
            minHeight: { xs: 48, sm: 40 },
            fontSize: { xs: "0.9375rem", sm: "0.875rem" },
            whiteSpace: "nowrap",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Kích hoạt Robot
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {myRobots.length === 0 ? (
        <Card
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "grey.50",
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <RobotIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Bạn chưa có robot nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Kích hoạt robot đầu tiên của bạn để bắt đầu học lập trình
          </Typography>
          <Button
            variant="contained"
            onClick={() => setActivateDialogOpen(true)}
            sx={{
              minHeight: { xs: 48, sm: 40 },
              px: { xs: 4, sm: 3 },
            }}
          >
            Kích hoạt Robot
          </Button>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {myRobots.map((robot: any) => (
            <Card
              key={robot.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                transition: "all 0.3s ease",
                borderRadius: { xs: 2, sm: 3 },
                "&:hover": {
                  transform: { xs: "none", sm: "translateY(-4px)" },
                  boxShadow: 4,
                },
              }}
            >
              {robot.imageUrl && (
                <CardMedia
                  component="img"
                  height="200"
                  image={robot.imageUrl}
                  alt={robot.name}
                  sx={{
                    objectFit: "cover",
                    height: { xs: 160, sm: 200 },
                  }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5 } }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}
                >
                  {robot.name || "Robot"}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {robot.model} - {robot.brand}
                </Typography>

                <Typography
                  variant="caption"
                  color="success.main"
                  sx={{
                    display: "inline-block",
                    mt: 2,
                    px: 1.5,
                    py: 0.5,
                    bgcolor: "success.lighter",
                    borderRadius: 1,
                    fontWeight: 600,
                  }}
                >
                  ● Đã kích hoạt
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                <IconButton size="small" color="primary">
                  <SettingsIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      <ActivateRobotDialog
        open={activateDialogOpen}
        onClose={() => setActivateDialogOpen(false)}
        onSuccess={handleActivateSuccess}
      />
    </Box>
  );
}
