import React, { useState } from "react";
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
  Grid,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import { register } from "store/auth/authSlice";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PATH_AUTH } from "../../routes/paths";

// Schema validation
const schema = yup.object().shape({
  fullName: yup.string().required("Họ tên là bắt buộc"),
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Mật khẩu là bắt buộc"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
});

// Define register form interface
interface RegisterFormType {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, errorMessage } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(
    null
  );

  // Setup react-hook-form with validation
  const methods = useForm<RegisterFormType>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  // Handle register form submit
  const onSubmit = async (values: RegisterFormType) => {
    const params = {
      data: { ...values },
      navigate: navigate,
    };

    try {
      // Use the register thunk from Redux
      await dispatch(register(params)).unwrap();
      setLocalErrorMessage(null);

      // Navigation will be handled by the thunk
    } catch (error: unknown) {
      console.error("Register error:", error);
      if (typeof error === "string") {
        setLocalErrorMessage(error);
      } else if (error && typeof error === "object" && "message" in error) {
        setLocalErrorMessage((error as { message: string }).message);
      } else {
        setLocalErrorMessage("Đăng ký thất bại. Vui lòng thử lại.");
      }
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
        p: 0,
        m: 0,
        overflow: "hidden",
      }}
    >
      <Grid container sx={{ height: "100vh", flex: 1 }}>
        {/* Left side - Image */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            position: "relative",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          {/* Background Image - Full coverage without overlay text */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: "url(/OttoDIY/RegisterPicture.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              filter: "brightness(1.1)",
            }}
          />
          
          {/* Optional subtle overlay for better contrast if needed */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(22,163,74,0.1) 100%)",
            }}
          />

          {/* Logo or branding in corner if needed */}
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              left: 20,
              color: "white",
              zIndex: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Ottobit
            </Typography>
          </Box>
        </Grid>

        {/* Right side - Form */}
        <Grid 
          item 
          xs={12} 
          md={6}
          sx={{
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Box 
            sx={{ 
              p: { xs: 3, md: 6 },
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              maxWidth: 480,
              mx: "auto",
              width: "100%",
            }}
          >
              <FormProvider {...methods}>
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
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
                      Sign Up
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#6b7280",
                        fontSize: "16px",
                      }}
                    >
                      Create your account to get started
                    </Typography>
                  </Box>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2.5}>
                      {(localErrorMessage || errorMessage) && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {localErrorMessage || errorMessage}
                        </Alert>
                      )}

                      <Box>
                        <Controller
                          name="fullName"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              variant="outlined"
                              fullWidth
                              placeholder="Full Name"
                              size="medium"
                              error={!!errors.fullName}
                              helperText={errors.fullName?.message}
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
                                      sx={{ color: "#6b7280" }}
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
                              type={showConfirmPassword ? "text" : "password"}
                              variant="outlined"
                              fullWidth
                              placeholder="Confirm Password"
                              size="medium"
                              error={!!errors.confirmPassword}
                              helperText={errors.confirmPassword?.message}
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
                                      onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                      }
                                      edge="end"
                                      sx={{ color: "#6b7280" }}
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
                          "Create Account"
                        )}
                      </Button>

                      <Box sx={{ textAlign: "center", mt: 2 }}>
                        <Typography sx={{ fontSize: "14px", color: "#6b7280" }}>
                          Already have an account?{" "}
                          <Link
                            component={RouterLink}
                            to={PATH_AUTH.login}
                            underline="none"
                            sx={{
                              color: "#22c55e",
                              fontWeight: 600,
                              "&:hover": {
                                color: "#16a34a",
                              },
                            }}
                          >
                            Sign In
                          </Link>
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Button
                        component={RouterLink}
                        to="/"
                        startIcon={<HomeIcon />}
                        variant="text"
                        fullWidth
                        sx={{
                          py: 1.5,
                          fontSize: "14px",
                          textTransform: "none",
                          color: "#6b7280",
                          "&:hover": {
                            backgroundColor: "rgba(34, 197, 94, 0.04)",
                            color: "#22c55e",
                          },
                        }}
                      >
                        Back to Homepage
                      </Button>
                    </Stack>
                  </form>
                </Box>
              </FormProvider>
            </Box>
          </Grid>
        </Grid>
    </Box>
  );
};

export default RegisterForm;
