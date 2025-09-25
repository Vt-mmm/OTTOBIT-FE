import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  PersonOutline as PersonOutlineIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAppSelector } from "store/config";
import { alpha } from "@mui/material/styles";
import dayjs from "dayjs";

interface ProfileOverviewProps {
  onEditProfile: () => void;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ onEditProfile }) => {
  const { userAuth } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.account);

  // Ưu tiên dữ liệu từ account.profile (BE), fallback sang auth
  const displayData = {
    fullName: profile.data?.fullName || userAuth?.username || "Chưa có tên",
    email: profile.data?.email || userAuth?.email || "Chưa có email",
    roles: (profile.data?.roles as string[] | undefined) || userAuth?.roles || [],
    phoneNumber: profile.data?.phoneNumber || "",
    avatarUrl: profile.data?.avatarUrl || "",
    registrationDate: profile.data?.registrationDate || "",
    emailConfirmed: true,
  };

  const formattedRegistrationDate = displayData.registrationDate && dayjs(displayData.registrationDate).isValid()
    ? dayjs(displayData.registrationDate).format("DD/MM/YYYY")
    : "Chưa cập nhật";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ maxWidth: 880 }}>
        {/* Header Background */}
        <Box
          sx={{
            height: 120,
            borderRadius: 2,
            background: (t) =>
              `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`,
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
        </Box>

        <Box sx={{ pt: 0, pb: 3, maxWidth: 1024, mx: "auto" }}>
          {/* Avatar and Edit Button */}
          <Box sx={{ display: "flex", alignItems: "flex-end", mb: 3 }}>
            <Avatar
              src={displayData.avatarUrl || undefined}
              sx={{
                width: 100,
                height: 100,
                border: (t) => `4px solid ${t.palette.common.white}`,
                boxShadow: (t) =>
                  `0 4px 16px ${alpha(t.palette.common.black, 0.12)}`,
                mt: -10,
                mr: 2,
                bgcolor: (t) => t.palette.primary.light,
                fontSize: "2rem",
                fontWeight: 600,
                color: (t) => t.palette.primary.contrastText,
              }}
            >
              {!displayData.avatarUrl && (displayData.fullName?.charAt(0)?.toUpperCase() || "U")}
            </Avatar>

            <Box sx={{ flexGrow: 1 }} />

            <Tooltip title="Chỉnh sửa hồ sơ">
              <IconButton
                onClick={onEditProfile}
                sx={{
                  bgcolor: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  "&:hover": {
                    bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <EditIcon sx={{ color: (t) => t.palette.primary.main }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* User Info */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: (t) => t.palette.text.primary,
                mb: 1,
              }}
            >
              {displayData.fullName || "Người dùng"}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {(displayData.roles || []).map((role: string) => (
                <Chip
                  key={role}
                  label={role === "OTTOBIT_USER" ? "Học viên" : role}
                  size="small"
                  sx={{
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                    color: (t) => t.palette.primary.dark,
                    fontWeight: 600,
                    border: (t) =>
                      `1px solid ${alpha(t.palette.primary.main, 0.3)}`,
                    "& .MuiChip-icon": {
                      color: (t) => t.palette.primary.dark,
                    },
                  }}
                  icon={<PersonOutlineIcon />}
                />
              ))}

              <Chip
                label="Email đã xác thực"
                size="small"
                sx={{
                  bgcolor: (t) => alpha(t.palette.success.main, 0.12),
                  color: (t) => t.palette.success.dark,
                  fontWeight: 600,
                  border: (t) =>
                    `1px solid ${alpha(t.palette.success.main, 0.3)}`,
                }}
                icon={<VerifiedIcon />}
              />
            </Stack>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* User Details Grid */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <EmailIcon
                    sx={{ color: (t) => t.palette.primary.main, fontSize: 20 }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Email
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: (t) => t.palette.text.primary,
                    }}
                  >
                    {displayData.email || "Chưa cập nhật"}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={12}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <PhoneIcon
                    sx={{
                      color: (t) => t.palette.text.secondary,
                      fontSize: 20,
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Số điện thoại
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: (t) => t.palette.text.primary,
                    }}
                  >
                    {displayData.phoneNumber || "Chưa cập nhật"}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={12}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <CalendarIcon sx={{ color: "#2E7D32", fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Ngày tham gia
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: (t) => t.palette.text.primary,
                    }}
                  >
                    {formattedRegistrationDate}
                  </Typography>
                </Box>
              </Box>
            </Grid>


          </Grid>
        </Box>
      </Box>
    </motion.div>
  );
};

export default ProfileOverview;
