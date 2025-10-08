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
import { ResetPasswordForm } from "sections/auth";
import { LanguageSwitcher } from "components/common";
import { useLocales } from "hooks";

const ResetPassword: React.FC = () => {
  const { translate } = useLocales();
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
      setErrorMessage(translate("auth.InvalidOrExpiredTokenContent"));
      setIsValidToken(false);
    }
    setIsValidatingToken(false);
  }, [location, translate]);

  const handleResetSuccess = () => {
    setIsSubmitted(true);
    setSuccessMessage(translate("auth.ResetPasswordSuccess"));
  };

  const handleResetError = (message: string) => {
    setErrorMessage(message);
  };

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
          {translate("auth.BackToHomepage2")}
        </Link>
      </Box>

      {/* Language Switcher - Top right */}
      <Box
        sx={{
          position: "absolute",
          top: 30,
          right: 30,
          zIndex: 2,
        }}
      >
        <LanguageSwitcher />
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
              {isSubmitted
                ? translate("auth.ResetPasswordSuccessTitle")
                : translate("auth.ResetPasswordTitle")}
            </Typography>

            <Typography variant="body1" color="text.secondary">
              {isSubmitted
                ? translate("auth.ResetPasswordUpdated")
                : isValidatingToken
                ? translate("auth.ValidatingInfo")
                : isValidToken
                ? translate("auth.CreateNewPassword")
                : translate("auth.InvalidOrExpiredLink")}
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
                  borderRadius: 2,
                  py: 1.5,
                  px: 4,
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
                {translate("auth.BackToLogin")}
              </Button>

              {!isValidToken && !isValidatingToken && (
                <Button
                  variant="text"
                  onClick={() => navigate(PATH_AUTH.forgotPassword)}
                  sx={{
                    display: "block",
                    mx: "auto",
                    mt: 2,
                    color: "#22c55e",
                    textTransform: "none",
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "rgba(34, 197, 94, 0.04)",
                    },
                  }}
                >
                  {translate("auth.RequestNewLink")}
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
