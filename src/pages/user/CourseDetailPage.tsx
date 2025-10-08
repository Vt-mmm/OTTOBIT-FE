import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "../../layout/components/header/Header";
import Footer from "../../layout/components/footer/Footer";
import CourseDetailSection from "../../sections/user/courses/CourseDetailSection";
import { LanguageSwitcher } from "../../components/common";
import { useLocales } from "../../hooks";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { translate } = useLocales();

  if (!id) {
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
        sx={{ flexGrow: 1, py: { xs: 2, sm: 3, md: 5 }, px: { xs: 0, sm: 2 } }}
      >
        <CourseDetailSection courseId={id} />
      </Box>
      <Footer />
    </Box>
  );
}
