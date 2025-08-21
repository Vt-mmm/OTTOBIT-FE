import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TextField, Button, Box, CircularProgress, Alert } from "@mui/material";
import { motion } from "framer-motion";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_AUTH } from "constants/routesApiKeys";

// Define the component's prop types
type ForgotPasswordFormProps = {
  onSuccessSubmit: () => void;
};

// Define form values type
type FormValues = {
  email: string;
};

// ForgotPassword Form Component
const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccessSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form validation schema
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email không được để trống")
      .email("Email không hợp lệ"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError("");

    try {
      // Use axiosClient - match backend ForgotPasswordRequest format (PascalCase)
      await axiosClient.post(ROUTES_API_AUTH.FORGOT_PASSWORD, {
        Email: data.email,
      });
      onSuccessSubmit();
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : typeof error === "object" && error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau."
          : "Đã xảy ra lỗi. Vui lòng thử lại sau."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        margin="normal"
        fullWidth
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        disabled={isSubmitting}
        {...register("email")}
        error={!!errors.email}
        helperText={errors.email?.message}
        InputProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      />

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ marginTop: "24px" }}
      >
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontSize: "1rem",
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 4px 14px 0 rgba(110, 204, 217, 0.4)",
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Đặt lại mật khẩu"
          )}
        </Button>
      </motion.div>
    </Box>
  );
};

export default ForgotPasswordForm;
