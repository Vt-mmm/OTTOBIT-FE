import React from "react";
import { Box } from "@mui/material";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import {
  HeroSection,
  InteractiveShowcaseSection,
  FeaturesSection,
  BannerSection,
} from "sections/user/homepage";

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
      }}
    >
      <Header />

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

        {/* Features Overview */}
        <FeaturesSection />

        {/* Interactive Technology Showcase */}
        <InteractiveShowcaseSection />

        {/* Call to Action Banner */}
        <BannerSection />
      </Box>

      <Footer />
    </Box>
  );
};

export default HomePage;
