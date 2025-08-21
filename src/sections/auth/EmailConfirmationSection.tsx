import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Link,
} from "@mui/material";
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_AUTH } from "constants/routesApiKeys";
import { PATH_AUTH } from "routes/paths";

interface EmailConfirmationSectionProps {
  userId: string;
  token: string;
}

interface EmailConfirmationResponse {
  message: string;
  errors?: string[] | null;
  errorCode?: string | null;
  timestamp?: string;
}

const EmailConfirmationSection: React.FC<EmailConfirmationSectionProps> = ({
  userId,
  token,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<EmailConfirmationResponse | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    confirmEmail();
  }, [userId, token]);

  const confirmEmail = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get(
        `${ROUTES_API_AUTH.CONFIRM_EMAIL}?userId=${encodeURIComponent(
          userId
        )}&token=${encodeURIComponent(token)}`
      );

      setResult(response.data);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Xác thực email thất bại";
      setResult({
        message: errorMessage,
        errors: error?.response?.data?.errors || null,
        errorCode: error?.response?.data?.errorCode || null,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setIsResending(true);
      // Assuming we have the email from userId or need to handle differently
      await axiosClient.post(ROUTES_API_AUTH.RESEND_EMAIL_CONFIRMATION, {
        Email: userId, // Using userId as email for now - need proper email
      });

      setResult({
        message: "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.",
        errors: null,
        errorCode: null,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Resend email error:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    navigate(PATH_AUTH.login);
  };

  // Check if email is already confirmed - handle multiple message formats
  const isAlreadyConfirmed =
    result?.message === "Email is already confirmed." ||
    result?.message?.toLowerCase().includes("already confirmed") ||
    result?.message?.toLowerCase().includes("đã được xác thực");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <Card
          sx={{
            maxWidth: { xs: "95vw", sm: 600 },
            width: "100%",
            boxShadow: {
              xs: "0 10px 40px rgba(0,0,0,0.15)",
              sm: "0 20px 60px rgba(0,0,0,0.2)",
            },
            borderRadius: { xs: 3, sm: 4 },
            overflow: "hidden",
            position: "relative",
            bgcolor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: { xs: 4, sm: 6 },
              background: "linear-gradient(90deg, #667eea, #764ba2, #f093fb)",
            },
          }}
        >
          <CardContent sx={{ p: { xs: 4, sm: 6 }, textAlign: "center" }}>
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ mb: 4 }}>
                  <CircularProgress
                    size={80}
                    thickness={4}
                    sx={{
                      color: "#667eea",
                      mb: 3,
                      filter: "drop-shadow(0 4px 8px rgba(102,126,234,0.3))",
                    }}
                  />
                </Box>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: "#2c3e50",
                    fontSize: { xs: "1.5rem", sm: "2rem" },
                  }}
                >
                  Đang xác thực email...
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                  }}
                >
                  Vui lòng đợi trong giây lát
                </Typography>
              </motion.div>
            ) : (
              <>
                {result && !result.errors && !result.errorCode ? (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
                  >
                    <Box sx={{ mb: 4 }}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      >
                        <SuccessIcon
                          sx={{
                            fontSize: { xs: 80, sm: 120 },
                            color: isAlreadyConfirmed ? "#f39c12" : "#27ae60",
                            mb: 3,
                            filter: `drop-shadow(0 8px 16px ${
                              isAlreadyConfirmed
                                ? "rgba(243,156,18,0.3)"
                                : "rgba(39,174,96,0.3)"
                            })`,
                          }}
                        />
                      </motion.div>
                    </Box>

                    <Typography
                      variant="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        color: isAlreadyConfirmed ? "#f39c12" : "#27ae60",
                        mb: 2,
                        letterSpacing: "-0.5px",
                        fontSize: { xs: "1.8rem", sm: "3rem" },
                      }}
                    >
                      {isAlreadyConfirmed
                        ? "Email đã được xác thực!"
                        : "Xác thực thành công!"}
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        mb: 4,
                        color: "#5a6c7d",
                        fontWeight: 400,
                        lineHeight: 1.6,
                      }}
                    >
                      {isAlreadyConfirmed
                        ? "Email của bạn đã được xác thực trước đó. Bạn có thể đăng nhập ngay bây giờ."
                        : result.message}
                    </Typography>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleGoToLogin}
                        sx={{
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          background:
                            "linear-gradient(45deg, #667eea, #764ba2)",
                          boxShadow: "0 8px 24px rgba(102,126,234,0.4)",
                          "&:hover": {
                            background:
                              "linear-gradient(45deg, #5a67d8, #6b46c1)",
                            boxShadow: "0 12px 32px rgba(102,126,234,0.5)",
                            transform: "translateY(-2px)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        Đi đến đăng nhập
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
                  >
                    <Box sx={{ mb: 4 }}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      >
                        <ErrorIcon
                          sx={{
                            fontSize: { xs: 80, sm: 120 },
                            color: "#e74c3c",
                            mb: 3,
                            filter:
                              "drop-shadow(0 8px 16px rgba(231,76,60,0.3))",
                          }}
                        />
                      </motion.div>
                    </Box>

                    <Typography
                      variant="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        color: "#e74c3c",
                        mb: 2,
                        letterSpacing: "-0.5px",
                        fontSize: { xs: "1.8rem", sm: "3rem" },
                      }}
                    >
                      Xác thực thất bại
                    </Typography>

                    <Alert
                      severity="error"
                      sx={{
                        mb: 4,
                        textAlign: "left",
                        borderRadius: 2,
                        fontSize: "1rem",
                        "& .MuiAlert-message": {
                          fontWeight: 500,
                        },
                      }}
                    >
                      {result?.message}
                    </Alert>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        {result?.errorCode !== "EMAIL_ALREADY_CONFIRMED" && (
                          <Button
                            variant="outlined"
                            startIcon={<EmailIcon />}
                            onClick={handleResendEmail}
                            disabled={isResending}
                            sx={{
                              borderRadius: 3,
                              px: 4,
                              py: 1.5,
                              fontSize: "1rem",
                              fontWeight: 600,
                              borderColor: "#667eea",
                              color: "#667eea",
                              "&:hover": {
                                borderColor: "#5a67d8",
                                background: "rgba(102,126,234,0.1)",
                                transform: "translateY(-1px)",
                              },
                              transition: "all 0.3s ease",
                            }}
                          >
                            {isResending
                              ? "Đang gửi..."
                              : "Gửi lại email xác thực"}
                          </Button>
                        )}

                        <Button
                          variant="contained"
                          onClick={handleGoToLogin}
                          sx={{
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontSize: "1.1rem",
                            fontWeight: 600,
                            background:
                              "linear-gradient(45deg, #667eea, #764ba2)",
                            boxShadow: "0 8px 24px rgba(102,126,234,0.4)",
                            "&:hover": {
                              background:
                                "linear-gradient(45deg, #5a67d8, #6b46c1)",
                              boxShadow: "0 12px 32px rgba(102,126,234,0.5)",
                              transform: "translateY(-2px)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          Quay lại đăng nhập
                        </Button>
                      </Box>
                    </motion.div>
                  </motion.div>
                )}
              </>
            )}

            <Box
              sx={{
                mt: 6,
                pt: 4,
                borderTop: "1px solid",
                borderColor: "rgba(0,0,0,0.1)",
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "#7c8ba1",
                    fontWeight: 500,
                    fontSize: "1rem",
                  }}
                >
                  Cần hỗ trợ?{" "}
                  <Link
                    component={RouterLink}
                    to="/contact"
                    sx={{
                      color: "#667eea",
                      textDecoration: "none",
                      fontWeight: 600,
                      "&:hover": {
                        textDecoration: "underline",
                        color: "#5a67d8",
                      },
                    }}
                  >
                    Liên hệ với chúng tôi
                  </Link>
                </Typography>
              </motion.div>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default EmailConfirmationSection;
