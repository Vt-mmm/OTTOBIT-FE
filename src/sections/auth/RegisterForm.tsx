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
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HomeIcon from "@mui/icons-material/Home";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "reduxStore/config";
import { register } from "reduxStore/auth/authSlice";
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
                Họ và tên
              </Typography>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    fullWidth
                    required
                    placeholder="Họ và tên"
                    size="small"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
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
                Mật khẩu
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
                    placeholder="Mật khẩu"
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

            <Box>
              <Typography variant="body2" mb={1}>
                Xác nhận mật khẩu
              </Typography>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showConfirmPassword ? "text" : "password"}
                    variant="outlined"
                    fullWidth
                    required
                    placeholder="Xác nhận mật khẩu"
                    size="small"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      sx: {
                        borderRadius: 4,
                        backgroundColor: "#FFFFFF",
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
              {isLoading ? "Đang xử lý..." : "Đăng ký"}
            </Button>

            <Box sx={{ position: "relative", py: 1.5 }}>
              <Divider />
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "rgba(229, 249, 244, 0.7)",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              ></Box>
            </Box>
          </Stack>
        </form>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography fontSize={14} mb={1.5}>
            Đã có tài khoản?{" "}
            <Link
              component={RouterLink}
              to={PATH_AUTH.login}
              underline="hover"
              fontWeight={600}
              color="primary"
            >
              ĐĂNG NHẬP
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
            Trở về Trang chủ
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default RegisterForm;
