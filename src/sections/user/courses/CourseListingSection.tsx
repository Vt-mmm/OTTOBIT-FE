import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Pagination,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
// import { getCourses } from "../../../redux/course/courseSlice";
import { createEnrollment } from "../../../redux/enrollment/enrollmentSlice";
import { getStudentByUserThunk } from "../../../redux/student/studentThunks";
import { PATH_USER } from "../../../routes/paths";
import StudentProfileRequiredDialog from "./StudentProfileRequiredDialog";
import CourseCard from "../../../components/course/CourseCard";
import { CourseFilters } from "./CourseFilterDialog";
// import axios from "axios";
import { axiosClient } from "axiosClient";
import { useLocales } from "../../../hooks";
import FilterListIcon from "@mui/icons-material/FilterList";

interface CourseListingSectionProps {
  searchQuery: string;
  filters?: CourseFilters;
}

export default function CourseListingSection({
  searchQuery,
  filters,
}: CourseListingSectionProps) {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const studentData = useAppSelector(
    (state) => state.student.currentStudent.data
  );

  // State for UI
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(12);
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
  // Remove itemsPerPage since we use pageSize state

  // Fetch courses with API
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        PageNumber: String(currentPage),
        PageSize: String(pageSize),
      });

      // Add search (from parent state)
      if (searchQuery && searchQuery.trim().length > 0) {
        params.append("SearchTerm", searchQuery.trim());
      }

      // Add filters
      if (filters?.minPrice != null)
        params.append("MinPrice", String(filters.minPrice));
      if (filters?.maxPrice != null)
        params.append("MaxPrice", String(filters.maxPrice));
      if (filters?.type != null) params.append("Type", String(filters.type));
      if (filters?.sortBy != null)
        params.append("SortBy", String(filters.sortBy));
      if (filters?.sortDirection != null)
        params.append("SortDirection", String(filters.sortDirection));

      // Call via axiosClient with baseURL from env (no hardcoded localhost)
      const { data } = await axiosClient.get("/api/v1/courses", { params });

      setCourses(data?.data?.items || []);
      setTotalPages(data?.data?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters, searchQuery]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Reset page when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, pageSize, searchQuery]);

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
    const course = courses.find((c) => c.id === courseId);
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

      // Refresh current list to update isEnrolled status from BE
      fetchCourses();
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
  // Now uses isEnrolled field directly from BE course data
  const isUserEnrolledInCourse = (course: any): boolean => {
    // BE returns isEnrolled when user is authenticated
    // null/undefined means not authenticated or not enrolled
    return course.isEnrolled === true;
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

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
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

  return (
    <Container id="courses-list" maxWidth="lg" sx={{ pt: 2, pb: 4 }}>
      {/* Filter Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => {
            // Trigger filter dialog from parent
            const filterEvent = new CustomEvent("openCourseFilter");
            window.dispatchEvent(filterEvent);
          }}
          sx={{
            borderColor: "#4caf50",
            color: "#4caf50",
            "&:hover": {
              borderColor: "#45a049",
              backgroundColor: "rgba(76, 175, 80, 0.04)",
            },
          }}
        >
          Bộ lọc
        </Button>
      </Box>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Alert severity="info">Không có khóa học nào</Alert>
        </Box>
      ) : (
        <>
          {/* Course Grid Layout - Max 3 columns */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 3,
              mb: 4,
            }}
          >
            {courses.map((course) => (
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
                isEnrolled={isUserEnrolledInCourse(course)}
                onEnroll={handleEnrollCourse}
                price={(course as any).price}
                type={(course as any).type}
                ratingAverage={(course as any).ratingAverage || 0}
                ratingCount={(course as any).ratingCount || 0}
              />
            ))}
          </Box>

          {/* Pagination and Page Size Selector */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ mt: 4 }}
          >
            {/* Page Size Selector */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Hiển thị</InputLabel>
              <Select
                value={pageSize}
                label="Hiển thị"
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <MenuItem value={6}>6</MenuItem>
                <MenuItem value={9}>9</MenuItem>
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={18}>18</MenuItem>
              </Select>
            </FormControl>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            )}
          </Stack>
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
