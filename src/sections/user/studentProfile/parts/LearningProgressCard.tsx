import { Card, Box, Typography, LinearProgress, Chip, Skeleton } from "@mui/material";

interface LearningItem {
  subject: string;
  progress: number;
  color: string;
}

interface Props {
  items: LearningItem[];
  loading: boolean;
  activityCount?: number;
}

export default function LearningProgressCard({ items, loading, activityCount = 0 }: Props) {
  return (
    <Card sx={{ borderRadius: { xs: 2.5, md: 3.5 }, p: { xs: 2.5, md: 3 }, boxShadow: "0 6px 25px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.04)", bgcolor: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>📚 Tiến độ học tập</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 24 }}>
          {activityCount > 0 && (
            <Chip label={`Đã nộp ${activityCount} bài`} size="small" color="primary" variant="outlined" />
          )}
        </Box>
      </Box>
      {loading ? (
        <Box>
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 1 }} />
            </Box>
          ))}
        </Box>
      ) : items.length > 0 ? (
        items.map((course, index) => {
          const status = course.progress >= 100 ? 'Hoàn thành' : course.progress > 0 ? 'Đang học' : 'Chưa bắt đầu';
          const color: any = course.progress >= 100 ? 'success' : course.progress > 0 ? 'warning' : 'default';
          return (
            <Box key={index} sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{course.subject}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={status} size="small" color={color} />
                  <Typography variant="body2" color="text.secondary">{course.progress}%</Typography>
                </Box>
              </Box>
              <LinearProgress variant="determinate" value={course.progress} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          );
        })
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" color="text.secondary">Chưa có khóa học nào. Hãy tham gia khóa học đầu tiên!</Typography>
        </Box>
      )}
    </Card>
  );
}
