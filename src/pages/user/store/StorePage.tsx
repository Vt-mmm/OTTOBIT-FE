import { Box } from "@mui/material";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import OttoBitHeroSection from "sections/user/store/OttoBitHeroSection";
import BestSellingProductSection from "sections/user/store/BestSellingProductSection";
import ExperiencesAndMaterialsSection from "sections/user/store/ExperiencesAndMaterialsSection";

export default function StorePage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
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
