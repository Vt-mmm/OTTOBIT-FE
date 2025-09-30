import { Box, Container, Typography } from "@mui/material";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import RobotListingSection from "sections/user/store/RobotListingSection";

export default function RobotListPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "white" }}>
      <Header />
      <Box sx={{ flexGrow: 1, py: 6, mt: 2 }}>
        <Container maxWidth="xl">
          <Typography variant="h3" component="h1" sx={{ mb: 1, fontWeight: 700 }}>
            Educational Robots
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Discover our collection of educational robots perfect for learning programming and robotics
          </Typography>
          <RobotListingSection />
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}