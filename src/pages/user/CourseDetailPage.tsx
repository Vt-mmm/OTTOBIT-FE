import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "../../layout/components/header/Header";
import Footer from "../../layout/components/footer/Footer";
import CourseDetailSection from "../../sections/user/courses/CourseDetailSection";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box sx={{ textAlign: "center" }}>
            <h1>Course Not Found</h1>
            <p>Course ID is missing</p>
          </Box>
        </Box>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box sx={{ flexGrow: 1, py: 5 }}>
        <CourseDetailSection courseId={id} />
      </Box>
      <Footer />
    </Box>
  );
}