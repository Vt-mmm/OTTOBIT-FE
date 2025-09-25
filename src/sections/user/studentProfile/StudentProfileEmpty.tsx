import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
} from "@mui/material";
import {
  School as SchoolIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { alpha } from "@mui/material/styles";

interface StudentProfileEmptyProps {
  onCreateProfile: () => void;
}

export default function StudentProfileEmpty({
  onCreateProfile,
}: StudentProfileEmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(59, 130, 246, 0.15)",
          border: `1px solid ${alpha("#3b82f6", 0.2)}`,
          textAlign: "center",
        }}
      >
        <CardContent sx={{ p: 6 }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              bgcolor: alpha("#3b82f6", 0.1),
              color: "#3b82f6",
              mx: "auto",
              mb: 3,
            }}
          >
            <SchoolIcon sx={{ fontSize: 60 }} />
          </Avatar>

          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              mb: 2,
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            Không có hồ sơ
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
          >
            Tạo hồ sơ để bắt đầu hành trình học tập cùng OttoBit!
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, sm: 4 },
              mb: 4,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" sx={{ mb: 0.5, color: "#22c55e" }}>
                🎯
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Theo dõi tiến độ
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" sx={{ mb: 0.5, color: "#22c55e" }}>
                🏆
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lưu thành tích
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" sx={{ mb: 0.5, color: "#22c55e" }}>
                📊
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phân tích năng lực
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={onCreateProfile}
            startIcon={<PersonAddIcon />}
            sx={{
              py: 1.5,
              px: 4,
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: 2,
              background: "linear-gradient(45deg, #22c55e, #16a34a)",
              boxShadow: "0 4px 20px rgba(34, 197, 94, 0.3)",
              "&:hover": {
                background: "linear-gradient(45deg, #16a34a, #15803d)",
                boxShadow: "0 6px 25px rgba(34, 197, 94, 0.4)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease-in-out",
            }}
          >
            Tạo hồ sơ ngay
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 2, opacity: 0.7 }}
          >
            Chỉ mất vài giây để thiết lập
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}
