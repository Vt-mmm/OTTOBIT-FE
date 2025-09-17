import { Box } from "@mui/material";
import Header from "../../layout/components/header/Header";
import Footer from "../../layout/components/footer/Footer";
import CourseListingSection from "../../sections/user/courses/CourseListingSection";

export default function CoursesPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box sx={{ flexGrow: 1, py: 5 }}>
        <CourseListingSection />
      </Box>
      <Footer />
    </Box>
  );
}