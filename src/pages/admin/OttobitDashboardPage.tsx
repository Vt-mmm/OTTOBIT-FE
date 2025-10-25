import { Box, Container, Typography, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "store/config";
import AdminLayout from "layout/admin/AdminLayout";
import useLocales from "hooks/useLocales";
import {
  getStatisticsThunk,
  getRevenueByDaysThunk,
  getOrderStatisticsThunk,
  getCourseDistributionThunk,
  getLearningContentStatisticsThunk,
} from "store/dashboard";
import {
  StatisticsCards,
  RevenueChart,
  CourseDistributionChart,
  LearningContentStats,
  OrderStatistics,
} from "sections/admin/dashboard";

const OttobitDashboardPage = () => {
  const { translate } = useLocales();
  const dispatch = useAppDispatch();
  const { userAuth } = useAppSelector((state) => state.auth);
  const {
    statistics,
    revenueByDays,
    orderStatistics,
    courseDistribution,
    learningContentStatistics,
  } = useAppSelector((state) => state.dashboard);

  const [selectedDays, setSelectedDays] = useState(7);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getStatisticsThunk());
    dispatch(getCourseDistributionThunk());
    dispatch(getLearningContentStatisticsThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getRevenueByDaysThunk({ days: selectedDays }));
  }, [dispatch, selectedDays]);

  useEffect(() => {
    const params: { year?: number; month?: number } = {};
    if (selectedYear) params.year = selectedYear;
    if (selectedMonth) params.month = selectedMonth;
    dispatch(getOrderStatisticsThunk(params));
  }, [dispatch, selectedYear, selectedMonth]);

  const handleDaysChange = (days: number) => {
    setSelectedDays(days);
  };

  const handleYearChange = (year: number | null) => {
    setSelectedYear(year);
    if (!year) setSelectedMonth(null);
  };

  const handleMonthChange = (month: number | null) => {
    setSelectedMonth(month);
  };

  return (
    <AdminLayout>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "#2c3e50",
              mb: 1,
              fontSize: { xs: "1.5rem", sm: "2.125rem" },
            }}
          >
            {translate("admin.dashboardWelcome", {
              username: userAuth?.username || translate("admin.admin"),
            })}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#64748b", fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            {translate("admin.dashboardSubtitle")}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Statistics Overview Cards */}
          <StatisticsCards
            data={statistics.data}
            isLoading={statistics.isLoading}
          />

          {/* Revenue Chart and Course Distribution */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <RevenueChart
                data={revenueByDays.data}
                isLoading={revenueByDays.isLoading}
                selectedDays={selectedDays}
                onDaysChange={handleDaysChange}
              />
            </Grid>
            <Grid item xs={12} lg={4}>
              <CourseDistributionChart
                data={courseDistribution.data}
                isLoading={courseDistribution.isLoading}
              />
            </Grid>
          </Grid>

          {/* Order Statistics */}
          <OrderStatistics
            data={orderStatistics.data}
            isLoading={orderStatistics.isLoading}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={handleYearChange}
            onMonthChange={handleMonthChange}
          />

          {/* Learning Content Statistics */}
          <LearningContentStats
            data={learningContentStatistics.data}
            isLoading={learningContentStatistics.isLoading}
          />
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default OttobitDashboardPage;
