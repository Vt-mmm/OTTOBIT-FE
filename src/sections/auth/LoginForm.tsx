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
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import { login, setIsLogout, googleLoginThunk, clearAuthErrors } from "store/auth/authSlice";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PATH_AUTH, PATH_USER } from "../../routes/paths";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useLocales } from "hooks";

// Define login form interface
interface LoginFormType {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const { translate } = useLocales();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, userAuth } = useAppSelector(
    (state) => state.auth
  );
  const [showPassword, setShowPassword] = useState(false);

  // Schema validation - inside component to use translate
  const schema = yup.object().shape({
    email: yup
      .string()
      .email(translate("auth.EmailInvalid"))
      .required(translate("auth.EmailRequired")),
    password: yup
      .string()
      .min(6, translate("auth.PasswordMinLength"))
      .required(translate("auth.PasswordRequired")),
  });

  // Clear auth errors on mount and unmount
  useEffect(() => {
    // Clear errors when component mounts
    dispatch(clearAuthErrors());

    // Clean up when component unmounts
    return () => {
      dispatch(clearAuthErrors());
    };
  }, [dispatch]);

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
      // The thunk will handle navigation and show toast
    } catch (error: unknown) {
      // Error already shown via toast in thunk
    }
  };

  // Handle Google login
  const handleGoogleLogin = async (response: CredentialResponse) => {
    if (!response.credential) {
      // Error already handled via toast in thunk
      return;
    }

    try {
      const user = await dispatch(
        googleLoginThunk(response.credential)
      ).unwrap();

      if (!user || !user.roles) {
        throw new Error(translate("auth.UnableToDetermineRights"));
      }

      // Clear any error messages
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
      // Error already shown via toast
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
          maxWidth: { xs: "100%", sm: 400, md: 420 },
          mx: "auto",
          p: 0,
        }}
      >
        {/* Header với logo */}
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "#1a1a1a",
              mb: 1,
              fontSize: { xs: "28px", sm: "32px" },
            }}
          >
            {translate("auth.LoginTitle")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#6b7280",
              fontSize: { xs: "14px", sm: "16px" },
              px: { xs: 1, sm: 0 },
            }}
          >
            {translate("auth.LoginContent")}
          </Typography>
        </Box>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
            <Box>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="email"
                    variant="outlined"
                    fullWidth
                    placeholder={translate("auth.EmailPlaceholder")}
                    size="medium"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    inputProps={{
                      maxLength: 254,
                      autoComplete: "email",
                      autoCapitalize: "none",
                      spellCheck: "false",
                    }}
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
                        whiteSpace: "nowrap",
                        textOverflow: "clip",
                      },
                      // Fix Chrome autofill background not full-width vs adornment
                      "& input:-webkit-autofill": {
                        WebkitBoxShadow: "0 0 0 1000px #ffffff inset",
                        boxShadow: "0 0 0 1000px #ffffff inset",
                        WebkitTextFillColor: "#1a1a1a",
                        caretColor: "#1a1a1a",
                        transition: "background-color 9999s ease-out 0s",
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
                    placeholder={translate("auth.PasswordPlaceholder")}
                    size="medium"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    inputProps={{
                      maxLength: 128,
                      autoComplete: "current-password",
                    }}
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
                        whiteSpace: "nowrap",
                        textOverflow: "clip",
                      },
                      // Fix Chrome autofill background not full-width vs adornment
                      "& input:-webkit-autofill": {
                        WebkitBoxShadow: "0 0 0 1000px #ffffff inset",
                        boxShadow: "0 0 0 1000px #ffffff inset",
                        WebkitTextFillColor: "#1a1a1a",
                        caretColor: "#1a1a1a",
                        transition: "background-color 9999s ease-out 0s",
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
                {translate("auth.ForgotPasswordButton")}
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                py: { xs: 1.8, sm: 2 },
                borderRadius: 2,
                fontSize: { xs: "14px", sm: "16px" },
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
                translate("auth.LoginButton")
              )}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography
                variant="body2"
                sx={{ color: "#6b7280", fontSize: "14px" }}
              >
                {translate("auth.OrLoginWith")}
              </Typography>
            </Divider>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                alignItems: { xs: "stretch", sm: "center" },
                "& > *": {
                  minHeight: { xs: "48px", sm: "48px" },
                },
              }}
            >
              {/* Google Login Button */}
              <Box
                sx={{
                  flex: 1,
                  overflow: "hidden",
                  "& > div": {
                    width: "100% !important",
                    margin: "0 !important",
                  },
                  "& > div > div": {
                    width: "100% !important",
                    margin: "0 !important",
                    borderRadius: "8px !important",
                    boxSizing: "border-box !important",
                    minHeight: "40px !important",
                  },
                }}
              >
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => {
                    // Error already handled via toast in thunk
                  }}
                  theme="outline"
                  size="large"
                  width="100%"
                  text="signin_with"
                  shape="rectangular"
                />
              </Box>
            </Stack>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
                {translate("auth.DontHaveAccount")}{" "}
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
                  {translate("auth.Signup")}
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
