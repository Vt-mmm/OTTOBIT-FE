import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Box,
  Avatar,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { UpdateProfileForm } from "common/@types";
import { useAppSelector } from "store/config";
import { alpha } from "@mui/material/styles";

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: UpdateProfileForm) => void;
}

// Local form interface
interface ProfileFormData {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

const genderOptions = [
  { value: "", label: "Chọn giới tính" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const { userAuth } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: userAuth?.username || "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "",
    },
  });

  const handleSave = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setAvatarPreview(null);
    onClose();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
          background: "linear-gradient(135deg, #8BC34A 0%, #689F38 100%)",
          color: "white",
          m: 0,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Chỉnh sửa hồ sơ
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleSave)}>
        <DialogContent sx={{ p: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Avatar Section */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    border: "4px solid white",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    background: avatarPreview
                      ? "none"
                      : "linear-gradient(45deg, #8BC34A, #4CAF50)",
                    fontSize: "2.5rem",
                    fontWeight: 600,
                  }}
                  src={avatarPreview || undefined}
                >
                  {!avatarPreview &&
                    (userAuth?.username?.charAt(0)?.toUpperCase() || "U")}
                </Avatar>

                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload">
                  <IconButton
                    component="span"
                    sx={{
                      position: "absolute",
                      bottom: -5,
                      right: -5,
                      bgcolor: "#8BC34A",
                      color: "white",
                      width: 40,
                      height: 40,
                      "&:hover": {
                        bgcolor: "#689F38",
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.2s ease",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                </label>
              </Box>
            </Box>

            {/* Form Fields */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Họ và tên"
                      error={!!errors.fullName}
                      helperText={errors.fullName?.message}
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
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Số điện thoại"
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber?.message}
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
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Giới tính"
                      error={!!errors.gender}
                      helperText={errors.gender?.message}
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
                    >
                      {genderOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Ngày sinh"
                      type="date"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      error={!!errors.dateOfBirth}
                      helperText={errors.dateOfBirth?.message}
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
              </Grid>
            </Grid>

            {/* Information Note */}
            <Alert
              severity="info"
              sx={{
                mt: 3,
                bgcolor: alpha("#8BC34A", 0.1),
                border: `1px solid ${alpha("#8BC34A", 0.3)}`,
                "& .MuiAlert-icon": {
                  color: "#2E7D32",
                },
              }}
            >
              <Typography variant="body2">
                Thông tin cá nhân sẽ được sử dụng để cải thiện trải nghiệm học
                tập của bạn. Chúng tôi cam kết bảo mật thông tin theo chính sách
                riêng tư.
              </Typography>
            </Alert>
          </motion.div>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleClose}
            sx={{
              color: "#666",
              fontWeight: 600,
              px: 3,
            }}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={16} /> : <EditIcon />
            }
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
            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProfileDialog;
