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
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getCourseById } from "../../../redux/course/courseSlice";
import { getLessonsPreview, getLessonProgress } from "../../../redux/lesson/lessonSlice";
import { isLessonAccessible } from "../../../utils/lessonUtils";
import {
  createEnrollment,
  getMyEnrollments,
} from "../../../redux/enrollment/enrollmentSlice";
import { getStudentByUserThunk } from "../../../redux/student/studentThunks";
import { PATH_USER } from "../../../routes/paths";
import StudentProfileRequiredDialog from "./StudentProfileRequiredDialog";

// Import the new sections
import CourseHeroSection from "./detail/CourseHeroSection";
import CourseSidebarSection from "./detail/CourseSidebarSection";
import CourseLessonsSection from "./detail/CourseLessonsSection";
import CourseCertificatesSection from "./detail/CourseCertificatesSection";

interface CourseDetailSectionProps {
  courseId: string;
}

export default function CourseDetailSection({
  courseId,
}: CourseDetailSectionProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });
  const [profileDialog, setProfileDialog] = useState({ 
    open: false, 
    courseName: "", 
    courseId: "" 
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

  const {
    data: lessonProgressData,
  } = useAppSelector((state) => state.lesson.lessonProgress);

  const { myEnrollments, operations } = useAppSelector(
    (state) => state.enrollment
  );
  const { studentData } = useAppSelector((state) => ({
    studentData: state.student.currentStudent.data,
  }));
  const { isEnrolling } = operations;

  // Check if user is enrolled in this course
  const isUserEnrolled =
    myEnrollments.data?.items?.some(
      (enrollment) => enrollment.courseId === courseId
    ) || false;

  useEffect(() => {
    // Fetch course details
    dispatch(getCourseById(courseId));

    // Fetch user's enrollments to check enrollment status
    dispatch(getMyEnrollments({ pageSize: 100 }));
  }, [dispatch, courseId]);

  // Always use preview for course detail page - individual lessons will be fetched when clicked
  useEffect(() => {
    // Always fetch preview lessons for course detail view
    dispatch(getLessonsPreview({ courseId, pageSize: 50 }));
  }, [dispatch, courseId]);

  // Fetch lesson progress for enrolled users
  useEffect(() => {
    if (isUserEnrolled) {
      // Ensure backend receives correct paging params (PageNumber/PageSize)
      dispatch(getLessonProgress({ courseId, pageNumber: 1, pageSize: 50 } as any));
    }
  }, [dispatch, courseId, isUserEnrolled]);

  // Check if user has student profile
  const checkStudentProfile = async (): Promise<boolean> => {
    try {
      if (studentData) {
        return true;
      }
      
      const result = await dispatch(getStudentByUserThunk()).unwrap();
      return !!result;
    } catch (error: any) {
      // If 404 or NO_STUDENT_PROFILE, user doesn't have profile
      if (error.includes?.("404") || error === "NO_STUDENT_PROFILE" || 
          (typeof error === "string" && error.toLowerCase().includes("not found"))) {
        return false;
      }
      // For other errors, assume no profile to be safe
      return false;
    }
  };

  const handleEnrollCourse = async () => {
    const courseName = course?.title || "khóa học này";
    
    try {
      // First check if user has student profile
      const hasProfile = await checkStudentProfile();
      
      if (!hasProfile) {
        // Show dialog to prompt user to create profile
        setProfileDialog({
          open: true,
          courseName,
          courseId
        });
        return;
      }

      // If has profile, proceed with enrollment
      await dispatch(createEnrollment({ courseId })).unwrap();

      setSnackbar({
        open: true,
        message: "Tham gia khóa học thành công!",
        severity: "success",
      });

      // Refresh enrollments to update UI immediately
      dispatch(getMyEnrollments({ pageSize: 100 }));
    } catch (error: any) {
      // Check if error indicates missing student profile
      const requiresProfile = typeof error === "string" && (
        error.toLowerCase().includes("student not found") ||
        error.toLowerCase().includes("student profile required") ||
        error.toLowerCase().includes("no student profile") || 
        error.toLowerCase().includes("create student profile") ||
        error.toLowerCase().includes("missing student profile")
      );
      
      if (requiresProfile) {
        setProfileDialog({
          open: true,
          courseName,
          courseId
        });
      } else {
        setSnackbar({
          open: true,
          message:
            typeof error === "string"
              ? error
              : "Không thể tham gia khóa học. Vui lòng thử lại.",
          severity: "error",
        });
      }
    }
  };

  const handleLessonClick = (lessonId: string) => {
    // Check if user is enrolled before allowing lesson access
    if (!isUserEnrolled) {
      setSnackbar({
        open: true,
        message: "Vui lòng tham gia khóa học để truy cập bài học.",
        severity: "warning",
      });
      return;
    }

    // For enrolled users, check lesson accessibility based on lesson progress
    const lessonProgresses = lessonProgressData?.items || [];
    const currentLesson = lessons.find(l => l.id === lessonId);
    
    if (!currentLesson) {
      setSnackbar({
        open: true,
        message: "Không tìm thấy bài học.",
        severity: "error",
      });
      return;
    }

    // Import lesson utils to check accessibility - we'll add this after checking if the lesson is accessible
    // Kiểm tra khả năng truy cập lesson dựa trên lessonProgress
    const accessible = isLessonAccessible(currentLesson as any, lessonProgresses as any);
    if (!accessible) {
    setSnackbar({
    open: true,
    message: `Vui lòng hoàn thành bài học trước đó để mở khóa "${currentLesson.title}".`,
    severity: "warning",
    });
    return;
    }

    // If accessible, navigate to lesson detail
    navigate(PATH_USER.lessonDetail.replace(":id", lessonId));
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCloseProfileDialog = () => {
    setProfileDialog({ open: false, courseName: "", courseId: "" });
  };

  const handleCreateProfile = () => {
    navigate(PATH_USER.studentProfile);
    handleCloseProfileDialog();
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
            Không tìm thấy khóa học
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Khóa học không tồn tại hoặc đã bị xóa.
          </Typography>
        </Box>
      </Container>
    );
  }

  // Always use preview data for course detail page
  const lessons = lessonsPreviewData?.items || [];
  const lessonProgresses = lessonProgressData?.items || [];

  // Mock ratings for now - in real app, get from API
  const courseRating = 4.2;
  const totalRatings = 1165;

  return (
    <>
      <Box sx={{ bgcolor: "#ffffff", minHeight: "100vh" }}>
        <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 12 } }}>
          <Grid container spacing={4}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              {/* Course Hero Section */}
              <CourseHeroSection
                course={course}
                lessons={lessons}
                isUserEnrolled={isUserEnrolled}
                isEnrolling={isEnrolling}
                onEnrollCourse={handleEnrollCourse}
                onLessonClick={handleLessonClick}
                courseRating={courseRating}
                totalRatings={totalRatings}
              />
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <CourseSidebarSection course={course} lessons={lessons} />
            </Grid>

            {/* Course Content Sections */}
            <Grid item xs={12}>
              <Box sx={{ mt: 6 }}>
                {/* Lessons List */}
                <CourseLessonsSection
                  lessons={lessons}
                  lessonProgresses={lessonProgresses}
                  isUserEnrolled={isUserEnrolled}
                  onLessonClick={handleLessonClick}
                />

                {/* Certificate Series Section */}
                <CourseCertificatesSection
                  course={course}
                  lessons={lessons}
                  isUserEnrolled={isUserEnrolled}
                  isEnrolling={isEnrolling}
                  onEnrollCourse={handleEnrollCourse}
                  courseRating={courseRating}
                  totalRatings={totalRatings}
                />
              </Box>
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

      {/* Student Profile Required Dialog */}
      <StudentProfileRequiredDialog
        open={profileDialog.open}
        onClose={handleCloseProfileDialog}
        courseName={profileDialog.courseName}
        onCreateProfile={handleCreateProfile}
      />
    </>
  );
}
