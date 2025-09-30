import { Box, Container, Typography } from "@mui/material";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import ComponentListingSection from "sections/user/store/ComponentListingSection";

export default function ComponentListPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "white" }}>
      <Header />
      <Box sx={{ flexGrow: 1, py: 6, mt: 2 }}>
        <Container maxWidth="xl">
          <Typography variant="h3" component="h1" sx={{ mb: 1, fontWeight: 700 }}>
            Electronic Components
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Browse our wide range of electronic components for your robotics projects
          </Typography>
          <ComponentListingSection />
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}