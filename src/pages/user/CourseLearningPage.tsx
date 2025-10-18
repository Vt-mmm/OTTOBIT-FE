import { useParams, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/config";
import { getMyEnrollments } from "../../redux/enrollment/enrollmentSlice";
import { PATH_USER } from "../../routes/paths";
import Header from "../../layout/components/header/Header";
import Footer from "../../layout/components/footer/Footer";
import CourseLearningSection from "../../sections/user/courses/CourseLearningSection";
import { LanguageSwitcher } from "../../components/common";
import { useLocales } from "../../hooks";

export default function CourseLearningPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { translate } = useLocales();
  const dispatch = useAppDispatch();

  const { myEnrollments, operations } = useAppSelector(
    (state) => state.enrollment
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch enrollments if not already loaded
  useEffect(() => {
    if (isAuthenticated && !myEnrollments.data && !myEnrollments.isLoading) {
      dispatch(getMyEnrollments({ pageSize: 10 }));
    }
  }, [dispatch, isAuthenticated, myEnrollments.data, myEnrollments.isLoading]);

  // Redirect to course detail if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to={PATH_USER.courseDetail.replace(":id", courseId || "")}
        replace
      />
    );
  }

  // ✅ FIX: Show loading while enrollments are being fetched OR during enrollment operation
  // This prevents premature redirect when F5 resets Redux state
  if (myEnrollments.isLoading || operations.isEnrolling || !myEnrollments.data) {
    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <h1>{translate("courses.Loading")}</h1>
          </Box>
        </Box>
        <Footer />
      </Box>
    );
  }

  // ✅ Now safe to check enrollment - data is guaranteed to be loaded
  const isUserEnrolled =
    myEnrollments.data?.items?.some(
      (enrollment) => enrollment.courseId === courseId
    ) || false;

  // Redirect to course detail if not enrolled
  if (!isUserEnrolled) {
    return (
      <Navigate
        to={PATH_USER.courseDetail.replace(":id", courseId || "")}
        replace
      />
    );
  }

  if (!courseId) {
    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />

        {/* Language Switcher */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 80, md: 90 },
            right: { xs: 16, md: 32 },
            zIndex: 999,
          }}
        >
          <LanguageSwitcher />
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <h1>{translate("courses.CourseNotFound")}</h1>
            <p>{translate("courses.CourseIdMissing")}</p>
          </Box>
        </Box>
        <Footer />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        maxWidth: "100vw",
        overflow: "hidden",
        bgcolor: "#fafafa", // Clean light gray background
      }}
    >
      <Header />

      {/* Language Switcher */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 80, md: 90 },
          right: { xs: 16, md: 32 },
          zIndex: 999,
        }}
      >
        <LanguageSwitcher />
      </Box>

      <Box
        sx={{ flexGrow: 1, py: 0, px: 0 }} // Remove padding to let section control layout
      >
        <CourseLearningSection courseId={courseId} />
      </Box>
      <Footer />
    </Box>
  );
}
