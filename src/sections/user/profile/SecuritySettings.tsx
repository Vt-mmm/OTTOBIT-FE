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
  Close as CloseIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAppDispatch, useAppSelector } from "store/config";
import {
  changePasswordThunk,
  forgotPasswordThunk,
} from "store/account/accountSlice";
import {
  AccountChangePasswordForm,
  ForgotPasswordForm,
} from "common/@types";
import { alpha } from "@mui/material/styles";
import { useLocales } from "../../../hooks";

const SecuritySettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { translate } = useLocales();
  const { isLoading, isError, errorMessage } = useAppSelector(
    (state) => state.account
  );

  // Validation schemas - MUST be inside component to use translate
  const changePasswordSchema = yup.object().shape({
    currentPassword: yup
      .string()
      .required(translate("profile.CurrentPasswordRequired")),
    newPassword: yup
      .string()
      .min(6, translate("profile.NewPasswordMinLength"))
      .required(translate("profile.NewPasswordRequired")),
    confirmNewPassword: yup
      .string()
      .oneOf(
        [yup.ref("newPassword")],
        translate("profile.PasswordMismatch")
      )
      .required(translate("profile.ConfirmPasswordRequired")),
  });

  const forgotPasswordSchema = yup.object().shape({
    email: yup
      .string()
      .email(translate("profile.InvalidEmail"))
      .required(translate("profile.EmailRequired")),
  });

  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
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

  const handleCloseDialog = () => {
    setOpenChangePassword(false);
    reset();
  };

  const handleCloseForgotDialog = () => {
    setOpenForgotPassword(false);
    resetForgot();
  };

  const securityFeatures = [
    {
      icon: <LockIcon />,
      title: translate("profile.ChangePassword"),
      description: translate("profile.UpdatePasswordSecurity"),
      action: translate("profile.ChangePassword"),
      onClick: () => setOpenChangePassword(true),
    },
    {
      icon: <ShieldIcon />,
      title: translate("profile.ForgotPassword"),
      description: translate("profile.ForgotPasswordDesc"),
      action: translate("profile.SendEmail"),
      onClick: () => setOpenForgotPassword(true),
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
            borderRadius: 2,
            boxShadow: "none",
            border: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: "background.paper",
          }}
        >
          <CardContent sx={{ p: 2 }}>
            {/* Header (compact/neutral) */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1.5,
                }}
              >
                <SecurityIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {translate("profile.SecuritySettingsTitle")}
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
                      mb: 0.5,
                      "&:hover": {
                        bgcolor: (t) => t.palette.action.hover,
                      },
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {React.cloneElement(feature.icon, {
                          sx: { color: "text.secondary", fontSize: 18 },
                        })}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, color: "text.primary" }}
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
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      {feature.action}
                    </Button>
                  </ListItem>
                  {index < securityFeatures.length - 1 && (
                    <Divider sx={{ my: 1, bgcolor: alpha("#22c55e", 0.1) }} />
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
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#22c55e" }}>
            {translate("profile.ChangePassword")}
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
                    label={translate("profile.CurrentPassword")}
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
                          borderColor: "#22c55e",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#22c55e",
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
                    label={translate("profile.NewPassword")}
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
                          borderColor: "#22c55e",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#22c55e",
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
                    label={translate("profile.ConfirmPassword")}
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
                          borderColor: "#22c55e",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#22c55e",
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
              {translate("profile.Cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                background: "linear-gradient(45deg, #22c55e, #16a34a)",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                "&:hover": {
                  background: "linear-gradient(45deg, #16a34a, #558B2F)",
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                translate("profile.ChangePasswordBtn")
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
            border: `1px solid ${alpha("#22c55e", 0.2)}`,
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#22c55e" }}>
              {translate("profile.ForgotPassword")}
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
              {translate("profile.EnterEmailResetInstruction")}
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
                        borderColor: "#22c55e",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#22c55e",
                    },
                  }}
                />
              )}
            />
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleCloseForgotDialog} sx={{ color: "#666" }}>
              {translate("profile.Cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                background: "linear-gradient(45deg, #22c55e, #16a34a)",
                fontWeight: 600,
                "&:hover": {
                  background: "linear-gradient(45deg, #16a34a, #558B2F)",
                },
              }}
            >
              {isLoading ? <CircularProgress size={20} /> : translate("profile.SendEmail")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default SecuritySettings;
