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
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import { login, setIsLogout, googleLoginThunk } from "store/auth/authSlice";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PATH_AUTH, PATH_USER } from "../../routes/paths";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

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
  const handleGoogleLogin = async (response: CredentialResponse) => {
    if (!response.credential) {
      setLocalErrorMessage("Google authentication error. Please try again.");
      return;
    }

    try {
      const user = await dispatch(
        googleLoginThunk(response.credential)
      ).unwrap();

      if (!user || !user.roles) {
        throw new Error("Unable to determine access rights.");
      }

      // Clear any error messages
      setLocalErrorMessage(null);
      dispatch(setIsLogout(false));

      // Navigate based on user role
      if (user.roles.includes("Admin")) {
        navigate("/admin/dashboard");
      } else if (user.roles.includes("Psychologist")) {
        navigate("/psychologist/dashboard");
      } else {
        navigate(PATH_USER.homepage);
      }
    } catch (error: any) {
      // Error handling without console logging
      setLocalErrorMessage(
        error?.message || "Google login failed. Please try again."
      );
    }
  };

  return (
    <FormProvider {...methods}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 0, // Remove padding since we're inside the white container
        }}
      >
        {/* Header với logo */}
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "#1a1a1a",
              mb: 1,
              fontSize: "32px",
            }}
          >
            Login
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#6b7280",
              fontSize: "16px",
            }}
          >
            Welcome back! Please login to your account
          </Typography>
        </Box>{" "}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
            {(localErrorMessage || errorMessage) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {localErrorMessage || errorMessage}
              </Alert>
            )}

            <Box>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    fullWidth
                    placeholder="Email address"
                    size="medium"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#ffffff",
                        fontSize: "16px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#e2e8f0",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#22c55e",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#22c55e",
                          borderWidth: "2px",
                        },
                      },
                      "& .MuiInputBase-input": {
                        padding: "14px 16px",
                      },
                    }}
                  />
                )}
              />
            </Box>

            <Box>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    fullWidth
                    placeholder="Password"
                    size="medium"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#ffffff",
                        fontSize: "16px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#e2e8f0",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#22c55e",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#22c55e",
                          borderWidth: "2px",
                        },
                      },
                      "& .MuiInputBase-input": {
                        padding: "14px 16px",
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{
                              color: "#6b7280",
                              "&:hover": {
                                color: "#22c55e",
                              },
                            }}
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

            <Box sx={{ textAlign: "right" }}>
              <Link
                component={RouterLink}
                to={PATH_AUTH.forgotPassword}
                underline="none"
                sx={{
                  fontSize: "14px",
                  color: "#6b7280",
                  "&:hover": {
                    color: "#22c55e",
                  },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                py: 2,
                borderRadius: 2,
                fontSize: "16px",
                fontWeight: 600,
                textTransform: "none",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                },
                "&:disabled": {
                  background: "#94a3b8",
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Login"
              )}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography
                variant="body2"
                sx={{ color: "#6b7280", fontSize: "14px" }}
              >
                Or Login with
              </Typography>
            </Divider>

            <Stack direction="row" spacing={2}>
              {/* Google Login Button */}
              <Box
                sx={{
                  flex: 1,
                  "& > div": {
                    width: "100% !important",
                  },
                  "& > div > div": {
                    width: "100% !important",
                    borderRadius: "8px !important",
                    border: "1px solid #e2e8f0 !important",
                    "&:hover": {
                      borderColor: "#22c55e !important",
                      backgroundColor: "rgba(34, 197, 94, 0.04) !important",
                    },
                  },
                }}
              >
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => {
                    setLocalErrorMessage(
                      "Google login failed. Please try again."
                    );
                  }}
                  theme="outline"
                  size="large"
                  width="100%"
                  text="signin_with"
                  shape="rectangular"
                />
              </Box>

              <Button
                variant="outlined"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: "#e2e8f0",
                  color: "#374151",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#22c55e",
                    backgroundColor: "rgba(34, 197, 94, 0.04)",
                  },
                }}
                startIcon={
                  <Box
                    sx={{
                      width: "18px",
                      height: "18px",
                      backgroundColor: "#1877f2",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    f
                  </Box>
                }
              >
                Facebook
              </Button>
            </Stack>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
                Don't have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/auth/register"
                  underline="none"
                  sx={{
                    color: "#22c55e",
                    fontWeight: 600,
                    "&:hover": {
                      color: "#16a34a",
                    },
                  }}
                >
                  Signup
                </Link>
              </Typography>
            </Box>
          </Stack>
        </form>
      </Box>
    </FormProvider>
  );
};

export default LoginForm;
