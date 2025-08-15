import { Link as RouterLink } from "react-router-dom";
// @mui
import { Box, Button, Container, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { styled } from "@mui/material/styles";

// ----------------------------------------------------------------------

// Custom styled component for content
const StyledContent = styled(Box)(({ theme }) => ({
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh", // Full-screen height
  background: "linear-gradient(135deg, #fce4e4 0%, #f8baba 100%)", // Gradient background with error theme
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
  maxWidth: 600,
  margin: "0 auto",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.02)", // Slight hover scaling effect
  },
}));

function Page500() {
  return (
    <>
      <Helmet title="500 - Internal Server Error" />{" "}
      {/* Updated title to English */}
      <Container>
        <StyledContent>
          {/* Uncomment and replace with a valid image URL if needed */}
          {/* <Box
            component="img"
            src="https://example.com/server-error.png"
            alt="500 Internal Server Error"
            sx={{
              width: { xs: 200, sm: 300 }, // Responsive width
              mb: 3,
              borderRadius: 2,
              boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
              animation: "fadeIn 1s ease-in", // Fade-in animation
            }}
          /> */}

          {/* Title with gradient text */}
          <Typography
            variant="h3"
            paragraph
            sx={{
              background: "linear-gradient(45deg, #d32f2f, #ff6f6f)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            Internal Server Error
          </Typography>

          {/* Description with improved typography */}
          <Typography
            sx={{
              color: "text.secondary",
              mb: 4,
              fontSize: { xs: "1rem", sm: "1.1rem" }, // Responsive font size
              lineHeight: 1.6,
              maxWidth: "80%",
            }}
          >
            The server encountered an issue. Please try again later or return to
            the homepage.
          </Typography>

          {/* Button with modern styling */}
          <Button
            size="large"
            variant="contained"
            component={RouterLink}
            to="/"
            sx={{
              bgcolor: "#d32f2f",
              color: "#fff",
              paddingX: 4,
              paddingY: 1.5,
              borderRadius: 10, // Rounded button
              boxShadow: "0 4px 12px rgba(211, 47, 47, 0.4)",
              "&:hover": {
                bgcolor: "#b71c1c",
                boxShadow: "0 6px 16px rgba(211, 47, 47, 0.6)",
                transform: "translateY(-2px)", // Slight lift on hover
              },
              transition: "all 0.3s ease",
            }}
          >
            Chở về trang chủ
          </Button>
        </StyledContent>
      </Container>
      {/* Add keyframes for animation (uncomment if using the image) */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </>
  );
}

export default Page500;
