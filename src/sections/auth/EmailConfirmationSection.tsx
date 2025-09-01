import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import {
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
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        p: 0,
        m: 0,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        style={{ width: "100%", maxWidth: "500px", padding: "24px" }}
      >
        <Box
          sx={{
            width: "100%",
            textAlign: "center",
            p: { xs: 4, sm: 6 },
          }}
        >
            {/* Header Logo */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#1a1a1a",
                  fontSize: "24px",
                }}
              >
                Ottobit
              </Typography>
            </Box>

            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ mb: 4 }}>
                  <CircularProgress
                    size={60}
                    thickness={4}
                    sx={{
                      color: "#22c55e",
                      mb: 3,
                    }}
                  />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "#1a1a1a",
                    fontSize: { xs: "28px", sm: "32px" },
                    mb: 2,
                  }}
                >
                  Đang xác thực email...
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#6b7280",
                    fontSize: "16px",
                    lineHeight: 1.6,
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
                    transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                  >
                    {/* Success Icon */}
                    <Box sx={{ mb: 4 }}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        <Box
                          sx={{
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 3,
                          }}
                        >
                          <img
                            src="/asset/IconSucces.png"
                            alt="Success"
                            style={{
                              width: "120px",
                              height: "120px",
                            }}
                          />
                        </Box>
                      </motion.div>
                    </Box>

                    {/* Success Title */}
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: "#1a1a1a",
                        fontSize: { xs: "32px", sm: "40px" },
                        mb: 2,
                        lineHeight: 1.2,
                      }}
                    >
                      {isAlreadyConfirmed
                        ? "Email đã được xác thực!"
                        : "Xác thực thành công!"}
                    </Typography>

                    {/* Success Description */}
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#6b7280",
                        fontSize: "16px",
                        lineHeight: 1.6,
                        mb: 4,
                        maxWidth: 400,
                        mx: "auto",
                      }}
                    >
                      {isAlreadyConfirmed
                        ? "Email của bạn đã được xác thực trước đó. Bạn có thể đăng nhập ngay bây giờ."
                        : "Tài khoản của bạn đã được kích hoạt thành công. Bạn có thể bắt đầu sử dụng Ottobit ngay bây giờ!"}
                    </Typography>

                    {/* Action Button */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleGoToLogin}
                        sx={{
                          py: 1.5,
                          px: 4,
                          borderRadius: 2,
                          fontSize: "16px",
                          fontWeight: 600,
                          textTransform: "none",
                          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                          boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                            boxShadow: "0 6px 16px rgba(34, 197, 94, 0.4)",
                            transform: "translateY(-1px)",
                          },
                          transition: "all 0.2s ease",
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
                    transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                  >
                    {/* Error Icon */}
                    <Box sx={{ mb: 4 }}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            bgcolor: "#ef4444",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 3,
                          }}
                        >
                          <ErrorIcon
                            sx={{
                              fontSize: 40,
                              color: "white",
                            }}
                          />
                        </Box>
                      </motion.div>
                    </Box>

                    {/* Error Title */}
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: "#1a1a1a",
                        fontSize: { xs: "32px", sm: "40px" },
                        mb: 2,
                        lineHeight: 1.2,
                      }}
                    >
                      Xác thực thất bại
                    </Typography>

                    {/* Error Message */}
                    <Alert
                      severity="error"
                      sx={{
                        mb: 4,
                        textAlign: "left",
                        borderRadius: 2,
                        fontSize: "14px",
                        backgroundColor: "#fef2f2",
                        borderColor: "#fecaca",
                        "& .MuiAlert-message": {
                          fontWeight: 500,
                          color: "#dc2626",
                        },
                        "& .MuiAlert-icon": {
                          color: "#dc2626",
                        },
                      }}
                    >
                      {result?.message}
                    </Alert>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        {result?.errorCode !== "EMAIL_ALREADY_CONFIRMED" && (
                          <Button
                            variant="outlined"
                            startIcon={<EmailIcon />}
                            onClick={handleResendEmail}
                            disabled={isResending}
                            sx={{
                              py: 1.5,
                              px: 4,
                              borderRadius: 2,
                              fontSize: "16px",
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
                            {isResending ? "Đang gửi..." : "Gửi lại email xác thực"}
                          </Button>
                        )}

                        <Button
                          variant="contained"
                          onClick={handleGoToLogin}
                          sx={{
                            py: 1.5,
                            px: 4,
                            borderRadius: 2,
                            fontSize: "16px",
                            fontWeight: 600,
                            textTransform: "none",
                            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                            boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                              boxShadow: "0 6px 16px rgba(34, 197, 94, 0.4)",
                              transform: "translateY(-1px)",
                            },
                            transition: "all 0.2s ease",
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

            {/* Footer */}
            <Box sx={{ mt: 6, pt: 4 }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#9ca3af",
                    fontSize: "14px",
                  }}
                >
                  Cần hỗ trợ?{" "}
                  <Link
                    component={RouterLink}
                    to="/contact"
                    sx={{
                      color: "#22c55e",
                      textDecoration: "none",
                      fontWeight: 600,
                      "&:hover": {
                        textDecoration: "underline",
                        color: "#16a34a",
                      },
                    }}
                  >
                    Liên hệ với chúng tôi
                  </Link>
                </Typography>
              </motion.div>
            </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default EmailConfirmationSection;
