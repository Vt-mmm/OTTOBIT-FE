import { Box } from "@mui/material";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import LessonDetailSection from "sections/user/lessons/LessonDetailSection";
import { useParams } from "react-router-dom";

export default function LessonDetailPage() {
  const { id: lessonId } = useParams<{ id: string }>();

  if (!lessonId) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <Box sx={{ flexGrow: 1, py: 5, textAlign: "center" }}>
          <p>Không tìm thấy bài học</p>
        </Box>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box sx={{ flexGrow: 1 }}>
        <LessonDetailSection lessonId={lessonId} />
      </Box>
      <Footer />
    </Box>
  );
}