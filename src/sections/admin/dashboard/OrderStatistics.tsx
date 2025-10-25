import { Card, CardContent, Typography, Box, Grid, Skeleton, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { CheckCircle, Clock, DollarSign } from "lucide-react";
import { RevenueStatistics } from "common/@types/dashboard";
import useLocales from "hooks/useLocales";

interface OrderStatisticsProps {
  data: RevenueStatistics | null;
  isLoading: boolean;
  selectedYear: number | null;
  selectedMonth: number | null;
  onYearChange: (year: number | null) => void;
  onMonthChange: (month: number | null) => void;
}

interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  isLoading: boolean;
}

const StatBox = ({ icon, label, value, color, isLoading }: StatBoxProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      p: 2,
      borderRadius: 2,
      bgcolor: `${color}08`,
      border: `1px solid ${color}30`,
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 48,
        height: 48,
        borderRadius: 2,
        bgcolor: `${color}20`,
        color: color,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {isLoading ? (
        <Skeleton variant="text" width={80} />
      ) : (
        <Typography variant="h6" fontWeight={700} color={color}>
          {value}
        </Typography>
      )}
    </Box>
  </Box>
);

export default function OrderStatistics({
  data,
  isLoading,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
}: OrderStatisticsProps) {
  const { translate } = useLocales();
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: translate("common.months.january") || "Tháng 1" },
    { value: 2, label: translate("common.months.february") || "Tháng 2" },
    { value: 3, label: translate("common.months.march") || "Tháng 3" },
    { value: 4, label: translate("common.months.april") || "Tháng 4" },
    { value: 5, label: translate("common.months.may") || "Tháng 5" },
    { value: 6, label: translate("common.months.june") || "Tháng 6" },
    { value: 7, label: translate("common.months.july") || "Tháng 7" },
    { value: 8, label: translate("common.months.august") || "Tháng 8" },
    { value: 9, label: translate("common.months.september") || "Tháng 9" },
    { value: 10, label: translate("common.months.october") || "Tháng 10" },
    { value: 11, label: translate("common.months.november") || "Tháng 11" },
    { value: 12, label: translate("common.months.december") || "Tháng 12" },
  ];
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {translate("admin.dashboardStats.orderStatistics")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{translate("admin.dashboardStats.year")}</InputLabel>
              <Select
                value={selectedYear || ""}
                label={translate("admin.dashboardStats.year")}
                onChange={(e) => onYearChange(e.target.value ? Number(e.target.value) : null)}
              >
                <MenuItem value="">{translate("admin.dashboardStats.all")}</MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{translate("admin.dashboardStats.month")}</InputLabel>
              <Select
                value={selectedMonth || ""}
                label={translate("admin.dashboardStats.month")}
                onChange={(e) => onMonthChange(e.target.value ? Number(e.target.value) : null)}
                disabled={!selectedYear}
              >
                <MenuItem value="">{translate("admin.dashboardStats.all")}</MenuItem>
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <StatBox
              icon={<DollarSign size={32} />}
              label={translate("admin.dashboardStats.totalRevenueLabel")}
              value={
                data?.totalRevenue
                  ? `${data.totalRevenue.toLocaleString()} VNĐ`
                  : "0 VNĐ"
              }
              color="#10b981"
              isLoading={isLoading}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatBox
              icon={<CheckCircle size={32} />}
              label={translate("admin.dashboardStats.paidOrders")}
              value={data?.paidOrdersCount || 0}
              color="#3b82f6"
              isLoading={isLoading}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatBox
              icon={<Clock size={32} />}
              label={translate("admin.dashboardStats.pendingOrders")}
              value={data?.pendingOrdersCount || 0}
              color="#f59e0b"
              isLoading={isLoading}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
