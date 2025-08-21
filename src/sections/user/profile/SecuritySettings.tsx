import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Shield as ShieldIcon,
  History as HistoryIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "store/config";
import { changePasswordThunk, forgotPasswordThunk, resetPasswordThunk } from "store/account/accountSlice";
import { AccountChangePasswordForm, ForgotPasswordForm, ResetPasswordForm } from "common/@types";
import { alpha } from "@mui/material/styles";

// Validation schemas
const changePasswordSchema = yup.object().shape({
  currentPassword: yup.string().required("Mật khẩu hiện tại là bắt buộc"),
  newPassword: yup
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .required("Mật khẩu mới là bắt buộc"),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Xác nhận mật khẩu không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
});

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Email là bắt buộc"),
});

const resetPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Email là bắt buộc"),
  resetToken: yup.string().required("Token là bắt buộc"),
  newPassword: yup
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .required("Mật khẩu mới là bắt buộc"),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Xác nhận mật khẩu không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
});

const SecuritySettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, isError, errorMessage } = useAppSelector(
    (state) => state.account
  );

  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [openResetPassword, setOpenResetPassword] = useState(false);
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

  const {
    control: forgotControl,
    handleSubmit: handleForgotSubmit,
    reset: resetForgot,
    formState: { errors: forgotErrors },
  } = useForm<ForgotPasswordForm>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    reset: resetReset,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordForm>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      resetToken: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const handleChangePassword = async (data: AccountChangePasswordForm) => {
    try {
      await dispatch(changePasswordThunk({ data })).unwrap();
      setOpenChangePassword(false);
      reset();
    } catch (error) {
      // Error đã được handle trong slice
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordForm) => {
    try {
      await dispatch(forgotPasswordThunk({ data })).unwrap();
      setOpenForgotPassword(false);
      resetForgot();
    } catch (error) {
      // Error đã được handle trong slice
    }
  };

  const handleResetPassword = async (data: ResetPasswordForm) => {
    try {
      await dispatch(resetPasswordThunk({ data })).unwrap();
      setOpenResetPassword(false);
      resetReset();
    } catch (error) {
      // Error đã được handle trong slice
    }
  };

  const handleCloseDialog = () => {
    setOpenChangePassword(false);
    reset();
  };

  const handleCloseForgotDialog = () => {
    setOpenForgotPassword(false);
    resetForgot();
  };

  const handleCloseResetDialog = () => {
    setOpenResetPassword(false);
    resetReset();
  };

  const securityFeatures = [
    {
      icon: <LockIcon />,
      title: "Đổi mật khẩu",
      description: "Cập nhật mật khẩu để bảo mật tài khoản",
      action: "Đổi mật khẩu",
      onClick: () => setOpenChangePassword(true),
    },
    {
      icon: <ShieldIcon />,
      title: "Quên mật khẩu",
      description: "Gửi email đặt lại mật khẩu",
      action: "Gửi email",
      onClick: () => setOpenForgotPassword(true),
    },
    {
      icon: <HistoryIcon />,
      title: "Đặt lại mật khẩu",
      description: "Đặt lại mật khẩu với token",
      action: "Đặt lại",
      onClick: () => setOpenResetPassword(true),
    },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(139, 195, 74, 0.15)",
            border: `1px solid ${alpha("#8BC34A", 0.2)}`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha("#8BC34A", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                }}
              >
                <SecurityIcon sx={{ color: "#2E7D32", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#2E7D32",
                    mb: 0.5,
                  }}
                >
                  Bảo mật tài khoản
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quản lý cài đặt bảo mật cho tài khoản của bạn
                </Typography>
              </Box>
            </Box>

            {/* Security Features List */}
            <List sx={{ p: 0 }}>
              {securityFeatures.map((feature, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      "&:hover": {
                        bgcolor: alpha("#8BC34A", 0.05),
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: alpha("#8BC34A", 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {React.cloneElement(feature.icon, {
                          sx: { color: "#2E7D32", fontSize: 20 },
                        })}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, color: "#2E7D32" }}
                        >
                          {feature.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      }
                    />
                    <Button
                      variant="outlined"
                      onClick={feature.onClick}
                      sx={{
                        borderColor: "#8BC34A",
                        color: "#2E7D32",
                        fontWeight: 600,
                        "&:hover": {
                          borderColor: "#689F38",
                          bgcolor: alpha("#8BC34A", 0.1),
                        },
                      }}
                    >
                      {feature.action}
                    </Button>
                  </ListItem>
                  {index < securityFeatures.length - 1 && (
                    <Divider sx={{ my: 1, bgcolor: alpha("#8BC34A", 0.1) }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </motion.div>

      {/* Change Password Dialog */}
      <Dialog
        open={openChangePassword}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#2E7D32" }}>
            Đổi mật khẩu
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit(handleChangePassword)}>
          <DialogContent>
            {isError && errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Stack spacing={3}>
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
                        <InputAdornment position="end">
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
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "#8BC34A",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#2E7D32",
                      },
                    }}
                  />
                )}
              />

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
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "#8BC34A",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#2E7D32",
                      },
                    }}
                  />
                )}
              />

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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "#8BC34A",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#2E7D32",
                      },
                    }}
                  />
                )}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                color: "#666",
                fontWeight: 600,
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                background: "linear-gradient(45deg, #8BC34A, #689F38)",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                "&:hover": {
                  background: "linear-gradient(45deg, #689F38, #558B2F)",
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Đổi mật khẩu"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog
        open={openForgotPassword}
        onClose={handleCloseForgotDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${alpha("#8BC34A", 0.2)}`,
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#2E7D32" }}>
              Quên mật khẩu
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={handleCloseForgotDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <form onSubmit={handleForgotSubmit(handleForgotPassword)}>
          <DialogContent>
            {isError && errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
            </Typography>

            <Controller
              name="email"
              control={forgotControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  type="email"
                  error={!!forgotErrors.email}
                  helperText={forgotErrors.email?.message}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#8BC34A",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#2E7D32",
                    },
                  }}
                />
              )}
            />
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleCloseForgotDialog} sx={{ color: "#666" }}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                background: "linear-gradient(45deg, #8BC34A, #689F38)",
                fontWeight: 600,
                "&:hover": {
                  background: "linear-gradient(45deg, #689F38, #558B2F)",
                },
              }}
            >
              {isLoading ? <CircularProgress size={20} /> : "Gửi email"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={openResetPassword}
        onClose={handleCloseResetDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${alpha("#8BC34A", 0.2)}`,
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#2E7D32" }}>
              Đặt lại mật khẩu
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={handleCloseResetDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <form onSubmit={handleResetSubmit(handleResetPassword)}>
          <DialogContent>
            {isError && errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Stack spacing={3}>
              <Controller
                name="email"
                control={resetControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!resetErrors.email}
                    helperText={resetErrors.email?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "#8BC34A",
                        },
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="resetToken"
                control={resetControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Token đặt lại"
                    error={!!resetErrors.resetToken}
                    helperText={resetErrors.resetToken?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "#8BC34A",
                        },
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="newPassword"
                control={resetControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Mật khẩu mới"
                    type="password"
                    error={!!resetErrors.newPassword}
                    helperText={resetErrors.newPassword?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "#8BC34A",
                        },
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="confirmNewPassword"
                control={resetControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    error={!!resetErrors.confirmNewPassword}
                    helperText={resetErrors.confirmNewPassword?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "#8BC34A",
                        },
                      },
                    }}
                  />
                )}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleCloseResetDialog} sx={{ color: "#666" }}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                background: "linear-gradient(45deg, #8BC34A, #689F38)",
                fontWeight: 600,
                "&:hover": {
                  background: "linear-gradient(45deg, #689F38, #558B2F)",
                },
              }}
            >
              {isLoading ? <CircularProgress size={20} /> : "Đặt lại mật khẩu"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default SecuritySettings;
