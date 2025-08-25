import React from "react";
import {
  Box,
  Card,
  CardContent,
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
  Person as PersonIcon,
  Verified as VerifiedIcon,
  PersonOutline as PersonOutlineIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAppSelector } from "store/config";
import { alpha } from "@mui/material/styles";

interface ProfileOverviewProps {
  onEditProfile: () => void;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ onEditProfile }) => {
  const { userAuth, userInfo } = useAppSelector((state) => state.auth);

  // Use auth data directly since we don't have getUserProfile endpoint
  const displayData = {
    fullName: userInfo?.fullName || "Chưa có tên",
    email: userAuth?.email || "Chưa có email",
    phoneNumber: "",
    avatarUrl: "",
    emailConfirmed: userInfo?.emailConfirmed || false,
    registrationDate: "",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(34, 197, 94, 0.15)",
          border: `1px solid ${alpha("#22c55e", 0.2)}`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Header Background */}
        <Box
          sx={{
            height: 120,
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
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

        <CardContent sx={{ pt: 0, pb: 3 }}>
          {/* Avatar and Edit Button */}
          <Box sx={{ display: "flex", alignItems: "flex-end", mb: 3 }}>
            <Avatar
              src={displayData.avatarUrl}
              sx={{
                width: 100,
                height: 100,
                border: "4px solid white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                mt: -6,
                mr: 2,
                background: "linear-gradient(45deg, #22c55e, #16a34a)",
                fontSize: "2rem",
                fontWeight: 600,
              }}
            >
              {displayData.fullName?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>

            <Box sx={{ flexGrow: 1 }} />

            <Tooltip title="Chỉnh sửa hồ sơ">
              <IconButton
                onClick={onEditProfile}
                sx={{
                  bgcolor: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  "&:hover": {
                    bgcolor: alpha("#22c55e", 0.1),
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <EditIcon sx={{ color: "#22c55e" }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* User Info */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#2E7D32",
                mb: 1,
                background: "linear-gradient(45deg, #2E7D32, #388E3C)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {displayData.fullName || "Người dùng"}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {userAuth?.roles?.map((role) => (
                <Chip
                  key={role}
                  label={role === "OTTOBIT_USER" ? "Học viên" : role}
                  size="small"
                  sx={{
                    bgcolor: alpha("#8BC34A", 0.15),
                    color: "#2E7D32",
                    fontWeight: 600,
                    border: `1px solid ${alpha("#8BC34A", 0.3)}`,
                    "& .MuiChip-icon": {
                      color: "#2E7D32",
                    },
                  }}
                  icon={<PersonOutlineIcon />}
                />
              ))}

              <Chip
                label="Email đã xác thực"
                size="small"
                sx={{
                  bgcolor: alpha("#4CAF50", 0.15),
                  color: "#1B5E20",
                  fontWeight: 600,
                  border: `1px solid ${alpha("#4CAF50", 0.3)}`,
                }}
                icon={<VerifiedIcon />}
              />
            </Stack>
          </Box>

          <Divider sx={{ mb: 3, bgcolor: alpha("#8BC34A", 0.2) }} />

          {/* User Details Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha("#8BC34A", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <EmailIcon sx={{ color: "#2E7D32", fontSize: 20 }} />
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
                    sx={{ fontWeight: 600, color: "#2E7D32" }}
                  >
                    {displayData.email || "Chưa cập nhật"}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha("#8BC34A", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <PhoneIcon sx={{ color: "#2E7D32", fontSize: 20 }} />
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
                    sx={{ fontWeight: 600, color: "#2E7D32" }}
                  >
                    {displayData.phoneNumber || "Chưa cập nhật"}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha("#8BC34A", 0.1),
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
                    Ngày sinh
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#2E7D32" }}
                  >
                    Chưa cập nhật
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha("#8BC34A", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <PersonIcon sx={{ color: "#2E7D32", fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Giới tính
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#2E7D32" }}
                  >
                    Chưa cập nhật
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileOverview;
