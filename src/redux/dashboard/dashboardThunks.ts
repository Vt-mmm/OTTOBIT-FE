import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_DASHBOARD } from "constants/routesApiKeys";
import {
  DashboardStatistics,
  RevenueByDaysResponse,
  RevenueStatistics,
  CourseDistribution,
  LearningContentStatistics,
  GetRevenueByDaysRequest,
  GetOrderStatisticsRequest,
} from "common/@types/dashboard";
import { extractApiErrorMessage } from "utils/errorHandler";

interface ApiResponse<T> {
  message: string;
  data: T;
  errors?: string[] | null;
  errorCode?: string | null;
  timestamp?: string;
}

async function callApiWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
      return await apiCall();
    } catch (error) {
      lastError = error;
      const axiosError = error as AxiosError;
      if (
        axiosError.response?.status === 401 ||
        axiosError.response?.status === 404
      ) {
        break;
      }
    }
  }
  throw lastError;
}

export const getStatisticsThunk = createAsyncThunk<
  DashboardStatistics,
  void,
  { rejectValue: string }
>("dashboard/getStatistics", async (_, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(async () => {
      return await axiosClient.get<ApiResponse<DashboardStatistics>>(
        ROUTES_API_DASHBOARD.STATISTICS
      );
    });
    return response.data.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    return rejectWithValue(message);
  }
});

export const getRevenueByDaysThunk = createAsyncThunk<
  RevenueByDaysResponse,
  GetRevenueByDaysRequest,
  { rejectValue: string }
>("dashboard/getRevenueByDays", async (params, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(async () => {
      return await axiosClient.get<ApiResponse<RevenueByDaysResponse>>(
        ROUTES_API_DASHBOARD.REVENUE_BY_DAYS,
        {
          params: { days: params.days || 7 },
        }
      );
    });
    return response.data.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    return rejectWithValue(message);
  }
});

export const getOrderStatisticsThunk = createAsyncThunk<
  RevenueStatistics,
  GetOrderStatisticsRequest,
  { rejectValue: string }
>("dashboard/getOrderStatistics", async (params, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(async () => {
      return await axiosClient.get<ApiResponse<RevenueStatistics>>(
        ROUTES_API_DASHBOARD.ORDER_STATISTICS,
        {
          params,
        }
      );
    });
    return response.data.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    return rejectWithValue(message);
  }
});

export const getCourseDistributionThunk = createAsyncThunk<
  CourseDistribution,
  void,
  { rejectValue: string }
>("dashboard/getCourseDistribution", async (_, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(async () => {
      return await axiosClient.get<ApiResponse<CourseDistribution>>(
        ROUTES_API_DASHBOARD.COURSE_DISTRIBUTION
      );
    });
    return response.data.data;
  } catch (error) {
    const message = extractApiErrorMessage(error);
    return rejectWithValue(message);
  }
});

export const getLearningContentStatisticsThunk = createAsyncThunk<
  LearningContentStatistics,
  void,
  { rejectValue: string }
>(
  "dashboard/getLearningContentStatistics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await callApiWithRetry(async () => {
        return await axiosClient.get<ApiResponse<LearningContentStatistics>>(
          ROUTES_API_DASHBOARD.LEARNING_CONTENT_STATISTICS
        );
      });
      return response.data.data;
    } catch (error) {
      const message = extractApiErrorMessage(error);
      return rejectWithValue(message);
    }
  }
);
