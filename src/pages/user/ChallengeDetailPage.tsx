import { Box } from "@mui/material";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import ChallengeDetailSection from "sections/user/challenges/ChallengeDetailSection";
import { useParams } from "react-router-dom";

export default function ChallengeDetailPage() {
  const { id: challengeId } = useParams<{ id: string }>();

  if (!challengeId) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <Box sx={{ flexGrow: 1, py: 5, textAlign: "center" }}>
          <p>Không tìm thấy thử thách</p>
        </Box>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box sx={{ flexGrow: 1, py: 5 }}>
        <ChallengeDetailSection challengeId={challengeId} />
      </Box>
      <Footer />
    </Box>
  );
}