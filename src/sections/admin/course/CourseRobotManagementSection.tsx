import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "store/config";
import {
  getCourseRobotsForAdminThunk,
  deleteCourseRobotThunk,
  restoreCourseRobotThunk,
} from "store/courseRobot/courseRobotThunks";
import { clearSuccessFlags } from "store/courseRobot/courseRobotSlice";
import AddRobotToCourseDialog from "components/courseRobot/AddRobotToCourseDialog";

interface CourseRobotManagementSectionProps {
  courseId: string;
  courseName?: string;
}

export default function CourseRobotManagementSection({
  courseId,
  courseName,
}: CourseRobotManagementSectionProps) {
  const dispatch = useAppDispatch();
  const { courseRobots, operations } = useAppSelector(
    (state) => state.courseRobot
  );

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    courseRobotId: string | null;
    robotName: string;
  }>({
    open: false,
    courseRobotId: null,
    robotName: "",
  });
  const [restoreDialog, setRestoreDialog] = useState<{
    open: boolean;
    courseRobotId: string | null;
    robotName: string;
  }>({
    open: false,
    courseRobotId: null,
    robotName: "",
  });

  // Use courseRobots.data (from GET_ALL endpoint)
  const items = courseRobots.data?.items || [];
  const isLoading = courseRobots.isLoading || false;
  const error = courseRobots.error || null;

  useEffect(() => {
    console.log("🔄 Fetching course robots for courseId:", courseId);
    dispatch(
      getCourseRobotsForAdminThunk({
        courseId,
        pageSize: 100,
        includeDelete: showDeleted, // Matches BE field name: IncludeDelete
      })
    );
  }, [dispatch, courseId, showDeleted]);

  useEffect(() => {
    if (operations.deleteSuccess) {
      setDeleteDialog({ open: false, courseRobotId: null, robotName: "" });
      dispatch(clearSuccessFlags());
      dispatch(
        getCourseRobotsForAdminThunk({
          courseId,
          pageSize: 100,
          includeDelete: showDeleted,
        })
      );
    }
  }, [operations.deleteSuccess, dispatch, courseId, showDeleted]);

  useEffect(() => {
    if (operations.restoreSuccess) {
      setRestoreDialog({ open: false, courseRobotId: null, robotName: "" });
      dispatch(clearSuccessFlags());
      dispatch(
        getCourseRobotsForAdminThunk({
          courseId,
          pageSize: 100,
          includeDelete: showDeleted,
        })
      );
    }
  }, [operations.restoreSuccess, dispatch, courseId, showDeleted]);

  const handleAddSuccess = () => {
    console.log(
      "✅ CourseRobotManagementSection: handleAddSuccess called, reloading..."
    );
    dispatch(
      getCourseRobotsForAdminThunk({
        courseId,
        pageSize: 100,
        includeDelete: showDeleted,
      })
    );
  };

  const handleDeleteClick = (courseRobotId: string, robotName: string) => {
    setDeleteDialog({
      open: true,
      courseRobotId,
      robotName,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.courseRobotId) {
      dispatch(deleteCourseRobotThunk(deleteDialog.courseRobotId));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, courseRobotId: null, robotName: "" });
  };

  const handleRestoreClick = (courseRobotId: string, robotName: string) => {
    setRestoreDialog({
      open: true,
      courseRobotId,
      robotName,
    });
  };

  const handleRestoreConfirm = () => {
    if (restoreDialog.courseRobotId) {
      dispatch(restoreCourseRobotThunk(restoreDialog.courseRobotId));
    }
  };

  const handleRestoreCancel = () => {
    setRestoreDialog({ open: false, courseRobotId: null, robotName: "" });
  };

  if (isLoading && items.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h6">Robots Yêu cầu</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            variant={showDeleted ? "contained" : "outlined"}
            color="secondary"
            size="small"
            onClick={() => setShowDeleted(!showDeleted)}
          >
            {showDeleted ? "Ẩn robots đã xóa" : "Hiện robots đã xóa"}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Thêm Robot
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {operations.createError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {operations.createError}
          {operations.createError.includes("already exists") && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Robot này đã được thêm vào khóa học rồi.
            </Typography>
          )}
        </Alert>
      )}

      {operations.deleteError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {operations.deleteError}
        </Alert>
      )}

      {operations.restoreError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {operations.restoreError}
        </Alert>
      )}

      {operations.restoreSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Robot đã được khôi phục thành công!
        </Alert>
      )}

      {items.length === 0 ? (
        <Card>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Chưa có robot nào được thêm vào khóa học này.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Robot</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Thương hiệu</TableCell>
                <TableCell align="center">Bắt buộc</TableCell>
                {showDeleted && <TableCell align="center">Trạng thái</TableCell>}
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((courseRobot) => (
                <TableRow key={courseRobot.id}>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        maxWidth: 220,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={courseRobot.robotName || "N/A"}
                    >
                      {courseRobot.robotName || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 180,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={courseRobot.robotModel || "N/A"}
                    >
                      {courseRobot.robotModel || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 180,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={courseRobot.robotBrand || "N/A"}
                    >
                      {courseRobot.robotBrand || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {courseRobot.isRequired ? (
                      <Chip label="Bắt buộc" color="error" size="small" />
                    ) : (
                      <Chip label="Tùy chọn" color="default" size="small" />
                    )}
                  </TableCell>
                  {showDeleted && (
                    <TableCell align="center">
                      {courseRobot.isDeleted ? (
                        <Chip label="Đã xóa" color="default" size="small" />
                      ) : (
                        <Chip label="Hoạt động" color="success" size="small" />
                      )}
                    </TableCell>
                  )}
                  <TableCell align="right">
                    {courseRobot.isDeleted ? (
                      <Button
                        size="small"
                        color="primary"
                        variant="outlined"
                        startIcon={<RestoreIcon />}
                        onClick={() =>
                          handleRestoreClick(
                            courseRobot.id,
                            courseRobot.robotName || "Robot"
                          )
                        }
                        disabled={operations.isRestoring}
                      >
                        Khôi phục
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() =>
                          handleDeleteClick(
                            courseRobot.id,
                            courseRobot.robotName || "Robot"
                          )
                        }
                        disabled={operations.isDeleting}
                      >
                        Xóa
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Robot Dialog */}
      <AddRobotToCourseDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        courseId={courseId}
        courseName={courseName}
        onSuccess={handleAddSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa robot{" "}
            <strong>{deleteDialog.robotName}</strong> khỏi khóa học này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={operations.isDeleting}>
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={operations.isDeleting}
            startIcon={operations.isDeleting && <CircularProgress size={16} />}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialog.open} onClose={handleRestoreCancel}>
        <DialogTitle>Xác nhận khôi phục</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn khôi phục robot{" "}
            <strong>{restoreDialog.robotName}</strong> cho khóa học này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRestoreCancel} disabled={operations.isRestoring}>
            Hủy
          </Button>
          <Button
            onClick={handleRestoreConfirm}
            color="primary"
            variant="contained"
            disabled={operations.isRestoring}
            startIcon={
              operations.isRestoring && <CircularProgress size={16} />
            }
          >
            Khôi phục
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
