import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  Avatar,
  Pagination,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "store/config";
import { getRobotsThunk } from "store/robot/robotThunks";
import { createCourseRobotThunk } from "store/courseRobot/courseRobotThunks";
import { clearSuccessFlags } from "store/courseRobot/courseRobotSlice";

interface AddRobotToCourseDialogProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseName?: string;
  onSuccess?: () => void;
}

export default function AddRobotToCourseDialog({
  open,
  onClose,
  courseId,
  courseName,
  onSuccess,
}: AddRobotToCourseDialogProps) {
  const dispatch = useAppDispatch();

  const { robots } = useAppSelector((state) => state.robot);
  const { operations } = useAppSelector((state) => state.courseRobot);

  const [selectedRobot, setSelectedRobot] = useState<any>(null);
  const [isRequired, setIsRequired] = useState(true);

  const fetchRobots = (page: number) => {
    dispatch(getRobotsThunk({ size: 12, page }));
  };

  useEffect(() => {
    if (open) {
      // Fetch available robots
      fetchRobots(1);
    }
  }, [open, dispatch]);

  const handleSuccess = () => {
    console.log("✅ AddRobotToCourseDialog: handleSuccess called");
    dispatch(clearSuccessFlags());
    setSelectedRobot(null);
    setIsRequired(true);
    if (onSuccess) {
      console.log("✅ AddRobotToCourseDialog: calling parent onSuccess");
      onSuccess();
    }
    onClose();
  };

  useEffect(() => {
    if (operations.createSuccess) {
      console.log("✅ AddRobotToCourseDialog: createSuccess detected!");
      handleSuccess();
    }
  }, [operations.createSuccess, handleSuccess]);

  const handleSubmit = () => {
    if (!selectedRobot) return;

    console.log("📤 AddRobotToCourseDialog: Submitting...", {
      courseId,
      robotId: selectedRobot.id,
      robotName: selectedRobot.name,
      isRequired,
    });

    dispatch(
      createCourseRobotThunk({
        courseId,
        robotId: selectedRobot.id,
        isRequired,
      })
    );
  };

  const handleCancel = () => {
    setSelectedRobot(null);
    setIsRequired(true);
    onClose();
  };

  const robotsList = robots.data?.items || [];
  const robotsPagination = robots.data
    ? {
        page: robots.data.page || 1,
        totalPages: robots.data.totalPages || 1,
        totalItems: robots.data.total || 0,
      }
    : { page: 1, totalPages: 1, totalItems: 0 };
  const isLoading = robots.isLoading || operations.isCreating;

  const handlePageChange = (page: number) => {
    fetchRobots(page);
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="lg" fullWidth>
      <DialogTitle>
        Thêm Robot vào Khóa học
        {courseName && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {courseName}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {operations.createError && (
            <Alert severity="error">{operations.createError}</Alert>
          )}

          {robots.isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Chọn Robot
              </Typography>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ maxHeight: 400 }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Chọn</TableCell>
                      <TableCell>Robot</TableCell>
                      <TableCell>Model</TableCell>
                      <TableCell>Thương hiệu</TableCell>
                      <TableCell>Mô tả</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {robotsList.map((robot) => (
                      <TableRow
                        key={robot.id}
                        hover
                        onClick={() => setSelectedRobot(robot)}
                        sx={{
                          cursor: "pointer",
                          backgroundColor:
                            selectedRobot?.id === robot.id
                              ? "#e3f2fd"
                              : "inherit",
                        }}
                      >
                        <TableCell>
                          <Radio
                            checked={selectedRobot?.id === robot.id}
                            onChange={() => setSelectedRobot(robot)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar
                              src={robot.imageUrl}
                              sx={{ width: 32, height: 32 }}
                            >
                              {robot.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500}>
                              {robot.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{robot.model}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{robot.brand}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: 300,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {robot.description}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {robotsPagination.totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Pagination
                    count={robotsPagination.totalPages}
                    page={robotsPagination.page}
                    onChange={(_, page) => handlePageChange(page)}
                    color="primary"
                    size="small"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
            />
          }
          label="Bắt buộc phải có robot này để hoàn thành khóa học"
        />
        <Box>
          <Button onClick={handleCancel} disabled={isLoading} sx={{ mr: 1 }}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!selectedRobot || isLoading}
            startIcon={operations.isCreating && <CircularProgress size={16} />}
          >
            Thêm Robot
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
