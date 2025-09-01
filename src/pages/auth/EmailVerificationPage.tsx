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
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { axiosClient } from "axiosClient/axiosClient";
import { PATH_AUTH, PATH_PUBLIC } from "routes/paths";
// Logo placeholder sẽ thay thế sau

const EmailVerificationPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  // errorMessage used to display error messages in the UI when verification fails
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const queryParams = new URLSearchParams(location.search);
      const email = queryParams.get("email");
      const token = queryParams.get("token");

      if (!email || !token) {
        setErrorMessage(
          "Liên kết xác thực không hợp lệ. Thiếu thông tin cần thiết."
        );
        setIsLoading(false);
        return;
      }

      try {
        // Sử dụng GET request thay vì POST và endpoint chính xác
        // Truyền email và token qua query params
        await axiosClient.get(
          `/api/v1/authentication/email-confirmation?email=${encodeURIComponent(
            email
          )}&token=${encodeURIComponent(token)}`
        );

        setIsSuccess(true);
        setIsLoading(false);
      } catch (error: unknown) {
        console.error("Email verification failed:", error);

        // Xử lý thông báo lỗi từ API nếu có
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        if (axiosError.response?.data?.message) {
          setErrorMessage(axiosError.response.data.message);
        } else {
          setErrorMessage(
            "Xác thực email thất bại. Liên kết có thể đã hết hạn hoặc không hợp lệ."
          );
        }
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [location]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
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
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "white",
              }}
            >
              O
            </Box>
            <Typography
              variant="h5"
              fontWeight={600}
              letterSpacing="-0.02em"
              fontSize={24}
              color="#1a1a1a"
            >
              Ottobit
            </Typography>
          </Box>

          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                my: 4,
              }}
            >
              <CircularProgress size={50} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Đang xác thực email của bạn...
              </Typography>
            </Box>
          ) : isSuccess ? (
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              sx={{ textAlign: "center" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <img
                  src="/asset/IconSucces.png"
                  alt="Email verified successfully"
                  style={{
                    width: "80px",
                    height: "80px",
                  }}
                />
              </Box>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Email xác thực thành công!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Cảm ơn bạn đã xác thực email. Tài khoản của bạn đã được kích
                hoạt.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(PATH_AUTH.login)}
                sx={{
                  mt: 2,
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                  },
                }}
              >
                Đăng nhập ngay
              </Button>
            </Box>
          ) : (
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              sx={{ textAlign: "center" }}
            >
              <ErrorOutlineIcon
                color="error"
                sx={{
                  fontSize: 80,
                  p: 1.5,
                  borderRadius: "50%",
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  mb: 2,
                }}
              />
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Xác thực email thất bại
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {errorMessage ||
                  "Chúng tôi không thể xác thực địa chỉ email của bạn. Điều này có thể do liên kết đã hết hạn hoặc không hợp lệ."}
              </Typography>

              <Alert severity="info" sx={{ textAlign: "left", mb: 3 }}>
                <Typography variant="body2" fontWeight={500} gutterBottom>
                  Vui lòng thử các bước sau:
                </Typography>
                <ul style={{ paddingLeft: "1.5rem", margin: "0.5rem 0" }}>
                  <li>
                    Kiểm tra xem bạn đang sử dụng liên kết xác nhận mới nhất
                    được gửi đến email.
                  </li>
                  <li>
                    Nhấp vào liên kết trực tiếp từ email thay vì sao chép và
                    dán.
                  </li>
                  <li>Yêu cầu email xác nhận mới nếu vấn đề vẫn tiếp diễn.</li>
                </ul>
              </Alert>

              <Button
                variant="outlined"
                onClick={() => navigate(PATH_AUTH.login)}
                sx={{
                  mb: 2,
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  borderColor: "#22c55e",
                  color: "#22c55e",
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    borderColor: "#16a34a",
                    backgroundColor: "rgba(34, 197, 94, 0.04)",
                  },
                }}
              >
                Trở về trang đăng nhập
              </Button>

              <Button
                variant="text"
                onClick={() => navigate(PATH_PUBLIC.homepage)}
                sx={{
                  color: "#22c55e",
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "rgba(34, 197, 94, 0.04)",
                  },
                }}
              >
                Trở về trang chủ
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default EmailVerificationPage;
