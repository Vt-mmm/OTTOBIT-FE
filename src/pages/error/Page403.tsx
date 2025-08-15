// @mui
import { Box, Button, Container, Typography, Stack } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// ----------------------------------------------------------------------

// Custom styled component for content
const StyledContent = styled(Box)(({ theme }) => ({
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh", // Full-screen height
  background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", // Gradient background
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

function Page403() {
  const navigate = useNavigate();
  
  const handleNavigateLogin = () => {
    navigate("/auth/login");
  };
  
  const handleNavigateHome = () => {
    navigate("/");
  };

  return (
    <>
      <Helmet title="403 - Access Denied" /> {/* Updated title to English */}
      <Container>
        <StyledContent>
          {/* Image with subtle animation */}
          <Box
            component="img"
            src="https://bizflyportal.mediacdn.vn/thumb_wm/1000,100/bizflyportal/images/loi16045468899996.jpg"
            alt="403 Forbidden"
            sx={{
              width: { xs: 200, sm: 300 }, // Responsive width
              mb: 3,
              borderRadius: 2,
              boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
              animation: "fadeIn 1s ease-in", // Fade-in animation
            }}
          />

          {/* Title with gradient text */}
          <Typography
            variant="h3"
            paragraph
            sx={{
              background: "linear-gradient(45deg, #16ab65, #34c759)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            Access Denied
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
            You do not have permission to access this page. Please log in again
            or return to the homepage.
          </Typography>

          {/* Button with modern styling */}
          <Stack direction="row" spacing={2}>
            <Button
              size="large"
              variant="contained"
              onClick={handleNavigateLogin}
              sx={{
                bgcolor: "#16ab65",
                color: "#fff",
                paddingX: 4,
                paddingY: 1.5,
                borderRadius: 10, // Rounded button
                boxShadow: "0 4px 12px rgba(22, 171, 101, 0.4)",
                "&:hover": {
                  bgcolor: "#138a52",
                  boxShadow: "0 6px 16px rgba(22, 171, 101, 0.6)",
                  transform: "translateY(-2px)", // Slight lift on hover
                },
                transition: "all 0.3s ease",
              }}
            >
              Log In Again
            </Button>
            
            <Button
              size="large"
              variant="outlined"
              onClick={handleNavigateHome}
              sx={{
                color: "#16ab65",
                borderColor: "#16ab65",
                paddingX: 4,
                paddingY: 1.5,
                borderRadius: 10, // Rounded button
                "&:hover": {
                  borderColor: "#138a52",
                  bgcolor: "rgba(22, 171, 101, 0.04)",
                  transform: "translateY(-2px)", // Slight lift on hover
                },
                transition: "all 0.3s ease",
              }}
            >
              Go to Homepage
            </Button>
          </Stack>
        </StyledContent>
      </Container>
      {/* Add keyframes for animation */}
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

export default Page403;
