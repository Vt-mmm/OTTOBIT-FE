import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Snackbar,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getCourseById } from "../../../redux/course/courseSlice";
import {
  getLessonsPreview,
  getLessonProgress,
} from "../../../redux/lesson/lessonSlice";
import {
  createEnrollment,
  getMyEnrollments,
} from "../../../redux/enrollment/enrollmentSlice";
import { getStudentByUserThunk } from "../../../redux/student/studentThunks";
import { PATH_USER } from "../../../routes/paths";
import StudentProfileRequiredDialog from "./StudentProfileRequiredDialog";
import { useLocales } from "../../../hooks";
import { CourseType, CourseRobotInfo } from "common/@types/course";
import { axiosClient } from "../../../axiosClient/axiosClient";
import { ROUTES_API_COURSE_ROBOT } from "../../../constants/routesApiKeys";

// Import detail sections
import CourseHeroSection from "./detail/CourseHeroSection";
import CourseSidebarSection from "./detail/CourseSidebarSection";
import CourseTabsSection from "./detail/CourseTabsSection";
import CourseBenefitsSection from "./detail/CourseBenefitsSection";

interface CourseDetailSectionProps {
  courseId: string;
}

export default function CourseDetailSection({
  courseId,
}: CourseDetailSectionProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { translate } = useLocales();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });
  const [profileDialog, setProfileDialog] = useState({
    open: false,
    courseName: "",
    courseId: "",
  });
  const [courseRobots, setCourseRobots] = useState<CourseRobotInfo[]>([]);

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

  const { myEnrollments, operations } = useAppSelector(
    (state) => state.enrollment
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  // Fix: Don't create new object in selector - access property directly
  const studentData = useAppSelector((state) => state.student.currentStudent.data);
  const { isEnrolling } = operations;

  // Check if user is enrolled in this course
  const isUserEnrolled =
    myEnrollments.data?.items?.some(
      (enrollment) => enrollment.courseId === courseId
    ) || false;

  // Fetch course details (public data)
  useEffect(() => {
    dispatch(getCourseById(courseId));
  }, [dispatch, courseId]);

  // Fetch course robots (required robots for this course)
  useEffect(() => {
    const fetchCourseRobots = async () => {
      try {
        // Use correct endpoint: GET /course-robots?courseId={courseId}
        const response = await axiosClient.get(ROUTES_API_COURSE_ROBOT.GET_ALL, {
          params: {
            courseId: courseId,
            pageSize: 100, // Get all robots for this course
          },
        });
        
        // Transform CourseRobot response to CourseRobotInfo format
        const items = response.data.data?.items || response.data.data || [];
        const robots: CourseRobotInfo[] = items.map((item: any) => ({
          robotId: item.robotId,
          robotName: item.robot?.name || item.robotName || "Unknown Robot",
          robotModel: item.robot?.model || item.robotModel || "N/A",
          robotBrand: item.robot?.brand || item.robotBrand || "N/A",
          robotImageUrl: item.robot?.imageUrl,
          isRequired: item.isRequired,
        }));
        
        setCourseRobots(robots);
      } catch (error) {
        // Failed to fetch course robots - silently continue without robots
        // This is not critical, course can work without robot requirements display
        setCourseRobots([]);
      }
    };

    fetchCourseRobots();
  }, [courseId]);

  // Fetch user's enrollments ONLY if authenticated and not already loaded/loading
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Don't fetch if already loading or already have data or got error
    if (myEnrollments.isLoading || myEnrollments.data || myEnrollments.error) {
      return;
    }
    
    dispatch(getMyEnrollments({ pageSize: 100 }));
  }, [dispatch, isAuthenticated, myEnrollments.isLoading, myEnrollments.data, myEnrollments.error]);

  // Always use preview for course detail page - individual lessons will be fetched when clicked
  useEffect(() => {
    // Always fetch preview lessons for course detail view
    dispatch(getLessonsPreview({ courseId, pageSize: 50 }));
  }, [dispatch, courseId]);

  // Fetch lesson progress for enrolled users
  useEffect(() => {
    if (isUserEnrolled) {
      // Ensure backend receives correct paging params (PageNumber/PageSize)
      dispatch(
        getLessonProgress({ courseId, pageNumber: 1, pageSize: 50 } as any)
      );
    }
  }, [dispatch, courseId, isUserEnrolled]);

  // Check if user has student profile - with cache
  const checkStudentProfile = useCallback(async (): Promise<boolean> => {
    try {
      // If already have data in Redux, use it immediately
      if (studentData) {
        return true;
      }

      // Only call API if we don't have data yet
      const result = await dispatch(getStudentByUserThunk()).unwrap();
      return !!result;
    } catch (error: any) {
      // If 404 or NO_STUDENT_PROFILE, user doesn't have profile
      if (
        error.includes?.("404") ||
        error === "NO_STUDENT_PROFILE" ||
        (typeof error === "string" && error.toLowerCase().includes("not found"))
      ) {
        return false;
      }
      // For other errors, assume no profile to be safe
      return false;
    }
  }, [studentData, dispatch]);

  const handleEnrollCourse = async () => {
    const courseName = course?.title || translate("courses.ThisCourse");

    try {
      // First check if user has student profile
      const hasProfile = await checkStudentProfile();

      if (!hasProfile) {
        // Show dialog to prompt user to create profile
        setProfileDialog({
          open: true,
          courseName,
          courseId,
        });
        return;
      }

      // If has profile, proceed with enrollment
      await dispatch(createEnrollment({ courseId })).unwrap();

      setSnackbar({
        open: true,
        message: translate("courses.EnrollSuccess"),
        severity: "success",
      });

      // Refresh enrollments to update UI immediately
      dispatch(getMyEnrollments({ pageSize: 100 }));
    } catch (error: any) {
      // Check if error indicates missing student profile
      const requiresProfile =
        typeof error === "string" &&
        (error.toLowerCase().includes("student not found") ||
          error.toLowerCase().includes("student profile required") ||
          error.toLowerCase().includes("no student profile") ||
          error.toLowerCase().includes("create student profile") ||
          error.toLowerCase().includes("missing student profile"));

      if (requiresProfile) {
        setProfileDialog({
          open: true,
          courseName,
          courseId,
        });
      } else {
        setSnackbar({
          open: true,
          message:
            typeof error === "string"
              ? error
              : translate("courses.EnrollError"),
          severity: "error",
        });
      }
    }
  };

  // Navigate to course learning page for enrolled users
  const handleGoToCourse = () => {
    navigate(PATH_USER.courseLearn.replace(":courseId", courseId));
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

  // Always use preview data for course detail page
  const lessons = lessonsPreviewData?.items || [];
  // Cast to correct LessonProgressResult type from lessonProgress.ts
  const lessonProgresses = (lessonProgressData?.items || []) as any;
  
  // Enrich course with robots data
  const enrichedCourse = course ? { ...course, courseRobots } : null;

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

  if (!course || !enrichedCourse) {
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

  return (
    <>
      <Box
        sx={{
          bgcolor: "#ffffff",
          minHeight: "100vh",
        }}
      >
        {/* Hero Section - Full Width với Enroll Button */}
        <Box sx={{ bgcolor: "white", borderBottom: "1px solid #e0e0e0" }}>
          <CourseHeroSection
            course={enrichedCourse!}
            lessons={lessons}
            isUserEnrolled={isUserEnrolled}
            isEnrolling={isEnrolling}
            onEnrollCourse={handleEnrollCourse}
            onGoToCourse={isUserEnrolled ? handleGoToCourse : undefined}
          />
        </Box>

        {/* Main Content Area - Single Column Layout */}
        <Container maxWidth="lg" sx={{ px: { xs: 3, md: 6 }, py: 6 }}>
          {/* Course Content */}
          <Box sx={{ mb: 8 }}>
            <CourseTabsSection
              course={enrichedCourse!}
              lessons={lessons}
              lessonProgresses={lessonProgresses}
              isUserEnrolled={isUserEnrolled}
            />
          </Box>

          {/* Benefits Section */}
          <Box sx={{ mb: 8 }}>
            <CourseBenefitsSection isPremium={enrichedCourse!.type === CourseType.Premium} />
          </Box>
        </Container>

        {/* Sticky Bottom Enroll Bar - Show only if not enrolled */}
        {!isUserEnrolled && (
          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: "white",
              borderTop: "1px solid #e0e0e0",
              boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
              py: 2,
              px: 3,
              zIndex: 1000,
              display: { xs: "block", md: "none" },
            }}
          >
            <CourseSidebarSection
              course={enrichedCourse!}
              lessons={lessons}
              isUserEnrolled={isUserEnrolled}
              isEnrolling={isEnrolling}
              onEnrollCourse={handleEnrollCourse}
              onGoToCourse={isUserEnrolled ? handleGoToCourse : undefined}
              compact
            />
          </Box>
        )}
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
