import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Divider,
  Paper,
} from "@mui/material";
import {
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  Schedule as ScheduleIcon,
  MenuBook as MenuBookIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getCourseById } from "../../../redux/course/courseSlice";
import {
  getLessonsPreview,
  getLessonProgress,
} from "../../../redux/lesson/lessonSlice";
import { isLessonAccessible } from "../../../utils/lessonUtils";
import { PATH_USER } from "../../../routes/paths";
import { useLocales } from "../../../hooks";
import CourseLessonsSection from "./detail/CourseLessonsSection";

interface CourseLearningProps {
  courseId: string;
}

export default function CourseLearningSection({
  courseId,
}: CourseLearningProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { translate } = useLocales();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useAppSelector((state) => state.course.currentCourse);

  const {
    data: lessonsPreviewData,
    isLoading: lessonsPreviewLoading,
    error: lessonsPreviewError,
  } = useAppSelector((state) => state.lesson.lessonsPreview);

  const { data: lessonProgressData } = useAppSelector(
    (state) => state.lesson.lessonProgress
  );

  // Fetch course details
  useEffect(() => {
    dispatch(getCourseById(courseId));
  }, [dispatch, courseId]);

  // Fetch lessons preview
  useEffect(() => {
    dispatch(getLessonsPreview({ courseId, pageSize: 50 }));
  }, [dispatch, courseId]);

  // Fetch lesson progress
  useEffect(() => {
    dispatch(
      getLessonProgress({ courseId, pageNumber: 1, pageSize: 50 } as any)
    );
  }, [dispatch, courseId]);

  const handleLessonClick = (lessonId: string) => {
    const lessonProgresses = lessonProgressData?.items || [];
    const currentLesson = lessons.find((l) => l.id === lessonId);

    if (!currentLesson) {
      setSnackbar({
        open: true,
        message: translate("courses.LessonNotFound"),
        severity: "error",
      });
      return;
    }

    // Check lesson accessibility
    const accessible = isLessonAccessible(
      currentLesson as any,
      lessonProgresses as any
    );
    if (!accessible) {
      setSnackbar({
        open: true,
        message: `${translate("courses.CompleteToUnlock")} "${
          currentLesson.title
        }".`,
        severity: "warning",
      });
      return;
    }

    // Navigate to lesson detail
    navigate(PATH_USER.lessonDetail.replace(":id", lessonId));
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const isLoading = courseLoading || lessonsPreviewLoading;
  const error = courseError || lessonsPreviewError;

  if (isLoading) {
    return (
      <Container>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            {translate("courses.CourseNotFound")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {translate("courses.CourseNotExist")}
          </Typography>
        </Box>
      </Container>
    );
  }

  const lessons = lessonsPreviewData?.items || [];
  const lessonProgresses = lessonProgressData?.items || [];

  // Calculate progress
  const totalLessons = lessons.length;
  const completedLessons = lessonProgresses.filter(
    (lp) => (lp.status as any) === 3 || lp.status === "Completed" // 3 = Completed from backend
  ).length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Find next lesson to continue
  const nextLesson = lessons.find((lesson) => {
    const progress = lessonProgresses.find((lp) => lp.lessonId === lesson.id);
    return !progress || ((progress.status as any) !== 3 && progress.status !== "Completed");
  });

  return (
    <>
      <Box
        sx={{
          bgcolor: "#fafafa",
          minHeight: "100vh",
          maxWidth: "100vw",
          overflow: "hidden",
        }}
      >
        {/* Clean Hero Section */}
        <Box
          sx={{
            bgcolor: "white",
            borderBottom: "1px solid",
            borderColor: "grey.200",
            pt: { xs: 12, md: 14 },
            pb: { xs: 3, md: 4 },
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h4"
              component="h1"
              fontWeight={600}
              gutterBottom
              sx={{
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                color: "grey.900",
              }}
            >
              {course.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.875rem", md: "1rem" },
                mb: 2,
                maxWidth: 800,
              }}
            >
              {course.description}
            </Typography>

            {/* Course Meta Info - Clean chips */}
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Chip
                icon={<MenuBookIcon sx={{ fontSize: 18 }} />}
                label={`${totalLessons} ${translate("courses.Lessons")}`}
                size="small"
                sx={{
                  bgcolor: "grey.100",
                  color: "grey.700",
                  fontWeight: 500,
                  "& .MuiChip-icon": { color: "grey.600" },
                }}
              />
              <Chip
                icon={<ScheduleIcon sx={{ fontSize: 18 }} />}
                label={`${(course as any).durationHours || 0} ${translate(
                  "courses.Hours"
                )}`}
                size="small"
                sx={{
                  bgcolor: "grey.100",
                  color: "grey.700",
                  fontWeight: 500,
                  "& .MuiChip-icon": { color: "grey.600" },
                }}
              />
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                label={`${progressPercent}% ${translate("courses.Complete")}`}
                size="small"
                sx={{
                  bgcolor: progressPercent > 0 ? "#e8f5e9" : "grey.100",
                  color: progressPercent > 0 ? "#2e7d32" : "grey.700",
                  fontWeight: 500,
                  "& .MuiChip-icon": {
                    color: progressPercent > 0 ? "#2e7d32" : "grey.600",
                  },
                }}
              />
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 3, pb: 6 }}>
          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              {/* Next Up Section - Clean design */}
              {nextLesson && (
                <Paper
                  elevation={0}
                  sx={{
                    mb: 3,
                    p: 3,
                    border: "2px solid",
                    borderColor: "#00AB55",
                    bgcolor: "white",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <PlayCircleOutlineIcon
                      sx={{ color: "#00AB55", fontSize: 24 }}
                    />
                    <Typography
                      variant="overline"
                      sx={{
                        color: "#00AB55",
                        fontWeight: 700,
                        letterSpacing: 1,
                      }}
                    >
                      {completedLessons === 0 
                        ? translate("courses.StartLearningLabel") 
                        : translate("courses.ContinueLearningLabel")}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ mb: 1, color: "grey.900" }}
                  >
                    {nextLesson.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mb: 2.5 }}
                  >
                    {nextLesson.content}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => handleLessonClick(nextLesson.id)}
                    sx={{
                      bgcolor: "#00AB55",
                      color: "white",
                      fontWeight: 600,
                      py: 1.25,
                      px: 3,
                      textTransform: "none",
                      fontSize: "1rem",
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: "#007B55",
                        boxShadow: "0 4px 12px rgba(0,171,85,0.2)",
                      },
                    }}
                  >
                    {completedLessons === 0
                      ? translate("courses.StartCourse")
                      : translate("courses.ContinueLearning")}
                  </Button>
                </Paper>
              )}

              {/* Progress Overview Card - Minimalist */}
              <Card
                sx={{
                  mb: 3,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
                elevation={0}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2.5,
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{ color: "grey.900" }}
                    >
                      {translate("courses.YourProgress")}
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      sx={{ color: "#00AB55" }}
                    >
                      {progressPercent}%
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={progressPercent}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 3,
                      bgcolor: "grey.200",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                        bgcolor: "#00AB55",
                      },
                    }}
                  />

                  <Box sx={{ display: "flex", gap: 3 }}>
                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight={600}
                        sx={{ color: "#00AB55" }}
                      >
                        {completedLessons}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.75rem" }}
                      >
                        {translate("courses.Completed")}
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight={600}
                        color="text.secondary"
                      >
                        {totalLessons - completedLessons}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.75rem" }}
                      >
                        {translate("courses.Remaining")}
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight={600}
                        color="grey.700"
                      >
                        {totalLessons}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.75rem" }}
                      >
                        {translate("courses.Total")}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Course Syllabus - Clean */}
              <Card
                sx={{
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
                elevation={0}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    gutterBottom
                    sx={{ color: "grey.900" }}
                  >
                    {translate("courses.CourseContent")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, fontSize: "0.875rem" }}
                  >
                    {totalLessons} {translate("courses.Lessons")} •{" "}
                    {completedLessons} {translate("courses.LessonsCompleted")}
                  </Typography>

                  {/* Lessons List */}
                  <CourseLessonsSection
                    lessons={lessons}
                    lessonProgresses={lessonProgresses}
                    isUserEnrolled={true}
                    onLessonClick={handleLessonClick}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              {/* About Course - Clean */}
              <Card
                sx={{
                  mb: 3,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
                elevation={0}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    gutterBottom
                    sx={{ color: "grey.900" }}
                  >
                    {translate("courses.AboutCourse")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6, fontSize: "0.875rem" }}
                  >
                    {course.description}
                  </Typography>
                </CardContent>
              </Card>

              {/* Course Stats - Minimalist */}
              <Card
                sx={{
                  mb: 3,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
                elevation={0}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    gutterBottom
                    sx={{ color: "grey.900" }}
                  >
                    {translate("courses.CourseDetails")}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2.5,
                      mt: 2.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                      }}
                    >
                      <MenuBookIcon
                        sx={{ color: "grey.600", fontSize: 20, mt: 0.25 }}
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ color: "grey.900" }}
                        >
                          {totalLessons} {translate("courses.Lessons")}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.75rem" }}
                        >
                          {translate("courses.TotalContent")}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider />

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                      }}
                    >
                      <ScheduleIcon
                        sx={{ color: "grey.600", fontSize: 20, mt: 0.25 }}
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ color: "grey.900" }}
                        >
                          {(course as any).durationHours || 0}{" "}
                          {translate("courses.Hours")}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.75rem" }}
                        >
                          {translate("courses.EstimatedTime")}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider />

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                      }}
                    >
                      <CheckCircleIcon
                        sx={{ color: "#00AB55", fontSize: 20, mt: 0.25 }}
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ color: "grey.900" }}
                        >
                          {completedLessons}/{totalLessons}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.75rem" }}
                        >
                          {translate("courses.Completed")}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
