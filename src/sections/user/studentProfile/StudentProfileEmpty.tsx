import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import {
  School as SchoolIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import { motion } from "framer-motion";

interface StudentProfileEmptyProps {
  onCreateProfile: () => void;
}

export default function StudentProfileEmpty({
  onCreateProfile,
}: StudentProfileEmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: "1px solid",
          borderColor: "divider",
          textAlign: "center",
          bgcolor: "white",
          overflow: "hidden",
        }}
      >
        {/* Top accent bar */}
        <Box
          sx={{
            height: 4,
            bgcolor: "primary.main",
          }}
        />
        
        <CardContent sx={{ p: { xs: 4, md: 6 } }}>
          <Box
            sx={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 4,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
            }}
          >
            <SchoolIcon sx={{ fontSize: 70, color: "white" }} />
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: "text.primary",
              fontSize: { xs: "1.75rem", md: "2.5rem" },
            }}
          >
            Chào mừng đến với OttoBit!
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 5, maxWidth: 500, mx: "auto", fontWeight: 400, lineHeight: 1.6 }}
          >
            Tạo hồ sơ học sinh để bắt đầu hành trình khám phá lập trình và robot học
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 3,
              mb: 5,
              maxWidth: 700,
              mx: "auto",
            }}
          >
            {[
              { 
                IconComponent: TrackChangesOutlinedIcon, 
                title: "Theo dõi tiến độ", 
                desc: "Lịch sử học tập chi tiết",
                colorKey: "primary"
              },
              { 
                IconComponent: EmojiEventsOutlinedIcon, 
                title: "Lưu thành tích", 
                desc: "Nhận huy hiệu và chứng chỉ",
                colorKey: "warning"
              },
              { 
                IconComponent: BarChartOutlinedIcon, 
                title: "Phân tích", 
                desc: "Biết điểm mạnh của bạn",
                colorKey: "success"
              },
            ].map((item, index) => (
              <Box
                key={index}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "white",
                  border: "2px solid",
                  borderColor: "divider",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
                    borderColor: `${item.colorKey}.main`,
                    bgcolor: `${item.colorKey}.50`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: `${item.colorKey}.50`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <item.IconComponent sx={{ fontSize: 28, color: `${item.colorKey}.main` }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={onCreateProfile}
            startIcon={<PersonAddIcon />}
            sx={{
              py: 2,
              px: 5,
              fontSize: "1.125rem",
              fontWeight: 700,
              borderRadius: 3,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Bắt đầu ngay
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "block", mt: 3, opacity: 0.8, fontStyle: "italic" }}
          >
            ✨ Chỉ mất 2 phút để thiết lập hồ sơ của bạn
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}
