import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useAppDispatch } from "store/config";
import { getCoursesForRobotThunk } from "store/robot/robotThunks";
import { CourseRobotResult } from "common/@types/robot";

interface RobotCoursesDialogProps {
  open: boolean;
  robotId: string;
  robotName: string;
  onClose: () => void;
}

const COURSES_PER_PAGE = 8;

export default function RobotCoursesDialog({
  open,
  robotId,
  robotName,
  onClose,
}: RobotCoursesDialogProps) {
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseRobotResult[]>([]);

  // Fetch courses for robot when dialog opens or robotId changes
  useEffect(() => {
    if (!open || !robotId) return;

    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await dispatch(
          getCoursesForRobotThunk({
            robotId,
            page: currentPage,
            size: COURSES_PER_PAGE,
          })
        ).unwrap();

        setCourses(result.items);
        setTotalPages(result.totalPages);

        console.log("🤖 [RobotCoursesDialog] Courses fetched:", result);
      } catch (err: any) {
        const errorMsg =
          typeof err === "string"
            ? err
            : err?.message || "Failed to fetch courses";
        setError(errorMsg);
        console.error("❌ [RobotCoursesDialog] Error fetching courses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [open, robotId, currentPage, dispatch]);

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  };

  const handleClose = () => {
    setCurrentPage(1);
    setCourses([]);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "80vh",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
        Courses for {robotName}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {isLoading && courses.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : courses.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">
              No courses available for this robot
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {courses.map((course) => (
              <Card
                key={course.id}
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {course.courseTitle}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    {course.isRequired && (
                      <Chip
                        label="Required"
                        size="small"
                        variant="filled"
                        color="error"
                      />
                    )}
                    {/* Order field not available in CourseRobotResult */}
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && courses.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              mt: 3,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Tooltip title="Previous page">
              <span>
                <IconButton
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || isLoading}
                  size="small"
                >
                  <ChevronLeftIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Typography
              variant="body2"
              sx={{ minWidth: 80, textAlign: "center" }}
            >
              Page {currentPage} / {totalPages}
            </Typography>

            <Tooltip title="Next page">
              <span>
                <IconButton
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || isLoading}
                  size="small"
                >
                  <ChevronRightIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
