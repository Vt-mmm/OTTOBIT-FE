import { Box, Card, CardContent, Grid, Typography, Skeleton } from "@mui/material";
import { Users, GraduationCap, BookOpen, DollarSign } from "lucide-react";
import { DashboardStatistics } from "common/@types/dashboard";
import useLocales from "hooks/useLocales";

interface StatisticsCardsProps {
  data: DashboardStatistics | null;
  isLoading: boolean;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  isLoading: boolean;
}

const StatCard = ({ title, value, icon, color, isLoading }: StatCardProps) => (
  <Card
    sx={{
      height: "100%",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: 4,
      },
    }}
  >
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: `${color}15`,
            color: color,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
      </Box>
      {isLoading ? (
        <Skeleton variant="text" width="60%" height={40} />
      ) : (
        <Typography variant="h4" fontWeight={700} color={color}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default function StatisticsCards({ data, isLoading }: StatisticsCardsProps) {
  const { translate } = useLocales();
  
  const stats = [
    {
      title: translate("admin.dashboardStats.totalStudents"),
      value: data?.totalStudent || 0,
      icon: <Users size={32} />,
      color: "#3b82f6",
    },
    {
      title: translate("admin.dashboardStats.totalCourses"),
      value: data?.totalCourses || 0,
      icon: <GraduationCap size={32} />,
      color: "#10b981",
    },
    {
      title: translate("admin.dashboardStats.totalEnrollments"),
      value: data?.totalEnrollments || 0,
      icon: <BookOpen size={32} />,
      color: "#f59e0b",
    },
    {
      title: translate("admin.dashboardStats.totalRevenue"),
      value: data?.totalRevenue ? `${data.totalRevenue.toLocaleString()} VNĐ` : "0 VNĐ",
      icon: <DollarSign size={32} />,
      color: "#ef4444",
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatCard
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            isLoading={isLoading}
          />
        </Grid>
      ))}
    </Grid>
  );
}
