import React from "react";
import { Box, Divider, Container } from "@mui/material";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import {
  HeroSection,
  FeaturesSection,
  BrandsSection,
  BannerSection,
} from "sections/user/homepage";
import { useAppSelector } from "store/config";

const HomePage: React.FC = () => {
  // Check if user is authenticated to show chat button
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#fff",
        width: "100%",
        overflow: "hidden", // Ngăn chặn scroll ngang không mong muốn
      }}
    >
      <Header />

      {/* Main content container - controls max width throughout */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <HeroSection />

        <FeaturesSection />

        <Container
          maxWidth={false}
          sx={{
            width: "100%",
            maxWidth: "1440px",
            px: { xs: 2, sm: 3, md: 4, lg: 5 },
            mx: "auto",
          }}
        >
          <BrandsSection />

          <Divider
            sx={{
              my: { xs: 3, sm: 4, md: 5 },
              opacity: 0.6,
              width: "100%",
            }}
          />

          <BannerSection />
          <Divider
            sx={{
              my: { xs: 3, sm: 4, md: 5 },
              opacity: 0.6,
              width: "100%",
            }}
          />
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default HomePage;
