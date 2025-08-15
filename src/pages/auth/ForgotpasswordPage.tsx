import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Link,
  Alert,
  useTheme,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockResetIcon from "@mui/icons-material/LockReset";
import { Link as RouterLink } from "react-router-dom";
import { PATH_AUTH, PATH_PUBLIC } from "routes/paths";
// Logo placeholder sẽ thay thế sau
import { ForgotPasswordForm } from "sections/auth";

const ForgotPassword: React.FC = () => {
  const theme = useTheme();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSuccessSubmit = () => {
    setIsSubmitted(true);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #f0fffd 0%, #e6f7f9 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Back to home button */}
      <Box
        sx={{
          position: "absolute",
          top: 30,
          left: 30,
          zIndex: 2,
        }}
      >
        <Link
          component={RouterLink}
          to={PATH_PUBLIC.homepage}
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
          Trở về trang chủ
        </Link>
      </Box>

      <Paper
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          backdropFilter: "blur(8px)",
          background: "rgba(255, 255, 255, 0.85)",
        }}
      >
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
          }}
        >
          {/* Header with Logo */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                mr: 1.5,
                background:
                  "linear-gradient(180deg, rgba(238, 255, 251, 0.55) 0%, #FDD9FF 54.17%, #C1E7FF 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "#70c8d2",
              }}
            >
              O
            </Box>
            <Typography
              variant="h5"
              fontWeight={500}
              letterSpacing="-0.02em"
              fontSize={24}
              color="#000000"
            >
              Ottobit
            </Typography>
          </Box>

          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{ mb: 4, textAlign: "center" }}
          >
            <LockResetIcon
              color="primary"
              sx={{
                fontSize: 50,
                mb: 2,
                p: 1,
                borderRadius: "50%",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }}
            />
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
              Quên mật khẩu?
            </Typography>

            <Typography variant="body1" color="text.secondary">
              {isSubmitted
                ? "Kiểm tra email của bạn để tiếp tục"
                : "Nhập email của bạn để nhận liên kết đặt lại mật khẩu"}
            </Typography>
          </Box>

          {!isSubmitted ? (
            <ForgotPasswordForm onSuccessSubmit={handleSuccessSubmit} />
          ) : (
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              sx={{ textAlign: "center", my: 3 }}
            >
              <Alert severity="success" sx={{ mb: 3 }}>
                Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email
                của bạn để tiếp tục.
              </Alert>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  component={RouterLink}
                  to={PATH_AUTH.login}
                  sx={{
                    display: "inline-block",
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    textDecoration: "none",
                    "&:hover": {
                      opacity: 0.8,
                    },
                  }}
                >
                  Trở về trang đăng nhập
                </Link>
              </motion.div>
            </Box>
          )}

          {!isSubmitted && (
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Link
                component={RouterLink}
                to={PATH_AUTH.login}
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Quay lại đăng nhập
              </Link>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
