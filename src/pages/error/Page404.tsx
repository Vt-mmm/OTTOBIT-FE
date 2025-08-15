// @mui
import { Box, Button, Container, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { StyledContent } from "./styles";
import { useNavigate } from "react-router-dom";

// Inject global keyframes using a CSS-in-JS solution or external CSS
import { css } from "@emotion/react";
import { Global } from "@emotion/react";

// ----------------------------------------------------------------------

function Page404() {
  const navigate = useNavigate();
  const handleNavigateHome = () => {
    navigate("/"); // Navigate to homepage instead of login
  };

  // Define the keyframes for the bounce animation
  const bounceAnimation = css`
    @keyframes bounce {
      0%,
      20%,
      50%,
      80%,
      100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-20px);
      }
      60% {
        transform: translateY(-10px);
      }
    }
  `;

  return (
    <>
      {/* Inject global styles */}
      <Global styles={bounceAnimation} />

      <Helmet title="404 - Page Not Found" />

      <Container maxWidth="sm">
        <StyledContent
          sx={{
            textAlign: "center",
            alignItems: "center",
            bgcolor: "#ffffff",
            p: { xs: 3, md: 5 },
            mt: { xs: 4, md: 8 },
            borderRadius: 3,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.18)",
            },
          }}
        >
          <Box
            component="img"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCEvzt9ilh8D0TPZRvKwD-UQhX135oYFE1PA&s"
            alt="404 Illustration"
            sx={{
              width: { xs: 200, md: 300 },
              mb: 3,
              animation: "bounce 2s infinite", // Reference the animation
            }}
          />

          <Typography
            variant="h2"
            paragraph
            sx={{
              color: "#16ab65",
              fontWeight: "700",
              letterSpacing: "-0.5px",
            }}
          >
            Oops! Page Not Found
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 4,
              maxWidth: 400,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            It seems we can't find the page you're looking for. Double-check the
            URL or head back to the homepage.
          </Typography>

          <Box display="flex" justifyContent="center" gap={2}>
            <Button
              size="large"
              variant="contained"
              color="primary"
              onClick={handleNavigateHome}
              sx={{
                bgcolor: "#16ab65",
                color: "#fff",
                px: 4,
                py: 1.5,
                fontWeight: "600",
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(22, 171, 101, 0.3)",
                "&:hover": {
                  bgcolor: "#138a52",
                  boxShadow: "0 6px 16px rgba(22, 171, 101, 0.4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Go to Homepage
            </Button>
          </Box>
        </StyledContent>
      </Container>
    </>
  );
}

export default Page404;
