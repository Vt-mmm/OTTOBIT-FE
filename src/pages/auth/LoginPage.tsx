import React from "react";
import { Box, Button } from "@mui/material";
import { Home } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import LoginForm from "sections/auth/LoginForm";
import { LanguageSwitcher } from "components/common";
import { useLocales } from "hooks";

const LoginPage: React.FC = () => {
  const { translate } = useLocales();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, md: 4 },
        position: "relative",
      }}
    >
      {/* Button về trang chủ - Responsive positioning */}
      <Button
        component={RouterLink}
        to="/"
        startIcon={<Home />}
        sx={{
          position: "absolute",
          top: { xs: 16, md: 32 },
          left: { xs: 16, md: 32 },
          zIndex: 20,
          color: "#22c55e",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          textTransform: "none",
          fontWeight: 600,
          px: { xs: 2, md: 3 },
          py: { xs: 0.5, md: 1 },
          borderRadius: 2,
          fontSize: { xs: "14px", md: "16px" },
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            backgroundColor: "white",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        {translate("auth.GoToHome")}
      </Button>

      {/* Language Switcher - Top right */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 16, md: 32 },
          right: { xs: 16, md: 32 },
          zIndex: 20,
        }}
      >
        <LanguageSwitcher />
      </Box>

      {/* Container trắng bọc toàn bộ - Improved responsive */}
      <Box
        sx={{
          background: "white",
          borderRadius: { xs: 0, sm: 2, md: 4 },
          boxShadow: {
            xs: "none",
            sm: "0 10px 30px rgba(0, 0, 0, 0.08)",
            md: "0 20px 60px rgba(0, 0, 0, 0.1)",
          },
          overflow: "hidden",
          width: "100%",
          maxWidth: { xs: "100%", sm: "500px", md: "1000px" },
          minHeight: { xs: "100vh", sm: "600px", md: "700px" },
          height: { xs: "100vh", sm: "auto" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          position: "relative",
        }}
      >
        {/* Logo ở góc trên - Responsive positioning */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 20, sm: 24, md: 32 },
            left: { xs: 20, sm: 24, md: 32 },
            zIndex: 10,
            display: { xs: "none", sm: "flex" }, // Ẩn trên mobile nhỏ
            alignItems: "center",
            gap: 1,
          }}
        >
          <img
            src="/asset/OttobitLogoText.png"
            alt="OttoBit Logo"
            style={{
              height: "24px",
              width: "auto",
            }}
          />
        </Box>

        {/* Login Form Section - Improved responsive */}
        <Box
          sx={{
            flex: { xs: 1, md: 0.8 },
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "center",
            p: { xs: 3, sm: 4, md: 5 },
            pt: { xs: 8, sm: 4, md: 5 }, // Extra top padding on mobile for logo space
            minHeight: { xs: "auto", sm: "500px" },
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <LoginForm />
        </Box>

        {/* Illustration Section - Better responsive */}
        <Box
          sx={{
            flex: { xs: 0, md: 1.2 },
            display: { xs: "none", lg: "flex" }, // Chỉ hiện trên màn hình lớn
            alignItems: "flex-end",
            justifyContent: "center",
            p: 0,
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            position: "relative",
            overflow: "hidden",
            minHeight: { md: "500px", lg: "600px" },
          }}
        >
          {/* Decorative elements */}
          <Box
            sx={{
              position: "absolute",
              top: "15%",
              right: "15%",
              width: "60px",
              height: "60px",
              borderRadius: "12px",
              background: "#22c55e",
              opacity: 0.1,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "20%",
              left: "10%",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#22c55e",
              opacity: 0.2,
            }}
          />

          {/* Microbit Image - Chạm thật sát dưới cùng */}
          <img
            src="/asset/Microbitv2-removebg-preview.png"
            alt="Microbit v2"
            style={{
              maxWidth: "100%",
              height: "auto",
              objectFit: "contain",
              objectPosition: "bottom center", // Căn dưới giữa
              display: "block",
              margin: "0 auto",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
