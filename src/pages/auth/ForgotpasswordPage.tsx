import React, { useState } from "react";
import { Box, Typography, Link, Grid } from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockResetIcon from "@mui/icons-material/LockReset";
import { Link as RouterLink } from "react-router-dom";
import { PATH_AUTH, PATH_PUBLIC } from "routes/paths";
import { ForgotPasswordForm } from "sections/auth";
import { LanguageSwitcher } from "components/common";
import { useLocales } from "hooks";

const ForgotPassword: React.FC = () => {
  const { translate } = useLocales();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSuccessSubmit = () => {
    setIsSubmitted(true);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        p: 0,
        m: 0,
        position: "relative",
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

      <Grid container sx={{ flex: 1, minHeight: "100vh" }}>
        {/* Left side - Image */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src="/asset/ForgotPassword.jpg"
            alt="Forgot Password"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Grid>

        {/* Right side - Form */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 3, sm: 4, md: 6 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 480,
              textAlign: "center",
            }}
          >
            {/* Header with Logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 5,
              }}
            >
              <Box
                component="img"
                src="/asset/OttobitLogoText.png"
                alt="Ottobit Logo"
                sx={{
                  height: 60,
                  width: "auto",
                }}
              />
            </Box>

            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              sx={{ mb: 5, textAlign: "center" }}
            >
              <LockResetIcon
                sx={{
                  fontSize: 64,
                  mb: 3,
                  color: "#22c55e",
                }}
              />
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ mb: 2, color: "#1a1a1a" }}
              >
                {translate("auth.ForgotPasswordTitle")}
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                fontSize={16}
                sx={{ maxWidth: 400, mx: "auto", lineHeight: 1.6 }}
              >
                {isSubmitted
                  ? translate("auth.ForgotPasswordContentAfterSubmit")
                  : translate("auth.ForgotPasswordContent")}
              </Typography>
            </Box>

            {!isSubmitted ? (
              <ForgotPasswordForm onSuccessSubmit={handleSuccessSubmit} />
            ) : (
              <Box
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                sx={{ textAlign: "center", my: 4 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 4,
                  }}
                >
                  <Box
                    component="img"
                    src="/asset/IconSucces.png"
                    alt="Success"
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 3,
                    }}
                  />
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="#22c55e"
                    sx={{ mb: 2 }}
                  >
                    {translate("auth.EmailSent")}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: 400, mx: "auto", lineHeight: 1.6 }}
                  >
                    {translate("auth.EmailSentContent")}
                  </Typography>
                </Box>

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
                      color: "#22c55e",
                      fontWeight: 600,
                      borderBottom: "2px solid #22c55e",
                      textDecoration: "none",
                      "&:hover": {
                        opacity: 0.8,
                      },
                    }}
                  >
                    {translate("auth.BackToLoginFromForgot")}
                  </Link>
                </motion.div>
              </Box>
            )}

            {!isSubmitted && (
              <Box sx={{ mt: 6, textAlign: "center" }}>
                <Link
                  component={RouterLink}
                  to={PATH_AUTH.login}
                  sx={{
                    color: "#22c55e",
                    fontWeight: 600,
                    fontSize: "1rem",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                      color: "#16a34a",
                    },
                  }}
                >
                  {translate("auth.BackToLogin")}
                </Link>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ForgotPassword;
