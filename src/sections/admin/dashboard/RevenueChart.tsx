import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  ToggleButtonGroup,
  ToggleButton,
  Fade,
  CircularProgress,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { RevenueByDaysResponse } from "common/@types/dashboard";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import useLocales from "hooks/useLocales";

interface RevenueChartProps {
  data: RevenueByDaysResponse | null;
  isLoading: boolean;
  selectedDays: number;
  onDaysChange: (days: number) => void;
}

export default function RevenueChart({
  data,
  isLoading,
  selectedDays,
  onDaysChange,
}: RevenueChartProps) {
  const { translate } = useLocales();

  const chartData =
    data?.revenueData.map((item) => ({
      date: format(new Date(item.date), "dd/MM", { locale: vi }),
      revenue: Number(item.revenue),
      orders: item.orderCount,
    })) || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {translate("admin.dashboardStats.revenueByDays")}
            </Typography>
            <Skeleton variant="rectangular" width={200} height={40} />
          </Box>
          <Skeleton variant="rectangular" height={300} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {translate("admin.dashboardStats.revenueByDays")}
          </Typography>
          <ToggleButtonGroup
            value={selectedDays}
            exclusive
            onChange={(_, value) => value && onDaysChange(value)}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                px: 2,
                py: 0.5,
                fontSize: "0.875rem",
                transition: "all 0.3s ease",
                "&.Mui-selected": {
                  transform: "scale(1.05)",
                  boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
                },
                "&:hover": {
                  transform: "translateY(-1px)",
                },
              },
            }}
          >
            <ToggleButton value={7}>
              7 {translate("admin.dashboardStats.days")}
            </ToggleButton>
            <ToggleButton value={14}>
              14 {translate("admin.dashboardStats.days")}
            </ToggleButton>
            <ToggleButton value={30}>
              30 {translate("admin.dashboardStats.days")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Fade in={!isLoading} timeout={500}>
          <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
            <Box sx={{ flex: 1, transition: "all 0.3s ease" }}>
              <Typography variant="body2" color="text.secondary">
                {translate("admin.dashboardStats.totalRevenueLabel")}
              </Typography>
              <Typography
                variant="h6"
                color="primary"
                fontWeight={600}
                sx={{
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "inline-block",
                }}
              >
                {data?.totalRevenue.toLocaleString() || 0} VNĐ
              </Typography>
            </Box>
            <Box sx={{ flex: 1, transition: "all 0.3s ease" }}>
              <Typography variant="body2" color="text.secondary">
                {translate("admin.dashboardStats.averagePerDay")}
              </Typography>
              <Typography
                variant="h6"
                color="success.main"
                fontWeight={600}
                sx={{
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "inline-block",
                }}
              >
                {data?.averageRevenue.toLocaleString() || 0} VNĐ
              </Typography>
            </Box>
            <Box sx={{ flex: 1, transition: "all 0.3s ease" }}>
              <Typography variant="body2" color="text.secondary">
                {translate("admin.dashboardStats.totalOrders")}
              </Typography>
              <Typography
                variant="h6"
                color="warning.main"
                fontWeight={600}
                sx={{
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "inline-block",
                }}
              >
                {data?.totalOrders || 0}
              </Typography>
            </Box>
          </Box>
        </Fade>

        {isLoading ? (
          <Box
            sx={{
              height: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#fafafa",
              borderRadius: 1,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Fade in={!isLoading} timeout={600}>
            <Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorOrders"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.96)",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: number, name: string) => [
                      name === "revenue"
                        ? `${value.toLocaleString()} VNĐ`
                        : value,
                      name === "revenue"
                        ? translate("admin.dashboardStats.revenue")
                        : translate("admin.dashboardStats.orders"),
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    formatter={(value) =>
                      value === "revenue"
                        ? translate("admin.dashboardStats.revenue")
                        : translate("admin.dashboardStats.orders")
                    }
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: "#3b82f6",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#3b82f6",
                      strokeWidth: 3,
                      stroke: "#fff",
                    }}
                    fill="url(#colorRevenue)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: "#10b981",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#10b981",
                      strokeWidth: 3,
                      stroke: "#fff",
                    }}
                    fill="url(#colorOrders)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Fade>
        )}
      </CardContent>
    </Card>
  );
}
