import React from "react";
import { Box, Paper, Typography, Link } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoginForm from "sections/auth/LoginForm";
import LoginBackground3D from "components/3d/LoginBackground3D";
import { Link as RouterLink } from "react-router-dom";

// Logo và hình ảnh sẽ thay thế sau

const LoginPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #EEFFFB 0%, #E5F9F4 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // Đặt justify content thành center để căn giữa
        position: "relative",
        p: 0,
        overflow: "hidden",
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      {/* Hiệu ứng nền */}
      <LoginBackground3D />

      {/* Thanh điều hướng về trang chủ */}
      <Box
        sx={{
          position: "absolute",
          top: 30,
          left: 30,
          zIndex: 10,
        }}
      >
        <Link
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            color: "text.primary",
            textDecoration: "none",
            fontWeight: 500,
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          <ArrowBackIcon sx={{ mr: 1, fontSize: "0.9rem" }} />
          Chở về trang chủ
        </Link>
      </Box>

      {/* Placeholder cho background illustration */}
      <Box
        sx={{
          position: "absolute",
          right: { xs: 0, sm: 0, md: "5%", lg: "10%" },
          top: "50%",
          transform: "translateY(-50%)",
          height: "400px",
          width: { xs: 0, sm: 0, md: "300px", lg: "350px" },
          display: { xs: "none", sm: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #e5f9f4 0%, #e5f0f1 100%)",
          borderRadius: "20px",
          border: "2px solid #70c8d2",
          zIndex: 1,
          opacity: 0.7,
          fontSize: "4rem",
          fontWeight: 700,
          color: "#70c8d2",
        }}
      >
        🧠
      </Box>

      {/* Form Login */}
      <Paper
        elevation={1}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          borderRadius: "20px",
          overflow: "hidden",
          maxWidth: { xs: 360, sm: 400, md: 420 },
          width: "100%",
          mx: { xs: 2, sm: 4, md: 0 }, // Thay đổi margin-left thành margin-x
          my: 4,
          boxShadow: "0px 10px 30px 0px rgba(47, 49, 40, 0.05)",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          zIndex: 2,
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: "100%",
            p: { xs: 3, sm: 3.5, md: 4 },
            background:
              "linear-gradient(180deg, rgba(238, 255, 251, 0.7) 0%, rgba(244, 254, 252, 0.7) 100%)",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              fontWeight={500}
              fontSize={20}
              lineHeight="1.5em"
              sx={{
                letterSpacing: "0.01em",
                mb: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              LOGIN{" "}
              <LockOutlinedIcon
                fontSize="small"
                sx={{ ml: 0.5, fontSize: "0.9rem" }}
              />
            </Typography>
          </Box>

          {/* Render the LoginForm component */}
          <LoginForm />
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
