import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_AUTH } from "constants/routesApiKeys";

// Schema validation
const schema = yup.object().shape({
  password: yup
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Mật khẩu là bắt buộc"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
});

// Define reset password form interface
interface ResetPasswordFormType {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordFormProps {
  email: string;
  resetToken: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  email,
  resetToken,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormType>({
    resolver: yupResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: ResetPasswordFormType) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Clean reset token: replace spaces with '+'
      const cleanResetToken = decodeURIComponent(resetToken).replace(/ /g, "+");

      // Make API call to reset password - match backend ResetPasswordRequest format (PascalCase)
      await axiosClient.post(ROUTES_API_AUTH.RESET_PASSWORD, {
        Email: email,
        ResetToken: cleanResetToken,
        NewPassword: data.password,
        ConfirmNewPassword: data.confirmPassword,
      });

      setIsLoading(false);
      // Use message from backend response or default message
      const successMsg =
        "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.";
      setSuccessMessage(successMsg);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      setIsLoading(false);
      console.error("Password reset error:", error);

      // Type guard for axios error response
      const axiosError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      const message =
        axiosError.response?.data?.message ||
        "Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại sau hoặc yêu cầu liên kết mới.";

      setErrorMessage(message);

      if (onError) {
        onError(message);
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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

      <Stack spacing={3}>
        <Box>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Mật khẩu mới"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    bgcolor: "white",
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Box>

        <Box>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Xác nhận mật khẩu"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Xác nhận mật khẩu mới"
                fullWidth
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                disabled={isLoading}
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    bgcolor: "white",
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          sx={{
            py: 1.5,
            mt: 2,
            borderRadius: 8,
            fontSize: "1rem",
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            background: "linear-gradient(90deg, #70c8d2 0%, #5ab9c3 100%)",
            "&:hover": {
              background: "linear-gradient(90deg, #5ab9c3 0%, #4aa9b3 100%)",
              boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Đặt lại mật khẩu"
          )}
        </Button>
      </Stack>
    </Box>
  );
};

export default ResetPasswordForm;
