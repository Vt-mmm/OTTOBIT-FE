import { useState } from "react";
import { Box } from "@mui/material";
import Header from "../../layout/components/header/Header";
import Footer from "../../layout/components/footer/Footer";
import { LanguageSwitcher } from "../../components/common";
import CourseHeroSection from "../../sections/user/courses/CourseHeroSection";
import CourseListingSection from "../../sections/user/courses/CourseListingSection";
import { CourseFilters } from "../../sections/user/courses/CourseFilterDialog";

export default function CoursesPage() {
  // Decouple typing input from applied search term
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilters, setCourseFilters] = useState<CourseFilters>({});

  const handleSearchChange = (query: string) => {
    setSearchInput(query);
  };

  const handleSearchSubmit = () => {
    setSearchQuery(searchInput.trim());
  };

  const handleFilterApply = (filters: CourseFilters) => {
    setCourseFilters(filters);
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
          searchQuery={searchInput}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onFilterApply={handleFilterApply}
          courseFilters={courseFilters}
        />
        <Box sx={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
          <CourseListingSection
            searchQuery={searchQuery}
            filters={courseFilters}
          />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
