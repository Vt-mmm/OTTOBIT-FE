import { Card, Box, Typography, Skeleton } from "@mui/material";

interface TaskItem {
  title: string;
  subject: string;
  time: string;
  icon: string;
}

interface Props {
  items: TaskItem[];
  loading: boolean;
}

export default function UpcomingTasksCard({ items, loading }: Props) {
  return (
    <Card sx={{ borderRadius: { xs: 2.5, md: 3.5 }, p: { xs: 2.5, md: 3 }, boxShadow: "0 6px 25px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.04)", bgcolor: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>📝 Nhiệm vụ sắp tới</Typography>
        <Typography variant="body2" color="primary" sx={{ cursor: "pointer" }}>Xem tất cả</Typography>
      </Box>
      {loading ? (
        <Box>
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
            </Box>
          ))}
        </Box>
      ) : items.length > 0 ? (
        items.map((task, index) => (
          <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2, p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "rgba(76, 175, 80, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", mr: 2, fontSize: "1.2rem" }}>{task.icon}</Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{task.title}</Typography>
              <Typography variant="body2" color="text.secondary">{task.subject}</Typography>
              <Typography variant="caption" color="text.secondary">Tham gia: {task.time}</Typography>
            </Box>
          </Box>
        ))
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" color="text.secondary">Không có nhiệm vụ sắp tới. Bạn đã hoàn thành tất cả!</Typography>
        </Box>
      )}
    </Card>
  );
}
