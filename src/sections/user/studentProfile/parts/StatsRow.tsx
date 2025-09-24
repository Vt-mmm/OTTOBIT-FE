import { Grid, Card, Box, Typography, CircularProgress } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

interface Props {
  totalEnrollments: number;
  totalSubmissions: number;
  completedCourses: number;
  totalPoints: number;
  loading: boolean;
}

const CardStat = ({ icon, value, label, color, loading }: { icon: JSX.Element; value: number | JSX.Element; label: string; color: string; loading: boolean; }) => (
  <Card sx={{ textAlign: "center", p: 2.5, borderRadius: { xs: 2, md: 3 }, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.05)", bgcolor: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", transition: "all 0.3s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" } }}>
    <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: color, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
      {icon}
    </Box>
    <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
      {loading ? <CircularProgress size={16} /> : value}
    </Typography>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
  </Card>
);

export default function StatsRow(props: Props) {
  const { totalEnrollments, totalSubmissions, completedCourses, totalPoints, loading } = props;
  const stats = [
    { icon: <SchoolIcon sx={{ color: "white", fontSize: 20 }} />, value: totalEnrollments, label: "Khóa học đã tham gia", color: "#ff6b6b" },
    { icon: <AssignmentIcon sx={{ color: "white", fontSize: 20 }} />, value: totalSubmissions, label: "Bài tập đã nộp", color: "#4ecdc4" },
    { icon: <SchoolIcon sx={{ color: "white", fontSize: 20 }} />, value: completedCourses, label: "Khóa học hoàn thành", color: "#a8e6cf" },
    { icon: <AccountBalanceIcon sx={{ color: "white", fontSize: 20 }} />, value: totalPoints, label: "Tổng điểm số", color: "#42a5f5" },
  ];

  return (
    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
      {stats.map((s, i) => (
        <Grid item xs={6} sm={4} md={3} key={i}>
          <CardStat icon={s.icon} value={s.value} label={s.label} color={s.color} loading={loading} />
        </Grid>
      ))}
    </Grid>
  );
}
