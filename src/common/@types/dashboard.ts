export interface DashboardStatistics {
  totalStudent: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueByDaysResponse {
  revenueData: RevenueByDay[];
  totalRevenue: number;
  totalOrders: number;
  days: number;
  averageRevenue: number;
  minRevenue: number;
  maxRevenue: number;
}

export interface RevenueStatistics {
  totalRevenue: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  generatedAt: string;
}

export interface CourseDistribution {
  totalCourses: number;
  freeCourses: number;
  freeCoursesPercentage: number;
  paidCourses: number;
  paidCoursesPercentage: number;
  generatedAt: string;
}

export interface LearningContentStatistics {
  totalLessons: number;
  totalChallenges: number;
  totalMaps: number;
  totalLessonResources: number;
  activeRobots: number;
  inactiveRobots: number;
  generatedAt: string;
}

export interface GetRevenueByDaysRequest {
  days?: number;
}

export interface GetOrderStatisticsRequest {
  year?: number;
  month?: number;
}
