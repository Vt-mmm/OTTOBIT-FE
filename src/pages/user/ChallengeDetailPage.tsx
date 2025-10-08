import { Box } from "@mui/material";
import Header from "layout/components/header/Header";
import Footer from "layout/components/footer/Footer";
import ChallengeDetailSection from "sections/user/challenges/ChallengeDetailSection";
import { useParams } from "react-router-dom";
import { LanguageSwitcher } from "components/common";
import { useLocales } from "hooks";

export default function ChallengeDetailPage() {
  const { id: challengeId } = useParams<{ id: string }>();
  const { translate } = useLocales();

  if (!challengeId) {
    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />

        {/* Language Switcher */}
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

        <Box sx={{ flexGrow: 1, py: 5, textAlign: "center" }}>
          <p>{translate("challenges.PageChallengeNotFound")}</p>
        </Box>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      {/* Language Switcher */}
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

      <Box sx={{ flexGrow: 1, py: 5 }}>
        <ChallengeDetailSection challengeId={challengeId} />
      </Box>
      <Footer />
    </Box>
  );
}
