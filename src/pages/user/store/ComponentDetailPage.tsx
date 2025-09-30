import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import ComponentDetailSection from "sections/user/store/ComponentDetailSection";

export default function ComponentDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "white" }}>
      <Header />
      <Box sx={{ flexGrow: 1, py: 6, mt: 2 }}>
        <ComponentDetailSection componentId={id || ""} />
      </Box>
      <Footer />
    </Box>
  );
}