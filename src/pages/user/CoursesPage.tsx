import { useState } from "react";
import { Box } from "@mui/material";
import Header from "../../layout/components/header/Header";
import Footer from "../../layout/components/footer/Footer";
import { LanguageSwitcher } from "../../components/common";
import CourseHeroSection from "../../sections/user/courses/CourseHeroSection";
import CourseListingSection from "../../sections/user/courses/CourseListingSection";

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <Header />

      {/* Language Switcher - Top right */}
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
      <Box sx={{ flexGrow: 1 }}>
        <CourseHeroSection
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
        <Box sx={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
          <CourseListingSection searchQuery={searchQuery} />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
