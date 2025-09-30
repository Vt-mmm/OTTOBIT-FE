import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";

interface StatsData {
  totalEnrollments: number;
  totalSubmissions: number;
  completedCourses: number;
  totalPoints: number;
}

interface LearningProgressItem {
  subject: string;
  progress: number;
  color: string;
}

interface OverviewTabProps {
  stats: StatsData;
  learningProgress: LearningProgressItem[];
  loading?: boolean;
}

export default function OverviewTab({
  stats,
  learningProgress,
  loading,
}: OverviewTabProps) {
  const statsCards = [
    {
      title: "Khóa học đã tham gia",
      value: stats.totalEnrollments,
      icon: <SchoolIcon sx={{ fontSize: 32 }} />,
      color: "#4caf50",
      bgColor: "rgba(76, 175, 80, 0.1)",
    },
    {
      title: "Bài tập đã nộp",
      value: stats.totalSubmissions,
      icon: <AssignmentIcon sx={{ fontSize: 32 }} />,
      color: "#2196f3",
      bgColor: "rgba(33, 150, 243, 0.1)",
    },
    {
      title: "Khóa học hoàn thành",
      value: stats.completedCourses,
      icon: <EmojiEventsIcon sx={{ fontSize: 32 }} />,
      color: "#ff9800",
      bgColor: "rgba(255, 152, 0, 0.1)",
    },
  ];

  return (
    <Box>
      {/* Stats Cards - 3 cards balanced */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                height: "100%", // Fix: Ensure all cards have same height
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                },
              }}
            >
              <CardContent sx={{ p: 3, flex: 1, display: "flex", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 3,
                      bgcolor: card.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
                    >
                      {loading ? <Skeleton width={60} /> : card.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ 
                        fontSize: "0.875rem",
                        lineHeight: 1.4,
                        minHeight: "2.8em", // Fix: Reserve space for 2 lines
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* Learning Progress Section */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            📚 Tiến độ học tập
          </Typography>

          {loading ? (
            <>
              <Skeleton height={60} sx={{ mb: 2 }} />
              <Skeleton height={60} sx={{ mb: 2 }} />
              <Skeleton height={60} />
            </>
          ) : learningProgress.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {learningProgress.map((item, index) => (
                <Box key={index}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.subject}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: item.color }}
                    >
                      {item.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.progress}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: "grey.200",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: item.color,
                        borderRadius: 5,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                py: 4,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <Typography variant="body2">
                Chưa có dữ liệu tiến độ học tập
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
