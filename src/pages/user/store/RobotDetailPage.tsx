import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import RobotDetailSection from "sections/user/store/RobotDetailSection";

export default function RobotDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "white" }}>
      <Header />
      <Box sx={{ flexGrow: 1, py: 6, mt: 2 }}>
        <RobotDetailSection robotId={id || ""} />
      </Box>
      <Footer />
    </Box>
  );
}