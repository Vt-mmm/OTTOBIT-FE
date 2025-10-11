import { Box, Container, Typography, Button, Stack, Card } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useNavigate } from "react-router-dom";
import { PATH_PUBLIC, PATH_USER } from "routes/paths";
import { useAppSelector } from "store/config";
import useLocales from "hooks/useLocales";

export default function OttoBitHeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { translate } = useLocales();

  const handleShopNow = () => {
    navigate(isAuthenticated ? PATH_USER.robots : PATH_PUBLIC.robots);
  };

  const handleComponentsClick = () => {
    navigate(isAuthenticated ? PATH_USER.components : PATH_PUBLIC.components);
  };

  return (
    <Box
      sx={{
        bgcolor: "white",
        minHeight: { xs: "auto", md: "85vh" },
        position: "relative",
        py: { xs: 8, md: 10 },
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "45fr 55fr" },
            gap: { xs: 6, lg: 8 },
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Left Content */}
          <Box
            sx={{
              zIndex: 2,
              pr: { lg: 4 },
            }}
          >
            {/* Hero Title */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "3.25rem", lg: "4rem" },
                fontWeight: 800,
                lineHeight: 1.15,
                mb: 3,
                color: "#1a1a1a",
                fontFamily: '"Playfair Display", serif',
              }}
            >
              {translate("store.hero.titlePart1")}{" "}
              <Box component="span" sx={{ display: "block", color: "#43A047" }}>
                {translate("store.hero.titlePart2")}
              </Box>
            </Typography>

            {/* CTA Buttons */}
              <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleShopNow}
                  sx={{
                    bgcolor: "#43A047",
                    color: "white",
                    px: 3.5,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 3,
                    boxShadow: "0 4px 14px rgba(67, 160, 71, 0.35)",
                    "&:hover": {
                      bgcolor: "#388E3C",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(67, 160, 71, 0.45)",
                    },
                  }}
                >
                  {translate("store.hero.learnMore")}
                </Button>

                <Button
                  onClick={handleShopNow}
                  startIcon={
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "#FFA726",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PlayArrowIcon sx={{ color: "white", fontSize: 20 }} />
                    </Box>
                  }
                  sx={{
                    color: "#424242",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                    "&:hover": {
                      bgcolor: "transparent",
                      color: "#1a1a1a",
                    },
                  }}
                >
                  {translate("store.hero.howItWorks")}
                </Button>
            </Stack>

            {/* Feature Cards */}
              <Stack spacing={2} sx={{ maxWidth: 280 }}>
                <Card
                  onClick={handleShopNow}
                  sx={{
                    background: "linear-gradient(135deg, #5E35B1 0%, #7E57C2 100%)",
                    color: "white",
                    p: 2,
                    borderRadius: 3,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(94, 53, 177, 0.25)",
                    "&:hover": {
                      transform: "translateX(8px)",
                      boxShadow: "0 6px 16px rgba(94, 53, 177, 0.35)",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      component="img"
                      src="/asset/OttobitCar.png"
                      sx={{ width: 60, height: 60, objectFit: "contain" }}
                    />
                    <Typography fontWeight={600} fontSize="0.95rem">
                      {translate("store.hero.trendingRobots")}
                    </Typography>
                  </Stack>
                </Card>

                <Card
                  onClick={handleComponentsClick}
                  sx={{
                    background: "linear-gradient(135deg, #66BB6A 0%, #81C784 100%)",
                    color: "white",
                    p: 2,
                    borderRadius: 3,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(102, 187, 106, 0.25)",
                    "&:hover": {
                      transform: "translateX(8px)",
                      boxShadow: "0 6px 16px rgba(102, 187, 106, 0.35)",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      component="img"
                      src="/asset/Microbitv2-removebg-preview.png"
                      sx={{ width: 60, height: 60, objectFit: "contain" }}
                    />
                    <Typography fontWeight={600} fontSize="0.95rem">
                      {translate("store.hero.bestComponents")}
                    </Typography>
                  </Stack>
                </Card>
              </Stack>
          </Box>

          {/* Right Content - Product Image & Store Icons */}
          <Box
            sx={{
              position: "relative",
              display: { xs: "none", lg: "flex" },
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              minHeight: 600,
            }}
          >
            {/* Main Product Image */}
            <Box
              sx={{
                position: "relative",
                zIndex: 2,
                width: 550,
                height: 550,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "rotate(-5deg)",
              }}
            >
              <img
                src="/asset/Microbitv2-removebg-preview.png"
                alt="OttoBit Product"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.2))",
                }}
              />
            </Box>

            {/* Decorative Icons on Right */}
            <Stack
              spacing={2.5}
              sx={{
                position: "absolute",
                right: 30,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              {/* Gift Icon */}
              <Box
                sx={{
                  width: 75,
                  height: 75,
                  borderRadius: "50%",
                  bgcolor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  border: "1px solid #f0f0f0",
                  fontSize: "2.2rem",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                🎁
              </Box>

              {/* Robot Icon */}
              <Box
                sx={{
                  width: 75,
                  height: 75,
                  borderRadius: "50%",
                  bgcolor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  border: "1px solid #f0f0f0",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Box
                  component="img"
                  src="/asset/OttobitCar.png"
                  sx={{ width: 50, height: 50, objectFit: "contain" }}
                />
              </Box>

              {/* Star Icon */}
              <Box
                sx={{
                  width: 75,
                  height: 75,
                  borderRadius: "50%",
                  bgcolor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  border: "1px solid #f0f0f0",
                  fontSize: "2.2rem",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                ⭐
              </Box>
            </Stack>

            {/* Top Right Badge */}
            <Box
              sx={{
                position: "absolute",
                top: 30,
                right: 100,
              }}
            >
              <Card
                sx={{
                  bgcolor: "white",
                  p: 2.5,
                  borderRadius: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  border: "1px solid #f0f0f0",
                  minWidth: 200,
                  textAlign: "center",
                }}
              >
                <Typography
                  fontWeight={700}
                  fontSize="1.15rem"
                  color="#1a1a1a"
                  mb={0.5}
                >
                  {translate("store.hero.exploreCollection")}
                </Typography>
              </Card>
            </Box>

            {/* Emoji Badge */}
            <Box
              sx={{
                position: "absolute",
                left: 60,
                top: "32%",
                width: 70,
                height: 70,
                borderRadius: "50%",
                bgcolor: "#FFD93D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.2rem",
                boxShadow: "0 8px 20px rgba(255, 217, 61, 0.4)",
              }}
            >
              🎓
            </Box>

            {/* Offer Text */}
            <Typography
              sx={{
                position: "absolute",
                left: 40,
                bottom: "28%",
                fontSize: "0.9rem",
                color: "#666",
                bgcolor: "white",
                px: 2.5,
                py: 1.5,
                borderRadius: 2,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                border: "1px solid #f0f0f0",
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              {translate("store.hero.educationalDesc")}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
