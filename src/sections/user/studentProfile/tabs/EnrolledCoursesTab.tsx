import { Box, Card, CardContent, Typography, LinearProgress, Chip, Skeleton } from "@mui/material";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import PlayCircleIcon from "@mui/icons-material/PlayCircleOutlined";

interface EnrollmentItem {
  id: string;
  courseId: string;
  courseTitle: string;
  enrollmentDate: string;
  progress?: number;
  totalLessonsCount?: number;
  completedLessonsCount?: number;
  isCompleted?: boolean;
}

interface EnrolledCoursesTabProps {
  enrollments: EnrollmentItem[];
  loading?: boolean;
}

export default function EnrolledCoursesTab({ enrollments, loading }: EnrolledCoursesTabProps) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
        ))}
      </Box>
    );
  }

  if (enrollments.length === 0) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 6, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Chưa có khóa học nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học của chúng tôi!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {enrollments.map((enrollment, index) => {
        // Fix: Nếu progress là số thập phân 0..1, nhân 100; nếu đã là %, giữ nguyên
        let progress = 0;
        if (enrollment.totalLessonsCount && enrollment.completedLessonsCount) {
          progress = Math.round((enrollment.completedLessonsCount / enrollment.totalLessonsCount) * 100);
        } else if (typeof enrollment.progress === 'number') {
          // Nếu progress <= 1 thì đây là tỷ lệ (0..1), nhân 100
          // Nếu progress > 1 thì đây đã là % rồi
          progress = enrollment.progress <= 1 
            ? Math.round(enrollment.progress * 100) 
            : Math.min(100, Math.round(enrollment.progress));
        }
        progress = Math.max(0, Math.min(100, progress)); // Clamp 0-100

        return (
          <motion.div
            key={enrollment.id}
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
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {enrollment.courseTitle || "Khóa học"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Ngày đăng ký: {dayjs(enrollment.enrollmentDate).format("DD/MM/YYYY")}
                    </Typography>
                  </Box>
                  <Chip
                    icon={enrollment.isCompleted ? <CheckCircleIcon /> : <PlayCircleIcon />}
                    label={enrollment.isCompleted ? "Hoàn thành" : "Đang học"}
                    size="small"
                    sx={{
                      bgcolor: enrollment.isCompleted ? "success.50" : "info.50",
                      color: enrollment.isCompleted ? "success.main" : "info.main",
                      fontWeight: 600,
                      border: "1px solid",
                      borderColor: enrollment.isCompleted ? "success.200" : "info.200",
                    }}
                  />
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Tiến độ học tập
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: "grey.200",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: enrollment.isCompleted ? "success.main" : "primary.main",
                        borderRadius: 5,
                      },
                    }}
                  />
                </Box>

                {enrollment.totalLessonsCount && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Bài học: {enrollment.completedLessonsCount || 0}/{enrollment.totalLessonsCount}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </Box>
  );
}