import React from "react";
import { Box, Button } from "@mui/material";
import { Home } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import LoginForm from "sections/auth/LoginForm";

// Logo và hình ảnh sẽ thay thế sau

const LoginPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", // Đổi thành màu xanh nhạt giống illustration
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, md: 4 },
        position: "relative",
      }}
    >
      {/* Button về trang chủ - Đặt ra ngoài background */}
      <Button
        component={RouterLink}
        to="/"
        startIcon={<Home />}
        sx={{
          position: "absolute",
          top: 32,
          left: 32,
          zIndex: 20, // Cao hơn để hiện ra ngoài
          color: "#22c55e",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          textTransform: "none",
          fontWeight: 600,
          px: 3,
          py: 1,
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            backgroundColor: "white",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        Về trang chủ
      </Button>

      {/* Container trắng bọc toàn bộ */}
      <Box
        sx={{
          background: "white",
          borderRadius: 4,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          width: "100%",
          maxWidth: "1000px",
          minHeight: { xs: "600px", md: "700px" },
          display: "flex",
          position: "relative",
        }}
      >
        {/* Logo ở góc trên */}
        <Box
          sx={{
            position: "absolute",
            top: 32,
            left: 32,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <img
            src="/asset/LogoOttobit.png"
            alt="OttoBit Logo"
            style={{
              height: "45px",
              width: "auto",
            }}
          />
        </Box>

        {/* Left Side - Login Form - Giảm kích thước */}
        <Box
          sx={{
            flex: 0.8, // Giảm từ 1 xuống 0.8 để form nhỏ hơn
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 3, md: 4 }, // Giảm padding
          }}
        >
          <LoginForm />
        </Box>

        {/* Right Side - Illustration - Tăng kích thước */}
        <Box
          sx={{
            flex: 1.2, // Tăng từ 1 lên 1.2 để hình to hơn
            display: { xs: "none", md: "flex" },
            alignItems: "flex-end", // Căn dưới cùng
            justifyContent: "center",
            p: 0, // Bỏ hoàn toàn padding
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            position: "relative",
            overflow: "hidden", // Đảm bảo không bị tràn
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
