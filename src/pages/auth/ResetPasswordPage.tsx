import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Link,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { PATH_AUTH, PATH_PUBLIC } from "routes/paths";
// Logo placeholder sẽ thay thế sau
import { ResetPasswordForm } from "sections/auth";

const ResetPassword: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  // Extract email and token from URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get("email");
    const tokenParam = queryParams.get("token");

    if (emailParam && tokenParam) {
      setEmail(emailParam);
      setResetToken(tokenParam);
      setIsValidToken(true);
    } else {
      setErrorMessage(
        "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."
      );
      setIsValidToken(false);
    }
    setIsValidatingToken(false);
  }, [location]);

  const handleResetSuccess = () => {
    setIsSubmitted(true);
    setSuccessMessage(
      "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới."
    );
  };

  const handleResetError = (message: string) => {
    setErrorMessage(message);
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
            <LockOutlinedIcon
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
              {isSubmitted ? "Đặt lại mật khẩu thành công" : "Đặt lại mật khẩu"}
            </Typography>

            <Typography variant="body1" color="text.secondary">
              {isSubmitted
                ? "Mật khẩu của bạn đã được cập nhật"
                : isValidatingToken
                ? "Đang xác thực thông tin..."
                : isValidToken
                ? "Tạo mật khẩu mới cho tài khoản của bạn"
                : "Liên kết không hợp lệ hoặc đã hết hạn"}
            </Typography>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}

          {isValidatingToken && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!isValidatingToken &&
            isValidToken &&
            !isSubmitted &&
            email &&
            resetToken && (
              <ResetPasswordForm
                email={email}
                resetToken={resetToken}
                onSuccess={handleResetSuccess}
                onError={handleResetError}
              />
            )}

          {(isSubmitted || (!isValidatingToken && !isValidToken)) && (
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              sx={{ textAlign: "center", my: 3 }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate(PATH_AUTH.login)}
                sx={{
                  borderRadius: 8,
                  py: 1.5,
                  px: 4,
                  fontWeight: 500,
                  textTransform: "none",
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    borderColor: theme.palette.primary.dark,
                  },
                }}
              >
                Trở về trang đăng nhập
              </Button>

              {!isValidToken && !isValidatingToken && (
                <Button
                  variant="text"
                  onClick={() => navigate(PATH_AUTH.forgotPassword)}
                  sx={{
                    display: "block",
                    mx: "auto",
                    mt: 2,
                    color: theme.palette.primary.main,
                    textTransform: "none",
                  }}
                >
                  Yêu cầu liên kết mới
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
