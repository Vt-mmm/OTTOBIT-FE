import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  DashboardStatistics,
  RevenueByDaysResponse,
  RevenueStatistics,
  CourseDistribution,
  LearningContentStatistics,
} from "common/@types/dashboard";
import {
  getStatisticsThunk,
  getRevenueByDaysThunk,
  getOrderStatisticsThunk,
  getCourseDistributionThunk,
  getLearningContentStatisticsThunk,
} from "./dashboardThunks";

interface DashboardState {
  statistics: {
    data: DashboardStatistics | null;
    isLoading: boolean;
    error: string | null;
  };
  revenueByDays: {
    data: RevenueByDaysResponse | null;
    isLoading: boolean;
    error: string | null;
  };
  orderStatistics: {
    data: RevenueStatistics | null;
    isLoading: boolean;
    error: string | null;
  };
  courseDistribution: {
    data: CourseDistribution | null;
    isLoading: boolean;
    error: string | null;
  };
  learningContentStatistics: {
    data: LearningContentStatistics | null;
    isLoading: boolean;
    error: string | null;
  };
}

const initialState: DashboardState = {
  statistics: {
    data: null,
    isLoading: false,
    error: null,
  },
  revenueByDays: {
    data: null,
    isLoading: false,
    error: null,
  },
  orderStatistics: {
    data: null,
    isLoading: false,
    error: null,
  },
  courseDistribution: {
    data: null,
    isLoading: false,
    error: null,
  },
  learningContentStatistics: {
    data: null,
    isLoading: false,
    error: null,
  },
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardData: (state) => {
      state.statistics.data = null;
      state.revenueByDays.data = null;
      state.orderStatistics.data = null;
      state.courseDistribution.data = null;
      state.learningContentStatistics.data = null;
    },
  },
  extraReducers: (builder) => {
    // Get Statistics
    builder
      .addCase(getStatisticsThunk.pending, (state) => {
        state.statistics.isLoading = true;
        state.statistics.error = null;
      })
      .addCase(getStatisticsThunk.fulfilled, (state, action) => {
        state.statistics.isLoading = false;
        state.statistics.data = action.payload;
      })
      .addCase(getStatisticsThunk.rejected, (state, action) => {
        state.statistics.isLoading = false;
        state.statistics.error = action.payload || "Failed to fetch statistics";
        toast.error(action.payload || "Failed to fetch statistics");
      });

    // Get Revenue By Days
    builder
      .addCase(getRevenueByDaysThunk.pending, (state) => {
        state.revenueByDays.isLoading = true;
        state.revenueByDays.error = null;
      })
      .addCase(getRevenueByDaysThunk.fulfilled, (state, action) => {
        state.revenueByDays.isLoading = false;
        state.revenueByDays.data = action.payload;
      })
      .addCase(getRevenueByDaysThunk.rejected, (state, action) => {
        state.revenueByDays.isLoading = false;
        state.revenueByDays.error =
          action.payload || "Failed to fetch revenue by days";
        toast.error(action.payload || "Failed to fetch revenue by days");
      });

    // Get Order Statistics
    builder
      .addCase(getOrderStatisticsThunk.pending, (state) => {
        state.orderStatistics.isLoading = true;
        state.orderStatistics.error = null;
      })
      .addCase(getOrderStatisticsThunk.fulfilled, (state, action) => {
        state.orderStatistics.isLoading = false;
        state.orderStatistics.data = action.payload;
      })
      .addCase(getOrderStatisticsThunk.rejected, (state, action) => {
        state.orderStatistics.isLoading = false;
        state.orderStatistics.error =
          action.payload || "Failed to fetch order statistics";
        toast.error(action.payload || "Failed to fetch order statistics");
      });

    // Get Course Distribution
    builder
      .addCase(getCourseDistributionThunk.pending, (state) => {
        state.courseDistribution.isLoading = true;
        state.courseDistribution.error = null;
      })
      .addCase(getCourseDistributionThunk.fulfilled, (state, action) => {
        state.courseDistribution.isLoading = false;
        state.courseDistribution.data = action.payload;
      })
      .addCase(getCourseDistributionThunk.rejected, (state, action) => {
        state.courseDistribution.isLoading = false;
        state.courseDistribution.error =
          action.payload || "Failed to fetch course distribution";
        toast.error(action.payload || "Failed to fetch course distribution");
      });

    // Get Learning Content Statistics
    builder
      .addCase(getLearningContentStatisticsThunk.pending, (state) => {
        state.learningContentStatistics.isLoading = true;
        state.learningContentStatistics.error = null;
      })
      .addCase(getLearningContentStatisticsThunk.fulfilled, (state, action) => {
        state.learningContentStatistics.isLoading = false;
        state.learningContentStatistics.data = action.payload;
      })
      .addCase(getLearningContentStatisticsThunk.rejected, (state, action) => {
        state.learningContentStatistics.isLoading = false;
        state.learningContentStatistics.error =
          action.payload || "Failed to fetch learning content statistics";
        toast.error(
          action.payload || "Failed to fetch learning content statistics"
        );
      });
  },
});

export const { clearDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
