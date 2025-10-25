import { Card, CardContent, Typography, Box, Skeleton, Grid } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CourseDistribution } from "common/@types/dashboard";
import useLocales from "hooks/useLocales";
import { BarChart3 } from "lucide-react";

interface CourseDistributionChartProps {
  data: CourseDistribution | null;
  isLoading: boolean;
}

const COLORS = ["#3b82f6", "#fbbf24"];

export default function CourseDistributionChart({
  data,
  isLoading,
}: CourseDistributionChartProps) {
  const { translate } = useLocales();
  
  const chartData = data
    ? [
        { name: translate("admin.dashboardStats.freeCourses"), value: data.freeCourses },
        { name: translate("admin.dashboardStats.paidCourses"), value: data.paidCourses },
      ]
    : [];

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {translate("admin.dashboardStats.courseDistribution")}
          </Typography>
          <Skeleton variant="circular" width={250} height={250} sx={{ mx: "auto" }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <BarChart3 size={24} color="#3b82f6" />
          <Typography variant="h6" fontWeight={600}>
            {translate("admin.dashboardStats.courseDistribution")}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Donut Chart - Left */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                    outerRadius={90}
                    innerRadius={55}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.96)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Stats Boxes - Right */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'center' }}>
              {/* Total Courses */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {translate("admin.dashboardStats.totalCoursesLabel")}
                </Typography>
                <Typography variant="h4" fontWeight={700} color="#334155">
                  {data?.totalCourses || 0}
                </Typography>
              </Box>

              {/* Free Courses */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#dbeafe',
                  border: '2px solid #3b82f6',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {translate("admin.dashboardStats.freeCourses")}
                  </Typography>
                  <Typography variant="h6" color="#3b82f6" fontWeight={700}>
                    {data?.freeCoursesPercentage?.toFixed(1) || 0}%
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="#3b82f6">
                  {data?.freeCourses || 0}
                </Typography>
              </Box>

              {/* Paid Courses */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#fef3c7',
                  border: '2px solid #fbbf24',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {translate("admin.dashboardStats.paidCourses")}
                  </Typography>
                  <Typography variant="h6" color="#f59e0b" fontWeight={700}>
                    {data?.paidCoursesPercentage?.toFixed(1) || 0}%
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">
                  {data?.paidCourses || 0}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
