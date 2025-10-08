import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Pagination,
  Snackbar,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getCourses } from "../../../redux/course/courseSlice";
import {
  createEnrollment,
  getMyEnrollments,
} from "../../../redux/enrollment/enrollmentSlice";
import { getStudentByUserThunk } from "../../../redux/student/studentThunks";
import { PATH_USER } from "../../../routes/paths";
import StudentProfileRequiredDialog from "./StudentProfileRequiredDialog";
// import CourseFilterSidebar from "./CourseFilterSidebar";
// import CourseListingHeader, { SortOption } from "./CourseListingHeader";

type SortOption = "newest" | "oldest" | "alphabetical" | "popular";
import CourseCard from "../../../components/course/CourseCard";
import { useLocales } from "../../../hooks";

interface CourseListingSectionProps {
  searchQuery: string;
}

export default function CourseListingSection({
  searchQuery,
}: CourseListingSectionProps) {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    data: courses,
    isLoading,
    error,
  } = useAppSelector((state) => state.course.courses);
  const { myEnrollments } = useAppSelector((state) => state.enrollment);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { studentData } = useAppSelector((state) => ({
    studentData: state.student.currentStudent.data,
  }));

  // State for UI
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [profileDialog, setProfileDialog] = useState({
    open: false,
    courseName: "",
    courseId: "",
  });
  const itemsPerPage = 12;

  // Fetch courses (public data)
  useEffect(() => {
    dispatch(getCourses({ pageSize: 50 }));
  }, [dispatch]);

  // Fetch enrollments ONLY if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getMyEnrollments({ pageSize: 100 }));
    }
  }, [dispatch, isAuthenticated]);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    if (!courses?.items) return [];

    let filtered = courses.items.filter((course) => {
      // Search filter
      if (
        searchQuery &&
        !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !course.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "popular":
          return (b.enrollmentsCount || 0) - (a.enrollmentsCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [courses?.items, searchQuery, sortBy]);

  // Paginate courses
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedCourses.slice(startIndex, endIndex);
  }, [filteredAndSortedCourses, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage);

  const handleCourseClick = (courseId: string) => {
    navigate(PATH_USER.courseDetail.replace(":id", courseId));
  };

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

  const handleEnrollCourse = async (courseId: string) => {
    // Find course name for better UX
    const course = courses?.items?.find((c) => c.id === courseId);
    const courseName = course?.title || "khóa học này";

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
        message: translate("courses.EnrollmentSuccess"),
        severity: "success",
      });

      // Refresh enrollments to update UI immediately
      dispatch(getMyEnrollments({ pageSize: 100 }));
    } catch (error: any) {
      // Check if error indicates missing student profile
      const requiresProfile =
        typeof error === "string" &&
        [
          "student not found",
          "student profile required",
          "no student profile",
          "create student profile",
          "missing student profile",
        ].some((keyword) => error.toLowerCase().includes(keyword));

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
              : translate("courses.EnrollmentError"),
          severity: "error",
        });
      }
    }
  };

  // Helper function to check if user is enrolled in a course
  const isUserEnrolledInCourse = (courseId: string): boolean => {
    if (!myEnrollments.data?.items) {
      return false;
    }

    const isEnrolled = myEnrollments.data.items.some((enrollment) => {
      return enrollment.courseId === courseId;
    });

    return isEnrolled;
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

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl">
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
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with search result count and sort */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: "#666" }}>
          {searchQuery ? (
            <span
              dangerouslySetInnerHTML={{
                __html: translate("courses.FoundCoursesFor", {
                  count: filteredAndSortedCourses.length,
                  query: searchQuery,
                }),
              }}
            />
          ) : (
            <>
              <span
                dangerouslySetInnerHTML={{
                  __html: translate("courses.FoundCourses", {
                    count: filteredAndSortedCourses.length,
                  }),
                }}
              />{" "}
              {translate("courses.PageInfo", {
                current: currentPage,
                total: Math.max(1, totalPages),
              })}
            </>
          )}
        </Typography>

        {/* Sort Dropdown */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>{translate("courses.SortBy")}</InputLabel>
          <Select
            value={sortBy}
            label={translate("courses.SortBy")}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
          >
            <MenuItem value="newest">
              {translate("courses.SortByNewest")}
            </MenuItem>
            <MenuItem value="popular">
              {translate("courses.SortByPopular")}
            </MenuItem>
            <MenuItem value="alphabetical">
              {translate("courses.CourseName")}
            </MenuItem>
            <MenuItem value="oldest">
              {translate("courses.SortByOldest")}
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Course Grid */}
      {paginatedCourses.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Alert severity="info">
            {courses?.items?.length === 0
              ? translate("courses.NoCourses")
              : searchQuery
              ? translate("courses.NoCoursesForQuery", { query: searchQuery })
              : translate("courses.NoCoursesFound")}
          </Alert>
        </Box>
      ) : (
        <>
          {/* Course Stack Layout - Coursera style */}
          <Stack spacing={3} sx={{ mb: 4 }}>
            {paginatedCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                imageUrl={course.imageUrl || ""}
                createdByName={course.createdByName}
                lessonsCount={course.lessonsCount}
                enrollmentsCount={course.enrollmentsCount}
                createdAt={course.createdAt}
                updatedAt={course.updatedAt}
                onClick={handleCourseClick}
                isEnrolled={isUserEnrolledInCourse(course.id)}
                onEnroll={handleEnrollCourse}
                price={(course as any).price}
                type={(course as any).type}
              />
            ))}
          </Stack>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

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
    </Container>
  );
}
