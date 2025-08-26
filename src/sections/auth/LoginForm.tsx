import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HomeIcon from "@mui/icons-material/Home";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import { login, setIsLogout, googleLoginThunk } from "store/auth/authSlice";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PATH_AUTH, PATH_USER } from "../../routes/paths";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

// Schema validation
const schema = yup.object().shape({
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Mật khẩu là bắt buộc"),
});

// Define login form interface
interface LoginFormType {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, errorMessage, isAuthenticated, userAuth } = useAppSelector(
    (state) => state.auth
  );
  const [showPassword, setShowPassword] = useState(false);
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(
    null
  );

  // Log auth state whenever it changes
  useEffect(() => {
    // If authenticated, navigate to the homepage
    if (isAuthenticated && userAuth) {
      // User is authenticated, navigation happens automatically
    }
  }, [isAuthenticated, userAuth]);

  // Setup react-hook-form with validation
  const methods = useForm<LoginFormType>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  // Handle login form submit
  const onSubmit = async (values: LoginFormType) => {
    const params = {
      data: { ...values },
      navigate: navigate, // Pass the navigate function to the thunk
    };

    try {
      await dispatch(login(params)).unwrap();
      dispatch(setIsLogout(false));
      setLocalErrorMessage(null);

      // The thunk will handle navigation to user homepage after successful login
    } catch (error: unknown) {
      // Error handling without console logging
      // Lưu message lỗi vào state để hiển thị
      if (typeof error === "string") {
        setLocalErrorMessage(error);
      } else if (error && typeof error === "object" && "message" in error) {
        setLocalErrorMessage(error.message as string);
      } else {
        setLocalErrorMessage("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    }
  };

  // Handle Google login
  const handleGoogleLogin = (response: CredentialResponse) => {
    if (!response.credential) {
      setLocalErrorMessage("Google authentication error. Please try again.");
      return;
    }

    try {
      dispatch(googleLoginThunk(response.credential))
        .unwrap()
        .then((user) => {
          if (!user || !user.roles) {
            throw new Error("Unable to determine access rights.");
          }

          // Navigate based on user role
          if (user.roles.includes("Admin")) {
            navigate("/admin/dashboard");
          } else if (user.roles.includes("Psychologist")) {
            navigate("/psychologist/dashboard");
          } else {
            navigate(PATH_USER.homepage);
          }
        })
        .catch((error) => {
          // Error handling without console logging
          setLocalErrorMessage(error?.message || "Google login failed.");
        });
    } catch (/* eslint-disable @typescript-eslint/no-unused-vars */ error /* eslint-enable */) {
      // Error handling without console logging
      setLocalErrorMessage("An unexpected error occurred during Google login.");
    }
  };

  return (
    <FormProvider {...methods}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
            {(localErrorMessage || errorMessage) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {localErrorMessage || errorMessage}
              </Alert>
            )}

            <Box>
              <Typography variant="body2" mb={1}>
                Email
              </Typography>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    fullWidth
                    required
                    placeholder="Email"
                    size="small"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      sx: {
                        borderRadius: 4,
                        backgroundColor: "#FFFFFF",
                      },
                    }}
                  />
                )}
              />
            </Box>

            <Box>
              <Typography variant="body2" mb={1}>
                Mật Khẩu
              </Typography>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    fullWidth
                    required
                    placeholder="Password"
                    size="small"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      sx: {
                        borderRadius: 4,
                        backgroundColor: "#FFFFFF",
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

            <Button
              type="submit"
              variant="contained"
              endIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <ArrowForwardIcon />
                )
              }
              sx={{
                bgcolor: "black",
                borderRadius: 6,
                fontWeight: 500,
                py: 1.2,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.8)",
                },
              }}
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <Divider sx={{ my: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Hoặc đăng nhập với
              </Typography>
            </Divider>

            <Box sx={{ mt: 1, mb: 1 }}>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setLocalErrorMessage("Google sign-in failed.")}
                useOneTap
                type="standard"
                theme="filled_blue"
                size="large"
                shape="rectangular"
                width="100%"
                text="signin_with"
                logo_alignment="left"
              />
            </Box>

            <Link
              component={RouterLink}
              to={PATH_AUTH.forgotPassword}
              underline="hover"
              sx={{
                textAlign: "center",
                fontSize: 14,
                color: "text.secondary",
                mt: 0.5,
              }}
            >
              Quên mật khẩu?
            </Link>
          </Stack>
        </form>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography fontSize={14} mb={1.5}>
            Đăng ký tài khoản mới?{" "}
            <Link
              component={RouterLink}
              to="/auth/register"
              underline="hover"
              fontWeight={600}
              color="primary"
            >
              Đăng Ký
            </Link>
          </Typography>

          <Button
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
            variant="text"
            size="small"
            sx={{
              fontSize: 13,
              textTransform: "none",
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            Chở về trang chủ
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default LoginForm;
