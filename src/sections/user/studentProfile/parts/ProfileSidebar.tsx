import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditOutlined";
import PhoneIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOnOutlined";
import CakeIcon from "@mui/icons-material/CakeOutlined";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { useEffect } from "react";
import { StudentResult } from "common/@types/student";
import { useAppSelector, useAppDispatch } from "store/config";
import { getMyProfileThunk } from "store/account/accountThunks";

interface ProfileSidebarProps {
  student: StudentResult;
  onEdit: () => void;
}

export default function ProfileSidebar({
  student,
  onEdit,
}: ProfileSidebarProps) {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.account);
  const avatarUrl = profile?.data?.avatarUrl;

  // Fetch account profile on mount if not already loaded
  useEffect(() => {
    if (!profile?.data) {
      dispatch(getMyProfileThunk());
    }
  }, [dispatch, profile?.data]);

  const getAge = (dateOfBirth: string) =>
    dayjs().diff(dayjs(dateOfBirth), "year");

  const formatDate = (dateString: string) =>
    dayjs(dateString).format("DD/MM/YYYY");

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          position: "sticky",
          top: 100,
        }}
      >
        {/* Clean header - White background */}
        <Box
          sx={{
            height: 120,
            background: "white",
            position: "relative",
          }}
        />

        <CardContent sx={{ p: 3, mt: -8, position: "relative" }}>
          {/* Avatar */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Avatar
              src={avatarUrl}
              sx={{
                width: 120,
                height: 120,
                border: "5px solid white",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                fontSize: "3rem",
                fontWeight: "bold",
                bgcolor: avatarUrl ? "transparent" : "primary.main",
              }}
            >
              {!avatarUrl && student.fullname.charAt(0).toUpperCase()}
            </Avatar>
          </Box>

          {/* Name */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              mb: 1,
              color: "text.primary",
            }}
          >
            {student.fullname}
          </Typography>

          {/* Student ID */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Chip
              label={`ID: ${student.id.slice(-8).toUpperCase()}`}
              size="small"
              sx={{
                bgcolor: "primary.50",
                color: "primary.main",
                fontWeight: 600,
                fontSize: "0.75rem",
                borderRadius: 1.5,
              }}
            />
          </Box>

          {/* Status */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Chip
              label="Đang hoạt động"
              size="small"
              sx={{
                bgcolor: "success.50",
                color: "success.main",
                fontWeight: 600,
                border: "1px solid",
                borderColor: "success.200",
              }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Thông tin cá nhân */}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              mb: 2,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Thông tin cá nhân
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Date of Birth */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "warning.50",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CakeIcon sx={{ fontSize: 22, color: "warning.main" }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Ngày sinh
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatDate(student.dateOfBirth)} (
                  {getAge(student.dateOfBirth)} tuổi)
                </Typography>
              </Box>
            </Box>

            {/* Phone */}
            {student.phoneNumber && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: "info.50",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 22, color: "info.main" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    Số điện thoại
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {student.phoneNumber}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Location */}
            {(student.city || student.state) && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: "error.50",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: 22, color: "error.main" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    Địa chỉ
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {[student.city, student.state].filter(Boolean).join(", ")}
                  </Typography>
                  {student.address && (
                    <Typography variant="caption" color="text.secondary">
                      {student.address}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Edit Button */}
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onEdit}
            fullWidth
            sx={{
              borderColor: "divider",
              color: "text.primary",
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "primary.50",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Chỉnh sửa hồ sơ
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
