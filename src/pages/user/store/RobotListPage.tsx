import { useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import RobotListingSection from "sections/user/store/RobotListingSection";

export default function RobotListPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "white",
        maxWidth: "100vw",
        overflow: "hidden",
      }}
    >
      <Header />
      <Box
        sx={{
          flexGrow: 1,
          py: { xs: 3, sm: 4, md: 6 },
          mt: { xs: 1, sm: 2 },
          px: { xs: 0, sm: 2 },
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              mb: 1,
              fontWeight: 700,
              fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            Educational Robots
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: { xs: 3, sm: 4 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Discover our collection of educational robots perfect for learning
            programming and robotics
          </Typography>
          <RobotListingSection />
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
