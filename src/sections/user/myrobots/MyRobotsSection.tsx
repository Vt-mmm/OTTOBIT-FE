import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  SmartToy as RobotIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import { getMyRobotsThunk } from "store/studentRobot/studentRobotThunks";
import ActivateRobotDialog from "components/robot/ActivateRobotDialog";

export default function MyRobotsSection() {
  const dispatch = useAppDispatch();
  const { myRobots } = useAppSelector((state) => state.studentRobot);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(getMyRobotsThunk()).catch((error) => {
      // Handle error silently if API not implemented yet
      console.log('API not available yet:', error);
    });
  }, [dispatch]);

  const handleActivateSuccess = () => {
    dispatch(getMyRobotsThunk());
  };

  // Debug: Log data to console to see format
  useEffect(() => {
    if (myRobots.data) {
      console.log('My Robots Data:', myRobots.data);
      console.log('Is Array:', Array.isArray(myRobots.data));
    }
  }, [myRobots.data]);

  if (myRobots.isLoading && !myRobots.data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Handle both array and object response formats
  let robots: any[] = [];
  if (myRobots.data) {
    if (Array.isArray(myRobots.data)) {
      robots = myRobots.data;
    } else if (typeof myRobots.data === 'object' && 'items' in myRobots.data) {
      const dataObj = myRobots.data as any;
      if (Array.isArray(dataObj.items)) {
        robots = dataObj.items;
      }
    }
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Robots của tôi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý các robot bạn đã kích hoạt
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RobotIcon />}
          onClick={() => setActivateDialogOpen(true)}
        >
          Kích hoạt Robot mới
        </Button>
      </Box>

      {myRobots.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {myRobots.error}
        </Alert>
      )}

      {robots.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 8, textAlign: "center" }}>
            <RobotIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Bạn chưa có robot nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Kích hoạt robot đầu tiên của bạn để bắt đầu học lập trình
            </Typography>
            <Button
              variant="contained"
              onClick={() => setActivateDialogOpen(true)}
            >
              Kích hoạt Robot
            </Button>
          </CardContent>
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
          {robots.map((studentRobot: any) => (
            <Card
              key={studentRobot.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              {studentRobot.robot?.imageUrl && (
                <CardMedia
                  component="img"
                  height="200"
                  image={studentRobot.robot.imageUrl}
                  alt={studentRobot.robot.name}
                  sx={{ objectFit: "cover" }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {studentRobot.customSettings?.name ||
                    studentRobot.robot?.name ||
                    "Robot"}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {studentRobot.robot?.model} - {studentRobot.robot?.brand}
                </Typography>

                {studentRobot.serialNumber && (
                  <Chip
                    label={`SN: ${studentRobot.serialNumber}`}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 2 }}
                >
                  Kích hoạt:{" "}
                  {new Date(studentRobot.activationDate).toLocaleDateString(
                    "vi-VN"
                  )}
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
