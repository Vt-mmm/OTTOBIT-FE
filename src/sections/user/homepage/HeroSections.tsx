import { Box, Container, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useAppSelector } from "store/config";
import { useLocales } from "hooks";
import { useNavigate } from "react-router-dom";
import { PATH_AUTH, PATH_USER } from "routes/paths";

const HeroSection = () => {
  const { translate } = useLocales();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (isAuthenticated) {
      navigate(PATH_USER.store);
    } else {
      navigate(PATH_AUTH.login);
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      sx={{
        width: "100%",
        pt: { xs: 0, md: 0 },
        pb: { xs: 8, md: 10 },
        position: "relative",
        minHeight: { xs: "100vh", md: "100vh" },
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Video Background - Positioned Right with strong mask */}
      <Box
        component="video"
        autoPlay
        loop
        muted
        playsInline
        sx={{
          position: "absolute",
          top: { xs: "60%", md: "50%" },
          right: { xs: "50%", md: "5%" },
          transform: { xs: "translate(50%, -50%)", md: "translateY(-50%)" },
          width: { xs: "120%", sm: "100%", md: "55%" },
          height: "auto",
          maxHeight: { xs: "50%", md: "95%" },
          objectFit: "contain",
          zIndex: 0,
          opacity: 1,
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 70%)",
        }}
      >
        <source src="/video/original-f12cae43867f9ff8f5c64c09017e4355.mp4" type="video/mp4" />
      </Box>

      {/* Gradient overlay for text readability */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: {
            xs: "linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.2) 100%)",
            md: "linear-gradient(to right, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0) 70%)"
          },
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth={false}
        sx={{
          maxWidth: "1440px",
          px: { xs: 3, sm: 4, md: 5 },
          position: "relative",
          zIndex: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 4, md: 6 },
            height: "100%",
          }}
        >
          {/* Left Column - Text Content (no background card) */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            sx={{
              width: { xs: "100%", md: "auto" },
              maxWidth: { xs: "100%", md: "520px" },
              zIndex: 2,
              padding: { xs: 4, sm: 3, md: 0 },
              position: { xs: "relative", md: "absolute" },
              left: { xs: "auto", md: "8%" },
              top: { xs: "auto", md: "50%" },
              transform: { xs: "none", md: "translateY(-50%)" },
              textAlign: { xs: "center", md: "left" },
              mt: { xs: 12, sm: 15, md: 0 },
            }}
          >
            {/* Main Heading */}
            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2rem", sm: "2.75rem", md: "4rem" },
                lineHeight: { xs: 1.2, md: 1.1 },
                mb: { xs: 2, md: 3 },
                color: "#000000",
                textShadow: "2px 2px 4px rgba(255,255,255,0.8)",
              }}
            >
              {translate("homepage.HeroHeading")}{" "}
              <Box
                component="span"
                sx={{
                  textDecoration: "underline",
                  textDecorationColor: "#000000",
                  textDecorationThickness: "3px",
                  textUnderlineOffset: "6px",
                }}
              >
                {translate("homepage.Ottobit")}
              </Box>
            </Typography>

            {/* Subtitle */}
            <Typography
              sx={{
                fontSize: { xs: "0.95rem", sm: "1.0625rem", md: "1.125rem" },
                lineHeight: { xs: 1.6, md: 1.8 },
                color: "#1f2937",
                mb: { xs: 3, md: 4 },
                fontWeight: 500,
                textShadow: "1px 1px 2px rgba(255,255,255,0.9)",
              }}
            >
              {translate("homepage.HeroDescription")}
            </Typography>

            {/* Action Button */}
            <Button
              variant="contained"
              onClick={handleButtonClick}
              sx={{
                backgroundColor: "#a3e635",
                color: "#000000",
                fontWeight: 600,
                px: { xs: 3, md: 4 },
                py: { xs: 1.25, md: 1.5 },
                fontSize: { xs: "0.95rem", md: "1rem" },
                borderRadius: "12px",
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(163, 230, 53, 0.4)",
                width: { xs: "auto", sm: "auto" },
                "&:hover": {
                  backgroundColor: "#84cc16",
                  boxShadow: "0 6px 20px rgba(132, 204, 22, 0.5)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {isAuthenticated
                ? translate("homepage.ExploreProductsButton")
                : translate("homepage.LoginButton")}
            </Button>

          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
