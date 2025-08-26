import React, { useState } from "react";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  Grid,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Header } from "layout/components/header";
import { useAppDispatch, useAppSelector } from "store/config";
import { changePasswordThunk } from "store/account/accountSlice";
import { AccountChangePasswordForm } from "common/@types";
import { alpha } from "@mui/material/styles";

// Validation schema
const changePasswordSchema = yup.object({
  currentPassword: yup.string().required("Vui lòng nhập mật khẩu hiện tại"),
  newPassword: yup
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .required("Vui lòng nhập mật khẩu mới"),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Xác nhận mật khẩu không khớp")
    .required("Vui lòng xác nhận mật khẩu mới"),
});

const UserProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, isSuccess, isError, message } = useAppSelector(
    (state) => state.account
  );
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountChangePasswordForm>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data: AccountChangePasswordForm) => {
    try {
      await dispatch(changePasswordThunk({ data })).unwrap();
      reset(); // Reset form on success
    } catch (error) {
      console.error("Change password failed:", error);
    }
  };

  return (
    <>
      <Header />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          pt: { xs: 10, md: 12 },
          pb: 6,
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Page Header */}
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: "bold",
                  background: "linear-gradient(45deg, #2E7D32, #8BC34A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 2,
                }}
              >
                Quản lý tài khoản
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  maxWidth: 600,
                  mx: "auto",
                }}
              >
                Cập nhật thông tin bảo mật cho tài khoản của bạn
              </Typography>
            </Box>

            {/* Success/Error Messages */}
            {isSuccess && message && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {message}
              </Alert>
            )}
            {isError && message && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {message}
              </Alert>
            )}

            {/* Change Password Card */}
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(139, 195, 74, 0.15)",
                border: `1px solid ${alpha("#8BC34A", 0.2)}`,
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <LockIcon sx={{ color: "#2E7D32", mr: 2, fontSize: 28 }} />
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#2E7D32" }}
                  >
                    Đổi mật khẩu
                  </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={3}>
                    {/* Current Password */}
                    <Grid item xs={12}>
                      <Controller
                        name="currentPassword"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Mật khẩu hiện tại"
                            type={showCurrentPassword ? "text" : "password"}
                            error={!!errors.currentPassword}
                            helperText={errors.currentPassword?.message}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  onClick={() =>
                                    setShowCurrentPassword(!showCurrentPassword)
                                  }
                                  edge="end"
                                >
                                  {showCurrentPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "&:hover fieldset": {
                                  borderColor: "#8BC34A",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#2E7D32",
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* New Password */}
                    <Grid item xs={12}>
                      <Controller
                        name="newPassword"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Mật khẩu mới"
                            type={showNewPassword ? "text" : "password"}
                            error={!!errors.newPassword}
                            helperText={errors.newPassword?.message}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  onClick={() =>
                                    setShowNewPassword(!showNewPassword)
                                  }
                                  edge="end"
                                >
                                  {showNewPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "&:hover fieldset": {
                                  borderColor: "#8BC34A",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#2E7D32",
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Confirm New Password */}
                    <Grid item xs={12}>
                      <Controller
                        name="confirmNewPassword"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Xác nhận mật khẩu mới"
                            type={showConfirmPassword ? "text" : "password"}
                            error={!!errors.confirmNewPassword}
                            helperText={errors.confirmNewPassword?.message}
                            InputProps={{
                              endAdornment: (
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
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "&:hover fieldset": {
                                  borderColor: "#8BC34A",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#2E7D32",
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                      <LoadingButton
                        type="submit"
                        variant="contained"
                        loading={isLoading}
                        sx={{
                          background:
                            "linear-gradient(45deg, #2E7D32, #8BC34A)",
                          "&:hover": {
                            background:
                              "linear-gradient(45deg, #1B5E20, #689F38)",
                          },
                          py: 1.5,
                          px: 4,
                          fontWeight: "bold",
                          textTransform: "none",
                          fontSize: "1.1rem",
                        }}
                      >
                        Cập nhật mật khẩu
                      </LoadingButton>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>
    </>
  );
};

export default UserProfilePage;
