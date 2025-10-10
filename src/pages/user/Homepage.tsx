import React from "react";
import { Box } from "@mui/material";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import { LanguageSwitcher } from "components/common";
import {
  HeroSection,
  TransitionSection,
  InteractiveShowcaseSection,
  FeaturesSection,
  BannerSection,
} from "sections/user/homepage";
import { AIFloatingButton } from "components/ai";

const HomePage: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#fff",
        width: "100%",
        overflow: "hidden",
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

      {/* Main Exhibition Layout */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Hero Section với Drone 3D */}
        <HeroSection />

        {/* Transition Section - Connect */}
        <TransitionSection />

        {/* Features Overview */}
        <FeaturesSection />

        {/* Interactive Technology Showcase */}
        <InteractiveShowcaseSection />

        {/* Call to Action Banner */}
        <BannerSection />
      </Box>

      <Footer />

      {/* AI Assistant Floating Button */}
      <AIFloatingButton
        position={{ bottom: 24, right: 24 }}
        tooltip="AI Trợ lý - Gợi ý khóa học"
      />
    </Box>
  );
};

export default HomePage;
