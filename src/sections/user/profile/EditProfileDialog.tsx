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
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Close as CloseIcon, Edit as EditIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { UpdateProfileForm } from "common/@types";
import { useAppSelector } from "store/config";
import { useLocales } from "hooks";
import { alpha } from "@mui/material/styles";
import { AvatarUploader } from "components/common/AvatarUploader";

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: UpdateProfileForm) => void;
}

// Local form interface - Matched with BE UpdateUserProfileCommand
interface ProfileFormData {
  fullName?: string;
  avatarUrl?: string;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const { translate } = useLocales();
  const { userAuth } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const { profile } = useAppSelector((state) => state.account);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(
    profile.data?.avatarUrl || null
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: profile.data?.fullName || userAuth?.username || "",
      avatarUrl: profile.data?.avatarUrl || "",
    },
  });

  const handleSave = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // Include uploaded avatar URL in the form data
      const formDataWithAvatar = {
        ...data,
        avatarUrl: uploadedAvatarUrl || undefined,
      };
      await onSave(formDataWithAvatar);
      onClose();
    } catch (error) {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setUploadedAvatarUrl(profile.data?.avatarUrl || null);
    onClose();
  };

  const handleAvatarChange = (avatarUrl: string | null) => {
    setUploadedAvatarUrl(avatarUrl);
    setValue("avatarUrl", avatarUrl || "");
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
          {translate("profile.EditProfile")}
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
            {/* Avatar Section with Firebase Upload */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <AvatarUploader
                userId={userAuth?.userId || profile.data?.id || "user"}
                currentAvatarUrl={uploadedAvatarUrl || undefined}
                onAvatarChange={handleAvatarChange}
                size={120}
                disabled={isLoading}
                folder="avatars/profiles"
                enableCrop={true}
                aspectRatio={1}
              />
            </Box>

            {/* Form Fields */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="fullName"
                  control={control}
                  rules={{ required: "Vui lòng nhập họ và tên" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Họ và tên"
                      placeholder="Nhập họ và tên của bạn"
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
                Bạn có thể thay đổi họ tên và ảnh đại diện. Số điện thoại chỉ có
                thể xem, không thể chỉnh sửa.
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
            {isLoading
              ? translate("profile.Saving")
              : translate("profile.SaveChanges")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProfileDialog;
