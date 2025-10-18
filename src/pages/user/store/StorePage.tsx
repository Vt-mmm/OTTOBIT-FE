import { Box } from "@mui/material";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import OttoBitHeroSection from "sections/user/store/OttoBitHeroSection";
import BestSellingProductSection from "sections/user/store/BestSellingProductSection";
import ExperiencesAndMaterialsSection from "sections/user/store/ExperiencesAndMaterialsSection";
import { LanguageSwitcher } from "components/common";

export default function StorePage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative" }}>
      {/* Language Switcher - Top right */}
      <Box
        sx={{
          position: "fixed",
          top: { xs: 80, md: 90 },
          right: { xs: 16, md: 32 },
          zIndex: 1000,
        }}
      >
        <LanguageSwitcher />
      </Box>

      {/* Header hệ thống */}
      <Header />
      <Box sx={{ flexGrow: 1 }}>
        {/* Sections theo template Figma nhưng với nội dung OttoBit */}
        <OttoBitHeroSection />
        <BestSellingProductSection />
        <ExperiencesAndMaterialsSection />
      </Box>
      <Footer />
    </Box>
  );
}
