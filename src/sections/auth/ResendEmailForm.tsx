import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Alert, Link } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link as RouterLink } from "react-router-dom";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppDispatch, useAppSelector } from "store/config";
import { resendEmailConfirmation, clearAuthErrors } from "store/auth/authSlice";
import { ResendEmailFormData } from "common/@types/form";
import { PATH_AUTH } from "routes/paths";
import { useLocales } from "hooks";

const ResendEmailForm: React.FC = () => {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLocalSuccess, setIsLocalSuccess] = useState(false);

  // Validation schema - PHẢI đặt trong component để dùng translate
  const schema = yup.object().shape({
    email: yup
      .string()
      .email(translate("auth.EmailInvalid"))
      .required(translate("auth.EmailRequired")),
  });

  // Clear auth errors when component mounts
  useEffect(() => {
    dispatch(clearAuthErrors());
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResendEmailFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResendEmailFormData) => {
    setLocalError(null);
    setIsLocalSuccess(false);
    try {
      const result = await dispatch(resendEmailConfirmation(data)).unwrap();
      setSuccessMessage(result || translate("auth.EmailConfirmationSent"));
      setIsLocalSuccess(true);
    } catch (error: any) {
      setLocalError(error || translate("auth.ResendEmailFailed"));
    }
  };

  const handleTryAgain = () => {
    reset();
    setLocalError(null);
    setSuccessMessage(null);
    setIsLocalSuccess(false);
  };

  if (isLocalSuccess) {
    return (
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
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
            alt="Email sent successfully"
            style={{
              width: "64px",
              height: "64px",
            }}
          />
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "#1a1a1a",
            mb: 2,
          }}
        >
          {translate("auth.EmailSentSuccessfully")}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#6b7280",
            mb: 3,
            lineHeight: 1.6,
          }}
        >
          {successMessage || translate("auth.ResendEmailSuccessContent")}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <LoadingButton
            onClick={handleTryAgain}
            variant="outlined"
            sx={{
              borderColor: "#22c55e",
              color: "#22c55e",
              "&:hover": {
                borderColor: "#16a34a",
                bgcolor: "#f0fdf4",
              },
            }}
          >
            {translate("auth.ResendAnotherEmail")}
          </LoadingButton>
          <Link
            component={RouterLink}
            to={PATH_AUTH.login}
            sx={{
              color: "#6b7280",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            {translate("auth.BackToLogin")}
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <EmailOutlinedIcon
          sx={{
            fontSize: 48,
            color: "#22c55e",
            mb: 2,
          }}
        />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "#1a1a1a",
            mb: 1,
          }}
        >
          {translate("auth.ResendEmailTitle")}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#6b7280",
            lineHeight: 1.6,
          }}
        >
          {translate("auth.ResendEmailContent")}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        {localError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {localError}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            {translate("auth.Email")}
          </Typography>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={translate("auth.EmailPlaceholder")}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                  },
                }}
              />
            )}
          />
        </Box>

        <LoadingButton
          type="submit"
          fullWidth
          loading={isLoading}
          variant="contained"
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
            },
            "&:disabled": {
              background: "#94a3b8",
            },
          }}
        >
          {isLoading
            ? translate("auth.Sending")
            : translate("auth.ResendEmailButton")}
        </LoadingButton>
      </form>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Link
          component={RouterLink}
          to={PATH_AUTH.login}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6b7280",
            textDecoration: "none",
            fontWeight: 500,
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          <ArrowBackIcon sx={{ mr: 1, fontSize: "1rem" }} />
          {translate("auth.BackToLogin")}
        </Link>
      </Box>
    </Box>
  );
};

export default ResendEmailForm;
